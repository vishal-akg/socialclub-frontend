import validator from "validator";
import {
  CheckCircle,
  Close,
  Error,
  Minimize,
  PlayCircleOutline,
  PriorityHigh,
  Publish,
  Queue,
  TaskAlt,
  FileUpload,
  RunningWithErrors,
  RestartAlt,
  KeyboardArrowLeft,
} from "@mui/icons-material";
import {
  Alert,
  alpha,
  Box,
  Button,
  CardActionArea,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  styled,
  Tooltip,
  tooltipClasses,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useSocket, useSocketEvent } from "socket.io-react-hook";
import { useForm, Controller } from "react-hook-form";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getMedia, getMediaUploadSignature } from "../../apis/endpoints/media";
import MuiTextField from "../components/inputs/MuiTextField";
import axios, { Axios, AxiosError } from "axios";
import { useSnackbar } from "./snackbar";
import { addPost } from "../../apis/endpoints/post";

const ErrorTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: 0,
    fontSize: theme.typography.pxToRem(12),
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: alpha(theme.palette.error.main, 0.15),
  },
}));

export const PostContext = createContext();

export default function PostProvider({ children }) {
  const { socket, error, connected } = useSocket(
    `${process.env.NEXT_PUBLIC_BASE_URL}/media`,
    {
      withCredentials: true,
    }
  );
  const {
    sendMessage: sendJobCompletedMessage,
    lastMessage: jobCompletedLastMessage,
  } = useSocketEvent(socket, "job:completed");
  const {
    sendMessage: sendJobStartedMessage,
    lastMessage: jobStartedLastMessage,
  } = useSocketEvent(socket, "job:submitted");
  const {
    sendMessage: sendJobProgressMessage,
    lastMessage: jobProgressLastMessage,
  } = useSocketEvent(socket, "job:status");
  const { sendMessage: sendJobErrorMessage, lastMessage: jobErrorLastMessage } =
    useSocketEvent(socket, "job:error");
  const { setSnackbar } = useSnackbar();
  const [id, setId] = useState(null);
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [mediaId, setMediaId] = useState(null);
  const [published, setPublished] = useState(false);
  const [fileErrors, setFileErrors] = useState(null);
  const [processingError, setProcessingError] = useState();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      audience: "all",
      activity: "allowed",
    },
  });
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const matchesMD = useMediaQuery(theme.breakpoints.down("md"));
  const sliderRef = useRef(null);

  useEffect(() => {
    if (mediaId) {
      getMedia(mediaId).then((res) => {
        setMedia(res.data);
        setFile({ transcoding: { jobProgress: { jobPercentComplete: 100 } } });
        setThumbnail(res.data.thumbnails[1]);
      });
    }
  }, [mediaId]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(thumbnail.index);
    }
  }, [thumbnail]);

  useEffect(() => {
    if (!open && published) {
      handleReset();
    }
  }, [open, published]);

  // useEffect(() => {
  //   sendJobStartedMessage({ id: "wbHJtSCnvF4n" });
  //   sendJobProgressMessage({ id: "wbHJtSCnvF4n" });
  //   sendJobCompletedMessage({ id: "wbHJtSCnvF4n" });
  // }, []);

  const handleReset = (event) => {
    setFile(null);
    setMedia(null);
    setPublished(false);
    setMediaId(null);
    setThumbnail(null);
    setFileErrors(null);
    setProcessingError(null);
  };

  const onFileDrop = async (acceptedFiles) => {
    setFileErrors(null);

    try {
      const f = acceptedFiles[0];
      const res = await getMediaUploadSignature({
        filename: f.name,
        filetype: f.type,
        filesize: f.size,
      });

      if (res.status === 200) {
        setId(res.data.metadata.id);
        setFile({
          id: res.data.metadata.id,
          object: f,
        });
        const controller = new AbortController();
        setFile((prev) => ({ ...prev, uploading: { controller } }));
        sendJobStartedMessage({ id: res.data.metadata.id });
        sendJobProgressMessage({ id: res.data.metadata.id });
        sendJobCompletedMessage({ id: res.data.metadata.id });
        sendJobErrorMessage({ id: res.data.metadata.id });

        await axios.put(res.data.url, f, {
          headers: { "Content-Type": f.type },
          signal: controller.signal,
          onUploadProgress: ({ loaded, total }) => {
            console.log(loaded, total);
            setFile((prev) => ({
              ...prev,
              uploading: {
                ...prev.uploading,
                progress: loaded / total,
              },
            }));
          },
        });
      }
    } catch (error) {
      const { message, statusCode } = error.response.data;
      setProcessingError({
        status: "ERROR",
        errorCode: statusCode,
        errorMessage: message,
      });
      if (axios.isCancel(error)) {
        setFile(null);

        console.log(error);
      }
    }
  };

  const onFileReject = (rejectedFile) => {
    setFileErrors(rejectedFile[0].errors);
    console.log(rejectedFile);
  };

  const onSubmit = async (data) => {
    try {
      const res = await addPost({
        ...data,
        thumbnailIndex: thumbnail.index,
        mediaId,
      });
      if (res.status === 201) {
        setPublished(true);
        setMediaId(null);
        setThumbnail(null);
        setMedia(null);
        setFile(null);
        console.log(res.data);
      }
    } catch (error) {}
  };

  const busy = mediaId || file;

  useEffect(() => {
    if (jobErrorLastMessage) {
      setProcessingError(jobErrorLastMessage);
    }
  }, [jobErrorLastMessage]);

  useEffect(() => {
    if (jobProgressLastMessage) {
      setFile((prev) => ({
        ...prev,
        transcoding: {
          jobProgress: jobProgressLastMessage.jobProgress,
        },
      }));
    }
  }, [jobProgressLastMessage]);

  useEffect(() => {
    if (jobStartedLastMessage && !file.transcoding) {
      setFile((prev) => ({
        ...prev,
        transcoding: {
          jobProgress: {
            jobPercentComplete: 0,
          },
        },
      }));
    }
  }, [jobStartedLastMessage]);

  useEffect(() => {
    if (jobCompletedLastMessage) {
      setMediaId(jobCompletedLastMessage.userMetadata.id);

      if (!open) {
        setSnackbar({
          open: true,
          message: "Video has been processed successfully.",
          severity: "success",
          action: () => setOpen(true),
        });
      }
    }
  }, [jobCompletedLastMessage]);

  return (
    <PostContext.Provider value={{ open, setOpen, setMediaId, busy }}>
      {children}
      <Dialog
        keepMounted
        fullScreen={fullScreen}
        fullWidth
        open={open}
        maxWidth={"md"}
      >
        <Grid container sx={{ px: 2, py: 1 }} alignItems={"center"}>
          <Grid item xs>
            <Stack direction={"row"} alignItems={"center"} spacing={1}>
              <Typography variant={"h6"} sx={{ fontWeight: 600 }}>
                Create/Edit Post
              </Typography>
              {fileErrors ? (
                <ErrorTooltip
                  placement={"bottom-start"}
                  arrow
                  open
                  title={
                    <>
                      {fileErrors.map(({ code, message }) => (
                        <Alert key={code} severity={"error"}>
                          {message}
                        </Alert>
                      ))}
                    </>
                  }
                >
                  <Error color={"error"} />
                </ErrorTooltip>
              ) : null}
            </Stack>
          </Grid>
          <Grid item>
            <IconButton onClick={() => setOpen(false)}>
              {busy ? <Minimize /> : <Close />}
            </IconButton>
          </Grid>
        </Grid>
        <DialogContent dividers sx={{ p: 3 }}>
          {processingError ? (
            <Stack
              sx={{
                p: 2,
                width: "100%",
                aspectRatio: { xs: undefined, md: "3" },
                height: { xs: "80vh", md: "auto" },
                border: (theme) => `2px dotted ${theme.palette.error.main}`,
              }}
              justifyContent={"center"}
              alignItems={"center"}
              spacing={1}
            >
              <Stack direction={"row"} alignItems={"center"} spacing={1}>
                <Error color={"error"} sx={{ fontSize: "2rem" }} />
                <Typography variant={"body1"} sx={{ fontSize: "1.1rem" }}>
                  {processingError.errorCode === 400
                    ? processingError.errorMessage.errorMessage
                    : processingError.errorMessage}
                </Typography>
              </Stack>
              <Box>
                <Button
                  disableElevation
                  variant={"contained"}
                  color={"error"}
                  startIcon={<RestartAlt />}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Box>
            </Stack>
          ) : published ? (
            <Box>
              <Box
                sx={{
                  aspectRatio: { xs: undefined, md: "3" },
                  height: { xs: "80vh", md: "auto" },
                  width: "100%",
                }}
              >
                <Stack
                  alignItems={"center"}
                  sx={{ height: "100%" }}
                  justifyContent={"center"}
                  spacing={0.5}
                >
                  <IconButton
                    size={"large"}
                    disableRipple
                    color={"success"}
                    sx={{
                      backgroundColor: (theme) =>
                        alpha(theme.palette.common.black, 0.05),
                    }}
                  >
                    <TaskAlt sx={{ fontSize: "3.5rem" }} />
                  </IconButton>
                  <Box height={8} />
                  <Typography variant={"body1"}>
                    Post has been successfully published.
                  </Typography>
                  <Stack direction={"row"}>
                    <PriorityHigh color={"info"} fontSize={"small"} />
                    <Typography
                      variant={"subtitle2"}
                      sx={{ color: (theme) => theme.palette.info.main }}
                    >
                      Post will only be publicly visible after verification.
                    </Typography>
                  </Stack>
                  <Button
                    variant={"contained"}
                    disableElevation
                    color={"secondary"}
                    startIcon={<Close />}
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Close
                  </Button>
                </Stack>
              </Box>
            </Box>
          ) : file?.transcoding ? (
            <Grid container spacing={3} alignItems={"stretch"}>
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  {media ? (
                    <Slider
                      initialSlide={thumbnail.index}
                      ref={sliderRef}
                      infinite
                    >
                      {media.thumbnails.map(({ index, uri, width, height }) => (
                        <Box>
                          <Stack
                            key={index}
                            sx={{
                              position: "relative",
                              aspectRatio: `16/9`,
                              backgroundColor: (theme) =>
                                theme.palette.common.black,
                            }}
                            alignItems={"center"}
                            justifyContent={"center"}
                          >
                            <Box
                              component={"img"}
                              sx={{
                                width: width / height > 1 ? "100%" : "auto",
                                height: width / height > 1 ? "auto" : "100%",
                              }}
                              src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${uri}`}
                            />
                            <Stack
                              sx={{ position: "absolute", inset: 0 }}
                              alignItems={"center"}
                              justifyContent={"center"}
                            >
                              <PlayCircleOutline
                                sx={{ fontSize: "3.5rem" }}
                                color={"primary"}
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Slider>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        position: "relative",
                        aspectRatio: "16/9",
                        backgroundColor: (theme) => theme.palette.common.black,
                      }}
                    >
                      <Grid
                        container
                        direction={"column"}
                        sx={{ position: "absolute", inset: 0 }}
                        justifyContent={"space-between"}
                        alignItems={"stretch"}
                      >
                        <Grid item xs>
                          <Stack
                            justifyContent={"center"}
                            alignItems={"center"}
                            sx={{ height: "100%" }}
                          >
                            <PlayCircleOutline
                              color={"primary"}
                              sx={{ fontSize: "3rem" }}
                            />
                          </Stack>
                        </Grid>
                        <Grid
                          item
                          sx={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                          }}
                        >
                          <LinearProgress
                            variant={"determinate"}
                            value={
                              file.transcoding.jobProgress.jobPercentComplete
                            }
                            sx={{ height: 10 }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  <Box>
                    <Box sx={{ display: { xs: "none", md: "initial" } }}>
                      <FormLabel>Select Thumbnail</FormLabel>
                      <Box height={8} />
                    </Box>
                    {media ? (
                      matchesMD ? (
                        <Slider
                          slidesToShow={3}
                          infinite={false}
                          prevArrow={
                            <IconButton color={"primary"}>
                              <KeyboardArrowLeft />
                            </IconButton>
                          }
                        >
                          {media.thumbnails.map(
                            ({ index, uri, width, height }) => (
                              <Box sx={{ p: 1 }}>
                                <CardActionArea
                                  onClick={() => {
                                    setThumbnail({ index, uri, width, height });
                                  }}
                                >
                                  <Stack
                                    alignItems={"center"}
                                    justifyContent={"center"}
                                    sx={{
                                      position: "relative",
                                      aspectRatio: "16/9",
                                      border: (theme) =>
                                        thumbnail.index === index
                                          ? `2px solid ${theme.palette.primary.main}`
                                          : "none",
                                      backgroundColor: (theme) =>
                                        theme.palette.common.black,
                                    }}
                                  >
                                    {thumbnail.index === index ? (
                                      <Stack
                                        sx={{ position: "absolute", inset: 0 }}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                      >
                                        <CheckCircle color={"primary"} />
                                      </Stack>
                                    ) : null}
                                    <Box
                                      component={"img"}
                                      sx={{
                                        display: "block",
                                        width:
                                          width / height > 1 ? "100%" : "auto",
                                        height:
                                          width / height > 1 ? "auto" : "100%",

                                        aspectRatio: `${width}/${height}`,
                                      }}
                                      src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${uri}`}
                                    />
                                  </Stack>
                                </CardActionArea>
                              </Box>
                            )
                          )}
                        </Slider>
                      ) : (
                        <Grid container spacing={2}>
                          {media.thumbnails.map(
                            ({ index, uri, width, height }) => (
                              <Grid item sm={6} key={index}>
                                <CardActionArea
                                  onClick={() => {
                                    setThumbnail({ index, uri, width, height });
                                  }}
                                >
                                  <Stack
                                    alignItems={"center"}
                                    sx={{
                                      position: "relative",
                                      aspectRatio: "16/9",
                                      border: (theme) =>
                                        thumbnail.index === index
                                          ? `2px solid ${theme.palette.primary.main}`
                                          : "none",
                                      backgroundColor: (theme) =>
                                        theme.palette.common.black,
                                    }}
                                  >
                                    {thumbnail.index === index ? (
                                      <Stack
                                        sx={{ position: "absolute", inset: 0 }}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                      >
                                        <CheckCircle color={"primary"} />
                                      </Stack>
                                    ) : null}
                                    <Box
                                      component={"img"}
                                      sx={{
                                        display: "block",
                                        width:
                                          width / height > 1 ? "100%" : "auto",
                                        height:
                                          width / height > 1 ? "auto" : "100%",

                                        aspectRatio: `${width}/${height}`,
                                      }}
                                      src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${uri}`}
                                    />
                                  </Stack>
                                </CardActionArea>
                              </Grid>
                            )
                          )}
                        </Grid>
                      )
                    ) : (
                      <Grid container spacing={2}>
                        {new Array(6).fill(0).map((_, i) => (
                          <Grid item sm={6} key={i}>
                            <Box
                              sx={{
                                aspectRatio: "16/9",
                                width: "100%",
                                backgroundColor: (theme) =>
                                  theme.palette.grey[100],
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack sx={{ height: "100%" }}>
                  <form
                    style={{ height: "100%" }}
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <Stack spacing={3} sx={{ height: "100%" }}>
                      <Controller
                        name={"title"}
                        control={control}
                        rules={{
                          validate: (value) => {
                            if (validator.isEmpty(value)) {
                              return `Title is required field.`;
                            }
                            if (
                              !validator.isLength(value, { min: 10, max: 100 })
                            ) {
                              return `Title should be minimum 10 and maximum 100 characters long.`;
                            }
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <MuiTextField
                            {...field}
                            error={error}
                            size={"small"}
                            shape={"square"}
                            label={"Title"}
                            placeholder={"Gulshan Kumar presents Na Chain se.."}
                          />
                        )}
                      />
                      <Controller
                        name={"description"}
                        control={control}
                        rules={{
                          validate: (value) => {
                            if (validator.isEmpty(value)) {
                              return `Description is required field.`;
                            }
                            if (
                              !validator.isLength(value, { min: 100, max: 500 })
                            ) {
                              return `Description should be minimum 100 and maximum 500 characters long.`;
                            }
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <MuiTextField
                            {...field}
                            placeholder={"Write description about the post..."}
                            multiline
                            error={error}
                            size={"small"}
                            shape={"square"}
                            label={"Description"}
                            minRows={5}
                            maxRows={10}
                          />
                        )}
                      />
                      <Controller
                        name={"audience"}
                        control={control}
                        render={({ field }) => (
                          <FormControl>
                            <FormLabel>Audience</FormLabel>
                            <RadioGroup {...field} defaultValue={"all"}>
                              <FormControlLabel
                                value={"adult"}
                                control={<Radio size={"small"} />}
                                label={
                                  "Restrict my video to people above 18 only."
                                }
                              />
                              <FormControlLabel
                                value={"all"}
                                control={<Radio size={"small"} />}
                                label={
                                  "My video is appropriate for all people."
                                }
                              />
                            </RadioGroup>
                          </FormControl>
                        )}
                      />
                      <Controller
                        name={"activity"}
                        control={control}
                        render={({ field }) => (
                          <FormControl>
                            <FormLabel>Reactions and Comments</FormLabel>
                            <RadioGroup {...field} defaultValue={"allowed"}>
                              <FormControlLabel
                                value={"allowed"}
                                control={<Radio size={"small"} />}
                                label={
                                  "Allow people to write comments and react."
                                }
                              />
                              <FormControlLabel
                                value={"prohibited"}
                                control={<Radio size={"small"} />}
                                label={"Disable reactions and comments"}
                              />
                            </RadioGroup>
                          </FormControl>
                        )}
                      />
                      <Box>
                        <Grid container justifyContent={"flex-end"} spacing={2}>
                          <Grid item>
                            <Button
                              type={"reset"}
                              variant={"outlined"}
                              startIcon={<Close />}
                              onClick={handleReset}
                            >
                              Cancel
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              type={"submit"}
                              startIcon={<Publish />}
                              disableElevation
                              disabled={!isValid || !media}
                              variant={"contained"}
                            >
                              Publish
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </form>
                </Stack>
              </Grid>
            </Grid>
          ) : file?.uploading ? (
            <Box
              sx={{
                aspectRatio: { xs: undefined, md: "2" },
                height: { xs: "80vh", md: "auto" },
                width: "100%",
              }}
            >
              <Stack
                justifyContent={"center"}
                alignItems={"center"}
                sx={{ height: "100%" }}
                spacing={1}
              >
                <CircularProgressWithLabel
                  size={"5rem"}
                  progress={Math.round(file.uploading.progress * 100) || 0}
                />
                <Box>
                  <Stack
                    direction={"row"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    spacing={1}
                  >
                    <Queue color={"warning"} />
                    <Typography variant={"h6"} align={"center"}>
                      {file.object.name}
                    </Typography>
                  </Stack>
                  <Typography
                    align={"center"}
                    variant={"subtitle2"}
                    sx={{ color: (theme) => theme.palette.warning.main }}
                  >
                    File queued for processing.
                  </Typography>
                </Box>

                <Button
                  disableElevation
                  variant={"contained"}
                  startIcon={<Close />}
                  onClick={() => file.uploading.controller.abort()}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          ) : (
            <Dropzone
              onDropAccepted={onFileDrop}
              onDropRejected={onFileReject}
              maxFiles={1}
              maxSize={100000000}
              accept={{
                "video/*": [".mp4", ".mkv"],
                "audio/*": [],
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <Box
                  {...getRootProps()}
                  sx={{
                    aspectRatio: { xs: undefined, md: "5/3" },
                    height: { xs: "80vh", md: "auto" },
                    width: "100%",
                  }}
                >
                  <input {...getInputProps()} />
                  <Stack
                    alignItems={"center"}
                    sx={{ height: "100%" }}
                    justifyContent={"center"}
                  >
                    <IconButton
                      size={"large"}
                      sx={{
                        backgroundColor: (theme) =>
                          alpha(theme.palette.common.black, 0.05),
                      }}
                    >
                      <FileUpload sx={{ fontSize: "3.5rem" }} />
                    </IconButton>
                    <Box height={8} />
                    <Typography variant={"body1"}>
                      Select or Drag & Drop file to upload.
                    </Typography>
                    <Typography variant={"body2"} color={"text.secondary"}>
                      Video should be minimum 360p, maximum 3 Mintues.{" "}
                    </Typography>

                    <Box height={8} />
                    <Button disableElevation variant={"contained"}>
                      Select File
                    </Button>
                  </Stack>
                </Box>
              )}
            </Dropzone>
          )}
        </DialogContent>
      </Dialog>
    </PostContext.Provider>
  );
}

export function usePost() {
  return useContext(PostContext);
}

function CircularProgressWithLabel({ size, progress }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress size={size} value={progress} variant={"determinate"} />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {`${Math.round(progress)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

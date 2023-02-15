import { Add, Camera, Close, Remove } from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  Slider,
  Stack,
  styled,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { forwardRef, useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import AvatarEditor from "react-avatar-editor";
import { useAuth } from "../../src/contexts/auth";
import { getProfilePictureUploadSignedUrl } from "../../apis/endpoints/user";
import axios from "axios";
import Timeline from "../../src/components/profile/Timeline";
import { pink } from "@mui/material/colors";
import { useProfile } from "../../src/contexts/profile";

const StyledTabs = styled(Tabs)({});

const StyledTab = styled((props) => <Tab {...props} />)(({ theme }) => ({
  fontWeight: 600,
}));

export default function Profile({ user }) {
  const { user: me, setUser } = useAuth();
  const { avatar, cover, setAvatar, setCover } = useProfile();
  const [selectedTab, setSelectedTab] = useState(0);
  const theme = useTheme();
  const matchesLG = useMediaQuery(theme.breakpoints.up("lg"));
  const matchesSM = useMediaQuery(theme.breakpoints.down("md"));
  const coverRef = useRef();

  return (
    <Stack>
      <Grid container justifyContent={"center"}>
        <Grid item xl={8} md={10} xs={12}>
          <Stack>
            <Box
              sx={{
                width: "100%",
                position: "relative",
                backgroundColor: pink[50],
                borderBottom: (theme) => `1px solid ${theme.palette.grey[100]}`,
              }}
            >
              {!cover && me.id === user.id ? (
                <Dropzone
                  onDropAccepted={(acceptedFiles) => setCover(acceptedFiles[0])}
                >
                  {({ getRootProps, getInputProps }) => (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 60,
                        right: 16,
                        zIndex: 2,
                      }}
                      {...getRootProps()}
                    >
                      <input {...getInputProps()} />
                      <Button
                        startIcon={<Camera />}
                        color={"inherit"}
                        variant={"contained"}
                        disableElevation
                      >
                        Change Cover
                      </Button>
                    </Box>
                  )}
                </Dropzone>
              ) : null}
              <Box sx={{ aspectRatio: "2.5", width: "100%" }} ref={coverRef}>
                {cover ? (
                  <CoverEditor file={cover} ref={coverRef} setFile={setCover} />
                ) : user.cover ? (
                  <Box
                    component={"img"}
                    src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${user.cover}`}
                    sx={{
                      aspectRatio: "2.5",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                ) : null}
              </Box>
              <Grid
                container
                sx={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
                alignItems={"flex-end"}
                justifyContent={"flex-end"}
              >
                <Grid
                  item
                  xs
                  md
                  sx={{
                    height: 48,
                    width: "100%",
                    marginRight: -1,
                    pr: 1,
                    backgroundColor: (theme) => theme.palette.background.paper,
                  }}
                ></Grid>
                <Grid item md={2.5} xs={4} sm={3}>
                  <Stack
                    sx={{ marginBottom: matchesLG ? "-10rem" : "-7rem" }}
                    alignItems={"center"}
                  >
                    <Box
                      sx={{
                        aspectRatio: "1",
                        width: "100%",
                        borderRadius: "50%",
                        position: "relative",

                        border: (theme) =>
                          `0.7rem solid ${theme.palette.background.default}`,
                        backgroundColor: pink[50],
                      }}
                    >
                      <Box
                        component={user.avatar ? "img" : "div"}
                        src={
                          user.avatar
                            ? `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${user.avatar}`
                            : undefined
                        }
                        sx={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                        }}
                      />
                      {me.id === user.id ? (
                        <Dropzone
                          onDropAccepted={(acceptedFiles) =>
                            setAvatar(acceptedFiles[0])
                          }
                        >
                          {({ getRootProps, getInputProps }) => (
                            <Box
                              {...getRootProps()}
                              sx={{
                                position: "absolute",
                                bottom: matchesSM ? "-0.7rem" : "0.7rem",
                                right: matchesSM ? "-0.7rem" : "0.7rem",
                              }}
                            >
                              <input {...getInputProps()} />
                              <IconButton
                                color={"inherit"}
                                sx={{
                                  backgroundColor: (theme) =>
                                    alpha(theme.palette.common.white, 0.5),
                                }}
                              >
                                <Camera />
                              </IconButton>
                            </Box>
                          )}
                        </Dropzone>
                      ) : null}
                    </Box>
                    <Typography
                      variant={"h6"}
                      color={"text.primary"}
                      sx={{ fontWeight: 600 }}
                      noWrap
                    >
                      {user.name}
                    </Typography>
                    {/* <Typography
                      color={"text.secondary"}
                      sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                    >
                      123 Followers
                    </Typography> */}
                    {me && me.id !== user.id ? (
                      <Button
                        startIcon={
                          <Stack
                            direction={"row"}
                            spacing={0.5}
                            alignItems={"center"}
                          >
                            <Typography variant={"button"}>1.1K</Typography>
                            <Box
                              sx={{
                                height: "80%",
                                borderRight: (theme) =>
                                  `1px solid ${alpha(
                                    theme.palette.background.default,
                                    0.3
                                  )}`,
                              }}
                            />
                            {/* <PersonAdd fontSize={"small"} /> */}
                          </Stack>
                        }
                        variant={"contained"}
                        disableElevation
                      >
                        Follow
                      </Button>
                    ) : (
                      <Stack
                        direction={"row"}
                        spacing={0.5}
                        alignItems={"center"}
                      >
                        <Typography
                          color={"primary"}
                          sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                        >
                          1.1K
                        </Typography>
                        <Typography
                          color={"text.secondary"}
                          variant={"body1"}
                          sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                        >
                          Followers
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
                <Grid
                  item
                  md={9}
                  xs={7.5}
                  sm={8.5}
                  sx={{
                    marginLeft: -2,
                    pl: 1,
                    backgroundColor: (theme) =>
                      theme.palette.background.default,
                  }}
                >
                  <Stack>
                    <Paper elevation={0} sx={{ px: 2 }}>
                      <Grid
                        container
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        sx={{ pl: 3 }}
                      >
                        <Grid item>
                          <StyledTabs
                            value={selectedTab}
                            onChange={(event, newValue) =>
                              setSelectedTab(newValue)
                            }
                          >
                            <StyledTab label={"Timeline"} />
                            <StyledTab label={"About"} />
                          </StyledTabs>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Stack>
          <Box height={matchesSM ? "8rem" : "3rem"} />
          <Timeline id={user.id} me={me} />
        </Grid>
      </Grid>
      {avatar ? <AvatarEditorDialog file={avatar} setFile={setAvatar} /> : null}
    </Stack>
  );
}

const CoverEditor = forwardRef(({ file, setFile }, ref) => {
  const [dimension, setDimension] = useState(null);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const { width, height } = ref.current.getBoundingClientRect();
    setDimension({
      width,
      height,
    });
  }, []);

  const onSubmit = async () => {
    const { x, y, width, height } = editorRef.current.getCroppingRect();
    setLoading(true);

    try {
      const res = await getProfilePictureUploadSignedUrl({
        filename: file.name,
        filetype: file.type,
        filesize: file.size,
        x,
        y,
        width,
        height,
        type: "cover",
      });

      if (res.status === 200) {
        axios.put(res.data.url, file, {
          headers: { "Content-Type": file.type },
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      {dimension ? (
        <AvatarEditor
          ref={editorRef}
          image={file}
          width={dimension.width}
          height={dimension.height}
          style={{ width: "100%", height: "auto" }}
          border={0}
        />
      ) : null}
      <Stack
        direction={"row"}
        sx={{ position: "absolute", right: 16, bottom: 60, zIndex: 2 }}
        spacing={1}
      >
        <Button
          disableElevation
          color={"inherit"}
          variant={"contained"}
          onClick={() => setFile(null)}
        >
          Cancel
        </Button>
        <Button variant={"contained"} disableElevation onClick={onSubmit}>
          Save
        </Button>
      </Stack>
    </Box>
  );
});

function AvatarEditorDialog({ file, setFile }) {
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const step = 0.1;

  const onSubmit = async () => {
    const { x, y, width, height } = ref.current.getCroppingRect();
    setLoading(true);

    try {
      const res = await getProfilePictureUploadSignedUrl({
        filename: file.name,
        filetype: file.type,
        filesize: file.size,
        x,
        y,
        width,
        height,
        type: "avatar",
      });

      if (res.status === 200) {
        axios.put(res.data.url, file, {
          headers: { "Content-Type": file.type },
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      //setLoading(false);
    }
  };

  return (
    <Dialog open={file instanceof File}>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        sx={{ px: 3, py: 1 }}
      >
        <Typography variant={"h6"} sx={{ fontWeight: 600 }}>
          Customize Avatar
        </Typography>
        <IconButton edge={"end"} onClick={() => setFile(null)}>
          <Close />
        </IconButton>
      </Stack>
      <DialogContent dividers>
        <Stack spacing={2}>
          <AvatarEditor
            ref={ref}
            image={file}
            width={260}
            height={260}
            border={20}
            scale={scale}
            borderRadius={130}
          />
          <Stack direction={"row"} alignItems={"center"}>
            <IconButton edge={"start"} onClick={() => setScale(scale - step)}>
              <Remove />
            </IconButton>
            <Slider
              value={scale}
              onChange={(event, value) => setScale(value)}
              max={3}
              min={1}
              step={step}
              sx={{
                height: 3,
                borderRadius: 0,
                "& .MuiSlider-track": {
                  border: "none",
                },
              }}
            />
            <IconButton edge={"end"} onClick={() => setScale(scale + step)}>
              <Add />
            </IconButton>
          </Stack>

          <Stack direction={"row"} justifyContent={"flex-end"} spacing={1}>
            <Button variant={"outlined"} onClick={() => setFile(null)}>
              Cancel
            </Button>
            <Button variant={"contained"} disableElevation onClick={onSubmit}>
              Save
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${id}`, {
    headers: context.req.headers,
  });
  console.log(res.body);
  if (res.status === 200) {
    const user = await res.json();
    return { props: { user } };
  }

  return { props: {} };
}

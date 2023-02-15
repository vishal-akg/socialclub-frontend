import {
  Grid,
  IconButton,
  createTheme,
  LinearProgress,
  Typography,
  Slider,
  Stack,
  Tooltip,
  Card,
  tooltipClasses,
  styled,
  Fade,
  Collapse,
  Grow,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  List,
  Paper,
  Divider,
  ClickAwayListener,
  Popper,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  AspectRatio,
  Done,
  Fullscreen,
  FullscreenExit,
  Hd,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Loop,
  MoreVert,
  Pause,
  PlayArrow,
  PlayArrowOutlined,
  PlayCircleOutline,
  Repeat,
  Settings,
  SlowMotionVideo,
  Speed,
  ToggleOff,
  ToggleOn,
  Tune,
  VolumeOff,
  VolumeUp,
} from "@mui/icons-material";
import { alpha, Box, ThemeProvider } from "@mui/system";
import { amber, grey, pink } from "@mui/material/colors";
import { Scrollbars } from "react-custom-scrollbars-2";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import _ from "lodash";

const TrickTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: 0,
    borderRadius: 0,
    border: `2px solid ${theme.palette.secondary.main}`,
  },
}));

const SettingsTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: 0,
    maxWidth: "none",
    backgroundColor: alpha(theme.palette.background.default, 1),
  },
}));

const theme = createTheme({
  palette: {
    primary: pink,
    secondary: {
      light: grey[50],
      main: grey[100],
      dark: grey[500],
    },
    text: {
      primary: grey[50],
      secondary: grey[800],
    },
  },
});

export default function PlayerControls({
  dash,
  enterFullscreen,
  exitFullscreen,
  isFullscreen,
}) {
  const [initialized, setInitialized] = useState(false);
  const [visible, setVisible] = useState(true);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [timeline, setTimeline] = useState(time);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [mute, setMute] = useState(false);
  const [quality, setQuality] = useState({ qualityIndex: -1 });
  const [qualityOptions, setQualityOptions] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [buffering, setBuffering] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const [trick, setTrick] = useState({
    visible: false,
    time: 0.0,
    clientReact: {
      x: 0,
      y: 0,
      width: 0,
    },
    position: {
      x: 0,
      y: 0,
    },
    object: null,
  });

  const containerRef = useRef(null);
  const trickWidth = isFullscreen ? 300 : 200;
  const popperRef = useRef(null);
  const settingsRef = useRef(null);
  const loopRef = useRef(loop);
  const trickRef = useRef({
    position: { x: 0, y: 0 },
    areaRef: null,
  });
  const timerRef = useRef(null);
  const mousemoveTimerRef = useRef(null);

  const handleTimelineMouseMove = (event) => {
    trickRef.current.position = { x: event.clientX, y: event.clientY };

    if (popperRef.current != null) {
      popperRef.current.update();
    }

    const { x, y, width } = trickRef.current.areaRef.getBoundingClientRect();
    const trickTime = ((event.clientX - x) / width) * duration;

    dash.provideThumbnail(trickTime, (data) => {
      setTrick({
        visible: true,
        time: trickTime,
        clientReact: {
          x,
          y,
          width,
        },
        position: {
          x: event.clientX,
          y,
        },
        object: data,
      });
    });
  };

  useEffect(() => {
    if (dash) {
      dash.on("playbackPlaying", (event) => {
        setPlaying(true);
      });
      dash.on("playbackPaused", (event) => {
        setPlaying(false);
      });
      dash.on("bufferLevelUpdated", (event) => {
        //console.log(event)
      });

      dash.on("playbackTimeUpdated", (event) => {
        //console.log(event)
        setTime(event.time);
      });

      dash.on("streamInitialized", (event) => {
        setQualityOptions(dash.getBitrateInfoListFor("video"));
        setDuration(event.streamInfo.duration);
        setInitialized(true);
      });

      dash.on("playbackSeeked", (event) => {
        setSeeking(false);
      });

      dash.on("playbackSeeking", (event) => {});

      dash.on("bufferStalled", (event) => {
        if (event.mediaType === "video") {
          setBuffering(true);
        }
      });

      dash.on("bufferLoaded", (event) => {
        if (event.mediaType === "video") {
          setBuffering(false);
        }
      });

      dash.on("playbackEnded", (event) => {
        if (loopRef.current) {
          dash.play();
        }
      });

      dash.on("qualityChangeRendered", (event) => {
        if (event.mediaType === "video") {
          setQuality((prev) => ({
            qualityIndex: prev.qualityIndex,
            newQuality: event.newQuality,
            oldQuality: event.oldQuality,
          }));
        }
      });

      dash.on("playbackRateChanged", (event) => {
        console.log(event);
        setSpeed(event.playbackRate);
      });

      return () => {
        dash.off("playbackPlaying");
        dash.off("playbackPaused");
        dash.off("bufferLevelUpdated");
        dash.off("playbackTimeUpdated");
      };
    }
  }, [dash]);

  useEffect(() => {
    if (!seeking) {
      setTimeline(time);
    }
  }, [time, seeking]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  //   console.log(dashjs.getBitrateInfoListFor('video'))
  //   console.log(
  //     dashjs.provideThumbnail(10, (thumbnail) => {
  //       console.log(thumbnail)
  //     }),
  //   )

  const setPlaybackRate = (rate) => {
    dash.setPlaybackRate(rate);
  };

  const setVideoQuality = (quality) => {
    setQuality((prev) => ({ ...prev, qualityIndex: quality }));

    if (quality !== -1) {
      dash.updateSettings({
        streaming: {
          abr: {
            autoSwitchBitrate: {
              video: false,
              audio: false,
            },
          },
        },
      });
      dash.setQualityFor("video", quality, true);
    } else {
      dash.updateSettings({
        streaming: {
          abr: {
            trackSwitchMode: {
              video: "alwaysReplace",
              audio: "alwaysReplace",
            },
            autoSwitchBitrate: {
              video: true,
              audio: true,
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    if (visible && playing) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 2000);

      return () => clearTimeout(timerRef.current);
    }
  }, [visible, playing]);

  useEffect(() => {
    if (initialized) {
      setMute(false);
      dash.setMute(false);
      dash.setVolume(volume);
    }
  }, [volume, initialized]);

  useEffect(() => {
    if (initialized) {
      if (mute) {
        dash.setMute(true);
      } else {
        dash.setMute(false);
      }
    }
  }, [mute, initialized]);

  return (
    <ThemeProvider theme={theme}>
      {dash ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            color: (theme) => theme.palette.text.primary,
            cursor: visible ? "default" : "none",
          }}
          ref={containerRef}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={playing ? () => setVisible(false) : undefined}
          onMouseMove={(e) => {
            setVisible(true);
            clearTimeout(mousemoveTimerRef.current);
            if (playing) {
              mousemoveTimerRef.current = setTimeout(() => {
                setVisible(false);
              }, 2000);
            }
          }}
        >
          <Stack sx={{ height: "100%" }}>
            <Grid
              container
              sx={{ position: "relative", height: "100%" }}
              direction={"column"}
              onMouseDown={() => (playing ? dash.pause() : dash.play())}
            >
              <Grid item xs></Grid>
              <Grid item xs={8}>
                <Grid
                  container
                  sx={{ height: "100%" }}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Grid item></Grid>
                  <Grid item>
                    {buffering ? (
                      <CircularProgress
                        color={"primary"}
                        size={isFullscreen ? "6rem" : "3.5rem"}
                      />
                    ) : null}
                  </Grid>
                  <Grid item></Grid>
                </Grid>
              </Grid>
              <Grid item xs></Grid>
            </Grid>
            <Fade in={visible || settingsOpen}>
              <Stack
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                }}
                onMouseEnter={(event) => {
                  clearTimeout(timerRef.current);
                  clearTimeout(mousemoveTimerRef.current);
                }}
              >
                <Grid container sx={{ px: 2 }} alignItems={"center"}>
                  <Grid
                    item
                    onMouseMove={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <Grid container spacing={1} alignItems={"center"}>
                      <Grid item>
                        <IconButton
                          size={isFullscreen ? "large" : "medium"}
                          color={"inherit"}
                          edge={"start"}
                        >
                          {playing ? (
                            <Pause
                              fontSize={isFullscreen ? "large" : "medium"}
                            />
                          ) : (
                            <PlayArrow
                              fontSize={isFullscreen ? "large" : "medium"}
                            />
                          )}
                        </IconButton>
                      </Grid>
                      <Grid item>
                        <Grid container spacing={0.5}>
                          <Grid item>
                            <Typography
                              variant={isFullscreen ? "h6" : "body2"}
                              color={"inherit"}
                            >
                              {dash.convertToTimeCode(time)}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Typography
                              variant={isFullscreen ? "h6" : "body2"}
                              color={"inherit"}
                            >
                              /
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Typography
                              variant={isFullscreen ? "h6" : "body2"}
                              color={"inherit"}
                            >
                              {dash.convertToTimeCode(duration)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Box flexGrow={1} />
                  <Grid item ref={settingsRef}>
                    <Grid container alignItems={"center"} spacing={0.5}>
                      <Grid item>
                        <VolumeButton
                          mute={mute}
                          setMute={setMute}
                          volume={volume}
                          setVolume={setVolume}
                          isFullscreen={isFullscreen}
                        />
                      </Grid>
                      <Grid item>
                        <Popper
                          open={settingsOpen}
                          anchorEl={settingsRef.current}
                          placement={"top-end"}
                          disablePortal
                        >
                          {({ TransitionProps }) => (
                            <Grow {...TransitionProps}>
                              <SettingsOption
                                isFullscreen={isFullscreen}
                                setSettingsOpen={setSettingsOpen}
                                containerRef={containerRef}
                                loop={loop}
                                setLoop={setLoop}
                                quality={quality}
                                qualityOptions={qualityOptions}
                                setVideoQuality={setVideoQuality}
                                speed={speed}
                                setPlaybackRate={setPlaybackRate}
                              />
                            </Grow>
                          )}
                        </Popper>
                        <IconButton
                          color={"inherit"}
                          onClick={() => setSettingsOpen(true)}
                          size={isFullscreen ? "large" : "medium"}
                        >
                          <Settings
                            fontSize={isFullscreen ? "large" : "medium"}
                          />
                        </IconButton>
                      </Grid>
                      {enterFullscreen ? (
                        <Grid item>
                          <IconButton
                            size={isFullscreen ? "large" : "medium"}
                            color={"inherit"}
                            onClick={
                              isFullscreen ? exitFullscreen : enterFullscreen
                            }
                          >
                            {isFullscreen ? (
                              <FullscreenExit fontSize={"large"} />
                            ) : (
                              <Fullscreen />
                            )}
                          </IconButton>
                        </Grid>
                      ) : null}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  container
                  sx={{
                    px: { xs: 0, md: 2 },
                    mb: -1,
                    py: isFullscreen ? 2 : 0,
                  }}
                >
                  <Grid item xs={12}>
                    <TrickTooltip
                      open={trick.visible}
                      leaveDelay={200}
                      enterDelay={300}
                      TransitionComponent={Fade}
                      TransitionProps={{ timeout: 200 }}
                      title={
                        <Box
                          sx={{
                            aspectRatio: trick.object
                              ? `${trick.object.width}/${trick.object.height}`
                              : "16/9",
                            width: trick.object
                              ? trick.object.width / trick.object.height > 1
                                ? trickWidth
                                : (trickWidth * trick.object.width) /
                                  trick.object.height
                              : 0,
                            height:
                              trick.object &&
                              trick.object.width / trick.object.height < 1
                                ? trickWidth
                                : undefined,
                            position: "relative",
                          }}
                        >
                          {trick.visible && trick.object ? (
                            <Card
                              square
                              sx={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: "transparent",
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                component={"img"}
                                src={trick.object.url}
                                alt={"trick at timestamp"}
                                sx={{
                                  width:
                                    trick.object.width / trick.object.height > 1
                                      ? trickWidth * 3
                                      : "auto",
                                  height:
                                    trick.object.width / trick.object.height > 1
                                      ? "auto"
                                      : trickWidth * 5,
                                  transform:
                                    trick.object &&
                                    trick.object.width / trick.object.height > 1
                                      ? `translate(-${
                                          (trick.object.x /
                                            trick.object.width) *
                                          trickWidth
                                        }px, -${
                                          (trick.object.y * trickWidth) /
                                          trick.object.width
                                        }px)`
                                      : `translate(-${
                                          (trick.object.x * trickWidth) /
                                          trick.object.height
                                        }px, -${
                                          (trick.object.y /
                                            trick.object.height) *
                                          trickWidth
                                        }px)`,
                                }}
                              />
                            </Card>
                          ) : null}
                          <Grid
                            container
                            sx={{
                              position: "absolute",
                              bottom: -(isFullscreen ? 36 : 26),
                              left: 0,
                              right: 0,
                            }}
                            justifyContent={"center"}
                          >
                            <Grid
                              item
                              sx={{
                                backgroundColor: (theme) =>
                                  theme.palette.secondary.light,
                                px: 1,
                                borderRadius: 10,
                              }}
                            >
                              <Typography
                                variant={"subtitle2"}
                                color={"text.secondary"}
                                sx={{
                                  fontWeight: 600,
                                  fontSize: isFullscreen ? "1rem" : "0.7rem",
                                }}
                              >
                                {dash.convertToTimeCode(trick.time)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      }
                      placement={"top"}
                      sx={{
                        [`& .${tooltipClasses.tooltip}`]: {
                          backgroundColor: theme.palette.common.black,
                        },
                      }}
                      PopperProps={{
                        popperRef,
                        disablePortal: true,
                        anchorEl: {
                          getBoundingClientRect: () => {
                            return new DOMRect(
                              trick.position.x < trick.clientReact.x + 100
                                ? trick.clientReact.x + 100
                                : trick.position.x >
                                  trick.clientReact.x +
                                    trick.clientReact.width -
                                    100
                                ? trick.clientReact.x +
                                  trick.clientReact.width -
                                  100
                                : trick.position.x,
                              trickRef.current.areaRef.getBoundingClientRect()
                                .y - (isFullscreen ? 50 : 30),
                              0,
                              0
                            );
                          },
                        },
                      }}
                    >
                      <Stack
                        sx={{ height: isFullscreen ? 30 : 20 }}
                        justifyContent={"center"}
                        ref={(e) => (trickRef.current.areaRef = e)}
                        onMouseMove={
                          !settingsOpen ? handleTimelineMouseMove : undefined
                        }
                        onMouseLeave={() =>
                          setTrick((prev) => ({ ...prev, visible: false }))
                        }
                      >
                        <Slider
                          color={"primary"}
                          value={timeline}
                          min={0}
                          step={0.1}
                          max={duration}
                          onChange={(event, newValue) => {
                            setSeeking(true);
                            setTimeline(newValue);
                          }}
                          onChangeCommitted={(event, newValue) => {
                            dash.seek(newValue);
                          }}
                          sx={{
                            height: isFullscreen ? 6 : 4,
                            borderRadius: 0,
                            transition:
                              "height 0.3s cubic-bezier(.5,1.64,.41,.8)",
                            "&:hover": {
                              height: isFullscreen ? 10 : 6,
                              "& .MuiSlider-thumb": {
                                width: isFullscreen ? 22 : 14,
                                height: isFullscreen ? 22 : 14,
                              },
                            },
                            "& .MuiSlider-track": {
                              border: "none",
                            },
                            "& .MuiSlider-thumb": {
                              width: 0,
                              height: 0,
                              transition:
                                "height 0.3s cubic-bezier(.5,1.64,.41,.8)",
                              "&.Mui-active": {
                                width: isFullscreen ? 22 : 14,
                                height: isFullscreen ? 22 : 14,
                              },
                              "&:hover, &.Mui-focusVisible, &.Mui-active": {
                                boxShadow: "none",
                              },
                            },
                            "& .MuiSlider-rail": {
                              opacity: 0.2,
                              backgroundColor: (theme) =>
                                theme.palette.secondary.main,
                            },
                          }}
                        />
                      </Stack>
                    </TrickTooltip>
                  </Grid>
                </Grid>
              </Stack>
            </Fade>
          </Stack>
        </Box>
      ) : null}
    </ThemeProvider>
  );
}

const SettingsOption = forwardRef(
  (
    {
      isFullscreen,
      setSettingsOpen,
      containerRef,
      loop,
      setLoop,
      qualityOptions,
      quality,
      setVideoQuality,
      setPlaybackRate,
      speed,
    },
    ref
  ) => {
    const [speedOpen, setSpeedOpen] = useState(false);
    const [qualityOpen, setQualityOpen] = useState(false);
    const activeQuality = qualityOptions.find(
      (option) => option.qualityIndex === quality.newQuality
    );

    const options = [
      {
        label: "Loop",
        Icon: Repeat,
        Secondary: (
          <Switch
            size={isFullscreen ? "medium" : "small"}
            checked={loop}
            onChange={(event, checked) => {
              setLoop(checked);
            }}
            color={"primary"}
          />
        ),
        onClick: () => setLoop((prev) => !prev),
      },
      {
        label: "Quality",
        Icon: Tune,
        Secondary: (
          <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
            <Typography
              sx={{ fontWeight: 600 }}
              variant={isFullscreen ? "body1" : "caption"}
            >
              {activeQuality.width / activeQuality.height > 1
                ? activeQuality.height
                : activeQuality.width}
              p
            </Typography>
            <KeyboardArrowDown
              fontSize={isFullscreen ? "large" : "medium"}
              color={"inherit"}
            />
          </Stack>
        ),
        onClick: () => setQualityOpen(true),
      },
      {
        label: "Speed",
        Icon: SlowMotionVideo,
        Secondary: (
          <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
            <Typography
              sx={{ fontWeight: 600 }}
              variant={isFullscreen ? "body1" : "caption"}
            >
              {speed === 1 ? "Normal" : `${speed}x`}
            </Typography>
            <KeyboardArrowDown
              fontSize={isFullscreen ? "large" : "medium"}
              color={"inherit"}
            />
          </Stack>
        ),
        onClick: () => setSpeedOpen(true),
      },
    ];

    const speedOptions = [2, 1.75, 1.5, 1, 0.75, 0.5, 0.25];

    return (
      <ClickAwayListener onClickAway={() => setSettingsOpen(false)}>
        <Paper sx={{ mb: isFullscreen ? 2 : 1 }} elevation={0}>
          <Stack
            sx={{
              maxHeight: containerRef.current.getBoundingClientRect() * 0.7,
            }}
          >
            <Collapse in={!speedOpen && !qualityOpen} timeout={200}>
              <List
                sx={{
                  minWidth:
                    !speedOpen && !qualityOpen
                      ? isFullscreen
                        ? "25rem"
                        : "18rem"
                      : undefined,
                }}
              >
                {options.map(({ Icon, label, Secondary, onClick }) => (
                  <ListItemButton
                    key={label}
                    sx={{ pl: 2, py: 0.7, color: theme.palette.common.black }}
                    onClick={onClick}
                  >
                    <ListItemIcon
                      sx={{ color: (theme) => theme.palette.common.black }}
                    >
                      <Icon
                        fontSize={isFullscreen ? "large" : "medium"}
                        color={"inherit"}
                      />
                    </ListItemIcon>
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography
                          variant={isFullscreen ? "body1" : "body2"}
                          sx={{ fontWeight: 600 }}
                        >
                          {label}
                        </Typography>
                      }
                    />

                    {Secondary}
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            <Collapse in={speedOpen} timeout={200}>
              <Stack direction={"row"}>
                <ListItemButton onClick={() => setSpeedOpen(false)}>
                  <ListItemIcon>
                    <ArrowBack fontSize={isFullscreen ? "medium" : "small"} />
                  </ListItemIcon>
                  <ListItemText
                    disableTypography
                    sx={{ color: (theme) => theme.palette.common.black }}
                    primary={
                      <Typography
                        variant={isFullscreen ? "body1" : "body2"}
                        sx={{ fontWeight: 600 }}
                      >
                        Speed
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Stack>
              <Divider light />
              <Scrollbars
                autoHeight
                autoHeightMax={
                  containerRef.current.getBoundingClientRect().height * 0.5
                }
              >
                <List>
                  {speedOptions.map((rate) => (
                    <ListItemButton
                      key={rate}
                      sx={{ pl: 3 }}
                      dense={!isFullscreen}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setSpeedOpen(false);
                      }}
                    >
                      <ListItemText
                        disableTypography
                        sx={{
                          color: (theme) =>
                            speed === rate
                              ? theme.palette.common.black
                              : theme.palette.grey[800],
                        }}
                        primary={
                          <Typography
                            variant={isFullscreen ? "body1" : "body2"}
                            sx={{ fontWeight: 600 }}
                          >
                            {rate === 1 ? "Normal" : `${rate}x`}
                          </Typography>
                        }
                      />
                      {speed === rate ? (
                        <Done
                          fontSize={isFullscreen ? "medium" : "small"}
                          sx={{ color: (theme) => theme.palette.common.black }}
                        />
                      ) : null}
                    </ListItemButton>
                  ))}
                </List>
              </Scrollbars>
            </Collapse>
            <Collapse in={qualityOpen} timeout={200}>
              <Stack direction={"row"}>
                <ListItemButton onClick={() => setQualityOpen(false)}>
                  <ListItemIcon>
                    <ArrowBack fontSize={isFullscreen ? "medium" : "small"} />
                  </ListItemIcon>
                  <ListItemText
                    disableTypography
                    sx={{ color: (theme) => theme.palette.common.black }}
                    primary={
                      <Typography
                        variant={isFullscreen ? "body1" : "body2"}
                        sx={{ fontWeight: 600 }}
                      >
                        Quality
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Stack>
              <Divider light />
              <Scrollbars
                autoHeight
                autoHeightMax={
                  containerRef.current.getBoundingClientRect().height * 0.5
                }
              >
                <List>
                  {[
                    ...qualityOptions.sort((a, b) =>
                      a.bitrate > b.bitrate ? -1 : 1
                    ),
                    { qualityIndex: -1 },
                  ].map(({ qualityIndex, width, height }) => (
                    <ListItemButton
                      key={qualityIndex}
                      sx={{ pl: 3 }}
                      dense={!isFullscreen}
                      onClick={() => setVideoQuality(qualityIndex)}
                    >
                      <ListItemText
                        disableTypography
                        sx={{
                          color: (theme) =>
                            qualityIndex === quality.qualityIndex
                              ? theme.palette.common.black
                              : theme.palette.grey[800],
                        }}
                        primary={
                          <Typography
                            variant={isFullscreen ? "body1" : "body2"}
                            sx={{ fontWeight: 600 }}
                          >
                            {qualityIndex === -1
                              ? `Auto ${
                                  quality.qualityIndex === -1
                                    ? `( ${
                                        activeQuality.width /
                                          activeQuality.height >
                                        1
                                          ? activeQuality.height
                                          : activeQuality.width
                                      }p )`
                                    : ""
                                }`
                              : `${width / height > 1 ? height : width}p`}
                          </Typography>
                        }
                      />
                      {qualityIndex === quality.qualityIndex ? (
                        <Done
                          fontSize={isFullscreen ? "medium" : "small"}
                          sx={{
                            color: (theme) => theme.palette.common.black,
                          }}
                        />
                      ) : null}
                    </ListItemButton>
                  ))}
                </List>
              </Scrollbars>
            </Collapse>
          </Stack>
        </Paper>
      </ClickAwayListener>
    );
  }
);

function VolumeButton({ isFullscreen, mute, setMute, volume, setVolume }) {
  const [mouseIn, setMouseIn] = useState(false);
  return (
    <Grid
      container
      onMouseEnter={() => setMouseIn(true)}
      onMouseLeave={() => setMouseIn(false)}
      alignItems={"center"}
      sx={{
        px: 2,
        borderRadius: 50,
        backgroundColor: (theme) =>
          alpha(theme.palette.grey[900], mouseIn ? 0.5 : 0.0),
      }}
    >
      <Collapse in={mouseIn} orientation={"horizontal"} collapsedSize={0}>
        <Grid item sx={{ width: isFullscreen ? 150 : 80 }}>
          <Stack>
            <Slider
              value={mute ? 0 : volume}
              min={0.0}
              max={1.0}
              step={0.1}
              size={"small"}
              color={"secondary"}
              onChange={(event, newValue) => setVolume(newValue)}
              sx={{
                height: isFullscreen ? 6 : 4,
                "& .MuiSlider-track": {
                  border: "none",
                },
                "&:hover": {
                  "& .MuiSlider-thumb": {
                    width: isFullscreen ? 16 : 12,
                    height: isFullscreen ? 16 : 12,
                  },
                },
                "& .MuiSlider-thumb": {
                  width: 0,
                  height: 0,
                  transition: "height 0.3s cubic-bezier(.5,1.64,.41,.8)",
                  "&.Mui-active": {
                    width: isFullscreen ? 16 : 12,
                    height: isFullscreen ? 16 : 12,
                  },
                  "&:hover, &.Mui-focusVisible, &.Mui-active": {
                    boxShadow: "none",
                  },
                },
              }}
            />
          </Stack>
        </Grid>
      </Collapse>
      <Grid item>
        <IconButton
          size={isFullscreen ? "large" : "medium"}
          color={mute ? "error" : "inherit"}
          edge={"end"}
          onClick={() => setMute((prev) => !prev)}
        >
          {mute ? (
            <VolumeOff fontSize={isFullscreen ? "large" : "medium"} />
          ) : (
            <VolumeUp fontSize={isFullscreen ? "large" : "medium"} />
          )}
        </IconButton>
      </Grid>
    </Grid>
  );
}

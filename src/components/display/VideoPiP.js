import {
  Close,
  OpenInNew,
  Pause,
  PlayArrow,
  VolumeOff,
} from "@mui/icons-material";
import {
  Fade,
  Grid,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { useEffect, useRef } from "react";
import { usePlayer } from "../../contexts/player";
import { convertToTimeCode } from "../../helpers/util";

export default function VideoPiP() {
  const {
    pip,
    media,
    playing,
    time,
    duration,
    reset,
    setPip,
    setMedia,
    togglePlay,
  } = usePlayer();
  const miniPlayerRef = useRef();
  const theme = useTheme();
  const matchesMD = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (media.view) {
      const aspectRatio = media.width / media.height;

      if (pip) {
        const { left, height } = miniPlayerRef.current.getBoundingClientRect();
        media.view.style.left = `${left}px`;
        media.view.style.position = "fixed";
        media.view.style.height = `${height}px`;
        media.view.style.bottom = matchesMD ? `56px` : `0px`;
        media.view.style.zIndex = 2;
        media.view.style.width = "auto";
      } else {
        media.view.style.position = "static";
        media.view.style.zIndex = 0;
        media.view.style.height = aspectRatio > 1 ? "auto" : "100%";
        media.view.style.width = aspectRatio > 1 ? "100%" : "auto";
      }
    }
  }, [pip]);

  return (
    <Fade in={pip}>
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          bottom: matchesMD ? 56 : 0,
          height: 90,
        }}
      >
        <Grid container sx={{ flexWrap: "nowrap" }}>
          <Grid
            item
            sx={{
              aspectRatio: `${media.width} / ${media.height}`,
              height: 90,

              backgroundColor: (theme) => theme.palette.common.black,
            }}
            alignItems={"center"}
            ref={miniPlayerRef}
          ></Grid>
          <Grid
            item
            sx={{
              width: `calc(100% - ${
                (media.width / media.height) * 90 + 120
              }px)`,
            }}
          >
            <Grid
              container
              alignItems={"center"}
              flexWrap={"nowrap"}
              sx={{
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Grid item xs>
                <Stack sx={{ px: 2, py: 1 }} spacing={0.5}>
                  <Typography variant={"body1"} sx={{ fontWeight: 600 }} noWrap>
                    {media.title}
                  </Typography>
                  <Stack direction={"row"} spacing={0.5}>
                    <IconButton
                      sx={{
                        backgroundColor: (theme) => theme.palette.grey[200],
                      }}
                      onClick={togglePlay}
                    >
                      {playing ? <Pause /> : <PlayArrow />}
                    </IconButton>

                    <Box width={8} />
                    <Stack
                      direction={"row"}
                      spacing={0.5}
                      alignItems={"center"}
                    >
                      <Typography variant={"body1"} sx={{ fontWeight: 600 }}>
                        {convertToTimeCode(time)}
                      </Typography>
                      <Typography>/</Typography>
                      <Typography variant={"body1"}>
                        {convertToTimeCode(duration)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item>
                <Stack
                  direction={"row"}
                  justifyContent={"flex-end"}
                  sx={{ px: 2, py: 1, minWidth: 60 }}
                  spacing={1}
                >
                  <IconButton
                    sx={{
                      backgroundColor: (theme) => theme.palette.grey[200],
                    }}
                    onClick={() => {
                      media.view.style.position = "static";
                      media.view.style.height = "auto";
                      media.view.style.width = "100%";
                      reset();
                    }}
                  >
                    <Close />
                  </IconButton>
                  <IconButton
                    sx={{
                      backgroundColor: (theme) => theme.palette.grey[200],
                    }}
                    onClick={() => {
                      window.scrollTo({
                        top:
                          media.view.parentNode.getBoundingClientRect().top +
                          window.pageYOffset -
                          80,
                        behavior: "smooth",
                      });
                    }}
                  >
                    <OpenInNew />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );
}

import {
  MoreHoriz,
  PlayCircleOutline,
  Share,
  ThumbDown,
  ThumbUp,
} from "@mui/icons-material";
import {
  Card,
  Stack,
  Box,
  Typography,
  Grid,
  ButtonGroup,
  Button,
  IconButton,
  Divider,
  Paper,
  CardActionArea,
} from "@mui/material";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { getUserPosts } from "../../../apis/endpoints/user";
import { usePlayer } from "../../contexts/player";
import CommentList from "../comments/List";
import PlayerControls from "../player/PlayerControls";

export default function Timeline({ id, me }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [id]);

  const fetchPosts = async () => {
    const res = await getUserPosts(id);
    if (res.status === 200) {
      setPosts(res.data);
    }
  };

  return (
    <Stack spacing={3}>
      <Grid container justifyContent={"space-evenly"}>
        <Grid item md={4} xs={0}></Grid>
        <Grid item md={8} xs={11}>
          <Paper elevation={0}>
            <Stack
              sx={{ p: 2, height: 160 }}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography
                variant={"body1"}
                sx={{ fontStyle: "normal", textTransform: "lowercase" }}
              >
                " HAVE MORE THAN YOU SHOW AND SPEAK LESS THAN YOU KNOW."
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Stack spacing={3}>
        {posts.map(
          ({
            id,
            title,
            uri,
            description,
            thumbnail,
            width,
            height,
            createdAt,
          }) => (
            <Grid container key={id}>
              <Grid
                item
                md={4}
                xs={0}
                sx={{ display: { xs: "none", md: "initial" } }}
              >
                <Grid
                  container
                  direction={"column"}
                  alignItems={"center"}
                  sx={{ height: "100%" }}
                >
                  <Grid item sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: (theme) => theme.palette.primary.light,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: -5,
                        left: 20,
                        width: 120,
                      }}
                    >
                      <Typography
                        color={"text.secondary"}
                        sx={{ fontWeight: 600 }}
                      >
                        {moment(createdAt).fromNow()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs>
                    <Box
                      sx={{
                        width: 2,
                        height: "100%",
                        backgroundColor: (theme) => theme.palette.primary.light,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={8}>
                <Post
                  id={id}
                  title={title}
                  description={description}
                  width={width}
                  height={height}
                  thumbnail={thumbnail}
                  me={me}
                  uri={uri}
                />
              </Grid>
            </Grid>
          )
        )}
      </Stack>
    </Stack>
  );
}

function Post({ me, id, uri, title, description, thumbnail, width, height }) {
  const { time, media, dash, setMedia } = usePlayer();
  const fullscreenHandle = useFullScreenHandle();

  const [active, setActive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (media.id === id) {
      setStartTime(time);
    }
  }, [time]);

  const play = () => {
    setActive(true);
  };

  useEffect(() => {
    if (active) {
      setMedia({
        id,
        url: `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${uri}`,
        width,
        height,
        title,
        view: ref.current,
        autoPlay: true,
        startTime,
      });
    }
  }, [active]);

  useEffect(() => {
    if (media.id !== id) {
      setActive(false);
    }
  }, [media]);

  const aspectRatio = width / height;

  return (
    <Card elevation={0} key={id}>
      <FullScreen
        handle={fullscreenHandle}
        onChange={(isFullscreen) => setFullscreen(isFullscreen)}
      >
        <Stack
          alignItems={"center"}
          justifyContent={"center"}
          sx={{
            aspectRatio: `${
              fullscreen
                ? undefined
                : aspectRatio > 1
                ? aspectRatio
                : Math.max(aspectRatio, 16 / 9)
            }`,
            width: fullscreen ? "100vw" : "100%",
            height: fullscreen ? "100vh" : undefined,
            position: "relative",
            backgroundColor: (theme) => theme.palette.common.black,
          }}
        >
          {active ? (
            <>
              <Box
                component={"video"}
                ref={ref}
                sx={{
                  display: "block",
                  width: aspectRatio > 1 ? "100%" : "auto",
                  height:
                    aspectRatio < 1 ? (fullscreen ? "100vh" : "65vh") : "auto",
                }}
              />
              <PlayerControls
                dash={dash}
                isFullscreen={fullscreen}
                enterFullscreen={fullscreenHandle.enter}
                exitFullscreen={fullscreenHandle.exit}
              />
            </>
          ) : (
            <CardActionArea onClick={play} sx={{ position: "relative" }}>
              <Stack alignItems={"center"} justifyContent={"center"}>
                <Box
                  component={"img"}
                  src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${thumbnail}`}
                  sx={{
                    width: aspectRatio > 1 ? "100%" : "auto",
                    maxHeight: aspectRatio > 1 ? "auto" : "65vh",
                  }}
                />
                <Stack
                  sx={{ position: "absolute", inset: 0 }}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <PlayCircleOutline
                    color={"primary"}
                    sx={{ fontSize: "5rem" }}
                  />
                </Stack>
              </Stack>
            </CardActionArea>
          )}
        </Stack>
        <Stack sx={{ p: 2 }} spacing={1}>
          <Typography
            variant={"h6"}
            sx={{ fontSize: "1.1rem", fontWeight: 600 }}
            noWrap
          >
            {title}
          </Typography>
          <Grid
            container
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Grid item>
              <Stack>
                <Stack direction={"row"} spacing={0.5}>
                  <Typography variant={"body1"} sx={{ fontWeight: 600 }}>
                    129
                  </Typography>
                  <Typography variant={"body1"}>views</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item>
              <Stack direction={"row"} spacing={1.5}>
                <ButtonGroup
                  color={"inherit"}
                  variant={"contained"}
                  disableElevation
                  size={"small"}
                >
                  <Button
                    size={"small"}
                    startIcon={<ThumbUp fontSize={"small"} />}
                    sx={{ fontWeight: 600 }}
                  >
                    Like
                  </Button>
                  <Button
                    size={"small"}
                    startIcon={<ThumbDown fontSize={"small"} />}
                    sx={{ fontWeight: 600 }}
                  >
                    Dislike
                  </Button>
                </ButtonGroup>
                <Button
                  startIcon={<Share />}
                  variant={"contained"}
                  disableElevation
                  color={"inherit"}
                  sx={{ fontWeight: 600 }}
                >
                  Share
                </Button>
                <IconButton
                  sx={{
                    backgroundColor: (theme) => theme.palette.grey[300],
                    fontWeight: 600,
                  }}
                  color={"inherit"}
                >
                  <MoreHoriz fontSize={"small"} />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
          <Box height={8} />
          <Typography variant={"body2"} sx={{ fontSize: ".97rem" }}>
            {description}
          </Typography>
          <Box height={8} />
          <Divider />
          <Typography sx={{ fontWeight: 600 }} variant={"body1"}>
            Comments
          </Typography>
          <Stack sx={{ pl: 3 }}>
            <CommentList id={id} author={me} />
          </Stack>
        </Stack>
      </FullScreen>
    </Card>
  );
}

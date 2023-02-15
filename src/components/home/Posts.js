import {
  Done,
  DoneAll,
  MoreHoriz,
  OpenInNew,
  OpenInNewOff,
  PersonAdd,
  PictureInPictureAlt,
  PlayCircleFilled,
  PlayCircleOutline,
  PlaylistAdd,
  Sd,
  Share,
  ThumbDown,
  ThumbUp,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActionArea,
  CircularProgress,
  Divider,
  Grid,
  Grow,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import VisibilitySensor from "react-visibility-sensor";
import InfiniteScroll from "react-infinite-scroller";
import {
  addReaction,
  deleteReaction,
  getAllPosts,
  getMyReaction,
} from "../../../apis/endpoints/post";

import { convertToTimeCode } from "../../helpers/util";
import { useTheme } from "@emotion/react";
import { usePlayer } from "../../contexts/player";
import {
  addFollowing,
  deleteFollowing,
  isFollowing,
} from "../../../apis/endpoints/follow";
import { useAuth } from "../../contexts/auth";
import CommentList from "../comments/List";
import PlayerControls from "../player/PlayerControls";
import { getUserFeed } from "../../../apis/endpoints/feed";
import Link from "../../Link";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [fullPosts, setFullPosts] = useState([]);
  const [initializing, setInitializing] = useState(true);
  const [loadingMore, setLoadingMore] = useState(true);
  const [hasWindow, setHasWindow] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const theme = useTheme();
  const matchesSM = useMediaQuery(theme.breakpoints.up("sm"));
  const matchesMD = useMediaQuery(theme.breakpoints.up("md"));
  const matchesLG = useMediaQuery(theme.breakpoints.up("lg"));

  const rowSize = matchesLG ? 3 : matchesMD ? 3 : matchesSM ? 2 : 1;
  const pageSize = rowSize * 2;

  // useEffect(() => {
  //   getUserFeed()
  //     .then((res) => setPosts([...res.data, ...res.data]))
  //     .finally(() => {
  //       setInitializing(false);
  //     });
  // }, []);

  const getRowFullPost = (idx) => {
    for (let i = 0; i < rowSize; i++) {
      if (fullPosts.includes(i + idx)) {
        return posts[i + idx];
      }
    }
  };

  const setRowPost = (idx) => {
    const start = parseInt(idx / rowSize) * rowSize;
    const newFullPosts = [...fullPosts];
    for (let i = start; i < start + rowSize; i++) {
      const index = newFullPosts.findIndex((elem) => elem === i);
      if (index !== -1) {
        newFullPosts.splice(index, 1, idx);
        setFullPosts(newFullPosts);
        return;
      }
    }
    newFullPosts.push(idx);
    setFullPosts(newFullPosts);
  };

  useEffect(() => {
    if (typeof window !== undefined) {
      setHasWindow(true);
    }
  }, []);

  return (
    <InfiniteScroll
      pageStart={0}
      hasMore={hasMore && hasWindow}
      initialLoad
      loader={
        <Stack
          key={posts.length}
          justifyContent={"center"}
          alignItems={"center"}
          sx={{ height: "5rem" }}
        >
          <CircularProgress size={"2rem"} />
        </Stack>
      }
      loadMore={(page) => {
        setLoadingMore(true);
        getUserFeed({ offset: (page - 1) * pageSize, limit: pageSize })
          .then((res) => {
            if (res.data.length < pageSize || res.data.length === 0) {
              setHasMore(false);
            }
            setPosts((prev) => [...prev, ...res.data]);
          })
          .finally(() => {
            setLoadingMore(false);
          });
      }}
    >
      <Grid container spacing={3}>
        {posts.map((post, i) => {
          const fullPost = i % rowSize === 0 ? getRowFullPost(i) : null;

          return [
            fullPost ? (
              <Grid item xs={12} key={`${post.id}_fullpost`}>
                <FullPost {...fullPost} />
              </Grid>
            ) : null,
            <Grid
              md={4}
              xs={12}
              sm={6}
              lg={4}
              item
              key={`${post.id}_${i}`}
              sx={{
                display: {
                  xs: fullPosts.includes(i) ? "none" : "initial",
                  sm: "initial",
                },
              }}
            >
              <PostCard
                opened={fullPosts.includes(i)}
                openPost={() => setRowPost(i)}
                {...post}
              />
            </Grid>,
          ];
        })}
      </Grid>
    </InfiniteScroll>
  );
}

function FullPost({
  id,
  uri,
  title,
  description,
  thumbnail,
  duration,
  width,
  height,
  author,
  createdAt,
}) {
  const { time, pip, reset, media, setMedia, setPip, dash } = usePlayer();
  const { user } = useAuth();
  const [reaction, setReaction] = useState(null);
  const [following, setFollowing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const fullscreenHandle = useFullScreenHandle();
  const ref = useRef(null);

  useEffect(() => {
    if (media.id === id && !fullscreen) {
      if (!visible) {
        setPip(true);
      } else {
        setPip(false);
      }
    }
  }, [visible]);

  useEffect(() => {
    switchMedia();

    const fetchInitialState = async () => {
      const [rRes, fRes] = await Promise.all([
        getMyReaction(id),
        isFollowing({ followee: user.id, follower: author.id }),
      ]);

      if (rRes.data.type) {
        setReaction(rRes.data);
      }

      if (fRes.data.id) {
        setFollowing(fRes.data);
      }
    };

    fetchInitialState();

    window.scrollTo({
      top: ref.current.getBoundingClientRect().top + window.pageYOffset - 80,
      behavior: "auto",
    });
  }, [id]);

  useEffect(() => {
    if (media.id === id) {
      setStartTime(time);
    }
  }, [time]);

  const switchMedia = () => {
    setPip(false);

    // if (media.view) {
    //   media.view.style.position = "static";
    //   media.view.style.height = "auto";
    //   media.view.style.width = "100%";
    // }

    setMedia({
      id,
      url: `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${uri}`,
      width,
      height,
      title,
      view: ref.current,
      autoPlay: true,
      fullscreenHandle: fullscreenHandle,
      startTime,
    });
  };

  const handleAddReaction = async (type) => {
    setLoading(true);
    try {
      const res = await addReaction(id, { type });
      if (res.status === 201) {
        setReaction(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReaction = async () => {
    setLoading(true);
    try {
      const res = await deleteReaction(id, reaction.id);
      if (res.status === 200) {
        setReaction(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowing = async () => {
    setLoading(true);
    try {
      const res = await addFollowing(author.id);
      if (res.status === 201) {
        setFollowing(res.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFollowing = async () => {
    setLoading(true);
    try {
      const res = await deleteFollowing(following.id);
      if (res.status === 200) {
        setFollowing(null);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const aspectRatio = width / height;

  return (
    <Card
      elevation={0}
      sx={{
        "& .fullscreen": {
          overflowY: "auto",
          backgroundColor: (theme) => theme.palette.common.white,
          "::-webkit-scrollbar": {
            display: "none",
          },
        },
      }}
    >
      <FullScreen
        handle={fullscreenHandle}
        onChange={(state) => setFullscreen(state)}
      >
        <Stack>
          <VisibilitySensor
            onChange={(isVisible) => setVisible(isVisible)}
            scrollThrottle={1}
            partialVisibility
            offset={{ top: 200, bottom: 200 }}
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
              <Box
                component={"video"}
                sx={{
                  display: "block",
                  width: aspectRatio > 1 ? "100%" : "auto",
                  height:
                    aspectRatio < 1 ? (fullscreen ? "100vh" : "70vh") : "auto",
                }}
                ref={ref}
              />
              <PlayerControls
                dash={dash}
                enterFullscreen={fullscreenHandle.enter}
                exitFullscreen={fullscreenHandle.exit}
                isFullscreen={fullscreen}
              />
              {media.id === id && pip ? (
                <Stack
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: (theme) => theme.palette.common.black,
                    color: (theme) => theme.palette.grey[500],
                  }}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <PictureInPictureAlt sx={{ fontSize: "5rem" }} />
                  <Typography variant={"body1"}>
                    Video playing in picture-in-picture mode.
                  </Typography>
                </Stack>
              ) : media.id && media.id !== id ? (
                <Stack
                  onClick={() => {
                    switchMedia();
                  }}
                  justifyContent={"center"}
                  alignItems={"center"}
                  sx={{ width: "100%", height: "100%" }}
                >
                  <Box
                    component={"img"}
                    src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${thumbnail}`}
                    sx={{
                      width: aspectRatio > 1 ? "100%" : "auto",
                      maxHeight: aspectRatio > 1 ? "auto" : "70vh",
                    }}
                  />
                  <Stack
                    sx={{
                      position: "absolute",
                      inset: 0,
                    }}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <PlayCircleOutline
                      sx={{ fontSize: "5rem" }}
                      color={"primary"}
                    />
                  </Stack>
                </Stack>
              ) : null}
            </Stack>
          </VisibilitySensor>
          <Box sx={{ px: 2, py: 1 }}>
            <Stack spacing={0.5}>
              <Grid container justifyContent={"space-between"}>
                <Grid item xs={9}>
                  <Typography variant={"h6"} sx={{ fontWeight: 600 }} noWrap>
                    {title}
                  </Typography>
                </Grid>
                <Grid item>
                  <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
                    <Typography
                      variant={"h6"}
                      sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                    >
                      126
                    </Typography>
                    <Typography>views</Typography>
                  </Stack>
                </Grid>
              </Grid>
              <Grid
                container
                sx={{
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: { xs: "space-between" },
                  alignItems: { md: "center" },
                }}
              >
                <Grid item xs={12} md={5}>
                  <Box>
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      spacing={1}
                      sx={{
                        justifyContent: { xs: "space-between", md: "initial" },
                        mb: { xs: 2, md: 0 },
                      }}
                    >
                      <Stack direction={"row"} spacing={1}>
                        <Link href={`/profile/${author.id}`}>
                          <Avatar
                            alt={author.name}
                            src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${author.avatar}`}
                            sx={{ width: "2.5rem", height: "2.5rem" }}
                          />
                        </Link>
                        <Stack>
                          <Link
                            href={`/profile/${author.id}`}
                            underline={"none"}
                            color={"inherit"}
                          >
                            <Typography
                              variant={"body1"}
                              sx={{ fontWeight: 500 }}
                            >
                              {author.name}
                            </Typography>
                          </Link>
                          <Stack direction={"row"} spacing={0.5}>
                            <Typography
                              color={"text.secondary"}
                              variant={"body2"}
                              sx={{ fontWeight: 600 }}
                            >
                              11K
                            </Typography>
                            <Typography
                              color={"text.secondary"}
                              variant={"body2"}
                            >
                              followers
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                      <Box width={12} />
                      <Button
                        disabled={loading}
                        onClick={
                          following?.id
                            ? handleDeleteFollowing
                            : handleAddFollowing
                        }
                        variant={"contained"}
                        size={"small"}
                        color={"inherit"}
                        disableElevation
                        startIcon={following?.id ? <Done /> : <PersonAdd />}
                        sx={{ fontWeight: 600 }}
                      >
                        {following?.id ? "following" : "follow"}
                      </Button>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Stack
                    direction={"row"}
                    spacing={1}
                    alignItems={"center"}
                    sx={{
                      justifyContent: { xs: "space-between", md: "flex-end" },
                    }}
                  >
                    <ButtonGroup>
                      <Button
                        disabled={loading}
                        size={"small"}
                        color={"inherit"}
                        startIcon={
                          <ThumbUp
                            color={
                              reaction?.type === "like" ? "inherit" : "disabled"
                            }
                          />
                        }
                        sx={{ fontWeight: 600 }}
                        variant={"contained"}
                        onClick={() =>
                          reaction?.type === "like"
                            ? handleDeleteReaction()
                            : handleAddReaction("like")
                        }
                        disableElevation
                      >
                        27
                      </Button>
                      <Button
                        disabled={loading}
                        size={"small"}
                        color={"inherit"}
                        startIcon={
                          <ThumbDown
                            color={
                              reaction?.type === "dislike"
                                ? "inherit"
                                : "disabled"
                            }
                          />
                        }
                        sx={{ fontWeight: 600 }}
                        variant={"contained"}
                        onClick={() =>
                          reaction?.type === "dislike"
                            ? handleDeleteReaction()
                            : handleAddReaction("dislike")
                        }
                        disableElevation
                      >
                        11
                      </Button>
                    </ButtonGroup>
                    <Stack direction={"row"} spacing={1}>
                      <Button
                        sx={{ fontWeight: 600 }}
                        startIcon={<Share />}
                        variant={"contained"}
                        size={"small"}
                        color={"inherit"}
                        disableElevation
                      >
                        Share
                      </Button>
                      <IconButton
                        sx={{
                          backgroundColor: (theme) => theme.palette.grey[300],
                        }}
                        size={"small"}
                        color={"inherit"}
                      >
                        <MoreHoriz />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
              <Box height={16} />
              <Stack>
                <Typography variant={"body2"} sx={{ fontSize: ".97rem" }}>
                  {description}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
        <Box height={8} />
        <Divider />
        <Stack sx={{ px: 2, py: 1 }} spacing={1}>
          <Typography
            variant={"body1"}
            sx={{ fontWeight: 600, fontSize: "1.1rem" }}
          >
            Comments
          </Typography>
          <Box sx={{ pl: 2 }}>
            <CommentList author={user} id={id} />
          </Box>

          <Box height={8} />
        </Stack>
      </FullScreen>
    </Card>
  );
}

function PostCard({
  id,
  uri,
  title,
  opened,
  thumbnail,
  duration,
  width,
  height,
  author,
  openPost,
  createdAt,
}) {
  const aspectRatio = width / height;
  const [mouseIn, setMouseIn] = useState(false);
  const isHD = aspectRatio > 1 ? width >= 1920 : height >= 1920;

  return (
    <Card
      square
      elevation={0}
      onMouseEnter={() => setMouseIn(true)}
      onMouseLeave={() => setMouseIn(false)}
      sx={{ cursor: opened ? "not-allowed" : "pointer" }}
      onClick={opened ? undefined : openPost}
    >
      <CardActionArea disabled={opened}>
        <Stack
          position={"relative"}
          sx={{
            aspectRatio: "16/9",
            backgroundColor: (theme) => theme.palette.common.black,
          }}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Stack
            sx={{
              position: "absolute",
              top: 6,
              right: 10,
              left: 10,
            }}
            direction={"row"}
            justifyContent={"flex-end"}
          >
            {opened ? (
              <Box
                sx={{
                  px: 1,
                  borderRadius: (theme) => theme.shape.borderRadius,
                  color: (theme) => theme.palette.common.white,
                  backgroundColor: (theme) => theme.palette.common.black,
                }}
              >
                <Typography
                  color={"inherit"}
                  variant={"button"}
                  sx={{ fontWeight: 600, fontSize: "0.77rem" }}
                >
                  Opened
                </Typography>
              </Box>
            ) : null}
          </Stack>
          <Box
            sx={{
              display: "block",
              width: aspectRatio > 1 ? "100%" : "auto",
              height: aspectRatio > 1 ? "auto" : "100%",
              aspectRatio: `${aspectRatio}`,
            }}
            component={"img"}
            src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${thumbnail}`}
          />
          <Stack
            sx={{ position: "absolute", inset: 0 }}
            justifyContent={"center"}
            alignItems={"center"}
          >
            {opened ? null : (
              <Grow in={mouseIn}>
                <PlayCircleOutline
                  sx={{ fontSize: "3rem" }}
                  color={"primary"}
                />
              </Grow>
            )}
          </Stack>
          <Stack
            sx={{
              position: "absolute",
              bottom: 6,
              right: 10,
              left: 10,
            }}
            direction={"row"}
            justifyContent={"space-between"}
          >
            <Box
              sx={{
                px: 1,
                borderRadius: (theme) => theme.shape.borderRadius,
                color: (theme) => theme.palette.common.white,
                backgroundColor: (theme) => theme.palette.common.black,
              }}
            >
              <Typography variant={"subtitle2"} sx={{ fontSize: "0.8rem" }}>
                {isHD ? "HD" : "SD"}
              </Typography>
            </Box>
            <Box
              sx={{
                px: 1,
                borderRadius: (theme) => theme.shape.borderRadius,
                color: (theme) => theme.palette.common.white,
                backgroundColor: (theme) => theme.palette.common.black,
              }}
            >
              <Typography
                color={"inherit"}
                variant={"body2"}
                sx={{ fontWeight: 600, letterSpacing: 1.1 }}
              >
                {convertToTimeCode(duration / 1000)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardActionArea>
      <Stack sx={{ p: 1 }}>
        <Tooltip title={title} placement={"bottom-start"}>
          <Grid container>
            <Grid item xs={11}>
              <Typography
                variant={"body1"}
                color={"text.primary"}
                sx={{ fontWeight: 600 }}
                noWrap
              >
                {title}
              </Typography>
            </Grid>
          </Grid>
        </Tooltip>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography
            variant={"body2"}
            color={"text.primary"}
            sx={{ fontWeight: 400 }}
          >
            {author.name}
          </Typography>
          <Stack direction={"row"} spacing={0.5}>
            <Typography variant={"body2"} sx={{ fontWeight: 600 }}>
              112
            </Typography>
            <Typography variant={"body2"} color={"text.secondary"}>
              views
            </Typography>
          </Stack>
        </Stack>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Box>
            <Stack
              direction={"row"}
              sx={{ color: (theme) => theme.palette.grey[600] }}
              spacing={1}
              alignItems={"center"}
            >
              <Typography color={"inherit"} variant={"body2"}>
                {moment(createdAt).fromNow()}
              </Typography>
            </Stack>
          </Box>
          <Box>
            <Stack direction={"row"} spacing={1}>
              <Box>
                <Stack direction={"row"} spacing={0.5}>
                  <ThumbUp color={"disabled"} fontSize={"small"} />
                  <Typography variant={"body2"} sx={{ fontWeight: 600 }}>
                    28
                  </Typography>
                </Stack>
              </Box>
              <Box>
                <Stack direction={"row"} spacing={0.5}>
                  <ThumbDown color={"disabled"} fontSize={"small"} />
                  <Typography variant={"body2"} sx={{ fontWeight: 600 }}>
                    10
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}

/*
initializing ? (
    <Paper elevation={0}>
      <Stack
        sx={{ minHeight: "10rem" }}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <CircularProgress size={"3.5rem"} />
      </Stack>
    </Paper>
  ) : posts.length === 0 ? (
    <Paper elevation={0}>
      <Stack
        sx={{ minHeight: "10rem" }}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Typography
          sx={{ fontSize: "1.2rem" }}
          color={"text.secondary"}
          variant={"body1"}
        >
          Start following people to get their post.
        </Typography>
      </Stack>
    </Paper>
  ) : (
    <Stack>
    */

import {
  CalendarMonth,
  PersonAdd,
  PostAdd,
  UndoOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { pink } from "@mui/material/colors";
import moment from "moment";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { TransitionGroup } from "react-transition-group";
import {
  addFollowing,
  deleteFollowing,
  getFollowings,
  getWhomToFollow,
} from "../../../apis/endpoints/follow";
import Link from "../../Link";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role={"tabpanel"} hidden={value !== index}>
      {
        <Box sx={{ visibility: index === value ? "visible" : "hidden" }}>
          {children}
        </Box>
      }
    </div>
  );
}

export default function Followings() {
  const [followings, setFollowings] = useState([]);
  const [undoList, setUndoList] = useState([]);
  const [whomToFollow, setWhomToFollow] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const handleAddFollowing = async (id) => {
    try {
      const res = await addFollowing(id);
      if (res.status === 201) {
        setUndoList((prev) =>
          prev.filter((follower) => res.data.follower.id !== follower)
        );
        setFollowings((prev) =>
          prev.map((following) =>
            following.follower.id === id ? res.data : following
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteFollowing = async (id) => {
    try {
      console.log(id);
      const res = await deleteFollowing(id);
      if (res.status === 200) {
        setUndoList((prev) => [...prev, res.data.follower.id]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Stack>
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          top: (theme) => theme.mixins.toolbar.minHeight,
          zIndex: 2,
          display: { xs: "initial", md: "none" },
        }}
      >
        <Tabs
          centered
          variant={"fullWidth"}
          value={selectedTab}
          onChange={(event, newValue) => setSelectedTab(newValue)}
        >
          <Tab label={"You Follow"} />
          <Tab label={"Whom To Follow"} />
        </Tabs>
        <Divider light />
      </Paper>
      <TabPanel index={0} value={selectedTab}>
        <WhomIFollow
          undoList={undoList}
          setUndoList={setUndoList}
          followings={followings}
          setFollowings={setFollowings}
          handleAddFollowing={handleAddFollowing}
          handleDeleteFollowing={handleDeleteFollowing}
        />
      </TabPanel>
      <TabPanel index={1} value={selectedTab}>
        <WhomToFollow
          whomToFollow={whomToFollow}
          setWhomToFollow={setWhomToFollow}
          setFollowings={setFollowings}
        />
      </TabPanel>
    </Stack>
  );
}

function WhomIFollow({
  undoList,
  setUndoList,
  followings,
  setFollowings,
  handleAddFollowing,
  handleDeleteFollowing,
}) {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasWindow, setHasWindow] = useState(false);

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
          key={followings.length}
          sx={{ height: "10rem" }}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <CircularProgress />
        </Stack>
      }
      loadMore={(page) => {
        getFollowings({ offset: (page - 1) * 6, limit: 6 })
          .then((res) => {
            if (res.data.length < 6) {
              setHasMore(false);
            }
            setFollowings((prev) => [...prev, ...res.data]);
          })
          .finally(() => {
            setLoading(false);
          });
      }}
    >
      <Grid container spacing={2} sx={{ p: { xs: 2, lg: 0 } }}>
        {followings.length === 0 ? (
          <Grid item xs>
            <Paper elevation={0}>
              <Stack sx={{ minHeight: "10rem" }} justifyContent={"center"}>
                <Typography
                  variant={"h6"}
                  sx={{ color: (theme) => theme.palette.info.main }}
                  align={"center"}
                >
                  You do not follow anyone.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ) : (
          followings.map(({ id, follower, createdAt }, i) => (
            <Grid key={isNaN} lg={4} item xs={12} sm={6}>
              <FollowCard
                {...follower}
                undoList={undoList}
                handleAddFollowing={() => handleAddFollowing(follower.id)}
                handleDeleteFollowing={() => handleDeleteFollowing(id)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </InfiniteScroll>
  );
}

function WhomToFollow({ setFollowings, whomToFollow, setWhomToFollow }) {
  const [hasMore, setHasMore] = useState(true);
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (typeof window !== undefined) {
      setHasWindow(true);
    }
  }, []);

  const handleAddFollowing = async (id) => {
    try {
      const res = await addFollowing(id);
      if (res.status === 201) {
        setWhomToFollow((prev) =>
          prev.filter((user) => res.data.follower.id !== user.id)
        );
        setFollowings((prev) => [res.data, ...prev]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <InfiniteScroll
      pageStart={0}
      hasMore={hasMore && hasWindow}
      initialLoad
      loader={
        <Stack
          key={whomToFollow.length}
          sx={{ height: "10rem" }}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <CircularProgress />
        </Stack>
      }
      loadMore={(page) => {
        getWhomToFollow({ offset: (page - 1) * 6, limit: 6 })
          .then((res) => {
            if (res.data.length < 6) {
              setHasMore(false);
            }
            setWhomToFollow((prev) => [...prev, ...res.data]);
          })
          .finally(() => {});
      }}
    >
      <Grid container spacing={2} sx={{ p: { xs: 2, lg: 0 } }}>
        {whomToFollow.length === 0 ? (
          <Grid item xs>
            <Paper elevation={0}>
              <Stack sx={{ minHeight: "10rem" }} justifyContent={"center"}>
                <Typography
                  variant={"h6"}
                  sx={{ color: (theme) => theme.palette.info.main }}
                  align={"center"}
                >
                  Sorry, we don't have any persom whom you could follow.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ) : (
          whomToFollow.map((user, i) => (
            <Grid item key={i} lg={4} xs={12} sm={6}>
              <WhomToFollowCard
                {...user}
                handleAddFollowing={() => handleAddFollowing(user.id)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </InfiniteScroll>
  );
}

function WhomToFollowCard({ id, name, avatar, cover, handleAddFollowing }) {
  return (
    <Card elevation={0}>
      <Stack>
        {cover ? (
          <Box
            component={"img"}
            src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${cover}`}
            sx={{ width: "100%", auto: "height" }}
          />
        ) : (
          <Box
            sx={{
              backgroundColor: pink[50],
              aspectRatio: "2.5",
              width: "100%",
            }}
          />
        )}
        <Stack sx={{ pr: 2, pb: 2, pl: 3, mt: -5 }} spacing={1}>
          <Grid container>
            <Grid item md={5} xs={3} lg={3}>
              <Avatar
                src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${avatar}`}
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 100,
                  border: (theme) =>
                    `6px solid ${theme.palette.background.paper}`,
                }}
              />
            </Grid>
          </Grid>
          <Grid
            container
            alignItems={"center"}
            justifyContent={"space-between"}
            flexWrap={"nowrap"}
          >
            <Grid item xs>
              <Stack>
                <Link
                  href={`/profile/${id}`}
                  underline={"none"}
                  color={"inherit"}
                >
                  <Typography
                    variant={"body1"}
                    sx={{ fontWeight: 600 }}
                    color={"text.primary"}
                    noWrap
                  >
                    {name}
                  </Typography>
                </Link>
              </Stack>
            </Grid>
            <Grid item xs={"auto"}>
              <Button
                sx={{ fontSize: "0.7rem", fontWeight: 600, borderRadius: 2 }}
                size={"small"}
                variant={"contained"}
                disableElevation
                color={"primary"}
                onClick={handleAddFollowing}
                startIcon={
                  <Stack direction={"row"}>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: "0.72rem!important" }}
                    >
                      1.1K
                    </Typography>
                  </Stack>
                }
              >
                {"follow"}
              </Button>
            </Grid>
          </Grid>

          <Stack direction={"row"} spacing={1}>
            <PostAdd color={"disabled"} fontSize={"small"} />
            <Typography variant={"body2"}>
              He has posted more than{" "}
              <Box component={"span"} sx={{ fontWeight: 600 }}>
                120
              </Box>{" "}
              stories.
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

function FollowCard({
  id,
  name,
  avatar,
  cover,
  createdAt,
  undoList,
  handleAddFollowing,
  handleDeleteFollowing,
}) {
  const undo = undoList.includes(id);

  return (
    <Card elevation={0}>
      <Stack>
        {cover ? (
          <Box
            component={"img"}
            src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${cover}`}
            sx={{ width: "100%", auto: "height" }}
          />
        ) : (
          <Box
            sx={{
              backgroundColor: pink[50],
              aspectRatio: "2.5",
              width: "100%",
            }}
          />
        )}
        <Stack sx={{ pr: 2, pb: 2, pl: 3, mt: -5 }} spacing={1}>
          <Grid container>
            <Grid item md={5} xs={3} lg={3}>
              <Avatar
                src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${avatar}`}
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 100,
                  border: (theme) =>
                    `6px solid ${theme.palette.background.paper}`,
                }}
              />
            </Grid>
          </Grid>
          <Grid
            container
            alignItems={"center"}
            justifyContent={"space-between"}
            flexWrap={"nowrap"}
          >
            <Grid item xs>
              <Stack>
                <Link
                  href={`/profile/${id}`}
                  underline={"none"}
                  color={"inherit"}
                >
                  <Typography
                    variant={"body1"}
                    sx={{ fontWeight: 600 }}
                    color={"text.primary"}
                    noWrap
                  >
                    {name}
                  </Typography>
                </Link>
              </Stack>
            </Grid>
            <Grid item xs={"auto"}>
              <Button
                sx={{ fontSize: "0.7rem", fontWeight: 600, borderRadius: 2 }}
                size={"small"}
                variant={"contained"}
                disableElevation
                color={undo ? "primary" : "inherit"}
                onClick={undo ? handleAddFollowing : handleDeleteFollowing}
                startIcon={
                  <Stack direction={"row"}>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: "0.72rem!important" }}
                    >
                      1.1K
                    </Typography>
                  </Stack>
                }
              >
                {undo ? "follow" : "following"}
              </Button>
            </Grid>
          </Grid>
          <Stack direction={"row"} spacing={1}>
            <CalendarMonth color={"disabled"} fontSize={"small"} />
            <Typography variant={"body2"}>
              You started following him/her{" "}
              <Box component={"span"} sx={{ fontWeight: 600 }}>
                {moment(createdAt).format("MMM DD YYYY")}.
              </Box>
            </Typography>
          </Stack>
          <Stack direction={"row"} spacing={1}>
            <PostAdd color={"disabled"} fontSize={"small"} />
            <Typography variant={"body2"}>
              He has posted more than{" "}
              <Box component={"span"} sx={{ fontWeight: 600 }}>
                120
              </Box>{" "}
              stories.
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

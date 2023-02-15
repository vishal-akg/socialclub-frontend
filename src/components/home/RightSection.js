import { Box, Collapse, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { TransitionGroup } from "react-transition-group";
import {
  addFollowing,
  deleteFollowing,
  getWhomToFollow,
} from "../../../apis/endpoints/follow";
import FollowCard from "../display/FollowCard";

export default function RightSection() {
  const [list, setList] = useState([]);
  const [followed, setFollowed] = useState([]);

  const fetchWhomToFollow = async () => {
    try {
      const res = await getWhomToFollow({ offset: 0, limit: 5 });
      if (res.status === 200) {
        setList(res.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchWhomToFollow();
  }, []);

  const handleAddFollowing = async (id) => {
    try {
      const res = await addFollowing(id);
      if (res.status === 201) {
        setFollowed((prev) => [...prev, id]);
      }
    } catch (error) {}
  };

  const handleDeleteFollowing = async (id) => {
    try {
      const res = await deleteFollowing(id);
      if (res.status === 200) {
        setFollowed((prev) => prev.filter((user) => user.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant={"body1"} sx={{ fontWeight: 600 }} color={"primary"}>
        Whom To Follow
      </Typography>
      <TransitionGroup>
        {list
          .filter((user) => !followed.includes(user.id))
          .map((user) => (
            <Collapse key={user.id}>
              <FollowCard
                key={user.id}
                {...user}
                addFollowing={handleAddFollowing}
              />
            </Collapse>
          ))}
      </TransitionGroup>
    </Stack>
  );
}

import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";
import { getAllComments } from "../../../apis/endpoints/post";
import CommentInput from "./Input";

export default function CommentList({ id, author }) {
  const [comments, setComments] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    getAllComments(id, { limit, offset }).then((res) => {
      setComments((prev) => [...res.data]);
      setOffset(1);
      setLimit(10);
      if (res.data.length === 0) {
        setHasMore(false);
      }
    });
  }, []);

  return (
    <Stack spacing={2}>
      <Stack sx={{ py: 2 }} spacing={2}>
        {comments.map((comment) => (
          <CommentItem {...comment} key={comment.id} />
        ))}
        {hasMore ? (
          <Stack alignItems={"center"}>
            <Button
              size={"small"}
              variant={"text"}
              color={"primary"}
              onClick={() => {
                getAllComments(id, { limit, offset }).then((res) => {
                  setComments((prev) => [...prev, ...res.data]);
                  setOffset(comments.length);

                  if (res.data.length < limit) {
                    setHasMore(false);
                  }
                });
              }}
            >
              {offset === 0 ? "Show more" : "Load More"}
            </Button>
          </Stack>
        ) : null}
      </Stack>
      <CommentInput author={author} id={id} setComments={setComments} />
    </Stack>
  );
}

function CommentItem({ author, content, id, createdAt }) {
  return (
    <Stack direction={"row"} spacing={1}>
      <Avatar
        alt={author.name}
        src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${author.avatar}`}
        sx={{ width: 26, height: 26 }}
      />
      <Stack direction={"row"} spacing={0.5}>
        <Typography variant={"body1"} sx={{ fontSize: "0.92rem" }}>
          <Box
            component={"span"}
            sx={{ fontSize: "0.95rem", fontWeight: 600, mr: 1 }}
          >
            {author.name}
          </Box>
          {content}
          <Box
            sx={{
              fontSize: "0.9rem",
              color: (theme) => theme.palette.text.secondary,
            }}
            component={"span"}
          >
            {moment(createdAt).fromNow()}
          </Box>
        </Typography>
      </Stack>
    </Stack>
  );
}

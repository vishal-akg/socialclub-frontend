import { Avatar, Box, Grid, Stack } from "@mui/material";
import { useState } from "react";
import { addComment } from "../../../apis/endpoints/post";
import MuiTextField from "../inputs/MuiTextField";

export default function CommentInput({ id, author, setComments }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setLoading(true);
    try {
      const res = await addComment(id, { content });
      if (res.status === 201) {
        setComments((prev) => [...prev, res.data]);
        setContent("");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item>
          <Avatar
            alt={author.name}
            src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${author.avatar}`}
            sx={{ width: 32, height: 32 }}
          />
        </Grid>
        <Grid item xs>
          <MuiTextField
            disabled={loading}
            size={"small"}
            fullWidth={true}
            placeholder={"So cool..."}
            value={content}
            onKeyDown={(e) => {
              if (e.keyCode == 13 || e.which == 13) {
                handleSubmit(e);
              }
            }}
            onChange={(e) => {
              setContent(e.target.value);
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

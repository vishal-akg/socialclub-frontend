import { Avatar, Button, Grid, Stack, Typography } from "@mui/material";

export default function ({ id, name, avatar, addFollowing }) {
  return (
    <Grid container spacing={1}>
      <Grid item>
        <Avatar
          src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${avatar}`}
          alt={name}
        />
      </Grid>
      <Grid item>
        <Stack alignItems={"flex-start"}>
          <Typography variant={"body1"} color={"text.seconary"}>
            {name}
          </Typography>
          <Button
            color={"secondary"}
            size={"small"}
            onClick={() => addFollowing(id)}
          >
            Follow
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}

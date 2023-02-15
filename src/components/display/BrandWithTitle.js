import { Diversity2 } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";

export default function BrandWithTitle() {
  return (
    <Stack
      direction={"row"}
      sx={{ display: "inline-flex", cursor: "pointer" }}
      spacing={0.5}
      alignItems={"center"}
      onClick={() => {
        if (router.pathname === "/") {
          router.reload();
        } else {
          router.replace("/?t=newsfeed");
        }
      }}
    >
      <Diversity2
        fontSize={"small"}
        sx={{
          color: (theme) => theme.palette.text.secondary,
          display: { xs: "none", lg: "initial" },
        }}
      />
      <Typography
        variant={"h3"}
        sx={{
          fontSize: "1.6rem",
          letterSpacing: -1.1,
          display: { xs: "none", md: "initial" },
        }}
        color={"text.secondary"}
        display={"inline"}
      >
        Socialclub
      </Typography>
      <Stack
        sx={{
          display: {
            xs: "flex",
            md: "none",
          },
          aspectRatio: "1",
          borderRadius: 50,
          width: "2.2rem",
          height: "2.2rem",
          backgroundColor: (theme) => theme.palette.primary.main,
        }}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Typography
          sx={{
            fontSize: "2rem",
            color: (theme) => theme.palette.common.white,
          }}
          variant={"h3"}
        >
          S
        </Typography>
      </Stack>
    </Stack>
  );
}

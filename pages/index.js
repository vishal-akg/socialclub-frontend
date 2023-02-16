import React, { useEffect, useRef } from "react";
import { Grid, Box, Paper, Stack, Typography } from "@mui/material";
import SideBar from "../src/components/home/SideBar";
import Posts from "../src/components/home/Posts";
import VideoPiP from "../src/components/display/VideoPiP";
import RightSection from "../src/components/home/RightSection";
import Followings from "../src/components/home/Followings";
import { useLayout } from "../src/contexts/layout";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role={"tabpanel"} hidden={value !== index} {...other}>
      {index === value ? <Box>{children}</Box> : null}
    </div>
  );
}

export default function Index() {
  const { selectedTab } = useLayout();
  const postsRef = useRef();

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.background.default,
        pt: { xs: 0, md: 3, lg: 5 },
      }}
    >
      <Grid
        container
        sx={{ justifyContent: { sm: "space-evenly", lg: "space-between" } }}
      >
        <Grid
          item
          lg={2}
          sx={{
            display: { xs: "none", md: "block" },
            width: { md: "3rem" },
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: (theme) => theme.mixins.toolbar.minHeight + 56,
            }}
          >
            <SideBar />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sm={11}
          lg={7.5}
          ref={postsRef}
          sx={{ pl: { lg: 4 } }}
        >
          <TabPanel value={selectedTab} index={"newsfeed"}>
            <Posts />
            {/* <VideoPlayer
                url={
                  "https://doavsn8e5isxs.cloudfront.net/output/0Bzxz65lSxqE/0Bzxz65lSxqE.mpd"
                }
              /> */}
            <VideoPiP />
          </TabPanel>
          <TabPanel value={selectedTab} index={"trending"}>
            <Paper elevation={0}>
              <Stack sx={{ minHeight: "10rem" }} justifyContent={"center"}>
                <Typography
                  variant={"h6"}
                  sx={{ color: (theme) => theme.palette.info.main }}
                  align={"center"}
                >
                  Feature yet to be implemented using AWS Kinesis and Apache
                  Flink
                </Typography>
              </Stack>
            </Paper>
          </TabPanel>
          <TabPanel value={selectedTab} index={"followings"}>
            <Followings />
          </TabPanel>
          <TabPanel value={selectedTab} index={"messages"}>
            {/* <Paper elevation={0}>
              <Stack sx={{ minHeight: "10rem" }} justifyContent={"center"}>
                <Typography
                  variant={"h6"}
                  sx={{ color: (theme) => theme.palette.info.main }}
                  align={"center"}
                >
                  Feature yet to be implemented using AWS SQS and Socket IO
                </Typography>
              </Stack>
            </Paper> */}
          </TabPanel>
          <TabPanel value={selectedTab} index={"shorts"}>
            <Paper elevation={0}>
              <Stack sx={{ minHeight: "10rem" }} justifyContent={"center"}>
                <Typography
                  variant={"h6"}
                  sx={{ color: (theme) => theme.palette.info.main }}
                  align={"center"}
                >
                  Feature yet to be implemented using AWS MediaConvert.
                </Typography>
              </Stack>
            </Paper>
          </TabPanel>
        </Grid>
        <Grid item lg={2} xl={2} sx={{ display: { xs: "none", lg: "block" } }}>
          <Box
            sx={{
              position: "sticky",
              top: (theme) => theme.mixins.toolbar.minHeight + 56,
            }}
          >
            <RightSection />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export async function getServerSideProps(context) {
  const { Authentication } = context.req.cookies;

  if (!Authentication) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/me`, {
    headers: {
      cookie: `Authentication=${Authentication}`,
    },
  });

  if (res.status === 200) {
    return {
      props: {
        me: await res.json(),
      },
    };
  }

  if (res.status === 401) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }
}

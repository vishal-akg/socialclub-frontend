import {
  Card,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha, Box, Stack } from "@mui/system";
import { Diversity2 } from "@mui/icons-material";
import Login from "../src/components/forms/Login";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Register from "../src/components/forms/Register";

const StyledTab = styled((props) => <Tab {...props} disableRipple />)(
  ({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 700,
  })
);

function TabPanel({ children, value, index }) {
  return index === value ? <Box sx={{ p: 5 }}>{children}</Box> : null;
}

export default function Auth() {
  const [tab, setTab] = useState(1);
  const theme = useTheme();
  const matchesMD = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Stack
      sx={{
        backgroundImage: "linear-gradient(to right, #e1eec3, #f05053)",
        minHeight: "100vh",
        width: "100%",
      }}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Grid
        container
        justifyContent={"space-evenly"}
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        <Grid item lg={4}>
          <Grid container alignItems={"flex-end"} spacing={1}>
            <Grid item>
              <Diversity2 fontSize={"large"} />
            </Grid>
            <Grid item>
              <Typography variant={"h3"}>Socialclub</Typography>
            </Grid>
          </Grid>

          <Box height={20} />
          <Typography
            color={"inherit"}
            variant={"body1"}
            sx={{ fontSize: "1.2rem" }}
          >
            Every moment there is new creation done by great people, connect
            with those wonderful people and have great experiences from them
            around the globe.
          </Typography>
        </Grid>
        <Grid item lg={4}>
          <Stack
            sx={{ position: "relative", height: "70vh" }}
            justifyContent={"center"}
          >
            <Card
              elevation={0}
              sx={{
                height: "80%",
                width: "100%",
                backgroundColor: (theme) =>
                  alpha(theme.palette.background.paper, 0.6),
              }}
            >
              <Stack
                direction={"row"}
                sx={{
                  width: "80%",
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%) translateX(-43%) rotate(270deg)",
                }}
              >
                <Box sx={{ position: "relative", width: "100%" }}>
                  <Tabs
                    variant={"fullWidth"}
                    centered
                    value={tab}
                    onChange={(e, newValue) => setTab(newValue)}
                    indicatorColor={"transparent"}
                  >
                    <StyledTab label={"Register"} />
                    <StyledTab label={"Login"} />
                  </Tabs>
                </Box>
              </Stack>
            </Card>
            <Card
              sx={{
                ml: 7,
                position: "absolute",
                inset: 0,
                zIndex: 2,
              }}
            >
              <TabPanel value={tab} index={1}>
                <Login />
              </TabPanel>
              <TabPanel value={tab} index={0}>
                <Register />
              </TabPanel>
            </Card>
          </Stack>
        </Grid>
      </Grid>
      <Stack sx={{ display: { xs: "flex", md: "none" }, px: 5 }} spacing={3}>
        <Box>
          <Typography
            variant={"h3"}
            sx={{ fontSize: "2.2rem", letterSpacing: -1.5 }}
            align={"center"}
          >
            Socialclub
          </Typography>
          <Typography variant={"body1"}>
            Every moment there is new creation done by great people. connect
            with those wonderful people and have great experiences from them
            around the globe.
          </Typography>
        </Box>

        <Card elevation={0}>
          <Tabs
            centered
            variant={"fullWidth"}
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            indicatorColor={"primary"}
          >
            <StyledTab value={1} label={"Login"} />
            <StyledTab value={0} label={"Register"} />
          </Tabs>
          <Divider />
          <TabPanel value={tab} index={1}>
            <Login />
          </TabPanel>
          <TabPanel value={tab} index={0}>
            <Register />
          </TabPanel>
        </Card>
      </Stack>
    </Stack>
  );
}

export async function getServerSideProps(context) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/me`, {
    headers: context.req.headers,
  });
  console.log(res);

  if (res.status === 200) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

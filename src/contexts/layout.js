import {
  Chat,
  DynamicFeed,
  Feed,
  MovieFilter,
  PeopleAlt,
  Queue,
  Whatshot,
} from "@mui/icons-material";
import {
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Paper,
} from "@mui/material";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import MuiAppBar from "../components/surfaces/MuiAppBar";
import { usePlayer } from "./player";
import { usePost } from "./post";

export const LayoutContext = createContext();

export default function LayoutProvider({ children }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { setOpen, busy } = usePost();
  const [selectedTab, setSelectedTab] = useState("newsfeed");
  const { pip } = usePlayer();

  const tabs = [
    {
      value: "newsfeed",
      title: "Newsfeed",
      Icon: DynamicFeed,
      color: "info",
      onClick: () => {
        router.query.t = "newsfeed";
        router.push(router);
      },
    },
    {
      value: "shorts",
      title: "Shorts",
      Icon: MovieFilter,
      color: "warning",
      onClick: () => {
        router.query.t = "shorts";
        router.push(router);
      },
    },
    {
      value: "trending",
      title: "Trending",
      Icon: Whatshot,
      color: "error",
      onClick: () => {
        router.query.t = "trending";
        router.push(router);
      },
    },
    {
      value: "followings",
      title: "Followings",
      Icon: PeopleAlt,
      color: "success",
      onClick: () => {
        router.query.t = "followings";
        router.push(router);
      },
    },
    {
      value: "messages",
      title: "Messages",
      Icon: Chat,
      color: "primary",
      onClick: () => {
        router.query.t = "messages";
        router.push(router);
      },
    },
  ];

  useEffect(() => {
    if (router.query.t) {
      setSelectedTab(router.query.t);
    } else {
      setSelectedTab("newsfeed");
    }
  }, [router.query]);

  const value = {
    drawerOpen,
    setDrawerOpen,
    tabs,
    selectedTab,
    setSelectedTab,
  };

  return (
    <LayoutContext.Provider value={value}>
      <MuiAppBar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      {children}
      <Fab
        color={"secondary"}
        size={"medium"}
        sx={{
          position: "fixed",
          right: "1rem",
          bottom: pip ? "10rem" : "4.5rem",
          display: { xs: "flex", md: "none" },
        }}
        onClick={() => setOpen(true)}
      >
        <Queue />
      </Fab>

      <Paper
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          display: { xs: "initial", md: "none" },
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={tabs.findIndex((tab) => tab.value === selectedTab)}
          onChange={(event, newValue) => {
            const tab = tabs[newValue];
            router.push(`/?t=${tab.value}`);
          }}
        >
          {tabs.map(({ Icon, title }) => (
            <BottomNavigationAction key={title} label={title} icon={<Icon />} />
          ))}
        </BottomNavigation>
      </Paper>
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}

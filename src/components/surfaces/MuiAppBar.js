import { useRouter } from "next/router";
import styled from "@emotion/styled";
import {
  AccessTimeFilled,
  DarkMode,
  Diversity2,
  Logout,
  Menu,
  Notifications,
  SearchOutlined,
  Settings,
  VideoLibrary,
} from "@mui/icons-material";
import {
  alpha,
  AppBar,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Grid,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  tooltipClasses,
  Typography,
} from "@mui/material";
import { useAuth } from "../../contexts/auth";
import { usePost } from "../../contexts/post";
import { useState } from "react";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 50,
  border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.default, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "default",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: 0,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}));

export default function MuiAppBar({ setDrawerOpen, drawerOpen }) {
  const { setOpen, busy } = usePost();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menu, setMenu] = useState({
    account: false,
  });

  const account = (
    <StyledTooltip
      open={menu.account}
      arrow
      placement={"bottom-end"}
      PopperProps={{ disablePortal: true }}
      title={
        <ClickAwayListener
          mouseEvent={"onMouseUp"}
          onClickAway={() => setMenu((prev) => ({ ...prev, account: false }))}
        >
          <Paper elevation={1}>
            <List sx={{ minWidth: { xs: "100vw", md: "13rem" } }}>
              <ListItemButton
                onMouseDown={() => router.push(`/profile/${user.id}`)}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{ width: "1.6rem", height: "1.6rem" }}
                    src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${user.avatar}`}
                    alt={user.name}
                  />
                </ListItemIcon>
                <ListItemText primary={user.name} />
              </ListItemButton>
              <ListItemButton>
                <ListItemIcon>
                  <DarkMode />
                </ListItemIcon>
                <ListItemText primary={"Dark Theme"} />
              </ListItemButton>
              <Divider light />
              <ListItemButton>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary={"Settings"} />
              </ListItemButton>
              <Divider light />
              <ListItemButton onClick={logout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary={"Logout"} />
              </ListItemButton>
            </List>
          </Paper>
        </ClickAwayListener>
      }
    >
      <IconButton
        size={"small"}
        onClick={() => setMenu((prev) => ({ ...prev, account: true }))}
      >
        <Avatar
          sx={{ width: "2.2rem", height: "2.2rem" }}
          src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${user.avatar}`}
          alt={user.name}
        />
      </IconButton>
    </StyledTooltip>
  );

  return (
    <Box>
      <AppBar color={"inherit"} elevation={0}>
        <Toolbar>
          <Grid
            container
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Grid item md={4}>
              <Stack direction={"row"} alignItems={"center"}>
                <IconButton
                  sx={{
                    display: { xs: "none", md: "flex", lg: "none" },
                    mr: 2,
                  }}
                  onClick={() => setDrawerOpen(true)}
                >
                  <Menu />
                </IconButton>
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
              </Stack>
            </Grid>
            <Grid item md>
              <Search>
                <SearchIconWrapper>
                  <SearchOutlined />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            </Grid>
            <Grid
              item
              md={"auto"}
              sx={{ display: { xs: "initial", md: "none" } }}
            >
              {account}
            </Grid>
            <Grid item md={4} sx={{ display: { xs: "none", md: "initial" } }}>
              <Grid container alignItems={"center"}>
                <Grid item md>
                  <Stack direction={"row"} alignItems={"center"}>
                    <Button
                      startIcon={busy ? <AccessTimeFilled /> : <VideoLibrary />}
                      variant={"outlined"}
                      onClick={() => setOpen(true)}
                    >
                      Create Post
                    </Button>
                  </Stack>
                </Grid>
                <Grid item>
                  <Stack
                    direction={"row"}
                    justifyContent={"flex-end"}
                    alignItems={"center"}
                  >
                    <IconButton
                      size={"large"}
                      sx={{ display: { xs: "none", md: "initial" } }}
                    >
                      <Badge showZero badgeContent={0} color={"primary"}>
                        <Notifications />
                      </Badge>
                    </IconButton>
                    {account}
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Toolbar />
      {/* <AppBar
        position={"fixed"}
        color={"inherit"}
        elevation={0}
        sx={{
          display: { xs: "initial", md: "none" },
          bottom: 0,
          top: "auto",
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        
      </AppBar> */}
    </Box>
  );
}

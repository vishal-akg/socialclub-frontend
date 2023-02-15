import { Menu } from "@mui/icons-material";
import {
  alpha,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import { useLayout } from "../../contexts/layout";
import BrandWithTitle from "../display/BrandWithTitle";

const drawerWidth = "16rem";

export default function SideBar() {
  const theme = useTheme();
  const { tabs, setDrawerOpen, drawerOpen, selectedTab } = useLayout();
  const betweenMDAndLG = useMediaQuery(theme.breakpoints.between("md", "lg"));

  console.log(drawerOpen);
  return (
    <>
      <Drawer
        elevation={0}
        variant={"temporary"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { md: "initial", lg: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        <Toolbar>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ mr: 2 }}>
            <Menu />
          </IconButton>
          <BrandWithTitle />
        </Toolbar>
        <Divider light />
        <Box height={8} />
        <List>
          {tabs.map(({ title, value, Icon, color, onClick }) => (
            <ListItemButton
              key={title}
              sx={{
                maxWidth: "none",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.1),
                },
                "&.Mui-selected ": {
                  backgroundImage: (theme) =>
                    `linear-gradient(to right, #fdc8d9, #f6ddfa)`,
                },
                mt: 1,
              }}
              selected={value === selectedTab}
              onClick={onClick}
            >
              <ListItemIcon>
                <Icon color={color} />
              </ListItemIcon>
              <ListItemText primary={title} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <List component={"nav"} disablePadding>
        {tabs.map(({ title, value, ...rest }) =>
          betweenMDAndLG ? (
            <MiniIcon selected={value === selectedTab} key={title} {...rest} />
          ) : (
            <MuiListItemButton
              rounded
              selected={value === selectedTab}
              key={title}
              title={title}
              {...rest}
            />
          )
        )}
      </List>
    </>
  );
}

function MiniIcon({ Icon, selected, color, onClick }) {
  return (
    <IconButton
      size={"large"}
      color={selected ? color : "inherit"}
      sx={{ mb: 0.5 }}
      onClick={onClick}
    >
      <Icon fontSize={"medium"} />
    </IconButton>
  );
}

function MuiListItemButton({ title, Icon, selected, color, onClick, rounded }) {
  return (
    <ListItemButton
      sx={{
        "&:hover": {
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
        },
        "&.Mui-selected ": {
          backgroundImage: (theme) =>
            `linear-gradient(to right, #fdc8d9, #f6ddfa)`,
        },
        borderTopRightRadius: rounded ? 50 : 0,
        borderBottomRightRadius: rounded ? 50 : 0,
        mt: 1,
      }}
      selected={selected}
      onClick={onClick}
    >
      <ListItemIcon>
        <Icon color={color} />
      </ListItemIcon>
      <ListItemText primary={title} />
    </ListItemButton>
  );
}

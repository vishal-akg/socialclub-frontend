import { Roboto, Source_Sans_Pro, Righteous } from "@next/font/google";
import { createTheme } from "@mui/material/styles";
import { pink, red, blue } from "@mui/material/colors";

export const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const sourceSansPro = Source_Sans_Pro({
  weight: ["200", "300", "400", "600", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const righteous = Righteous({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: pink,
    secondary: blue,
    error: {
      main: red.A400,
    },
    background: {
      default: "#fdf7f8",
    },
    facebook: "#4267B2",
    google: "#DB4437",
    twitter: "#1DA1F2",
  },
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontFamily: sourceSansPro.style.fontFamily,
    h3: {
      fontFamily: righteous.style.fontFamily,
    },
    subtitle2: {
      fontFamily: righteous.style.fontFamily,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          maxWidth: "15rem",
          "& .MuiListItemIcon-root": {
            minWidth: 36,
          },
        },
      },
    },
  },
});

export default theme;

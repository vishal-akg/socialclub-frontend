import * as React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { IoProvider } from "socket.io-react-hook";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import { useRouter } from "next/router";
import theme from "../src/theme";
import createEmotionCache from "../src/createEmotionCache";
import AuthProvider from "../src/contexts/auth";
import PostProvider from "../src/contexts/post";
import SnackbarProvider from "../src/contexts/snackbar";
import PlayerProvider from "../src/contexts/player";
import ProfileProvider from "../src/contexts/profile";
import LayoutProvider from "../src/contexts/layout";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const router = useRouter();

  const isAuthPage = router.pathname.includes("auth");

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <SnackbarProvider>
          <AuthProvider>
            {!isAuthPage ? (
              <IoProvider>
                <PostProvider>
                  <PlayerProvider>
                    <ProfileProvider>
                      <LayoutProvider>
                        <Component {...pageProps} />
                      </LayoutProvider>
                    </ProfileProvider>
                  </PlayerProvider>
                </PostProvider>
              </IoProvider>
            ) : (
              <Component {...pageProps} />
            )}
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};

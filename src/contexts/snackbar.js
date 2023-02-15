import { Alert, Button, Snackbar } from "@mui/material";
import { createContext, useContext, useState } from "react";

export const SnackbarContext = createContext();

export default function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    action: null,
  });

  const { open, message, severity, action } = snackbar;

  return (
    <SnackbarContext.Provider
      value={{
        setSnackbar,
      }}
    >
      {children}
      <Snackbar
        open={open}
        sx={{ maxWidth: "20%", left: { xs: 0 } }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        autoHideDuration={6000}
        onClose={
          action
            ? undefined
            : () =>
                setSnackbar({
                  open: false,
                  message: "",
                  severity: "",
                  action: null,
                })
        }
      >
        <Alert
          severity={severity}
          variant={"standard"}
          action={
            action ? (
              <Button
                disableElevation
                variant={"outlined"}
                onClick={() => {
                  action();
                  setSnackbar({
                    open: false,
                    message: "",
                    severity: "",
                    action: null,
                  });
                }}
                color={severity}
                size={"small"}
              >
                Open
              </Button>
            ) : undefined
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}

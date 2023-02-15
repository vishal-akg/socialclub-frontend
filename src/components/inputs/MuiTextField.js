import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, TextField, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import React, { useState } from "react";

function MuiTextField(
  { shape = "rounded", helperText, error, type, ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <Stack spacing={0.5}>
      <TextField
        sx={
          shape === "rounded"
            ? {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 50,
                  "& .MuiOutlinedInput-input": {
                    padding: "8px 22px",
                  },
                },
              }
            : undefined
        }
        ref={ref}
        error={!!error}
        helperText={error ? error.message : undefined}
        InputProps={{
          endAdornment:
            type === "password" ? (
              <IconButton edge={"end"}>
                {visible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            ) : undefined,
        }}
        type={type}
        {...rest}
      />
      {helperText ? (
        <Typography variant={"caption"}>{helperText}</Typography>
      ) : null}
    </Stack>
  );
}

export default React.forwardRef(MuiTextField);

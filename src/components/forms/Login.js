import {
  Button,
  Divider,
  Fab,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { FacebookOutlined, Google, Twitter } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import validator from "validator";
import MuiTextField from "../inputs/MuiTextField";
import { useAuth } from "../../contexts/auth";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const { login } = useAuth();
  const [errors, setErrors] = useState(false);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      if (res) {
        router.replace("/");
      }
    } catch (error) {
      // const { message, statusCode } = error.response?.data;
      setErrors({ errorMessage: error.meesage });
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ position: "relative" }}>
        {errors ? (
          <Box
            sx={{
              position: "absolute",
              top: -40,
              left: 0,
              right: 0,
              px: 2,
              py: 1,
              borderBottomLeftRadius: (theme) => theme.shape.borderRadius * 2,
              borderBottomRightRadius: (theme) => theme.shape.borderRadius * 2,
              backgroundColor: (theme) => theme.palette.error.main,
            }}
          >
            <Typography variant={"body1"} color={"white"}>
              {errors.statusCode === 401
                ? "Email or Password is wrong."
                : errors.errorMessage}
            </Typography>
          </Box>
        ) : null}
        <Box>
          <Stack spacing={0.5}>
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <Typography variant={"h5"} sx={{ fontWeight: 700 }}>
                Login
              </Typography>
            </Stack>

            <Typography
              variant={"body2"}
              sx={{ fontSize: "1.1rem", fontWeight: 600 }}
            >
              Welcome Back!
            </Typography>
          </Stack>
        </Box>
        <Stack divider={<Divider variant={"middle"} light />} spacing={5}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller
                control={control}
                name={"email"}
                rules={{
                  validate: (val) => {
                    if (!val) {
                      return "Email is required field.";
                    }
                    if (!validator.isEmail(val)) {
                      return "Email should be in proper format.";
                    }
                  },
                }}
                render={({ field }) => (
                  <MuiTextField
                    {...field}
                    size={"small"}
                    placeholder={"john@example.com"}
                    type={"email"}
                  />
                )}
              />
              <Controller
                control={control}
                name={"password"}
                rules={{
                  validate: (val) => {
                    if (!val) {
                      return "Password is required field.";
                    }
                  },
                }}
                render={({ field }) => (
                  <MuiTextField
                    {...field}
                    size={"small"}
                    placeholder={"●●●●●●"}
                    type={"password"}
                  />
                )}
              />
              <Box>
                <Button
                  type={"submit"}
                  variant={"contained"}
                  sx={{ minWidth: 120 }}
                  disableElevation
                  disabled={!isValid}
                >
                  Login
                </Button>
              </Box>
            </Stack>
          </form>
          <Stack spacing={1}>
            <Typography
              variant="subtitle2"
              color={"text.secondary"}
              align="center"
            >
              or continue using -
            </Typography>
            <Stack direction={"row"} justifyContent={"center"}>
              <IconButton
                sx={{
                  color: (theme) => theme.palette.facebook,
                }}
              >
                <FacebookOutlined fontSize="large" />
              </IconButton>
              <IconButton sx={{ color: (theme) => theme.palette.google }}>
                <Google fontSize="large" />
              </IconButton>
              <IconButton sx={{ color: (theme) => theme.palette.twitter }}>
                <Twitter fontSize="large" />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}

import { useRouter } from "next/router";
import {
  Button,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { FacebookOutlined, Google, Twitter } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import validator from "validator";
import MuiTextField from "../inputs/MuiTextField";
import { useAuth } from "../../contexts/auth";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      name: "",
      dob: null,
      email: "",
      password: "",
      gender: "",
    },
  });

  const onSubmit = async (data) => {
    const { dob, ...rest } = data;
    try {
      const res = await register({ ...rest, dob: dob.format("YYYY-MM-DD") });
      if (res) {
        router.replace("/");
      }
    } catch (error) {}
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Stack spacing={0.5}>
          <Typography variant={"h5"} sx={{ fontWeight: 700 }}>
            Register
          </Typography>
          <Typography
            variant={"body2"}
            color={"text.secondary"}
            sx={{ fontSize: "1rem", fontWeight: 600 }}
          >
            Join the world of wonderful people, join them!
          </Typography>
        </Stack>
      </Box>
      <Stack divider={<Divider variant={"middle"} light />} spacing={2}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Controller
                  name={"name"}
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (validator.isEmpty(value)) {
                        return `Name is required field`;
                      }
                      if (!validator.isLength(value, { min: 3, max: 30 })) {
                        return `Name should be of length minimum 3 and maximum 30`;
                      }
                    },
                  }}
                  render={({ field }) => (
                    <MuiTextField
                      {...field}
                      size={"small"}
                      placeholder={"John Keats"}
                      type={"text"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name={"dob"}
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || validator.isEmpty(value.toString())) {
                        return `Date of birth is required field`;
                      }
                      if (
                        !validator.isDate(value.format("DD/MM/YYYY"), {
                          format: "DD/MM/YYYY",
                        })
                      ) {
                        return `Date of birth should be in correct format`;
                      }
                    },
                  }}
                  render={({ field }) => (
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                      <DatePicker
                        {...field}
                        inputFormat={"DD/MM/YYYY"}
                        renderInput={(params) => (
                          <MuiTextField {...params} size={"small"} />
                        )}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Grid>
            </Grid>
            <Controller
              control={control}
              name={"email"}
              rules={{
                validate: (value) => {
                  if (validator.isEmpty(value)) {
                    return `Email is required field`;
                  }
                  if (!validator.isEmail(value)) {
                    return `Email should be in correct format`;
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
            <Box>
              <Grid container spacing={3}>
                <Grid item md={6}>
                  <Controller
                    control={control}
                    name={"password"}
                    rules={{
                      validate: (value) => {
                        if (validator.isEmpty(value)) {
                          return `Password is required field`;
                        }
                        if (!validator.isLength(value, { min: 3, max: 30 })) {
                          return `Password should be of length minimum 3 and maximum 30`;
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
                </Grid>
                <Grid item md={6}>
                  <Controller
                    name={"gender"}
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (validator.isEmpty(value)) {
                          return `Gender is required field`;
                        }
                        if (!validator.isIn(value, ["male", "female"])) {
                          return `Gender can either be male or female`;
                        }
                      },
                    }}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel
                          value={"male"}
                          control={<Radio size={"small"} />}
                          label={"Male"}
                        />
                        <FormControlLabel
                          value={"female"}
                          control={<Radio size={"small"} />}
                          label={"Female"}
                        />
                      </RadioGroup>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Button
                type={"submit"}
                variant={"contained"}
                sx={{ minWidth: 120 }}
                disableElevation
                disabled={!isValid}
              >
                Register
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
            or register using -
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
  );
}

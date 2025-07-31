"use client";

import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Container, Paper, TextField, Button, Typography } from "@mui/material";
import Link from "next/link";
import { PersonAdd } from "@mui/icons-material";
import { AuthAPI } from "@/services/AuthAPI";
import { getErrorMessage } from "@/utils/helper";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { setUserSlice } from "@/store/userSlice";
import toast from "react-hot-toast";

const validationSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "Full name must be at least 2 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const initialValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const dispatch: AppDispatch = useDispatch();

  const onSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    try {
      setSubmitting(true);
      const response = await AuthAPI.signUp(values);
      if (response?.success) {
        dispatch(
          setUserSlice({
            token: response?.data?.token || "",
            userDetails: response?.data?.userDetails || null,
          })
        );
      } else {
        toast.error(response?.message || "Failed to create account");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center px-4">
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={0}
          className="p-8 backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
              <PersonAdd className="absolute text-white w-6 h-6" />
            </div>
            <Typography
              component="h1"
              variant="h4"
              className="font-bold text-gray-800 mb-2"
            >
              Create Account
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Join Task Manager to get started
            </Typography>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({
              values,
              touched,
              errors,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <TextField
                    required
                    fullWidth
                    id="fullName"
                    label="Full Name"
                    name="fullName"
                    autoComplete="name"
                    autoFocus
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fullName && Boolean(errors.fullName)}
                    helperText={touched.fullName && errors.fullName}
                    className="bg-white/90"
                    slotProps={{
                      input: { className: "rounded-lg" },
                    }}
                  />
                </div>
                <div>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    className="bg-white/90"
                    slotProps={{
                      input: { className: "rounded-lg" },
                    }}
                  />
                </div>
                <div>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    className="bg-white/90"
                    slotProps={{
                      input: { className: "rounded-lg" },
                    }}
                  />
                </div>
                <div>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.confirmPassword && Boolean(errors.confirmPassword)
                    }
                    helperText={
                      touched.confirmPassword && errors.confirmPassword
                    }
                    className="bg-white/90"
                    slotProps={{
                      input: { className: "rounded-lg" },
                    }}
                  />
                </div>
                <div className="pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg normal-case font-medium text-base"
                  >
                    Sign Up
                  </Button>
                </div>
                <div className="text-center pt-4">
                  <Link
                    href="/login"
                    className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                  >
                    Already have an account? Sign In
                  </Link>
                </div>
              </form>
            )}
          </Formik>
        </Paper>
      </Container>
    </div>
  );
}

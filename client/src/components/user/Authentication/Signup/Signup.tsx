// src/components/user/Authentication/Signup/Signup.tsx
// Full pink-theme redesign — all existing logic preserved exactly

import "./Signup.scss";
import React, { useEffect } from "react";
import { useState } from "react";
import axiosUser from "../../../../services/axios/axiosUser";
import { PinInput, PinInputField, HStack } from "@chakra-ui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  Auth,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "../../../../services/firebase";
import Identificationpage from "../../../../pages/user/Authentication/Identificationpage";
import { useFormik } from "formik";
import * as Yup from "yup";

const ShieldHeart = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
    <defs>
      <linearGradient id="shield-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E91E8C" />
        <stop offset="100%" stopColor="#2D1470" />
      </linearGradient>
    </defs>
    <path
      d="M32 4L8 14v16c0 14 10 26 24 30 14-4 24-16 24-30V14L32 4z"
      fill="url(#shield-g)"
      opacity="0.15"
    />
    <path
      d="M32 8L10 17v13c0 12.5 9 22.5 22 26 13-3.5 22-13.5 22-26V17L32 8z"
      stroke="url(#shield-g)"
      strokeWidth="2"
      fill="url(#shield-g)"
      opacity="0.25"
    />
    <path
      d="M32 12l-18 8v11c0 11 7.5 19.5 18 23 10.5-3.5 18-12 18-23V20L32 12z"
      fill="url(#shield-g)"
      opacity="0.45"
    />
    <path
      d="M25.5 27c-2.5 0-4.5 2-4.5 4.5 0 4 6.5 9 11 11.5 4.5-2.5 11-7.5 11-11.5 0-2.5-2-4.5-4.5-4.5-1.5 0-2.8.7-3.7 1.8-.3.3-.8.3-1.1 0C32.8 27.7 31.5 27 30 27c-1.7 0-3.2.9-4.1 2.2-.2-.7-.9-2.2-0-.8L25.5 27z"
      fill="white"
    />
  </svg>
);

const EyeIcon = ({ show }: { show: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-brand-pink/60">
    {show ? (
      <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" />
        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
      </>
    )}
  </svg>
);

const InputField = ({
  icon,
  error,
  touched,
  type = "text",
  children,
  ...props
}: any) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-3">
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-200 bg-white/70 backdrop-blur-sm
          ${touched && error
            ? "border-red-400 ring-1 ring-red-200"
            : "border-pink-200 focus-within:border-brand-pink focus-within:ring-2 focus-within:ring-brand-pink/20"
          }`}
      >
        <span className="text-brand-pink/50 flex-shrink-0">{icon}</span>
        <input
          type={isPassword ? (showPwd ? "text" : "password") : type}
          className="flex-1 bg-transparent outline-none text-sm text-brand-purple placeholder-pink-300/70 font-poppins"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="flex-shrink-0 text-brand-pink/40 hover:text-brand-pink transition-colors"
          >
            <EyeIcon show={showPwd} />
          </button>
        )}
      </div>
      {touched && error && (
        <p className="text-red-400 text-[10px] mt-1 ml-4 font-poppins">{error}</p>
      )}
    </div>
  );
};

const Signup = () => {
  const [counter, setCounter] = useState(30);
  const navigate = useNavigate();
  const [otpPage, setOtpPage] = useState(false);
  const [identificationPage, setIdentificationPage] = useState(false);
  const [otp, setOtp] = useState<number>(0);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (otpPage) {
      counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
    }
  }, [counter, otpPage]);

  useEffect(() => {
    setOtpPage(false);
    setIdentificationPage(false);
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      re_password: "",
      reffered_Code: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().min(3, "Type a valid name").required("Please enter a name"),
      email: Yup.string().email("Please enter a valid email").required("Please enter an email"),
      mobile: Yup.string().length(10, "Please enter a valid number").required("Please enter a mobile number"),
      password: Yup.string()
        .matches(/^(?=.*[A-Z])/, "Must include one uppercase letter")
        .matches(/^(?=.*\d)/, "Must include one digit")
        .required("Password is required"),
      re_password: Yup.string()
        .oneOf([Yup.ref("password")], "Password must match")
        .required("Please re-enter the password"),
      reffered_Code: Yup.string()
        .min(5, "Enter a valid code")
        .matches(/^(?=.*\d)/, "Enter a valid code"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await signupHandle(values);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleOtpChange = (index: number, newValue: number) => {
    const newOtp = [...otp.toString()];
    newOtp[index] = newValue.toString();
    setOtp(parseInt(newOtp.join("")));
  };

  const signupHandle = async (formData: any) => {
    try {
      const { data } = await axiosUser(null).post(`checkUser`, formData);
      if (data.message === "User login") {
        toast.info("User Already registered! Please Login to continue");
        navigate("/login");
      } else if (data.message === "User must fill documents") {
        toast.info(`User Already registered! Please verify the documents`);
        localStorage.setItem("userId", data.userId);
        setIdentificationPage(true);
      } else {
        sendOtp();
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const onCaptchaVerify = (auth: Auth) => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => { toast.success("Otp sent successfully"); },
      "expired-callback": () => { toast.error("TimeOut"); },
    });
  };

  const sendOtp = async () => {
    try {
      onCaptchaVerify(auth);
      const number = "+91" + formik.values.mobile;
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, number, appVerifier);
      setConfirmationResult(result);
      setOtpPage(true);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const otpVerify = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (otp && confirmationResult) {
      const otpValue: string = otp.toString();
      confirmationResult
        .confirm(otpValue)
        .then(async () => { registerSubmit(); })
        .catch(() => { toast.error("Enter a valid otp"); });
    } else {
      toast.error("Enter a valid otp");
    }
  };

  const registerSubmit = async () => {
    try {
      const response = await axiosUser(null).post(`register`, formik.values);
      if (response.data.message === "Success") {
        toast.success("OTP verified successfully");
        localStorage.setItem("userId", response.data.userId);
        setIdentificationPage(true);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <>
      {identificationPage ? (
        <Identificationpage />
      ) : (
        <>
          {/* Full-screen pink gradient background */}
          <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
              background:
                "linear-gradient(135deg, #fce4f0 0%, #f8d7e8 30%, #fdeef6 60%, #fbcfe4 100%)",
            }}
          >
            {/* Decorative blobs */}
            <div
              className="fixed top-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(circle, #E91E8C 0%, transparent 70%)" }}
            />
            <div
              className="fixed bottom-[-60px] left-[-60px] w-56 h-56 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, #2D1470 0%, transparent 70%)" }}
            />

            {/* Card */}
            <div
              className="relative w-full max-w-md"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                borderRadius: "28px",
                boxShadow: "0 20px 60px rgba(233,30,140,0.18), 0 4px 16px rgba(45,20,112,0.08)",
                border: "1px solid rgba(233,30,140,0.15)",
              }}
            >
              {/* Shield logo top-right */}
              <div className="absolute -top-5 right-6">
                <ShieldHeart />
              </div>

              <div className="px-8 pt-10 pb-8">
                {/* ── OTP PANEL ── */}
                {otpPage ? (
                  <>
                    <div className="text-center mb-6">
                      <div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                        style={{
                          background: "linear-gradient(135deg, #E91E8C20, #2D147020)",
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-brand-pink">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h1 className="text-2xl font-bold font-poppins text-brand-purple">
                        Verify Your Number
                      </h1>
                      <p className="text-sm text-neutral-body mt-1 font-poppins">
                        Enter the 6-digit OTP sent to{" "}
                        <span className="text-brand-pink font-semibold">
                          +91 {formik.values.mobile}
                        </span>
                      </p>
                    </div>

                    <form>
                      <div className="flex justify-center mb-6">
                        <HStack spacing="8px">
                          <PinInput otp placeholder="">
                            {[...Array(6)].map((_, index) => (
                              <PinInputField
                                key={index}
                                onChange={(e) =>
                                  handleOtpChange(index, parseInt(e.target.value))
                                }
                                style={{
                                  width: "44px",
                                  height: "52px",
                                  borderRadius: "12px",
                                  border: "2px solid #F8D7E8",
                                  background: "rgba(248,215,232,0.3)",
                                  textAlign: "center",
                                  fontSize: "20px",
                                  fontWeight: "700",
                                  color: "#2D1470",
                                  outline: "none",
                                  fontFamily: "Poppins, sans-serif",
                                }}
                              />
                            ))}
                          </PinInput>
                        </HStack>
                      </div>

                      <button
                        onClick={otpVerify}
                        type="submit"
                        className="w-full py-3 rounded-2xl font-semibold text-white font-poppins text-sm transition-all duration-200 active:scale-[0.98]"
                        style={{
                          background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                          boxShadow: "0 8px 24px rgba(233,30,140,0.35)",
                        }}
                      >
                        Verify OTP
                      </button>

                      <div className="text-center mt-4 font-poppins text-sm">
                        {counter > 0 ? (
                          <p className="text-neutral-body">
                            Resend OTP in{" "}
                            <span className="text-brand-pink font-semibold">00:{counter < 10 ? `0${counter}` : counter}</span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            className="text-brand-pink font-semibold hover:underline"
                            onClick={() => { setCounter(30); sendOtp(); }}
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </form>
                  </>
                ) : (
                  /* ── SIGNUP PANEL ── */
                  <>
                    <div className="text-center mb-6">
                      <h1
                        className="text-3xl font-bold font-poppins"
                        style={{
                          background: "linear-gradient(135deg, #E91E8C, #2D1470)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        Create Account
                      </h1>
                      <p className="text-neutral-body text-sm mt-1 font-poppins">
                        Join SafeRoute — your first ride is on us!
                      </p>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                      <InputField
                        placeholder="Full Name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.name}
                        touched={formik.touched.name}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" /></svg>
                        }
                      />

                      <InputField
                        placeholder="Email Address"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.email}
                        touched={formik.touched.email}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        }
                      />

                      <InputField
                        placeholder="Mobile Number"
                        name="mobile"
                        type="tel"
                        value={formik.values.mobile}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.mobile}
                        touched={formik.touched.mobile}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="17" r="1" fill="currentColor" /></svg>
                        }
                      />

                      <InputField
                        placeholder="Password"
                        name="password"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.password}
                        touched={formik.touched.password}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        }
                      />

                      <InputField
                        placeholder="Confirm Password"
                        name="re_password"
                        type="password"
                        value={formik.values.re_password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.re_password}
                        touched={formik.touched.re_password}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        }
                      />

                      <InputField
                        placeholder="Referral Code (optional)"
                        name="reffered_Code"
                        value={formik.values.reffered_Code}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.reffered_Code}
                        touched={formik.touched.reffered_Code}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        }
                      />

                      <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full py-3 rounded-2xl font-semibold text-white font-poppins text-sm mt-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
                        style={{
                          background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                          boxShadow: "0 8px 24px rgba(233,30,140,0.35)",
                        }}
                      >
                        {formik.isSubmitting ? "Creating Account…" : "Create Account"}
                      </button>

                      <p className="text-center text-sm mt-4 font-poppins text-neutral-body">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/login")}
                          className="text-brand-pink font-semibold hover:underline"
                        >
                          Log in
                        </button>
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
          <div id="recaptcha-container" />
        </>
      )}
    </>
  );
};

export default Signup;
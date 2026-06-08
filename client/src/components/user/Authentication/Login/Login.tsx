// src/components/user/Authentication/Login/Login.tsx
// Full pink-theme redesign — all existing logic preserved exactly

import { PinInput, PinInputField, HStack } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import axiosUser from "../../../../services/axios/axiosUser";
import { toast } from "react-toastify";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  Auth,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "../../../../services/firebase";
import "./Login.scss";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { openPendingModal } from "../../../../services/redux/slices/pendingModalSlice";
import { openRejectedModal } from "../../../../services/redux/slices/rejectedModalSlice";
import { userLogin } from "../../../../services/redux/slices/userAuthSlice";

// ── Shield logo ──────────────────────────────────────────────────────────────
const ShieldHeart = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
    <defs>
      <linearGradient id="sl-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E91E8C" />
        <stop offset="100%" stopColor="#2D1470" />
      </linearGradient>
    </defs>
    <path d="M32 8L10 17v13c0 12.5 9 22.5 22 26 13-3.5 22-13.5 22-26V17L32 8z"
      fill="url(#sl-g)" opacity="0.45" />
    <path d="M25.5 27c-2.5 0-4.5 2-4.5 4.5 0 4 6.5 9 11 11.5 4.5-2.5 11-7.5 11-11.5 0-2.5-2-4.5-4.5-4.5-1.5 0-2.8.7-3.7 1.8-.3.3-.8.3-1.1 0C32.8 27.7 31.5 27 30 27z"
      fill="white" />
  </svg>
);

function Login() {
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const navigate = useNavigate();

  const [userData, setuserData] = useState({
    user: "",
    userToken: null,
    user_id: "",
  });

  const dispatch = useDispatch();

  // formik ─────────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: { mobile: "" },
    validationSchema: Yup.object({
      mobile: Yup.string()
        .length(10, "Enter a valid mobile number")
        .required("Please enter the mobile number"),
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await axiosUser(null).post("checkLoginUser", values);
        if (data.message === "Success") {
          sendOtp();
          setuserData({ user: data.name, userToken: data.token, user_id: data._id });
        } else if (data.message === "Incomplete registration") {
          toast.error("Please complete the verification!");
          localStorage.setItem("userId", data.userId);
          navigate("/identification");
        } else if (data.message === "Blocked") {
          toast.info("Your account is blocked!");
        } else if (data.message === "Not verified") {
          dispatch(openPendingModal());
        } else if (data.message === "Rejected") {
          dispatch(openRejectedModal());
          localStorage.setItem("userId", data.userId);
        } else {
          toast.error("Not registered! Please register to continue.");
        }
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
  });

  const [otpInput, setotpInput] = useState(false);
  const [otp, setOtp] = useState<number>(0);
  const [counter, setCounter] = useState(30);

  const handleOtpChange = (index: number, newValue: number) => {
    const newOtp = [...otp.toString()];
    newOtp[index] = newValue.toString();
    setOtp(parseInt(newOtp.join("")));
  };

  useEffect(() => {
    if (otpInput) {
      counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
    }
  }, [counter, otpInput]);

  // OTP functions ───────────────────────────────────────────────────────────────
  const onCaptchaVerify = (auth: Auth) => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          toast.success("Otp sent successfully");
          setotpInput(true);
        },
        "expired-callback": () => { toast.error("TimeOut"); },
      }
    );
  };

  const sendOtp = async () => {
    try {
      onCaptchaVerify(auth);
      const number = "+91" + formik.values.mobile;
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, number, appVerifier);
      setConfirmationResult(result);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const otpVerify = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (otp && confirmationResult) {
      confirmationResult
        .confirm(otp.toString())
        .then(async () => {
          dispatch(userLogin(userData));
          toast.success("Login success");
          navigate("/");
          localStorage.removeItem("userId");
        })
        .catch(() => { toast.error("Enter a valid otp"); });
    } else {
      toast.error("Enter a valid otp");
    }
  };

  const googleLogin = async (data: CredentialResponse) => {
    try {
      if (data.credential) {
        const decodedData = jwt_decode(data.credential) as any;
        const formData = new FormData();
        formData.append("email", decodedData.email);
        const response = await axiosUser(null).post("checkGoogleLoginUser", formData);
        if (response.data.message === "Success") {
          toast.success("Login success!");
          dispatch(userLogin({ user: response.data.name, userToken: response.data.token, user_id: response.data._id }));
          localStorage.removeItem("userId");
          navigate("/");
        } else if (response.data.message === "Incomplete registration") {
          toast.info("Please complete the verification!");
          localStorage.setItem("userId", response.data.userId);
          navigate("/identification");
        } else if (response.data.message === "Not verified") {
          dispatch(openPendingModal());
        } else if (response.data.message === "Rejected") {
          toast.error("rejected");
          dispatch(openRejectedModal());
          localStorage.setItem("userId", response.data.userId);
        } else {
          toast.error("Not registered! Please register to continue.");
        }
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  // ── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <>
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
            boxShadow:
              "0 20px 60px rgba(233,30,140,0.18), 0 4px 16px rgba(45,20,112,0.08)",
            border: "1px solid rgba(233,30,140,0.15)",
          }}
        >
          {/* Shield logo */}
          <div className="absolute -top-5 right-6">
            <ShieldHeart />
          </div>

          <div className="px-8 pt-10 pb-8">
            {/* Header */}
            <div className="text-center mb-7">
              <h1
                className="text-3xl font-bold font-poppins"
                style={{
                  background: "linear-gradient(135deg, #E91E8C, #2D1470)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Welcome Back
              </h1>
              <p className="text-neutral-body text-sm mt-1 font-poppins">
                Sign in with your mobile number
              </p>
            </div>

            <form onSubmit={formik.handleSubmit}>
              {/* Mobile field */}
              <div className="mb-3">
                <label className="block text-xs font-semibold font-poppins text-brand-purple mb-1.5 ml-1">
                  Mobile Number
                </label>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 bg-white/70 backdrop-blur-sm
                    ${formik.touched.mobile && formik.errors.mobile
                      ? "border-red-400 ring-1 ring-red-200"
                      : "border-pink-200 focus-within:border-brand-pink focus-within:ring-2 focus-within:ring-brand-pink/20"
                    }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-brand-pink/50 flex-shrink-0">
                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="17" r="1" fill="currentColor" />
                  </svg>
                  <span className="text-xs text-brand-pink/60 font-poppins font-medium border-r border-pink-200 pr-2">
                    +91
                  </span>
                  <input
                    type="number"
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your mobile number"
                    className="flex-1 bg-transparent outline-none text-sm text-brand-purple placeholder-pink-300/70 font-poppins"
                  />
                </div>
                {formik.touched.mobile && formik.errors.mobile && (
                  <p className="text-red-400 text-[10px] mt-1 ml-4 font-poppins">
                    {formik.errors.mobile}
                  </p>
                )}
              </div>

              {/* OTP field (shown after send) */}
              {otpInput && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold font-poppins text-brand-purple mb-3 ml-1">
                    Enter OTP
                  </label>
                  <div className="flex justify-center">
                    <HStack spacing="8px">
                      <PinInput otp placeholder="">
                        {[...Array(6)].map((_, index) => (
                          <PinInputField
                            key={index}
                            onChange={(e) =>
                              handleOtpChange(index, parseInt(e.target.value))
                            }
                            style={{
                              width: "42px",
                              height: "50px",
                              borderRadius: "12px",
                              border: "2px solid #F8D7E8",
                              background: "rgba(248,215,232,0.3)",
                              textAlign: "center",
                              fontSize: "18px",
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
                </div>
              )}

              {/* Action button */}
              {otpInput ? (
                <>
                  <button
                    onClick={otpVerify}
                    className="w-full py-3 rounded-2xl font-semibold text-white font-poppins text-sm transition-all duration-200 active:scale-[0.98] mt-2"
                    style={{
                      background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                      boxShadow: "0 8px 24px rgba(233,30,140,0.35)",
                    }}
                  >
                    Verify OTP
                  </button>
                  <div className="text-center mt-3 font-poppins text-sm">
                    {counter > 0 ? (
                      <p className="text-neutral-body">
                        Resend OTP in{" "}
                        <span className="text-brand-pink font-semibold">
                          00:{counter < 10 ? `0${counter}` : counter}
                        </span>
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
                </>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-semibold text-white font-poppins text-sm mt-2 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                    boxShadow: "0 8px 24px rgba(233,30,140,0.35)",
                  }}
                >
                  Send OTP
                </button>
              )}

              {/* Divider + Google */}
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-pink-200" />
                <span className="text-xs text-neutral-body font-poppins">or continue with</span>
                <div className="flex-1 h-px bg-pink-200" />
              </div>

              <div className="flex justify-center mb-4">
                <GoogleLogin shape="circle" ux_mode="popup" onSuccess={googleLogin} />
              </div>

              <p className="text-center text-sm font-poppins text-neutral-body">
                New to SafeRoute?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-brand-pink font-semibold hover:underline"
                >
                  Create account
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      <div id="recaptcha-container" />
    </>
  );
}

export default Login;
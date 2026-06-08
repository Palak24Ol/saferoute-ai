import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosUser from "../../../../services/axios/axiosUser";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { openPendingModal } from "../../../../services/redux/slices/pendingModalSlice";

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: "user",
};

// ── Shield logo ──────────────────────────────────────────────────────────────
const ShieldHeart = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
    <defs>
      <linearGradient id="ph-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E91E8C" />
        <stop offset="100%" stopColor="#2D1470" />
      </linearGradient>
    </defs>
    <path d="M32 8L10 17v13c0 12.5 9 22.5 22 26 13-3.5 22-13.5 22-26V17L32 8z"
      fill="url(#ph-g)" opacity="0.45" />
    <path d="M25.5 27c-2.5 0-4.5 2-4.5 4.5 0 4 6.5 9 11 11.5 4.5-2.5 11-7.5 11-11.5 0-2.5-2-4.5-4.5-4.5-1.5 0-2.8.7-3.7 1.8-.3.3-.8.3-1.1 0C32.8 27.7 31.5 27 30 27z"
      fill="white" />
  </svg>
);

// ── Camera ring overlay ──────────────────────────────────────────────────────
const CameraRing = () => (
  <div
    className="absolute inset-0 rounded-full pointer-events-none"
    style={{
      boxShadow:
        "inset 0 0 0 3px rgba(233,30,140,0.6), 0 0 0 6px rgba(233,30,140,0.1)",
    }}
  />
);

function Photo() {
  const [initial, setInitial] = useState(true);
  const webcamRef = useRef<Webcam | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // formik + yup — all preserved ───────────────────────────────────────────────
  const formik = useFormik({
    initialValues: { userImage: null },
    validationSchema: Yup.object({
      userImage: Yup.mixed().required("Please capture your photo"),
    }),
    onSubmit: async (values) => {
      try {
        if (values.userImage) {
          const blob = await fetch(values.userImage).then((res) => res.blob());
          const file = new File([blob], "userImage.jpeg", { type: "image/jpeg" });
          const formData = new FormData();
          formData.append("userImage", file);
          const userId = localStorage.getItem("userId");

          const response = await axiosUser(null).post(
            `uploadUserImage?userId=${userId}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          if (response.data.message === "Success") {
            navigate("/login");
            dispatch(openPendingModal());
          } else {
            toast.error(response.data.message);
          }
        }
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
  });

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const userImage = webcamRef.current.getScreenshot();
      formik.setFieldValue("userImage", userImage);
    }
  }, []);

  // ── JSX ──────────────────────────────────────────────────────────────────────
  return (
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

      {/* Camera view — full-screen overlay when active ──────────────────────── */}
      {!formik.values.userImage && !initial && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <p className="text-white text-sm font-poppins mb-4 opacity-70">
            Position your face in the circle
          </p>
          <div className="relative w-72 h-72">
            <div className="w-72 h-72 rounded-full overflow-hidden">
              <Webcam
                audio={false}
                ref={webcamRef}
                width={288}
                height={288}
                screenshotFormat="image/jpeg"
                videoConstraints={{ ...videoConstraints, width: 288, height: 288 }}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
            <CameraRing />
            {/* Decorative corner guides */}
            {[
              "top-0 left-0 border-t-2 border-l-2 rounded-tl-full",
              "top-0 right-0 border-t-2 border-r-2 rounded-tr-full",
              "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-full",
              "bottom-0 right-0 border-b-2 border-r-2 rounded-br-full",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-8 h-8 border-brand-pink ${cls}`}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setInitial(true)}
              className="px-6 py-2.5 rounded-2xl border-2 border-white/30 text-white text-sm font-poppins font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={capture}
              className="px-8 py-2.5 rounded-2xl font-semibold text-white text-sm font-poppins transition-all duration-200 active:scale-[0.96]"
              style={{
                background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                boxShadow: "0 8px 24px rgba(233,30,140,0.5)",
              }}
            >
              📸 Capture
            </button>
          </div>
        </div>
      )}

      {/* Main card ─────────────────────────────────────────────────────────── */}
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
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: "linear-gradient(135deg, #E91E8C15, #2D147015)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-brand-pink">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h1
              className="text-3xl font-bold font-poppins"
              style={{
                background: "linear-gradient(135deg, #E91E8C, #2D1470)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {formik.values.userImage ? "Looks Good?" : "Take a Selfie"}
            </h1>
            <p className="text-neutral-body text-sm mt-1 font-poppins">
              {formik.values.userImage
                ? "Review your photo before submitting"
                : "We need a clear photo for your profile"}
            </p>
          </div>

          {/* Content — preview or initial prompt ──────────────────────────── */}
          {formik.values.userImage ? (
            /* ── PREVIEW STATE ── */
            <form onSubmit={formik.handleSubmit}>
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-40 h-40 mb-4">
                  <img
                    src={formik.values.userImage}
                    alt="Your selfie"
                    className="w-40 h-40 rounded-full object-cover"
                    style={{
                      boxShadow:
                        "0 0 0 4px white, 0 0 0 6px #E91E8C, 0 12px 32px rgba(233,30,140,0.25)",
                    }}
                  />
                  {/* Success badge */}
                  <div
                    className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                      boxShadow: "0 4px 12px rgba(233,30,140,0.4)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Tips */}
                <div
                  className="w-full rounded-2xl px-4 py-3 text-xs font-poppins text-brand-purple/70 space-y-1"
                  style={{ background: "rgba(233,30,140,0.05)", border: "1px solid rgba(233,30,140,0.1)" }}
                >
                  {["Face clearly visible", "Good lighting", "Looking straight ahead"].map((tip) => (
                    <div key={tip} className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-brand-pink flex-shrink-0">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => formik.setFieldValue("userImage", null)}
                className="w-full py-2.5 rounded-2xl border-2 border-pink-200 text-brand-pink font-semibold text-sm font-poppins mb-3 transition-all hover:bg-pink-50"
              >
                Retake Photo
              </button>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-semibold text-white font-poppins text-sm transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                  boxShadow: "0 8px 24px rgba(233,30,140,0.35)",
                }}
              >
                Submit Photo
              </button>
            </form>
          ) : (
            /* ── INITIAL / OPEN CAMERA STATE ── */
            <div>
              {/* Placeholder avatar */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-36 h-36 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(233,30,140,0.1), rgba(45,20,112,0.08))",
                    border: "3px dashed rgba(233,30,140,0.3)",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 text-brand-pink/40">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Tips */}
              <div
                className="w-full rounded-2xl px-4 py-3 text-xs font-poppins text-brand-purple/70 space-y-2 mb-6"
                style={{ background: "rgba(233,30,140,0.05)", border: "1px solid rgba(233,30,140,0.1)" }}
              >
                <p className="font-semibold text-brand-purple text-xs">Photo tips:</p>
                {[
                  "Ensure your face is well-lit",
                  "Remove sunglasses or hats",
                  "Look directly at the camera",
                ].map((tip) => (
                  <div key={tip} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-pink flex-shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setInitial(false)}
                className="w-full py-3 rounded-2xl font-semibold text-white font-poppins text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                  boxShadow: "0 8px 24px rgba(233,30,140,0.35)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
                Open Camera
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Photo;
// src/components/user/Authentication/Identification/Identification.tsx
// Full pink-theme redesign — all existing logic preserved exactly

import { useState } from "react";
import axiosUser from "../../../../services/axios/axiosUser";
import * as Yup from "yup";
import { useFormik } from "formik";
import "./Identification.scss";
import Photopage from "../../../../pages/user/Authentication/Photopage";
import { toast } from "react-toastify";

// ── Shield logo ──────────────────────────────────────────────────────────────
const ShieldHeart = () => (
  <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
    <defs>
      <linearGradient id="id-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E91E8C" />
        <stop offset="100%" stopColor="#2D1470" />
      </linearGradient>
    </defs>
    <path d="M32 8L10 17v13c0 12.5 9 22.5 22 26 13-3.5 22-13.5 22-26V17L32 8z"
      fill="url(#id-g)" opacity="0.45" />
    <path d="M25.5 27c-2.5 0-4.5 2-4.5 4.5 0 4 6.5 9 11 11.5 4.5-2.5 11-7.5 11-11.5 0-2.5-2-4.5-4.5-4.5-1.5 0-2.8.7-3.7 1.8-.3.3-.8.3-1.1 0C32.8 27.7 31.5 27 30 27z"
      fill="white" />
  </svg>
);

// ── Radio card component ─────────────────────────────────────────────────────
const IdRadioCard = ({
  value,
  label,
  icon,
  selected,
  onChange,
  onBlur,
  name,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onChange: any;
  onBlur: any;
  name: string;
}) => (
  <label
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex-1
      ${selected
        ? "border-brand-pink bg-brand-pink/5 shadow-[0_0_0_3px_rgba(233,30,140,0.12)]"
        : "border-pink-200 bg-white/60 hover:border-brand-pink/40"
      }`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className="sr-only"
    />
    <span
      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors
        ${selected ? "bg-brand-pink text-white" : "bg-pink-100 text-brand-pink/60"}`}
    >
      {icon}
    </span>
    <span
      className={`text-sm font-semibold font-poppins transition-colors
        ${selected ? "text-brand-pink" : "text-brand-purple/70"}`}
    >
      {label}
    </span>
    {selected && (
      <span className="ml-auto">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-brand-pink">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </span>
    )}
  </label>
);

function Identification() {
  const [photoPage, setphotoPage] = useState(false);

  // all existing formik + validation logic preserved ──────────────────────────
  const validationSchema = Yup.object().shape({
    idImage: Yup.mixed().required("ID Image is required"),
    chooseID: Yup.string().required("Choose an ID type"),
    enterID: Yup.string().required("Enter the ID number"),
  });

  const formik = useFormik({
    initialValues: {
      idImage: null,
      chooseID: "",
      enterID: "",
    },
    validationSchema,
    onSubmit: (values) => { handleUpload(values); },
  });

  const handleUpload = (formData: any) => {
    const userId = localStorage.getItem("userId");
    axiosUser(null)
      .post(`identification?userId=${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        if (response.data.message === "Success") {
          setphotoPage(true);
          toast.success("Identification details submitted successfully!");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => { console.error("Error uploading file:", error); });
  };

  // ── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <>
      {photoPage ? (
        <Photopage />
      ) : (
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
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                  style={{ background: "linear-gradient(135deg, #E91E8C15, #2D147015)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-brand-pink">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  Verify Identity
                </h1>
                <p className="text-neutral-body text-sm mt-1 font-poppins">
                  We need to verify your identity for safety
                </p>
              </div>

              <form onSubmit={formik.handleSubmit}>
                {/* Step 1 — Choose ID type */}
                <div className="mb-5">
                  <p className="text-xs font-bold font-poppins text-brand-purple mb-3 uppercase tracking-wider">
                    Select ID Type
                  </p>
                  <div className="flex gap-3">
                    <IdRadioCard
                      name="chooseID"
                      value="Aadhar"
                      label="Aadhaar"
                      selected={formik.values.chooseID === "Aadhar"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                          <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M13 9h5M13 12h5M13 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      }
                    />
                    <IdRadioCard
                      name="chooseID"
                      value="License"
                      label="License"
                      selected={formik.values.chooseID === "License"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                          <circle cx="8" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12 9h7M12 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M5 17a3 3 0 016 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      }
                    />
                  </div>
                  {formik.touched.chooseID && formik.errors.chooseID && (
                    <p className="text-red-400 text-[10px] mt-1.5 ml-1 font-poppins">
                      {formik.errors.chooseID}
                    </p>
                  )}
                </div>

                {/* Step 2 — Enter ID number */}
                <div className="mb-5">
                  <label className="block text-xs font-bold font-poppins text-brand-purple mb-2 uppercase tracking-wider">
                    ID Number
                  </label>
                  <div
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-200 bg-white/70 backdrop-blur-sm
                      ${formik.touched.enterID && formik.errors.enterID
                        ? "border-red-400 ring-1 ring-red-200"
                        : "border-pink-200 focus-within:border-brand-pink focus-within:ring-2 focus-within:ring-brand-pink/20"
                      }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-brand-pink/50 flex-shrink-0">
                      <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                      type="text"
                      name="enterID"
                      placeholder={
                        formik.values.chooseID === "Aadhar"
                          ? "XXXX XXXX XXXX"
                          : formik.values.chooseID === "License"
                          ? "DL-XXXXXXXXXXXX"
                          : "Enter your ID number"
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.enterID}
                      className="flex-1 bg-transparent outline-none text-sm text-brand-purple placeholder-pink-300/70 font-poppins"
                    />
                  </div>
                  {formik.touched.enterID && formik.errors.enterID && (
                    <p className="text-red-400 text-[10px] mt-1 ml-4 font-poppins">
                      {formik.errors.enterID}
                    </p>
                  )}
                </div>

                {/* Step 3 — Upload ID image */}
                <div className="mb-6">
                  <label className="block text-xs font-bold font-poppins text-brand-purple mb-2 uppercase tracking-wider">
                    Upload ID Image
                  </label>
                  <label
                    className={`flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
                      ${formik.touched.idImage && formik.errors.idImage
                        ? "border-red-400 bg-red-50/50"
                        : "border-pink-200 bg-white/50 hover:border-brand-pink hover:bg-brand-pink/5"
                      }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-brand-pink/50">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {formik.values.idImage ? (
                      <span className="text-sm font-semibold text-brand-pink font-poppins">
                        ✓ Image selected
                      </span>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-brand-purple/70 font-poppins">
                          Click to upload
                        </span>
                        <span className="text-xs text-neutral-body font-poppins">
                          JPG, PNG, WEBP up to 10MB
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      name="idImage"
                      onChange={(e) => {
                        formik.setFieldValue("idImage", e.currentTarget.files?.[0]);
                      }}
                      accept="image/*"
                      className="sr-only"
                    />
                  </label>
                  {formik.touched.idImage && formik.errors.idImage && (
                    <p className="text-red-400 text-[10px] mt-1.5 ml-1 font-poppins">
                      {formik.errors.idImage as string}
                    </p>
                  )}
                </div>

                {/* Progress indicator */}
                <div className="flex gap-1.5 justify-center mb-5">
                  {[1, 2, 3].map((step, i) => (
                    <div
                      key={step}
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: i === 1 ? "28px" : "8px",
                        background:
                          (i === 0 && formik.values.chooseID) ||
                          (i === 1 && formik.values.enterID) ||
                          (i === 2 && formik.values.idImage)
                            ? "linear-gradient(90deg, #E91E8C, #8B1A4A)"
                            : "#F8D7E8",
                      }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-semibold text-white font-poppins text-sm transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                    boxShadow: "0 8px 24px rgba(233,30,140,0.35)",
                  }}
                >
                  Submit Verification
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Identification;
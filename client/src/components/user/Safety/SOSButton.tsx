import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import createAxiosUser from "../../../services/axios/axiosUser";
import toast from "react-hot-toast";

const SOSButton = () => {
  const [progress, setProgress] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [holding, setHolding] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdingRef = useRef(false);

  const userToken = useSelector((store: any) => store.user.userToken);
  const axiosUser = createAxiosUser(userToken);

  const getReverseGeocode = (lat: number, lng: number): Promise<string> =>
    new Promise((resolve) => {
      if (typeof google === "undefined") {
        resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        return;
      }
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      });
    });

  const triggerSOS = () => {
    setTriggered(true);
    setHolding(false);
    holdingRef.current = false;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const address = await getReverseGeocode(latitude, longitude);
          const response = await axiosUser.post("/safety/sos/trigger", {
            latitude, longitude, address,
          });
          toast.success(
            `🚨 SOS sent! ${response.data.contactsNotified} contact(s) notified.`,
            { duration: 6000 }
          );
        } catch (err: any) {
          toast.error("SOS failed: " + (err.response?.data?.message || "Try again"));
        } finally {
          setTimeout(() => { setTriggered(false); setProgress(0); }, 3000);
        }
      },
      () => {
        toast.error("Location access denied. Enable location for SOS.");
        setTriggered(false);
        setProgress(0);
      }
    );
  };

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (triggered) return;
    holdingRef.current = true;
    setHolding(true);
    setProgress(0);

    let p = 0;
    intervalRef.current = setInterval(() => {
      if (!holdingRef.current) { clearInterval(intervalRef.current!); return; }
      p += 3.34;
      setProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(intervalRef.current!); triggerSOS(); }
    }, 100);
  };

  const stopHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (triggered) return;
    holdingRef.current = false;
    setHolding(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  };

  const circumference = 2 * Math.PI * 26;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1.5 select-none"
      style={{ userSelect: "none" }}
    >
      {/* Label */}
      <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
        {triggered ? "Sending..." : holding ? "Keep holding..." : "Hold for SOS"}
      </span>

      <div className="relative w-16 h-16">
        {/* Pulsing glow ring — always visible */}
        {!triggered && !holding && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              animation: "sosPulse 1.5s ease-in-out infinite",
              backgroundColor: "rgba(255,71,87,0.3)",
            }}
          />
        )}

        {/* Progress ring SVG */}
        <svg
          className="absolute inset-0 w-16 h-16"
          viewBox="0 0 64 64"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
          {holding && (
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          )}
        </svg>

        {/* Button */}
        <button
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
          disabled={triggered}
          className={`absolute inset-0 w-16 h-16 rounded-full font-bold text-white text-sm
            shadow-xl transition-transform font-poppins
            ${triggered ? "cursor-not-allowed scale-95 opacity-80"
              : holding ? "scale-90" : "active:scale-95"
            }`}
          style={{
            backgroundColor: "#FF4757",
            touchAction: "none",
          }}
        >
          {triggered ? "..." : "SOS"}
        </button>
      </div>
    </div>
  );
};

export default SOSButton;

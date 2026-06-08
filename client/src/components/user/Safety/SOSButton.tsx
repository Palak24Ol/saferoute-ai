import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import createAxiosUser from "../../../services/axios/axiosUser";
import toast from "react-hot-toast";

const SOSButton = () => {
  const { pathname } = useLocation();
  if (pathname !== "/safety") return null;
  const [progress, setProgress]   = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [holding, setHolding]     = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdingRef  = useRef(false);

  const userToken = useSelector((store: any) => store.user.userToken);
  const axiosUser = createAxiosUser(userToken);

  const getReverseGeocode = (lat: number, lng: number): Promise<string> =>
    new Promise((resolve) => {
      if (typeof google === "undefined") { resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`); return; }
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        resolve(status === "OK" && results?.[0] ? results[0].formatted_address : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });
    });

  const triggerSOS = () => {
    setTriggered(true); setHolding(false); holdingRef.current = false;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const address = await getReverseGeocode(latitude, longitude);
          const response = await axiosUser.post("/safety/sos/trigger", { latitude, longitude, address });
          toast.success(`🚨 SOS sent! ${response.data.contactsNotified} contact(s) notified.`, { duration: 6000 });
        } catch (err: any) { toast.error("SOS failed: " + (err.response?.data?.message || "Try again")); }
        finally { setTimeout(() => { setTriggered(false); setProgress(0); }, 3000); }
      },
      () => { toast.error("Location access denied. Enable location for SOS."); setTriggered(false); setProgress(0); }
    );
  };

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (triggered) return;
    holdingRef.current = true; setHolding(true); setProgress(0);
    let p = 0;
    intervalRef.current = setInterval(() => {
      if (!holdingRef.current) { clearInterval(intervalRef.current!); return; }
      p += 3.34; setProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(intervalRef.current!); triggerSOS(); }
    }, 100);
  };

  const stopHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (triggered) return;
    holdingRef.current = false; setHolding(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  };

  const circumference = 2 * Math.PI * 26;

  return (
    <>
      <style>{`
        @keyframes sosPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, userSelect: 'none' }}>
        {/* Label */}
        <span style={{ fontSize: 11, fontWeight: 600, color: 'white', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 999 }}>
          {triggered ? "Sending..." : holding ? "Keep holding..." : "Hold for SOS"}
        </span>

        <div style={{ position: 'relative', width: 64, height: 64 }}>
          {/* Pulse ring */}
          {!triggered && !holding && (
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(239,68,68,0.35)', animation: 'sosPulse 1.5s ease-in-out infinite' }} />
          )}

          {/* Progress ring */}
          <svg style={{ position: 'absolute', inset: 0, width: 64, height: 64, transform: 'rotate(-90deg)' }} viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            {holding && (
              <circle cx="32" cy="32" r="26" fill="none" stroke="white" strokeWidth="3"
                strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
            )}
          </svg>

          {/* Button */}
          <button
            onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold}
            onTouchStart={startHold} onTouchEnd={stopHold} onTouchCancel={stopHold}
            disabled={triggered}
            style={{
              position: 'absolute', inset: 0, width: 64, height: 64, borderRadius: '50%',
              background: '#ef4444', color: 'white', border: 'none', fontWeight: 800, fontSize: 15,
              fontFamily: 'DM Sans, sans-serif', letterSpacing: 1,
              boxShadow: '0 4px 24px rgba(239,68,68,0.5)', cursor: triggered ? 'not-allowed' : 'pointer',
              touchAction: 'none',
              transform: holding ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.1s',
              opacity: triggered ? 0.8 : 1,
            }}
          >
            {triggered ? "..." : "SOS"}
          </button>
        </div>
      </div>
    </>
  );
};

export default SOSButton;
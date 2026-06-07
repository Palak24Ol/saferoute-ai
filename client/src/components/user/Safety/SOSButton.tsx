import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import createAxiosUser from "../../../services/axios/axiosUser";

const SOSButton: React.FC = () => {
    const [holding, setHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [triggered, setTriggered] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const holdingRef = useRef(false);
    const userToken = useSelector((store: any) => store.user.userToken);
    const axiosUser = createAxiosUser(userToken);

    // Global release listener — fires even if mouse leaves button while holding
    useEffect(() => {
        const handleRelease = () => {
            if (holdingRef.current) stopHold();
        };
        window.addEventListener("mouseup", handleRelease);
        window.addEventListener("touchend", handleRelease);
        return () => {
            window.removeEventListener("mouseup", handleRelease);
            window.removeEventListener("touchend", handleRelease);
        };
    }, []);

    const startHold = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (triggered || holdingRef.current) return;
        holdingRef.current = true;
        setHolding(true);
        setProgress(0);
        let p = 0;
        intervalRef.current = setInterval(() => {
            p += 3.33;
            setProgress(Math.min(p, 100));
            if (p >= 100) {
                clearInterval(intervalRef.current!);
                triggerSOS();
            }
        }, 100);
    };

    const stopHold = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        holdingRef.current = false;
        if (!triggered) {
            setHolding(false);
            setProgress(0);
        }
    };

    const triggerSOS = () => {
        setTriggered(true);
        setHolding(false);
        holdingRef.current = false;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const response = await axiosUser.post("/safety/sos/trigger", {
                        latitude,
                        longitude,
                        address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
                    });
                    toast.success(
                        `🚨 SOS Alert sent! ${response.data.contactsNotified} contact(s) notified.`,
                        { duration: 5000 }
                    );
                } catch (err: any) {
                    toast.error("SOS failed: " + (err.response?.data?.message || "Try again"));
                } finally {
                    setTimeout(() => {
                        setTriggered(false);
                        setProgress(0);
                    }, 3000);
                }
            },
            () => {
                toast.error("Location access denied. Enable location for SOS.");
                setTriggered(false);
                setProgress(0);
            }
        );
    };

    const circumference = 2 * Math.PI * 28;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1 select-none">
            <p className="text-xs text-gray-500 font-medium">
                {holding ? "Keep holding..." : triggered ? "Sending..." : "Hold for SOS"}
            </p>

            {/* Wrapper handles ALL mouse/touch events — SVG is pointer-events-none */}
            <div
                className="relative w-16 h-16 cursor-pointer"
                onMouseDown={startHold}
                onTouchStart={startHold}
            >
                {/* SVG ring — pointer-events-none so it never blocks clicks */}
                <svg
                    className="absolute inset-0 w-16 h-16 -rotate-90 pointer-events-none"
                    viewBox="0 0 64 64"
                >
                    <circle
                        cx="32" cy="32" r="28"
                        fill="none" stroke="#fee2e2" strokeWidth="4"
                    />
                    <circle
                        cx="32" cy="32" r="28"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress / 100)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.1s linear" }}
                    />
                </svg>

                {/* Button — no onMouseLeave, no onMouseUp, handled globally */}
                <button
                    disabled={triggered}
                    className={`absolute inset-0 w-16 h-16 rounded-full font-bold text-white text-xs shadow-lg transition-all
                        ${triggered
                            ? "bg-orange-500 scale-95"
                            : holding
                            ? "bg-red-700 scale-95 shadow-red-300 shadow-xl"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                >
                    {triggered ? "..." : "SOS"}
                </button>
            </div>
        </div>
    );
};

export default SOSButton;
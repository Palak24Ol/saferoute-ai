import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import createAxiosUser from "../../../services/axios/axiosUser";
import toast from "react-hot-toast";

const INCIDENT_TYPES = [
    { value: "harassment", label: "Harassment", emoji: "⚠️" },
    { value: "unsafe_area", label: "Unsafe Area", emoji: "🚧" },
    { value: "accident", label: "Accident", emoji: "🚗" },
    { value: "theft", label: "Theft / Robbery", emoji: "🔓" },
    { value: "other", label: "Other", emoji: "📋" },
];

const ReportIncident: React.FC = () => {
    const userToken = useSelector((store: any) => store.user.userToken);
    const axiosUser = createAxiosUser(userToken);

    const [form, setForm] = useState({
        type: "",
        description: "",
        severity: "medium",
        latitude: 0,
        longitude: 0,
        address: "",
    });
    const [locating, setLocating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const getLocation = () => {
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`,
                }));
                setLocating(false);
            },
            () => {
                toast.error("Could not get your location. Please enable location access.");
                setLocating(false);
            }
        );
    };

    useEffect(() => { getLocation(); }, []);

    const handleSubmit = async () => {
        if (!form.type) { toast.error("Please select an incident type"); return; }
        if (!form.description) { toast.error("Please describe what happened"); return; }
        if (!form.latitude) { toast.error("Location is required. Click 'Use My Location'"); return; }

        setSubmitting(true);
        try {
            await axiosUser.post("/safety/incidents", form);
            setSubmitted(true);
            toast.success("Incident reported. Thank you for keeping the community safe!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to report. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-lg mx-auto p-6 text-center py-20">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Incident Reported!</h2>
                <p className="text-gray-500 mb-6">Our team will review this and update the safety map.</p>
                <button
                    onClick={() => { setSubmitted(false); setForm({ type: "", description: "", severity: "medium", latitude: 0, longitude: 0, address: "" }); getLocation(); }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                    Report Another
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Report an Incident</h2>
            <p className="text-sm text-gray-500 mb-6">Your report helps keep the community safe. Location is anonymized.</p>

            {/* Incident type */}
            <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Incident *</label>
                <div className="grid grid-cols-2 gap-2">
                    {INCIDENT_TYPES.map(t => (
                        <button
                            key={t.value}
                            onClick={() => setForm({ ...form, type: t.value })}
                            className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition
                                ${form.type === t.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}
                        >
                            <span className="text-xl mr-2">{t.emoji}</span>{t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Severity */}
            <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Severity Level *</label>
                <div className="flex gap-3">
                    {["low", "medium", "high"].map(s => (
                        <button
                            key={s}
                            onClick={() => setForm({ ...form, severity: s })}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize border-2 transition
                                ${form.severity === s
                                    ? s === "high" ? "bg-red-500 text-white border-red-500"
                                        : s === "medium" ? "bg-yellow-500 text-white border-yellow-500"
                                        : "bg-green-500 text-white border-green-500"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">What happened? *</label>
                <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the incident briefly..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
            </div>

            {/* Location */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                {form.latitude ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-green-700">📍 Location captured</p>
                            <p className="text-xs text-green-600">{form.address}</p>
                        </div>
                        <button onClick={getLocation} className="text-xs text-green-600 hover:underline">Refresh</button>
                    </div>
                ) : (
                    <button
                        onClick={getLocation}
                        disabled={locating}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
                    >
                        {locating ? "Getting location..." : "📍 Use My Location"}
                    </button>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition"
            >
                {submitting ? "Submitting..." : "Submit Report"}
            </button>
        </div>
    );
};

export default ReportIncident;

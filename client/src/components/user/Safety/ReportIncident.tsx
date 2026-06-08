import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import createAxiosUser from "../../../services/axios/axiosUser";
import toast from "react-hot-toast";

const INCIDENT_TYPES = [
    { value: "harassment",  label: "Harassment",     emoji: "⚠️" },
    { value: "unsafe_area", label: "Unsafe Area",    emoji: "🚧" },
    { value: "accident",    label: "Accident",        emoji: "🚗" },
    { value: "theft",       label: "Theft / Robbery", emoji: "🔓" },
    { value: "other",       label: "Other",           emoji: "📋" },
];

const ReportIncident: React.FC = () => {
    const userToken = useSelector((store: any) => store.user.userToken);
    const axiosUser = createAxiosUser(userToken);

    const [form, setForm] = useState({ type: "", description: "", severity: "medium", latitude: 0, longitude: 0, address: "" });
    const [locating, setLocating]   = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted]  = useState(false);

    const getLocation = () => {
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude, address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}` }));
                setLocating(false);
            },
            () => { toast.error("Could not get your location."); setLocating(false); }
        );
    };
    useEffect(() => { getLocation(); }, []);

    const handleSubmit = async () => {
        if (!form.type)        { toast.error("Please select an incident type"); return; }
        if (!form.description) { toast.error("Please describe what happened"); return; }
        if (!form.latitude)    { toast.error("Location is required"); return; }
        setSubmitting(true);
        try {
            await axiosUser.post("/safety/incidents", form);
            setSubmitted(true);
            toast.success("Incident reported. Thank you!");
        } catch (err: any) { toast.error(err.response?.data?.message || "Failed to report."); }
        finally { setSubmitting(false); }
    };

    const severityColor: Record<string, string> = { low: '#22c55e', medium: '#eab308', high: '#ef4444' };
    const severityBg:    Record<string, string> = { low: '#f0fdf4', medium: '#fefce8', high: '#fef2f2' };

    if (submitted) return (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Incident Reported!</h2>
            <p style={{ color: '#6b7280', marginBottom: 28 }}>Our team will review this and update the safety map.</p>
            <button
                onClick={() => { setSubmitted(false); setForm({ type: "", description: "", severity: "medium", latitude: 0, longitude: 0, address: "" }); getLocation(); }}
                style={{ background: '#e91e8c', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >Report Another</button>
        </div>
    );

    return (
        <>
            <style>{`
                .ri-section-label {
                    font-size: 12px; font-weight: 700; letter-spacing: 1px;
                    text-transform: uppercase; color: #9ca3af; margin-bottom: 10px;
                }
                .ri-type-btn {
                    padding: 14px 16px;
                    border-radius: 14px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.15s;
                    display: flex; align-items: center; gap: 10px;
                }
                .ri-type-btn:hover { border-color: #e91e8c; background: #fdf0f7; }
                .ri-type-btn.active { border-color: #e91e8c; background: #fdf0f7; color: #9d174d; font-weight: 600; }

                .ri-sev-btn {
                    flex: 1; padding: 11px;
                    border-radius: 12px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px; font-weight: 600; text-transform: capitalize;
                    cursor: pointer; transition: all 0.15s; color: #6b7280;
                }

                .ri-textarea {
                    width: 100%;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 14px;
                    padding: 14px 16px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    color: #1f2937;
                    resize: none;
                    outline: none;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .ri-textarea:focus { border-color: #e91e8c; }

                .ri-submit-btn {
                    width: 100%;
                    padding: 15px;
                    background: #e91e8c;
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 16px; font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s;
                    margin-top: 24px;
                }
                .ri-submit-btn:hover:not(:disabled) { background: #c7176f; }
                .ri-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
            `}</style>

            <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28 }}>Your report helps keep the community safe. Location is anonymized.</p>

                {/* Type */}
                <div style={{ marginBottom: 24 }}>
                    <div className="ri-section-label">Type of Incident *</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {INCIDENT_TYPES.map(t => (
                            <button key={t.value} className={`ri-type-btn${form.type === t.value ? ' active' : ''}`}
                                onClick={() => setForm({ ...form, type: t.value })}>
                                <span style={{ fontSize: 20 }}>{t.emoji}</span> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Severity */}
                <div style={{ marginBottom: 24 }}>
                    <div className="ri-section-label">Severity Level *</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {["low", "medium", "high"].map(s => (
                            <button key={s} className="ri-sev-btn"
                                style={form.severity === s ? { background: severityBg[s], borderColor: severityColor[s], color: severityColor[s] } : {}}
                                onClick={() => setForm({ ...form, severity: s })}
                            >{s}</button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 24 }}>
                    <div className="ri-section-label">What happened? *</div>
                    <textarea className="ri-textarea" rows={4} placeholder="Describe the incident briefly..."
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>

                {/* Location */}
                <div>
                    <div className="ri-section-label">Location *</div>
                    {form.latitude ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 16px' }}>
                            <div>
                                <p style={{ fontWeight: 600, color: '#15803d', fontSize: 14 }}>📍 Location captured</p>
                                <p style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>{form.address}</p>
                            </div>
                            <button onClick={getLocation} style={{ fontSize: 12, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Refresh</button>
                        </div>
                    ) : (
                        <button onClick={getLocation} disabled={locating}
                            style={{ width: '100%', padding: '14px', border: '2px dashed #d1d5db', borderRadius: 12, background: 'white', color: '#9ca3af', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}>
                            {locating ? "Getting location..." : "📍 Use My Location"}
                        </button>
                    )}
                </div>

                <button className="ri-submit-btn" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Report"}
                </button>
            </div>
        </>
    );
};

export default ReportIncident;
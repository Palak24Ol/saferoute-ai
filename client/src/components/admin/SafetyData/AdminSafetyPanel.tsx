import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import createAxiosAdmin from "../../../services/axios/axiosAdmin";
import toast from "react-hot-toast";

const AdminSafetyPanel: React.FC = () => {
    const adminToken = useSelector((store: any) => store.admin.adminToken);
    const axiosAdmin = createAxiosAdmin(adminToken);

    const [activeTab, setActiveTab] = useState<"sos" | "incidents">("sos");
    const [sosAlerts, setSosAlerts] = useState<any[]>([]);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sosRes, incRes] = await Promise.all([
                axiosAdmin.get("/safety/sos"),
                axiosAdmin.get("/safety/incidents"),
            ]);
            setSosAlerts(sosRes.data.alerts);
            setIncidents(incRes.data.incidents);
        } catch {
            toast.error("Failed to load safety data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const resolveSOS = async (alertId: string) => {
        try {
            await axiosAdmin.post("/safety/sos/resolve", { alertId });
            toast.success("SOS resolved");
            setSosAlerts(prev => prev.map(a => a._id === alertId ? { ...a, status: "resolved" } : a));
        } catch {
            toast.error("Failed to resolve SOS");
        }
    };

    const updateIncident = async (incidentId: string, status: string) => {
        try {
            await axiosAdmin.post("/safety/incidents/update", { incidentId, status });
            toast.success("Incident updated");
            setIncidents(prev => prev.map(i => i._id === incidentId ? { ...i, status } : i));
        } catch {
            toast.error("Failed to update incident");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Safety Management</h2>
            <p className="text-sm text-gray-500 mb-6">Monitor SOS alerts and incident reports</p>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total SOS", value: sosAlerts.length, color: "red" },
                    { label: "Active SOS", value: sosAlerts.filter(a => a.status === "active").length, color: "orange" },
                    { label: "Total Incidents", value: incidents.length, color: "yellow" },
                    { label: "Pending Review", value: incidents.filter(i => i.status === "pending").length, color: "blue" },
                ].map(stat => (
                    <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-200 rounded-xl p-4`}>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6">
                <button
                    onClick={() => setActiveTab("sos")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition ${activeTab === "sos" ? "border-red-500 text-red-600" : "border-transparent text-gray-500"}`}
                >
                    🚨 SOS Alerts ({sosAlerts.filter(a => a.status === "active").length} active)
                </button>
                <button
                    onClick={() => setActiveTab("incidents")}
                    className={`pb-3 text-sm font-semibold border-b-2 transition ${activeTab === "incidents" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"}`}
                >
                    ⚠️ Incidents ({incidents.filter(i => i.status === "pending").length} pending)
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-400">Loading...</div>
            ) : activeTab === "sos" ? (
                <div className="flex flex-col gap-4">
                    {sosAlerts.length === 0 ? (
                        <div className="text-center py-14 text-gray-400">No SOS alerts yet</div>
                    ) : sosAlerts.map(alert => (
                        <div key={alert._id} className={`border rounded-xl p-4 ${alert.status === "active" ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${alert.status === "active" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                                            {alert.status.toUpperCase()}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800">{alert.userName}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">📍 {alert.address}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        🕐 {new Date(alert.createdAt).toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Notified {alert.contactsNotified?.length || 0} contact(s)
                                    </p>
                                    <a
                                        href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                                        target="_blank" rel="noreferrer"
                                        className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                                    >
                                        📌 View on Maps
                                    </a>
                                </div>
                                {alert.status === "active" && (
                                    <button
                                        onClick={() => resolveSOS(alert._id)}
                                        className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {incidents.length === 0 ? (
                        <div className="text-center py-14 text-gray-400">No incidents reported yet</div>
                    ) : incidents.map(inc => (
                        <div key={inc._id} className="border border-gray-200 rounded-xl p-4 bg-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize
                                            ${inc.severity === "high" ? "bg-red-100 text-red-700"
                                            : inc.severity === "medium" ? "bg-yellow-100 text-yellow-700"
                                            : "bg-green-100 text-green-700"}`}>
                                            {inc.severity}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{inc.type.replace("_", " ")}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full
                                            ${inc.status === "pending" ? "bg-blue-100 text-blue-700"
                                            : inc.status === "reviewed" ? "bg-purple-100 text-purple-700"
                                            : "bg-gray-100 text-gray-600"}`}>
                                            {inc.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{inc.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">By {inc.userName} · {new Date(inc.createdAt).toLocaleString("en-IN")}</p>
                                    <p className="text-xs text-gray-400">📍 {inc.address || `${inc.latitude?.toFixed(4)}, ${inc.longitude?.toFixed(4)}`}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {inc.status === "pending" && (
                                        <button onClick={() => updateIncident(inc._id, "reviewed")}
                                            className="bg-purple-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-600">
                                            Mark Reviewed
                                        </button>
                                    )}
                                    {inc.status !== "resolved" && (
                                        <button onClick={() => updateIncident(inc._id, "resolved")}
                                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600">
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminSafetyPanel;

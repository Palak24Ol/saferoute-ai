import React, { useState } from "react";
import EmergencyContacts from "../../../components/user/Safety/EmergencyContacts";
import ReportIncident from "../../../components/user/Safety/ReportIncident";
import SafeRoutePage from "../../../components/user/Safety/SafeRoutePage";
import SOSButton from "../../../components/user/Safety/SOSButton";

type Tab = "contacts" | "report" | "route";

const SafetyHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>("contacts");

    const tabs: { key: Tab; label: string; emoji: string }[] = [
        { key: "contacts", label: "Emergency Contacts", emoji: "📞" },
        { key: "report", label: "Report Incident", emoji: "⚠️" },
        { key: "route", label: "Safe Route", emoji: "🗺️" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-700 text-white px-6 py-5">
                <h1 className="text-2xl font-bold">Safety Hub</h1>
                <p className="text-blue-200 text-sm mt-1">SafeRoute AI — Your personal safety toolkit</p>
            </div>

            {/* Tab bar */}
            <div className="bg-white border-b border-gray-200 px-4">
                <div className="flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition
                                ${activeTab === tab.key
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <span>{tab.emoji}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className="py-4">
                {activeTab === "contacts" && <EmergencyContacts />}
                {activeTab === "report" && <ReportIncident />}
                {activeTab === "route" && <SafeRoutePage />}
            </div>

            {/* Floating SOS button always visible */}
            <SOSButton />
        </div>
    );
};

export default SafetyHub;

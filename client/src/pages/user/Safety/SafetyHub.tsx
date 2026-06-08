import React, { useState } from "react";
import Navbar from "../../../components/user/Home/Navbar";
import Footer from "../../../components/user/Home/Footer";
import EmergencyContacts from "../../../components/user/Safety/EmergencyContacts";
import ReportIncident from "../../../components/user/Safety/ReportIncident";
import SafeRoutePage from "../../../components/user/Safety/SafeRoutePage";
import SOSButton from "../../../components/user/Safety/SOSButton";

type Tab = "contacts" | "report" | "route";

const SafetyHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>("contacts");

    const tabs: { key: Tab; label: string }[] = [
        { key: "contacts", label: "Emergency Contacts" },
        { key: "report",   label: "Report Incident"   },
        { key: "route",    label: "Safe Route"        },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

                .sh-root {
                    font-family: 'DM Sans', sans-serif;
                    min-height: 100vh;
                    background: #f8f4fc;
                }

                /* ── Hero banner ── */
                .sh-hero {
                    position: relative;
                    width: 100%;
                    height: 280px;
                    overflow: hidden;
                    background: linear-gradient(135deg, #3b5fe2 0%, #a855f7 60%, #ec4899 100%);
                }
                .sh-hero img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                }


                /* ── Tab strip ── */
                .sh-tab-strip {
                    background: white;
                    border-bottom: 1px solid #f0e6f6;
                    display: flex;
                    padding: 0 40px;
                    gap: 0;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    box-shadow: 0 2px 12px rgba(233,30,140,0.06);
                }
                .sh-tab-btn {
                    position: relative;
                    padding: 18px 28px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    font-weight: 500;
                    color: #9ca3af;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: color 0.2s;
                    white-space: nowrap;
                }
                .sh-tab-btn:hover { color: #e91e8c; }
                .sh-tab-btn.active {
                    color: #e91e8c;
                    font-weight: 700;
                }
                .sh-tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 3px;
                    background: #e91e8c;
                    border-radius: 2px 2px 0 0;
                }

                /* ── Body ── */
                .sh-body {
                    max-width: 860px;
                    margin: 36px auto 60px;
                    padding: 0 20px;
                }
            `}</style>

            <div className="sh-root">
                <Navbar />

                {/* Hero */}
                <div className="sh-hero">
                    <img src="/bg.png" alt="Safety Hub" />
                </div>

                {/* Tab strip */}
                <div className="sh-tab-strip">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`sh-tab-btn${activeTab === tab.key ? " active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="sh-body">
                    {activeTab === "contacts" && <EmergencyContacts />}
                    {activeTab === "report"   && <ReportIncident />}
                    {activeTab === "route"    && <SafeRoutePage />}
                </div>

                <Footer />
                <SOSButton />
            </div>
        </>
    );
};

export default SafetyHub;
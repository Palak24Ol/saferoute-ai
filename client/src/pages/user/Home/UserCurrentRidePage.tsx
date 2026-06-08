import { useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../../components/user/Home/Navbar';
import Footer from '../../../components/user/Home/Footer';
import UserCurrentRide from '../../../components/user/Home/UserCurrentRide';
import UserRideHistory from '../../../components/user/Home/UserRideHistory';
import UserRideDetails from '../../../components/user/Home/UserRideDetails';

const CurrentRidePage = () => {
    const { isOpenUserRideData, ride_id } = useSelector((store: any) => store.userRideData);
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

                .rides-page-wrapper {
                    font-family: 'DM Sans', sans-serif;
                    min-height: 100vh;
                    background: #fafafa;
                }

                .rides-content-card {
                    max-width: 1200px;
                    margin: 28px auto 40px;
                    padding: 0 20px;
                }

                /* ── Tab strip ──────────────────────────── */
                .rides-tab-strip {
                    background: white;
                    border-radius: 16px 16px 0 0;
                    border: 1px solid #fce7f3;
                    border-bottom: none;
                    padding: 0 28px;
                    display: flex;
                    gap: 0;
                }

                .rides-tab-strip-btn {
                    position: relative;
                    padding: 18px 24px 16px;
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

                .rides-tab-strip-btn.active {
                    color: #e91e8c;
                    font-weight: 700;
                }

                .rides-tab-strip-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #e91e8c, #be185d);
                    border-radius: 2px 2px 0 0;
                }

                /* ── Tab body ───────────────────────────── */
                .rides-tab-body {
                    background: white;
                    border-radius: 0 0 20px 20px;
                    border: 1px solid #fce7f3;
                    border-top: 1px solid #fce7f3;
                    padding: 28px;
                    box-shadow: 0 4px 32px rgba(233,30,140,0.06);
                }

                /* Subtle pink border on top of body */
                .rides-tab-body::before {
                    content: '';
                    display: block;
                    height: 1px;
                    background: linear-gradient(90deg, #fce7f3, #f9a8d4, #fce7f3);
                    margin: -28px -28px 28px;
                }

                @media (max-width: 768px) {
                    .rides-content-card { padding: 0 12px; }
                    .rides-tab-strip { padding: 0 12px; }
                    .rides-tab-strip-btn { padding: 14px 14px 12px; font-size: 13px; }
                    .rides-tab-body { padding: 16px; }
                    .rides-tab-body::before { margin: -16px -16px 16px; }
                }
            `}</style>

            <div className="rides-page-wrapper">
                <Navbar />

                <div className="rides-content-card">
                    {/* Tab strip */}
                    <div className="rides-tab-strip">
                        <button
                            className={`rides-tab-strip-btn${activeTab === 'current' ? ' active' : ''}`}
                            onClick={() => setActiveTab('current')}
                        >
                            Current Ride
                        </button>
                        <button
                            className={`rides-tab-strip-btn${activeTab === 'history' ? ' active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Rides History
                        </button>
                    </div>

                    {/* Tab body */}
                    <div className="rides-tab-body">
                        {activeTab === 'current' && <UserCurrentRide />}
                        {activeTab === 'history' && (
                            isOpenUserRideData
                                ? <UserRideDetails ride_id={ride_id} />
                                : <UserRideHistory />
                        )}
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
};

export default CurrentRidePage;
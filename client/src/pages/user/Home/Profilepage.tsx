import Navbar from "../../../components/user/Home/Navbar";
import Footer from "../../../components/user/Home/Footer";
import ProfileInfo from "../../../components/user/Home/ProfileInfo";
import { Tabs, TabList, TabPanels, Tab, TabPanel, TabIndicator } from "@chakra-ui/react";
import { useState } from 'react';
import UserWalletInfo from "../../../components/user/Home/UserWalletInfo";

const Profilepage = () => {
    const [tab, settab] = useState(1);

    return (
        <>
            <Navbar />

            {/* Pink gradient hero banner */}
            <div
                className="w-full py-8 px-6"
                style={{
                    background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 60%, #f48fb1 100%)",
                }}
            >
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold" style={{ color: "#880e4f" }}>My Account</h1>
                    <p className="text-sm mt-1" style={{ color: "#c2185b" }}>Manage your profile and wallet</p>
                </div>
            </div>

            {/* Main card */}
            <div
                className="rounded-3xl md:w-[91%] mx-auto mt-[-1.5rem] pt-7 pb-4 mb-8 drop-shadow-xl"
                style={{ background: "#fff" }}
            >
                <div className="md:ml-5">
                    <Tabs position="relative" variant="unstyled">
                        <div className="md:ml-5">
                            <TabList>
                                <Tab
                                    sx={{ fontSize: "20px" }}
                                    onClick={() => settab(1)}
                                >
                                    <h1
                                        className={tab === 1 ? "font-bold" : "font-normal"}
                                        style={{ color: tab === 1 ? "#c2185b" : "#9e9e9e" }}
                                    >
                                        Profile Info
                                    </h1>
                                </Tab>
                                <Tab
                                    sx={{ fontSize: "20px" }}
                                    onClick={() => settab(2)}
                                >
                                    <h1
                                        className={tab === 2 ? "font-bold" : "font-normal"}
                                        style={{ color: tab === 2 ? "#c2185b" : "#9e9e9e" }}
                                    >
                                        Wallet
                                    </h1>
                                </Tab>
                            </TabList>
                            {/* Pink tab indicator */}
                            <TabIndicator mt="-1.5px" height="3px" bg="#e91e63" borderRadius="2px" />
                        </div>
                        <TabPanels>
                            <TabPanel>
                                <ProfileInfo />
                            </TabPanel>
                            <TabPanel>
                                <UserWalletInfo />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Profilepage;
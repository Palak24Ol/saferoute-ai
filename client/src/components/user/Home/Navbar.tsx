// src/components/user/Home/Navbar.tsx
// Logo updated to /images/Frame 7.png with "StreePath" text

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "../../../services/redux/slices/userAuthSlice";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((store: any) => store.user);
    const [windowSize, setWindowSize] = useState(window.innerWidth);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleWindowResize = () => setWindowSize(window.innerWidth);
        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, []);

    useEffect(() => {
        if (windowSize > 400) setIsOpen(false);
    }, [windowSize]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const currentPath = window.location.pathname;

    const navLinks = [
        { label: "Home",    path: "/"        },
        { label: "Rides",   path: "/rides"   },
        { label: "Account", path: "/account" },
        { label: "About",   path: "/about"   },
    ];

    return (
        <>
            <nav
                className="sticky top-0 z-40 w-full transition-all duration-300"
                style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderBottom: scrolled
                        ? "1px solid rgba(233,30,140,0.12)"
                        : "1px solid transparent",
                    boxShadow: scrolled
                        ? "0 4px 24px rgba(233,30,140,0.08)"
                        : "none",
                }}
            >
                <div className="max-w-screen-xl mx-auto px-5 py-2.5 flex items-center justify-between">

                    {/* ── Logo ── */}
                    <div
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2.5 cursor-pointer select-none flex-shrink-0"
                    >
                        <img
                            src="/images/Frame 7.png"
                            alt="StreePath logo"
                            className="h-9 w-auto object-contain"
                            style={{ maxWidth: "120px" }}
                        />
                        <span className="text-xl font-bold text-[#711764] font-poppins tracking-wide">
                            StreePath
                        </span>
                    </div>

                    {/* ── Desktop nav links ── */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = currentPath === link.path;
                            return (
                                <button
                                    key={link.path}
                                    onClick={() => navigate(link.path)}
                                    className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 font-poppins
                                        ${isActive
                                            ? "text-[#E91E8C]"
                                            : "text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5]"
                                        }`}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span
                                            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                                            style={{ background: "#E91E8C" }}
                                        />
                                    )}
                                </button>
                            );
                        })}

                        {/* Safety — always pink with shield icon */}
                        <button
                            onClick={() => navigate("/safety")}
                            className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 font-poppins
                                ${currentPath === "/safety"
                                    ? "text-[#E91E8C] bg-[#FFF0F5]"
                                    : "text-[#E91E8C] hover:bg-[#FFF0F5]"
                                }`}
                        >
                            <span
                                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px]"
                                style={{ background: "rgba(233,30,140,0.12)" }}
                            >
                                🛡️
                            </span>
                            Safety
                            {currentPath === "/safety" && (
                                <span
                                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                                    style={{ background: "#E91E8C" }}
                                />
                            )}
                        </button>
                    </div>

                    {/* ── Right side: Avatar dropdown + mobile hamburger ── */}
                    <div className="flex items-center gap-3">

                        {/* Avatar dropdown */}
                        <div className="hidden lg:block">
                            <button
                                type="button"
                                className="dropdown dropdown-bottom dropdown-end focus:outline-none"
                                aria-label="toggle profile dropdown"
                                tabIndex={0}
                            >
                                <ul
                                    tabIndex={0}
                                    className="menu dropdown-content z-[1] p-2 shadow-lg bg-white rounded-2xl w-52 mt-3"
                                    style={{
                                        border: "1px solid rgba(233,30,140,0.12)",
                                        boxShadow: "0 12px 32px rgba(233,30,140,0.12)",
                                    }}
                                >
                                    {user ? (
                                        <>
                                            <li onClick={() => dispatch(userLogout())}>
                                                <a className="text-sm font-medium text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5] rounded-xl">
                                                    Sign out
                                                </a>
                                            </li>
                                            <li onClick={() => navigate("/driver/login")}>
                                                <a className="text-sm font-medium text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5] rounded-xl">
                                                    Login as Driver
                                                </a>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li onClick={() => navigate("/login")}>
                                                <a className="text-sm font-medium text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5] rounded-xl">
                                                    Login
                                                </a>
                                            </li>
                                            <li onClick={() => navigate("/signup")}>
                                                <a className="text-sm font-medium text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5] rounded-xl">
                                                    Sign up
                                                </a>
                                            </li>
                                            <li onClick={() => navigate("/driver/login")}>
                                                <a className="text-sm font-medium text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5] rounded-xl">
                                                    Login as Driver
                                                </a>
                                            </li>
                                        </>
                                    )}
                                </ul>

                                {/* Avatar circle */}
                                {user ? (
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-105"
                                        style={{
                                            background: "linear-gradient(135deg, #E91E8C, #8B1A4A)",
                                            boxShadow: "0 2px 10px rgba(233,30,140,0.35)",
                                        }}
                                    >
                                        {user[0].toUpperCase()}
                                    </div>
                                ) : (
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-105"
                                        style={{
                                            background: "linear-gradient(135deg, #2D1470, #534AB7)",
                                            boxShadow: "0 2px 10px rgba(45,20,112,0.25)",
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                            <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-[#FFF0F5]"
                            style={{ color: "#E91E8C" }}
                            aria-label="toggle menu"
                        >
                            {isOpen ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Mobile dropdown menu ── */}
                <div
                    className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                    }`}
                    style={{ borderTop: isOpen ? "1px solid rgba(233,30,140,0.08)" : "none" }}
                >
                    <div className="px-5 py-4 flex flex-col gap-1">
                        {navLinks.map((link) => {
                            const isActive = currentPath === link.path;
                            return (
                                <button
                                    key={link.path}
                                    onClick={() => { navigate(link.path); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors font-poppins
                                        ${isActive
                                            ? "text-[#E91E8C] bg-[#FFF0F5]"
                                            : "text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5]"
                                        }`}
                                >
                                    {link.label}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => { navigate("/safety"); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-[#E91E8C] hover:bg-[#FFF0F5] transition-colors font-poppins flex items-center gap-2"
                        >
                            🛡️ Safety
                        </button>

                        <div className="mt-2 pt-3" style={{ borderTop: "1px solid rgba(233,30,140,0.1)" }}>
                            {user ? (
                                <>
                                    <p className="text-xs text-[#6B5B7B] font-poppins px-4 mb-2">
                                        Signed in as <span className="font-semibold text-[#E91E8C]">{user}</span>
                                    </p>
                                    <button
                                        onClick={() => { dispatch(userLogout()); setIsOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5] transition-colors"
                                    >
                                        Sign out
                                    </button>
                                    <button
                                        onClick={() => { navigate("/driver/login"); setIsOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5] transition-colors"
                                    >
                                        Login as Driver
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { navigate("/login"); setIsOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5] transition-colors"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => { navigate("/signup"); setIsOpen(false); }}
                                        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white mt-1 transition-all"
                                        style={{ background: "linear-gradient(135deg, #E91E8C, #8B1A4A)" }}
                                    >
                                        Sign up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
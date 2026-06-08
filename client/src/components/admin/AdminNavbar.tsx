// src/components/admin/AdminNavbar.tsx
// Logo updated to /images/Frame 7.png — all existing logic preserved exactly

import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../services/redux/slices/adminAuthSlice";

export function AdminNavbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [openNav, setOpenNav] = React.useState(false);

    const navLinks = [
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Drivers",   path: "/admin/drivers"   },
        { label: "Users",     path: "/admin/users"     },
        { label: "Safety",    path: "/admin/safety"    },
    ];

    const currentPath = window.location.pathname;

    return (
        <nav
            className="w-full shadow-sm"
            style={{
                background: "linear-gradient(135deg, #1a0c42 0%, #2D1470 60%, #3d1a5a 100%)",
                borderBottom: "1px solid rgba(233,30,140,0.2)",
            }}
        >
            <div className="max-w-screen-xl mx-auto px-5 py-3 flex items-center justify-between">

                {/* ── Logo ── */}
                <div
                    className="flex items-center gap-3 cursor-pointer select-none"
                    onClick={() => navigate("/admin/dashboard")}
                >
                    <img
                        src="/images/Frame 7.png"
                        alt="StreePath logo"
                        className="h-8 w-auto object-contain"
                        style={{
                            maxWidth: "110px",
                            // The filter line has been removed from here
                        }}
                    />
                    <span 
                        className="text-xl font-bold" 
                        style={{ color: "#711764" }}
                    >
                        StreePath
                    </span>
                    {/* ... Admin badge continues below ... */}
                    <span
                        className="text-xs font-semibold tracking-widest uppercase px-2 py-0.5 rounded-md"
                        style={{
                            background: "rgba(233,30,140,0.25)",
                            color: "#F8A8D0",
                            border: "1px solid rgba(233,30,140,0.35)",
                            letterSpacing: "0.12em",
                        }}
                    >
                        Admin
                    </span>
                </div>

                {/* ── Desktop nav links ── */}
                <ul className="hidden lg:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive =
                            currentPath === link.path ||
                            currentPath.startsWith(link.path + "/");
                        return (
                            <li key={link.path}>
                                <button
                                    onClick={() => navigate(link.path)}
                                    className="relative px-4 py-2 text-sm font-medium text-white rounded-xl transition-all duration-200"
                                    style={{
                                        background: isActive
                                            ? "rgba(233,30,140,0.2)"
                                            : "transparent",
                                        opacity: isActive ? 1 : 0.75,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive)
                                            (e.currentTarget as HTMLElement).style.opacity = "1";
                                        if (!isActive)
                                            (e.currentTarget as HTMLElement).style.background =
                                                "rgba(255,255,255,0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive)
                                            (e.currentTarget as HTMLElement).style.opacity = "0.75";
                                        if (!isActive)
                                            (e.currentTarget as HTMLElement).style.background =
                                                "transparent";
                                    }}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span
                                            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                                            style={{ background: "#E91E8C" }}
                                        />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* ── Log out button ── */}
                <div className="hidden lg:flex items-center gap-3">
                    <button
                        onClick={() => dispatch(adminLogout())}
                        className="flex items-center gap-2 px-5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={{
                            border: "1px solid rgba(233,30,140,0.45)",
                            color: "#F8A8D0",
                            background: "rgba(233,30,140,0.08)",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                                "rgba(233,30,140,0.22)";
                            (e.currentTarget as HTMLElement).style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                                "rgba(233,30,140,0.08)";
                            (e.currentTarget as HTMLElement).style.color = "#F8A8D0";
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Log Out
                    </button>
                </div>

                {/* ── Mobile hamburger ── */}
                <button
                    className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-white"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                    onClick={() => setOpenNav(!openNav)}
                    aria-label="toggle menu"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        {openNav ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* ── Mobile menu ── */}
            <div
                className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                    openNav ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
                }`}
                style={{ borderTop: openNav ? "1px solid rgba(233,30,140,0.15)" : "none" }}
            >
                <div className="px-5 py-4 flex flex-col gap-1">
                    {navLinks.map((link) => {
                        const isActive =
                            currentPath === link.path ||
                            currentPath.startsWith(link.path + "/");
                        return (
                            <button
                                key={link.path}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors
                                    ${isActive ? "bg-white/15" : "opacity-75 hover:opacity-100 hover:bg-white/08"}`}
                                onClick={() => { navigate(link.path); setOpenNav(false); }}
                            >
                                {link.label}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => dispatch(adminLogout())}
                        className="mt-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                        style={{
                            background: "rgba(233,30,140,0.18)",
                            border: "1px solid rgba(233,30,140,0.35)",
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Log Out
                    </button>
                </div>
            </div>
        </nav>
    );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../services/redux/slices/adminAuthSlice";

// Same export name, same function name, same logic — only styling changed
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
        <nav style={{ backgroundColor: "#2D1470" }} className="w-full px-6 py-3 shadow-sm">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between">

                {/* Logo */}
                <span
                    className="text-xl font-bold text-white cursor-pointer tracking-tight select-none"
                    onClick={() => navigate("/admin/dashboard")}
                >
                    Safely
                    <span className="ml-2 text-xs font-normal opacity-60">Admin</span>
                </span>

                {/* Desktop nav */}
                <ul className="hidden lg:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = currentPath === link.path || currentPath.startsWith(link.path + "/");
                        return (
                            <li key={link.path}>
                                <button
                                    onClick={() => navigate(link.path)}
                                    className={`relative px-4 py-2 text-sm font-medium text-white rounded-lg transition-all
                                        ${isActive ? "bg-white/15" : "opacity-70 hover:opacity-100 hover:bg-white/10"}`}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#E91E8C] rounded-full" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* Log out button */}
                <button
                    onClick={() => dispatch(adminLogout())}
                    className="hidden lg:block border border-white/60 text-white text-sm font-semibold px-5 py-1.5 rounded-xl hover:bg-white hover:text-[#2D1470] transition-colors"
                >
                    Log Out
                </button>

                {/* Mobile hamburger */}
                <button
                    className="lg:hidden text-white"
                    onClick={() => setOpenNav(!openNav)}
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        {openNav
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        }
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {openNav && (
                <div className="lg:hidden mt-3 flex flex-col gap-1 px-2 pb-3">
                    {navLinks.map((link) => (
                        <p
                            key={link.path}
                            className="cursor-pointer text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition-colors"
                            onClick={() => { navigate(link.path); setOpenNav(false); }}
                        >
                            {link.label}
                        </p>
                    ))}
                    <button
                        onClick={() => dispatch(adminLogout())}
                        className="mt-2 border border-white/60 text-white font-semibold px-4 py-2 rounded-xl w-full text-sm hover:bg-white hover:text-[#2D1470] transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            )}
        </nav>
    );
}

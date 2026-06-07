import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../services/redux/slices/adminAuthSlice";

export function AdminNavbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [openNav, setOpenNav] = React.useState(false);

    return (
        <nav className="bg-indigo-600 px-4 py-3">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between text-white">
                <span
                    className="font-semibold text-lg cursor-pointer"
                    onClick={() => navigate("/admin/dashboard")}
                >
                    SafeRoute AI — Admin
                </span>

                {/* Desktop nav */}
                <ul className="hidden lg:flex gap-6 text-sm font-medium">
                    <li className="cursor-pointer hover:text-yellow-300" onClick={() => navigate("/admin/dashboard")}>Dashboard</li>
                    <li className="cursor-pointer hover:text-yellow-300" onClick={() => navigate("/admin/drivers")}>Drivers</li>
                    <li className="cursor-pointer hover:text-yellow-300" onClick={() => navigate("/admin/users")}>Users</li>
                    <li className="cursor-pointer hover:text-yellow-300" onClick={() => navigate("/admin/safety")}>Safety</li>
                </ul>

                <button
                    onClick={() => dispatch(adminLogout())}
                    className="hidden lg:block bg-white text-indigo-600 text-sm font-semibold px-4 py-1.5 rounded hover:bg-yellow-300 hover:text-black transition"
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
                <div className="lg:hidden mt-2 flex flex-col gap-3 text-white text-sm px-2 pb-3">
                    <p className="cursor-pointer hover:text-yellow-300" onClick={() => navigate("/admin/dashboard")}>Dashboard</p>
                    <p className="cursor-pointer hover:text-yellow-300" onClick={() => navigate("/admin/drivers")}>Drivers</p>
                    <p className="cursor-pointer hover:text-yellow-300" onClick={() => navigate("/admin/users")}>Users</p>
                    <button
                        onClick={() => dispatch(adminLogout())}
                        className="bg-white text-indigo-600 font-semibold px-4 py-1.5 rounded w-full"
                    >
                        Log Out
                    </button>
                </div>
            )}
        </nav>
    );
}
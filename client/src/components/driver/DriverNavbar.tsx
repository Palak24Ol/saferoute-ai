import React from "react";
import { useDispatch } from "react-redux";
import { driverLogout } from "../../services/redux/slices/driverAuthSlice";
import { useNavigate } from "react-router-dom";

// Same export name, same function name, same logic — removed @material-tailwind dependency,
// only styling changed to match maroon design
export function DriverNavbar() {
    const dispatch = useDispatch();
    const [openNav, setOpenNav] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        window.addEventListener("resize", () => window.innerWidth >= 960 && setOpenNav(false));
    }, []);

    const currentPath = window.location.pathname;

    const navLinks = [
        { label: "Dashboard",     path: "/driver/dashboard"      },
        { label: "Rides",         path: "/driver/driverRides"    },
        { label: "Profile",       path: "/driver/profile"        },
    ];

    return (
        <nav
            className="w-full px-6 py-3 shadow-sm"
            style={{ backgroundColor: "#8B1A4A" }}
        >
            <div className="max-w-screen-xl mx-auto flex items-center justify-between">

                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer select-none"
                    onClick={() => navigate("/driver/dashboard")}
                >
                    <img
                        src="/images/Frame 7.png"
                        alt="StreePath logo"
                        className="h-8 w-auto object-contain"
                        style={{ maxWidth: "110px" }}
                    />
                    <span className="text-xl font-bold text-white tracking-tight">
                        StreePath
                    </span>
                </div>

                {/* Desktop nav links */}
                <ul className="hidden lg:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = currentPath === link.path;
                        return (
                            <li key={link.path}>
                                <p
                                    onClick={() => navigate(link.path)}
                                    className={`relative px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-all
                                        ${isActive ? "bg-white/20" : "opacity-75 hover:opacity-100 hover:bg-white/10"}`}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
                                    )}
                                </p>
                            </li>
                        );
                    })}
                </ul>

                {/* Log out — desktop */}
                <button
                    onClick={() => dispatch(driverLogout())}
                    className="hidden lg:block border border-white text-white text-sm font-semibold px-5 py-1.5 rounded-xl hover:bg-white hover:text-[#8B1A4A] transition-colors"
                >
                    LOG OUT
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
                            onClick={() => { navigate(link.path); setOpenNav(false); }}
                            className="cursor-pointer text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition-colors"
                        >
                            {link.label}
                        </p>
                    ))}
                    <button
                        onClick={() => dispatch(driverLogout())}
                        className="mt-2 border border-white text-white font-semibold px-4 py-2 rounded-xl w-full text-sm hover:bg-white hover:text-[#8B1A4A] transition-colors"
                    >
                        LOG OUT
                    </button>
                </div>
            )}
        </nav>
    );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "../../../services/redux/slices/userAuthSlice";

// Same export name (default Navbar), same logic, same state, same dispatch calls
// Only styling changed to match Stitch design
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((store: any) => store.user);
    const [windowSize, setWindowSize] = useState(window.innerWidth);

    useEffect(() => {
        const handleWindowResize = () => setWindowSize(window.innerWidth);
        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, []);

    useEffect(() => {
        if (windowSize > 400) setIsOpen(false);
    }, [windowSize]);

    const currentPath = window.location.pathname;

    const navLinks = [
        { label: "Home",    path: "/"        },
        { label: "Rides",   path: "/rides"   },
        { label: "Account", path: "/account" },
        { label: "About",   path: "/about"   },
    ];

    return (
        <>
            <div>
                <nav className="relative bg-white shadow-sm sticky top-0 z-40">
                    <div className="container px-6 py-3 mx-auto">
                        <div className="lg:flex lg:items-center lg:justify-between">

                            {/* Logo + mobile hamburger row */}
                            <div className="flex items-center justify-between">
                                <div
                                    onClick={() => navigate("/")}
                                    className="flex items-center cursor-pointer"
                                >
                                    <h1
                                        className="text-2xl px-2 font-bold tracking-tight"
                                        style={{ color: "#E91E8C" }}
                                    >
                                        Safely
                                    </h1>
                                </div>

                                {/* Mobile hamburger */}
                                <div className="flex lg:hidden">
                                    <button
                                        onClick={() => setIsOpen(!isOpen)}
                                        type="button"
                                        className="text-gray-500 hover:text-gray-600 focus:outline-none"
                                        aria-label="toggle menu"
                                    >
                                        {isOpen ? (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Nav links + avatar — collapsible on mobile */}
                            <div
                                className={`absolute inset-x-0 z-20 w-full px-6 py-4 transition-all duration-300 ease-in-out
                                    bg-white lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:bg-transparent
                                    lg:w-auto lg:opacity-100 lg:translate-x-0 lg:flex lg:items-center
                                    ${isOpen ? "translate-x-0 opacity-100" : "opacity-0 -translate-x-full"}`}
                            >
                                {/* Nav links */}
                                <div className="flex flex-col font-medium -mx-6 lg:flex-row lg:items-center lg:mx-1">
                                    {navLinks.map((link) => {
                                        const isActive = currentPath === link.path;
                                        return (
                                            <p
                                                key={link.path}
                                                onClick={() => navigate(link.path)}
                                                className={`relative px-4 py-2 mx-1 mt-2 cursor-pointer text-sm font-medium
                                                    rounded-lg lg:mt-0 transition-colors duration-200
                                                    ${isActive
                                                        ? "text-[#E91E8C]"
                                                        : "text-[#2D1470] hover:text-[#E91E8C] hover:bg-[#FFF0F5]"
                                                    }`}
                                            >
                                                {link.label}
                                                {isActive && (
                                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#E91E8C] rounded-full" />
                                                )}
                                            </p>
                                        );
                                    })}

                                    {/* Safety link — always pink */}
                                    <p
                                        onClick={() => navigate("/safety")}
                                        className={`relative px-4 py-2 mx-1 mt-2 cursor-pointer text-sm font-semibold
                                            rounded-lg lg:mt-0 transition-colors duration-200 flex items-center gap-1
                                            ${currentPath === "/safety"
                                                ? "text-[#E91E8C]"
                                                : "text-[#E91E8C] hover:bg-[#FFF0F5]"
                                            }`}
                                    >
                                        🛡️ Safety
                                        {currentPath === "/safety" && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#E91E8C] rounded-full" />
                                        )}
                                    </p>
                                </div>

                                {/* Avatar dropdown — same DaisyUI logic as before */}
                                <div className="flex items-center mt-4 lg:mt-0">
                                    <button
                                        type="button"
                                        className={`flex items-center focus:outline-none dropdown
                                            ${!isOpen ? "dropdown-bottom dropdown-end" : "dropdown-right"}`}
                                        aria-label="toggle profile dropdown"
                                        tabIndex={0}
                                    >
                                        {/* Dropdown menu — same items as before */}
                                        <ul
                                            tabIndex={0}
                                            className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4"
                                        >
                                            {user ? (
                                                <>
                                                    <li onClick={() => dispatch(userLogout())}>
                                                        <a>Signout</a>
                                                    </li>
                                                    <li onClick={() => navigate("/driver/login")}>
                                                        <a>Login as Driver</a>
                                                    </li>
                                                </>
                                            ) : (
                                                <>
                                                    <li onClick={() => navigate("/login")}>
                                                        <a>Login</a>
                                                    </li>
                                                    <li onClick={() => navigate("/signup")}>
                                                        <a>Signup</a>
                                                    </li>
                                                    <li onClick={() => navigate("/driver/login")}>
                                                        <a>Login as Driver</a>
                                                    </li>
                                                </>
                                            )}
                                        </ul>

                                        {/* Avatar circle — brand pink */}
                                        {user ? (
                                            <>
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                                                    style={{ backgroundColor: "#E91E8C" }}>
                                                    {user[0].toUpperCase()}
                                                </div>
                                                <h3 className="mx-2 text-gray-700 lg:hidden">{user}</h3>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                                                    style={{ backgroundColor: "#2D1470" }}>
                                                    A
                                                </div>
                                                <h3 className="mx-2 text-gray-700 lg:hidden">Account</h3>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Navbar;

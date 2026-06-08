import { useNavigate } from "react-router-dom";

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section
            style={{
                backgroundImage: "url('/images/image.png')",
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
                minHeight: "72vh",
            }}
            className="relative w-full flex items-center"
        >
             <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(233,30,140,0.25)" }} />
            <div className="relative z-10 max-w-7xl mx-auto px-8 py-16 w-full">
                <div className="text-white max-w-lg">
                    <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                        Your Safe<br />
                        Journey<br />
                        Begins Here
                    </h1>
                    <p className="text-white/85 text-base font-light mb-10 leading-relaxed">
                        Reliable, secure, and exclusive transportation for women, by women.
                        Experience peace of mind with every ride.
                    </p>
                    <button
                        onClick={() => navigate("/rides")}
                        className="border-2 border-white text-white text-sm font-bold tracking-widest
                            uppercase px-8 py-3 rounded-lg hover:bg-white hover:text-[#E91E8C]
                            transition-all duration-200"
                    >
                        BOOK YOUR RIDE
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
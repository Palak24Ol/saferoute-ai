const cards = [
    {
        title: "Safety First",
        desc: "Advanced safety features, real-time tracking, and dedicated support.",
        icon: (
            // Shield with heart
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                <path
                    d="M24 4L8 10v14c0 9.4 6.8 18.2 16 20 9.2-1.8 16-10.6 16-20V10L24 4z"
                    stroke="#E91E8C" strokeWidth="2.5" strokeLinejoin="round"
                    fill="#FFF0F5"
                />
                <path
                    d="M18 24c0-1.65 1.35-3 3-3 .98 0 1.84.47 2.38 1.2.54-.73 1.4-1.2 2.38-1.2 1.65 0 3 1.35 3 3 0 2.5-3 5-5.38 6.6C20.62 29 18 26.5 18 24z"
                    fill="#E91E8C"
                />
            </svg>
        ),
    },
    {
        title: "Women Drivers Only",
        desc: "All drivers are verified women, empowering and safe for everyone.",
        icon: (
            // Woman silhouette
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="14" r="7" stroke="#E91E8C" strokeWidth="2.5" fill="#FFF0F5" />
                <path
                    d="M10 38c0-7.73 6.27-14 14-14s14 6.27 14 14"
                    stroke="#E91E8C" strokeWidth="2.5" strokeLinecap="round" fill="none"
                />
                <circle cx="24" cy="38" r="3" fill="#E91E8C" />
                <line x1="24" y1="35" x2="24" y2="31" stroke="#E91E8C" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        title: "Verified Profiles",
        desc: "Rigorous background checks and profile verification for all users.",
        icon: (
            // Clipboard with check
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                <rect x="10" y="8" width="28" height="34" rx="3" stroke="#E91E8C" strokeWidth="2.5" fill="#FFF0F5" />
                <path d="M18 8v-2a2 2 0 014 0v2" stroke="#E91E8C" strokeWidth="2" />
                <path d="M26 8v-2a2 2 0 014 0v2" stroke="#E91E8C" strokeWidth="2" />
                <path d="M16 26l4 4 8-8" stroke="#E91E8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

const WhySafely = () => {
    return (
        <section className="w-full py-16 px-6" style={{ backgroundColor: "#FAF7F0" }}>
            <div className="max-w-5xl mx-auto">
                {/* Section heading */}
                <h2 className="text-3xl font-bold mb-10" style={{ color: "#2D1470" }}>
                    Why Safely
                </h2>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(233,30,140,0.08)] border border-[#F8D7E8]/60
                                hover:shadow-[0_8px_32px_rgba(233,30,140,0.14)] hover:-translate-y-0.5 transition-all duration-200"
                        >
                            {/* Icon */}
                            <div className="mb-4">
                                {card.icon}
                            </div>
                            {/* Title */}
                            <h3 className="text-base font-bold mb-2" style={{ color: "#2D1470" }}>
                                {card.title}
                            </h3>
                            {/* Description */}
                            <p className="text-sm leading-relaxed" style={{ color: "#6B5B7B" }}>
                                {card.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhySafely;
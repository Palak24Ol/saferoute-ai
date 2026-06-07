import SafetyCheckIcon from "@mui/icons-material/SafetyCheck";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SupportIcon from '@mui/icons-material/Support';

const cards = [
    {
        icon: <SafetyCheckIcon fontSize="inherit" />,
        title: "Safety First",
        desc: "At SafeRoute AI, we prioritize your safety above all else. Our women-only cab booking service is designed to provide you with a secure and comfortable travel experience.",
        bg: "https://img.freepik.com/free-photo/front-view-female-builder-yellow-helmet-black-shirt-showing-heart-sign-white-wall_140725-35157.jpg?w=1060"
    },
    {
        icon: <CalendarMonthIcon fontSize="inherit" />,
        title: "Unmatched Convenience",
        desc: "Experience the ultimate convenience with SafeRoute AI. All our drivers undergo strict background checks and we offer services tailored to modern women on the move.",
        bg: "https://img.freepik.com/free-photo/businesswoman-car_23-2148002180.jpg?w=1060"
    },
    {
        icon: <SupportIcon fontSize="inherit" />,
        title: "Dedicated Assistance",
        desc: "We are committed to providing exceptional customer support. Our dedicated team is available round-the-clock to assist you with any queries or concerns.",
        bg: "https://img.freepik.com/free-photo/portrait-woman-customer-service-worker_144627-37948.jpg?w=996"
    }
];

const WhySafely = () => {
    return (
        <div className="container mx-auto px-6 pb-7">
            <h1 className="text-4xl font-bold text-blue-800">Why SafeRoute AI?</h1>
            <div className="container w-full h-fit md:flex md:justify-between grid grid-rows-1 gap-5 py-10">
                {cards.map((card, index) => (
                    <div key={index} className="mx-auto">
                        <div
                            className="relative h-60 w-full max-w-xs rounded-xl overflow-hidden text-center flex flex-col justify-end"
                            style={{ backgroundImage: `url('${card.bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        >
                            <div className="absolute inset-0 bg-black opacity-50" />
                            <div className="relative z-10 p-6">
                                <div className="text-5xl mb-2 text-white">
                                    {card.icon}
                                </div>
                                <h4 className="mb-2 font-bold text-yellow-400 text-lg">{card.title}</h4>
                                <p className="mb-4 text-gray-300 text-sm">{card.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhySafely;
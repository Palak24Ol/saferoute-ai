import Navbar from "./Navbar"
import Footer from "./Footer"

const About = () => {
    return (
        <>
            <Navbar />
            <section className="bg-white dark:bg-gray-900">
                <div className="relative flex">
                    <div className="min-h-screen lg:w-1/3" />
                    <div className="hidden w-3/4 min-h-screen lg:block" style={{ background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)" }} />
                    <div className="container flex flex-col justify-center w-full min-h-screen px-6 py-10 mx-auto lg:absolute lg:inset-x-0">
                        <h1 className="text-2xl font-semibold text-gray-800 capitalize lg:text-4xl dark:text-white">
                            What our{" "}
                            <span style={{ color: "#c2185b" }}>CEO</span>{" "}
                            <br /> Has to Say
                        </h1>

                        {/* Decorative pink accent bar */}
                        <div
                            className="mt-4 rounded-full"
                            style={{ width: "80px", height: "4px", background: "linear-gradient(90deg, #e91e63, #f48fb1)" }}
                        />

                        <div className="mt-10 lg:mt-20 lg:flex lg:items-center">
                            {/* Image with pink ring */}
                            <div className="relative flex-shrink-0">
                                <div
                                    className="absolute inset-0 rounded-lg"
                                    style={{
                                        background: "linear-gradient(135deg, #e91e63, #f48fb1)",
                                        transform: "translate(8px, 8px)",
                                        zIndex: 0,
                                        borderRadius: "0.5rem",
                                        width: "100%",
                                        maxWidth: "32rem",
                                        height: "24rem",
                                    }}
                                />
                                <img
                                    className="relative object-cover object-center w-full lg:w-[32rem] rounded-lg h-96"
                                    style={{ zIndex: 1 }}
                                    src="https://d2y3cuhvusjnoc.cloudfront.net/IMG_4630.jpg"
                                    alt="CEO Palak Jaiswal"
                                />
                            </div>

                            {/* Text content */}
                            <div className="mt-8 lg:px-10 lg:mt-0">
                                {/* Pink quote mark */}
                                <span style={{ fontSize: "4rem", lineHeight: 1, color: "#f48fb1", fontFamily: "Georgia, serif" }}>"</span>

                                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white lg:w-72 -mt-4">
                                    Hello, Wonderful Community,
                                </h1>

                                <p className="max-w-lg mt-6 text-gray-500 dark:text-gray-400 leading-relaxed">
                                    At StreePath, we are committed to providing a safe and reliable cab service exclusively designed for women.
                                    Our team is dedicated to making your ride experience exceptional, and we are continuously working to improve our services to better serve you.
                                </p>

                                <p className="max-w-lg mt-6 text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Thank you for choosing StreePath, where your safety is our destination.
                                </p>

                                {/* Pink divider */}
                                <div
                                    className="my-6 rounded-full"
                                    style={{ width: "48px", height: "3px", background: "linear-gradient(90deg, #e91e63, #f48fb1)" }}
                                />

                                <h3 className="text-lg font-bold" style={{ color: "#c2185b" }}>
                                    Palak Jaiswal
                                </h3>
                                 

                                {/* Pink badge */}
                                <span
                                    className="inline-block mt-4 px-4 py-1 text-sm font-medium rounded-full"
                                    style={{
                                        background: "linear-gradient(90deg, #fce4ec, #f8bbd0)",
                                        color: "#c2185b",
                                        border: "1px solid #f48fb1",
                                    }}
                                >
                                    🌸 Women's Safety First
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}

export default About
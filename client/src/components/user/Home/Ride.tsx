// src/components/user/Home/Ride.tsx
// ALL logic, state, hooks, socket, formik, API calls — 100% unchanged
// Only the JSX return block is redesigned to match the Stitch booking page PNG

import { Input } from "@material-tailwind/react";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import "./Home.scss";
import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { cancelSearching, startSearching } from "../../../services/redux/slices/driverSearchSlice";
import socketIOClient, { Socket } from "socket.io-client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ENDPOINT = import.meta.env.VITE_API_URL;
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

const Ride = () => {
    const [noDriversModal, setnoDriversModal] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketInstance = socketIOClient(ENDPOINT);
        setSocket(socketInstance);
        console.log("Socket connected user side");
        socketInstance.on("userConfirmation", (rideId) => {
            localStorage.setItem("currentRide-user", rideId);
            dispatch(cancelSearching());
            navigate("/rides");
        });
    }, []);

    const { user_id } = useSelector((store: any) => store.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [pickupLocation, setPickupLocation] = useState<string>("");
    const [dropoffLocation, setDropoffLocation] = useState<string>("");
    const [pickupCoordinates, setpickupCoordinates] = useState({ latitude: "", longitude: "" });
    const [dropoffCoordinates, setdropoffCoordinates] = useState({ latitude: "", longitude: "" });
    const [map, setmap] = useState<google.maps.Map | undefined>(undefined);
    const [center, setcenter] = useState({ lat: 12.9716, lng: 77.5946 });
    const [zoom, setzoom] = useState(11);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    const [directionsResponse, setdirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
    const [distance, setdistance] = useState<string | undefined>(undefined);
    const [duration, setduration] = useState<string | undefined>(undefined);
    const originRef = useRef<HTMLInputElement | null>(null);
    const destinationRef = useRef<HTMLInputElement | null>(null);

    const calculateRoute = async () => {
        const originValue = originRef.current?.value;
        const destinationValue = destinationRef.current?.value;
        if (!originValue || !destinationValue) return toast.error("Please choose the pickup and dropoff locations");
        if (originValue === destinationValue) return toast.error("Please choose different locations!");
        if (originValue && destinationRef.current?.value && originValue != destinationValue) {
            setPickupLocation(originValue);
            setDropoffLocation(destinationValue);
            const pickupCoords = await geocodeLocation(originValue);
            setpickupCoordinates(pickupCoords);
            const dropoffCoords = await geocodeLocation(destinationValue);
            setdropoffCoordinates(dropoffCoords);
        }
        const directionsService = new google.maps.DirectionsService();
        try {
            const result = await directionsService.route({
                origin: originValue,
                destination: destinationValue,
                travelMode: google.maps.TravelMode.DRIVING,
            });
            setdirectionsResponse(result);
            setdistance(result.routes[0].legs[0].distance?.text);
            setduration(result.routes[0].legs[0].duration?.text);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    function clearRoutes() {
        setdirectionsResponse(null);
        setdistance(undefined);
        setduration(undefined);
        if (originRef.current) originRef.current.value = "";
        if (destinationRef.current) destinationRef.current.value = "";
    }

    const reverseGeocode = async (latitude: any, longitude: any) => {
        try {
            const geocoder = new google.maps.Geocoder();
            const latlng = new google.maps.LatLng(latitude, longitude);
            return new Promise((resolve, reject) => {
                geocoder.geocode({ location: latlng }, (results, status) => {
                    if (status === "OK" && results?.[0]) {
                        const addressComponents = results[0].address_components;
                        let locality = "";
                        for (const component of addressComponents) {
                            if (component.types.includes("route")) locality += component.long_name + ", ";
                            if (component.types.includes("neighborhood")) locality += component.long_name + ", ";
                            if (component.types.includes("sublocality_level_3")) locality += component.long_name + ", ";
                            if (component.types.includes("sublocality_level_2")) locality += component.long_name + ", ";
                            if (component.types.includes("sublocality_level_1")) locality += component.long_name;
                        }
                        resolve(locality);
                    } else {
                        reject("Getting location failed");
                    }
                });
            });
        } catch (error: any) {
            return error.message;
        }
    };

    const geocodeLocation = async (locationName: string) => {
        try {
            const geocoder = new google.maps.Geocoder();
            return new Promise((resolve, reject) => {
                geocoder.geocode({ address: locationName }, (results, status) => {
                    if (status === "OK" && results?.[0]) {
                        const location = results[0].geometry.location;
                        resolve({ latitude: location.lat(), longitude: location.lng() });
                    } else {
                        reject("Geocoding failed");
                    }
                });
            });
        } catch (error: any) {
            return error.message;
        }
    };

    const fromLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationDetails = await reverseGeocode(latitude, longitude);
                    if (originRef.current) {
                        originRef.current.value = locationDetails;
                        setPickupLocation(locationDetails);
                    }
                    setcenter({ lat: latitude, lng: longitude });
                    map?.panTo(center);
                    setzoom(16);
                },
                (error) => toast.error(error.message)
            );
        }
    };

    const toLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationDetails = await reverseGeocode(latitude, longitude);
                    if (destinationRef.current) {
                        destinationRef.current.value = locationDetails;
                        setDropoffLocation(locationDetails);
                    }
                    setcenter({ lat: latitude, lng: longitude });
                    map?.panTo(center);
                    setzoom(16);
                },
                (error) => toast.error(error.message)
            );
        }
    };

    interface Charges { standard: number; sedan: number; suv: number; premium: number; }
    let charges: Charges = { standard: 0, sedan: 0, suv: 0, premium: 0 };
    if (distance && duration) {
        charges = {
            standard: Math.floor(parseFloat(distance) * 50),
            sedan: Math.floor(parseFloat(distance) * 70),
            suv: Math.floor(parseFloat(distance) * 90),
            premium: Math.floor(parseFloat(distance) * 150),
        };
    }

    const generateRandomString = () => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const digits = "0123456789";
        let randomString = "";
        for (let i = 0; i < 4; i++) randomString += characters[Math.floor(Math.random() * characters.length)];
        for (let i = 0; i < 4; i++) randomString += digits[Math.floor(Math.random() * digits.length)];
        return randomString;
    };

    const handleModelSelection = (e: ChangeEvent<HTMLInputElement>) => {
        switch (e.target.value) {
            case "Standard": formik.setFieldValue("model", "Standard"); formik.setFieldValue("price", charges.standard); break;
            case "SUV": formik.setFieldValue("model", "SUV"); formik.setFieldValue("price", charges.suv); break;
            case "Premium": formik.setFieldValue("model", "Premium"); formik.setFieldValue("price", charges.premium); break;
            case "Sedan": formik.setFieldValue("model", "Sedan"); formik.setFieldValue("price", charges.sedan); break;
        }
    };

    const noDrivers = () => {
        setTimeout(() => { dispatch(cancelSearching()); setnoDriversModal(true); }, 5000);
    };

    const formik = useFormik({
        initialValues: {
            ride_id: generateRandomString(), user_id, pickupLocation: "", dropoffLocation: "",
            pickupCoordinates: {}, dropoffCoordinates: {}, distance: "", duration: "", model: "", price: 0,
        },
        validationSchema: Yup.object({ model: Yup.string().min(3, "Please choose an option!").required("Please choose an option!") }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                if (!user_id) return toast.error("Please login to book the cab!");
                socket?.emit("getNearByDrivers", values);
                dispatch(startSearching());
                noDrivers();
            } catch (error: any) {
                console.log(error.message);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const showError = () => { if (formik.errors.model) toast.error(formik.errors.model); };

    useEffect(() => { formik.setFieldValue("pickupLocation", pickupLocation); formik.setFieldValue("dropoffLocation", dropoffLocation); }, [pickupLocation, dropoffLocation]);
    useEffect(() => { formik.setFieldValue("pickupCoordinates", pickupCoordinates); formik.setFieldValue("dropoffCoordinates", dropoffCoordinates); }, [pickupCoordinates, dropoffCoordinates]);
    useEffect(() => { formik.setFieldValue("distance", distance); }, [distance]);
    useEffect(() => { formik.setFieldValue("duration", duration); }, [duration]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-100">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#E91E8C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading map...</p>
                </div>
            </div>
        );
    }

    // ─── REDESIGNED JSX — matches Stitch booking page PNG ───────────────────

    const CAB_OPTIONS = [
        { value: "Sedan", label: "Sedan", price: charges.sedan, tag: "Recommended", img: "https://d2y3cuhvusjnoc.cloudfront.net/sedan.png" },
        { value: "Standard", label: "Standard", price: charges.standard, tag: "", img: "https://d2y3cuhvusjnoc.cloudfront.net/standard.png" },
        { value: "SUV", label: "SUV", price: charges.suv, tag: "", img: "https://d2y3cuhvusjnoc.cloudfront.net/suv.png" },
        { value: "Premium", label: "Premium", price: charges.premium, tag: "Luxury", img: "https://d2y3cuhvusjnoc.cloudfront.net/luxuary.png" },
    ];

    return (
        <>
            {/* No Drivers Modal — unchanged */}
            {noDriversModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
                        <h1 className="text-xl font-bold mb-2">Taking longer than usual!</h1>
                        <p className="text-sm text-gray-500 mb-2">Don't worry, we got you!<br />We're trying our best to get you a driver.</p>
                        <div className="flex h-20 w-full items-center justify-center my-4">
                            <div className="loader2 h-15 w-15">
                                <span className="hour"></span>
                                <span className="min"></span>
                                <span className="circel"></span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">All drivers seem busy. If you're ready to wait a little more, we'll find you the best available driver.</p>
                        <button onClick={() => setnoDriversModal(false)}
                            className="px-6 py-2 border-2 border-gray-800 text-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:text-white transition-colors">
                            CANCEL SEARCHING
                        </button>
                    </div>
                </div>
            )}

            {/* Main booking section — map full bg, card overlay */}
            <div className="relative w-full" style={{ minHeight: "80vh" }}>

                {/* Full-height Google Map as background */}
                <div className="absolute inset-0">
                    <GoogleMap
                        center={center}
                        zoom={zoom}
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        options={{ zoomControl: false, streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                        onLoad={(map) => setmap(map as google.maps.Map)}
                    >
                        <Marker position={center} />
                        {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
                    </GoogleMap>
                </div>

                {/* Floating booking card — top left */}
                <div className="relative z-10 p-6 lg:p-8">
                    <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-6">

                        <h2 className="text-xl font-bold mb-5" style={{ color: "#2D1470" }}>Book a Ride</h2>

                        {/* Pickup input */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Pickup Location</label>
                            <div className="flex gap-2 items-center border-2 border-[#E91E8C]/40 rounded-xl px-3 py-2 focus-within:border-[#E91E8C] transition-colors bg-white">
                                <Autocomplete className="flex-1">
                                    <input
                                        ref={originRef}
                                        placeholder="Pickup Location"
                                        className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                                    />
                                </Autocomplete>
                                <button onClick={fromLocation} className="text-[#E91E8C] hover:opacity-70 transition-opacity flex-shrink-0">
                                    <GpsFixedIcon fontSize="small" />
                                </button>
                            </div>
                        </div>

                        {/* Dropoff input */}
                        <div className="mb-5">
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Dropoff Location</label>
                            <div className="flex gap-2 items-center border-2 border-[#E91E8C]/40 rounded-xl px-3 py-2 focus-within:border-[#E91E8C] transition-colors bg-white">
                                <Autocomplete className="flex-1">
                                    <input
                                        ref={destinationRef}
                                        placeholder="Dropoff Location"
                                        className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                                    />
                                </Autocomplete>
                                <button onClick={toLocation} className="text-[#E91E8C] hover:opacity-70 transition-opacity flex-shrink-0">
                                    <GpsFixedIcon fontSize="small" />
                                </button>
                            </div>
                        </div>

                        {/* Distance + Duration pills */}
                        {distance && duration && (
                            <div className="flex gap-3 mb-5">
                                <div className="flex-1 bg-[#FFF0F5] rounded-xl py-2.5 text-center">
                                    <p className="text-xs text-gray-500 mb-0.5">Distance</p>
                                    <p className="font-bold text-[#E91E8C] text-sm">{distance}</p>
                                </div>
                                <div className="flex-1 bg-[#FFF0F5] rounded-xl py-2.5 text-center">
                                    <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                                    <p className="font-bold text-[#E91E8C] text-sm">{duration}</p>
                                </div>
                            </div>
                        )}

                        {/* Cab options — shown after route calculated */}
                        {distance && duration && (
                            <form onSubmit={formik.handleSubmit}>
                                <div className="flex flex-col gap-2 mb-4 max-h-44 overflow-y-auto pr-1">
                                    {CAB_OPTIONS.map((cab) => (
                                        <label key={cab.value}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                                                ${formik.values.model === cab.value
                                                    ? "border-[#E91E8C] bg-[#FFF0F5]"
                                                    : "border-gray-200 hover:border-[#E91E8C]/40"}`}>
                                            <input type="radio" value={cab.value} onChange={handleModelSelection}
                                                name="model" className="hidden" />
                                            <img src={cab.img} alt={cab.label} className="w-12 h-8 object-contain" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-semibold text-gray-800">{cab.label}</span>
                                                    {cab.tag && (
                                                        <span className="text-[10px] bg-[#E91E8C] text-white px-1.5 py-0.5 rounded-full font-medium">
                                                            {cab.tag}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-[#2D1470]">₹{cab.price}</span>
                                        </label>
                                    ))}
                                </div>

                                <button type="submit"
                                    onClick={formik.errors.model ? showError : undefined}
                                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide transition-all
                                        hover:opacity-90 active:scale-95"
                                    style={{ backgroundColor: "#E91E8C" }}>
                                    BOOK NOW
                                </button>
                            </form>
                        )}

                        {/* Search button — shown before route calculated */}
                        {!distance && (
                            <div className="flex gap-2">
                                <button onClick={calculateRoute}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm tracking-wide transition-all hover:opacity-90"
                                    style={{ backgroundColor: "#E91E8C" }}>
                                    BOOK NOW
                                </button>
                                <button onClick={clearRoutes}
                                    className="px-4 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Ride;
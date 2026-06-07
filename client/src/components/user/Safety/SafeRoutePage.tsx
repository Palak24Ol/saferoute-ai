import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    DirectionsRenderer,
    Autocomplete,
} from "@react-google-maps/api";
import createAxiosUser from "../../../services/axios/axiosUser";
import toast from "react-hot-toast";

// Must be outside component — stable reference prevents Maps script reload
const LIBRARIES: ("places")[] = ["places"];
const MAP_CONTAINER = { width: "100%", height: "380px" };
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

interface DangerResult {
    dangerScore: number;
    safetyLevel: string;
    color: string;
    message: string;
    incidentsNearby: number;
}

const SafeRoutePage = () => {
    const userToken = useSelector((store: any) => store.user.userToken);
    const axiosUser = createAxiosUser(userToken);
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { isLoaded } = useJsApiLoader({ googleMapsApiKey, libraries: LIBRARIES });

    const originRef = useRef<HTMLInputElement>(null);
    const destinationRef = useRef<HTMLInputElement>(null);

    const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [endCoords, setEndCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [dangerResult, setDangerResult] = useState<DangerResult | null>(null);
    const [loadingScore, setLoadingScore] = useState(false);
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

    const useMyLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setStartCoords(coords);
                setMapCenter(coords);
                if (originRef.current) {
                    originRef.current.value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
                }
            },
            () => toast.error("Location access denied. Please enable it.")
        );
    };

    const handleCheckRoute = async () => {
        const originValue = originRef.current?.value;
        const destValue = destinationRef.current?.value;

        if (!originValue || !destValue) {
            toast.error("Please enter both start and destination");
            return;
        }

        setLoadingScore(true);
        setDirections(null);
        setDangerResult(null);

        try {
            // Use Geocoder to get coordinates from whatever is typed
            const geocoder = new google.maps.Geocoder();

            const geocode = (address: string): Promise<{ lat: number; lng: number }> =>
                new Promise((resolve, reject) => {
                    geocoder.geocode({ address }, (results, status) => {
                        if (status === "OK" && results?.[0]) {
                            resolve({
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng(),
                            });
                        } else {
                            reject(new Error(`Could not find: ${address}`));
                        }
                    });
                });

            const [sCoords, eCoords] = await Promise.all([
                geocode(originValue),
                geocode(destValue),
            ]);

            setStartCoords(sCoords);
            setEndCoords(eCoords);
            setMapCenter(sCoords);

            // Draw route on map
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: sCoords,
                    destination: eCoords,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === "OK" && result) setDirections(result);
                }
            );

            // Get danger score from backend
            const res = await axiosUser.get("/safety/danger-score", {
                params: {
                    startLat: sCoords.lat,
                    startLng: sCoords.lng,
                    endLat: eCoords.lat,
                    endLng: eCoords.lng,
                },
            });
            setDangerResult(res.data);

        } catch (err: any) {
            toast.error(err.message || "Could not check route. Try again.");
        } finally {
            setLoadingScore(false);
        }
    };

    const clearRoute = () => {
        setDirections(null);
        setDangerResult(null);
        setStartCoords(null);
        setEndCoords(null);
        if (originRef.current) originRef.current.value = "";
        if (destinationRef.current) destinationRef.current.value = "";
        setMapCenter(DEFAULT_CENTER);
    };

    if (!isLoaded) return (
        <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Loading map...</div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Safe Route Planner</h2>
            <p className="text-sm text-gray-500 mb-6">
                Check the danger score of any route based on reported incidents
            </p>

            {/* Input card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
                <div className="flex flex-col gap-4">
                    {/* Origin */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">STARTING POINT</label>
                        <div className="flex gap-2">
                            <Autocomplete className="flex-1">
                                <input
                                    ref={originRef}
                                    placeholder="Where from? (type a place name)"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </Autocomplete>
                            <button
                                onClick={useMyLocation}
                                className="bg-blue-600 text-white px-4 py-3 rounded-xl text-xs font-semibold hover:bg-blue-700 whitespace-nowrap"
                                title="Use my current location"
                            >
                                📍 My Location
                            </button>
                        </div>
                    </div>

                    {/* Destination */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">DESTINATION</label>
                        <Autocomplete>
                            <input
                                ref={destinationRef}
                                placeholder="Where to? (type a place name)"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </Autocomplete>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleCheckRoute}
                            disabled={loadingScore}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {loadingScore ? "Checking safety..." : "Check Route Safety"}
                        </button>
                        <button
                            onClick={clearRoute}
                            className="bg-gray-100 text-gray-600 px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Score Result */}
            {dangerResult && (
                <div
                    className="rounded-2xl p-5 mb-6 text-white"
                    style={{ backgroundColor: dangerResult.color }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">
                            {dangerResult.safetyLevel === "safe" ? "✅" :
                             dangerResult.safetyLevel === "moderate" ? "⚠️" : "🚨"} Safety Score
                        </h3>
                        <span className="text-4xl font-black">{dangerResult.dangerScore}/100</span>
                    </div>
                    <p className="text-sm opacity-90 mb-3">{dangerResult.message}</p>
                    <div className="bg-white bg-opacity-20 rounded-xl p-3 flex justify-between text-sm">
                        <span>
                            Status: <strong className="capitalize">{dangerResult.safetyLevel}</strong>
                        </span>
                        <span>
                            Incidents nearby: <strong>{dangerResult.incidentsNearby}</strong>
                        </span>
                    </div>
                    <div className="mt-3 bg-white bg-opacity-30 rounded-full h-3">
                        <div
                            className="h-3 rounded-full bg-white transition-all duration-700"
                            style={{ width: `${dangerResult.dangerScore}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <div className="px-4 py-2 bg-gray-50 border-b">
                    <span className="text-sm font-semibold text-gray-600">Route Map</span>
                    {dangerResult && (
                        <span className="ml-2 text-xs text-gray-400">
                            Route drawn below — green = safe, red = danger
                        </span>
                    )}
                </div>
                <GoogleMap
                    mapContainerStyle={MAP_CONTAINER}
                    center={mapCenter}
                    zoom={startCoords ? 13 : 5}
                >
                    {directions && (
                        <DirectionsRenderer
                            directions={directions}
                            options={{
                                polylineOptions: {
                                    strokeColor: dangerResult?.color || "#1d4ed8",
                                    strokeWeight: 5,
                                },
                            }}
                        />
                    )}
                    {startCoords && !directions && <Marker position={startCoords} label="A" />}
                    {endCoords && !directions && <Marker position={endCoords} label="B" />}
                </GoogleMap>
            </div>

            {/* Tip */}
            <p className="text-xs text-gray-400 text-center mt-3">
                💡 Report incidents at the "Report Incident" tab to improve safety scores for everyone
            </p>
        </div>
    );
};

export default SafeRoutePage;
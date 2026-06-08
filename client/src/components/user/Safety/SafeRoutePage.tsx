import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Autocomplete } from "@react-google-maps/api";
import createAxiosUser from "../../../services/axios/axiosUser";
import toast from "react-hot-toast";

const LIBRARIES: ("places")[] = ["places"];
const MAP_CONTAINER = { width: "100%", height: "380px" };
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

interface DangerResult {
    dangerScore: number; safetyLevel: string; color: string; message: string; incidentsNearby: number;
}

const SafeRoutePage = () => {
    const userToken = useSelector((store: any) => store.user.userToken);
    const axiosUser = createAxiosUser(userToken);
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { isLoaded } = useJsApiLoader({ googleMapsApiKey, libraries: LIBRARIES });
    const originRef      = useRef<HTMLInputElement>(null);
    const destinationRef = useRef<HTMLInputElement>(null);

    const [startCoords, setStartCoords]   = useState<{ lat: number; lng: number } | null>(null);
    const [endCoords, setEndCoords]       = useState<{ lat: number; lng: number } | null>(null);
    const [directions, setDirections]     = useState<google.maps.DirectionsResult | null>(null);
    const [dangerResult, setDangerResult] = useState<DangerResult | null>(null);
    const [loadingScore, setLoadingScore] = useState(false);
    const [mapCenter, setMapCenter]       = useState(DEFAULT_CENTER);

    const useMyLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setStartCoords(coords); setMapCenter(coords);
                if (originRef.current) originRef.current.value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
            },
            () => toast.error("Location access denied.")
        );
    };

    const handleCheckRoute = async () => {
        const originValue = originRef.current?.value;
        const destValue   = destinationRef.current?.value;
        if (!originValue || !destValue) { toast.error("Please enter both start and destination"); return; }
        setLoadingScore(true); setDirections(null); setDangerResult(null);
        try {
            const geocoder = new google.maps.Geocoder();
            const geocode = (address: string): Promise<{ lat: number; lng: number }> =>
                new Promise((resolve, reject) => {
                    geocoder.geocode({ address }, (results, status) => {
                        if (status === "OK" && results?.[0]) {
                            resolve({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
                        } else { reject(new Error(`Could not find: ${address}`)); }
                    });
                });
            const [sCoords, eCoords] = await Promise.all([geocode(originValue), geocode(destValue)]);
            setStartCoords(sCoords); setEndCoords(eCoords); setMapCenter(sCoords);
            new google.maps.DirectionsService().route(
                { origin: sCoords, destination: eCoords, travelMode: google.maps.TravelMode.DRIVING },
                (result, status) => { if (status === "OK" && result) setDirections(result); }
            );
            const res = await axiosUser.get("/safety/danger-score", { params: { startLat: sCoords.lat, startLng: sCoords.lng, endLat: eCoords.lat, endLng: eCoords.lng } });
            setDangerResult(res.data);
        } catch (err: any) { toast.error(err.message || "Could not check route."); }
        finally { setLoadingScore(false); }
    };

    const clearRoute = () => {
        setDirections(null); setDangerResult(null); setStartCoords(null); setEndCoords(null);
        if (originRef.current) originRef.current.value = "";
        if (destinationRef.current) destinationRef.current.value = "";
        setMapCenter(DEFAULT_CENTER);
    };

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Loading map...</div>;

    return (
        <>
            <style>{`
                .sr-label { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
                .sr-input {
                    flex: 1; border: 1.5px solid #e5e7eb; border-radius: 12px;
                    padding: 12px 16px; font-size: 14px; font-family: 'DM Sans', sans-serif;
                    color: #1f2937; outline: none; transition: border-color 0.2s;
                }
                .sr-input:focus { border-color: #e91e8c; }
                .sr-loc-btn {
                    background: #6366f1; color: white; border: none; border-radius: 12px;
                    padding: 12px 18px; font-size: 13px; font-weight: 600;
                    font-family: 'DM Sans', sans-serif; cursor: pointer; white-space: nowrap;
                    transition: background 0.2s; display: flex; align-items: center; gap: 6px;
                }
                .sr-loc-btn:hover { background: #4f46e5; }
                .sr-check-btn {
                    flex: 1; padding: 13px; background: #6366f1; color: white;
                    border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif;
                    font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s;
                }
                .sr-check-btn:hover:not(:disabled) { background: #4f46e5; }
                .sr-check-btn:disabled { opacity: 0.55; cursor: not-allowed; }
                .sr-clear-btn {
                    padding: 13px 24px; background: #f3f4f6; color: #374151;
                    border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif;
                    font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                }
                .sr-clear-btn:hover { background: #e5e7eb; }
            `}</style>

            <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Check the danger score of any route based on reported incidents</p>

                {/* Input card */}
                <div style={{ background: 'white', border: '1px solid #ede9fe', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 2px 16px rgba(99,102,241,0.07)' }}>
                    <div style={{ marginBottom: 16 }}>
                        <div className="sr-label">Starting Point</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Autocomplete className="flex-1" style={{ flex: 1 }}>
                                <input ref={originRef} className="sr-input" placeholder="Where from? (type a place name)" style={{ width: '100%' }} />
                            </Autocomplete>
                            <button className="sr-loc-btn" onClick={useMyLocation}>
                                📍 My Location
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <div className="sr-label">Destination</div>
                        <Autocomplete style={{ width: '100%' }}>
                            <input ref={destinationRef} className="sr-input" placeholder="Where to? (type a place name)" style={{ width: '100%' }} />
                        </Autocomplete>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="sr-check-btn" onClick={handleCheckRoute} disabled={loadingScore}>
                            {loadingScore ? "Checking safety..." : "Check Route Safety"}
                        </button>
                        <button className="sr-clear-btn" onClick={clearRoute}>Clear</button>
                    </div>
                </div>

                {/* Danger result */}
                {dangerResult && (
                    <div style={{ background: dangerResult.color, borderRadius: 16, padding: '20px 24px', marginBottom: 20, color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 16 }}>
                                {dangerResult.safetyLevel === "safe" ? "✅" : dangerResult.safetyLevel === "moderate" ? "⚠️" : "🚨"} Safety Score
                            </span>
                            <span style={{ fontSize: 36, fontWeight: 800 }}>{dangerResult.dangerScore}/100</span>
                        </div>
                        <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>{dangerResult.message}</p>
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span>Status: <strong style={{ textTransform: 'capitalize' }}>{dangerResult.safetyLevel}</strong></span>
                            <span>Incidents nearby: <strong>{dangerResult.incidentsNearby}</strong></span>
                        </div>
                        <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.3)', borderRadius: 999, height: 10 }}>
                            <div style={{ height: 10, borderRadius: 999, background: 'white', width: `${dangerResult.dangerScore}%`, transition: 'width 0.7s ease' }} />
                        </div>
                    </div>
                )}

                {/* Map */}
                <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #ede9fe', boxShadow: '0 2px 16px rgba(99,102,241,0.07)' }}>
                    <div style={{ padding: '10px 18px', background: '#faf5ff', borderBottom: '1px solid #ede9fe' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Route Map</span>
                    </div>
                    <GoogleMap mapContainerStyle={MAP_CONTAINER} center={mapCenter} zoom={startCoords ? 13 : 5}>
                        {directions && (
                            <DirectionsRenderer directions={directions}
                                options={{ polylineOptions: { strokeColor: dangerResult?.color || '#6366f1', strokeWeight: 5 } }} />
                        )}
                        {startCoords && !directions && <Marker position={startCoords} label="A" />}
                        {endCoords   && !directions && <Marker position={endCoords}   label="B" />}
                    </GoogleMap>
                </div>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
                    💡 Report incidents at the "Report Incident" tab to improve safety scores for everyone
                </p>
            </div>
        </>
    );
};

export default SafeRoutePage;
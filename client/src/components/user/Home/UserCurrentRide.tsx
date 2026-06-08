import React, { useEffect, useState } from 'react'
import { useJsApiLoader, GoogleMap, DirectionsRenderer } from "@react-google-maps/api";
import axiosUser from '../../../services/axios/axiosUser'
import { toast } from 'react-hot-toast';
import socketIOClient, { Socket } from "socket.io-client";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Radio
} from "@material-tailwind/react";
import { useFormik } from 'formik';
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Dialog } from "@material-tailwind/react";
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from 'react-router-dom';
import { Spinner } from '@chakra-ui/react'
import ChatBoxSender from '../../ChatBoxSender';
import ChatInputField from '../../ChatInputField';
import ChatBoxReciever from '../../ChatBoxReciever';
import './Home.scss'

const ENDPOINT = import.meta.env.VITE_API_URL;

// ─── tiny SVG icon helpers ────────────────────────────────────────────────────
const PinIcon = ({ color = '#e91e8c' }: { color?: string }) => (
  <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
    <path d="M9 0C4.03 0 0 4.03 0 9c0 6.75 9 13 9 13s9-6.25 9-13c0-4.97-4.03-9-9-9z" fill={color} />
    <circle cx="9" cy="9" r="3.5" fill="white" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const RouteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" />
  </svg>
);

const CashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M6 12h.01M18 12h.01" />
  </svg>
);

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.58 6.58l.61-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const SosIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" opacity=".4" />
    <circle cx="12" cy="12" r="2" fill="white" stroke="none" />
  </svg>
);


const UserCurrentRide = () => {
  const { user, user_id, userToken } = useSelector((store: any) => store.user);

  const [userData, setuserData] = useState<any | null>(null);
  const getUserData = async () => {
    try {
      const { data } = await axiosUser(userToken).get(`userData?id=${user_id}`);
      setuserData(data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  useEffect(() => { getUserData(); }, []);

  interface RideDetails {
    _id: number; ride_id: string; driver_id: string; user_id: string;
    pickupCoordinates: { latitude: number; longitude: number };
    dropoffCoordinates: { latitude: number; longitude: number };
    pickupLocation: string; dropoffLocation: string;
    driverCoordinates: { latitude: number; longitude: number };
    distance: string; duration: string; model: string; price: number; date: number; status: string; pin: string;
  }

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rideId = queryParams.get('rideId');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setchats] = useState<any[]>([]);

  useEffect(() => {
    const socketInstance = socketIOClient(ENDPOINT);
    setSocket(socketInstance);
    socketInstance.on("rideConfirmed", () => setrideConfirmed(true));
    socketInstance.on("userPaymentPage", () => setpaymentModal(true));
    socketInstance.on("chat", (senderChats) => setchats(senderChats));
    if (rideId) {
      toast.success("Payment successful");
      localStorage.removeItem("currentRide-user");
      socketInstance.emit("paymentCompleted");
    }
    return () => { socketInstance.disconnect(); };
  }, []);

  const sendMessageToSocket = (chat: any[]) => socket?.emit("chat", chat);
  const addMessage = (message: string) => {
    const newChat = { message, sender: user, avatar: userData?.userImage };
    setchats((prev) => [...prev, newChat]);
    sendMessageToSocket([...chats, newChat]);
  };

  const ChatList = () => chats.map((chat, i) =>
    chat.sender === user
      ? <ChatBoxSender key={i} avatar={chat.avatar} message={chat.message} />
      : <ChatBoxReciever key={i} message={chat.message} avatar={chat.avatar} />
  );

  const navigate = useNavigate();
  const [open, setOpen] = React.useState(0);
  const handleOpen = (value: any) => setOpen(open === value ? 0 : value);
  const [paymentModal, setpaymentModal] = useState(false);
  const handlePaymentModal = () => setpaymentModal(!paymentModal);

  const [rideData, setrideData] = useState<RideDetails>();
  const [driverData, setdriverData] = useState<any | null>(null);
  const [feedbacks, setfeedbacks] = useState<null | any>([]);
  const [directionsResponse, setdirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [duration, setduration] = useState<string | undefined>(undefined);
  const [rideConfirmed, setrideConfirmed] = useState(false);
  const [driverLocation, setdriverLocation] = useState("");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [center] = useState({ lat: 12.9716, lng: 77.5946 });
  const [zoom] = useState(11);
  const [, setmap] = useState<google.maps.Map | undefined>(undefined);

  const getRideData = async () => {
    try {
      const ride_id = localStorage.getItem("currentRide-user");
      const response = await axiosUser(userToken).get(`getCurrentRide?rideId=${ride_id}`);
      setrideData(response.data.rideData);
      setdriverData(response.data.driverData);
      setfeedbacks(response.data.driverData?.formattedFeedbacks || null);
      formik.setFieldValue("amount", response.data.rideData?.price);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  useEffect(() => { getRideData(); }, []);

  useEffect(() => {
    if (rideData) {
      const getDirectionsData = async () => {
        if (rideData.status === "Confirmed") {
          setrideConfirmed(true);
          getDirections(rideData.pickupLocation, rideData.dropoffLocation);
        } else {
          const { latitude, longitude } = rideData.driverCoordinates;
          const origin = await reverseGeocode(latitude, longitude);
          setdriverLocation(origin as string);
          getDirections(origin, rideData.pickupLocation);
        }
      };
      getDirectionsData();
    }
  }, [rideData]);

  useEffect(() => {
    if (rideData) getDirections(rideData.pickupLocation, rideData.dropoffLocation);
  }, [rideConfirmed]);

  const getDirections = async (origin: any, destination: any) => {
    if (!rideData) return;
    const directionsService = new google.maps.DirectionsService();
    try {
      const result = await directionsService.route({ origin, destination, travelMode: google.maps.TravelMode.DRIVING });
      setdirectionsResponse(result);
      setduration(result.routes[0].legs[0].duration?.text);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

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
          } else { reject("Getting location failed"); }
        });
      });
    } catch (error: any) { return error.message; }
  };

  const formik = useFormik({
    initialValues: { paymentMode: "", amount: 0 },
    validationSchema: Yup.object({ paymentMode: Yup.string().required("Please choose a Payment method") }),
    onSubmit: async (values: any) => {
      if (values.paymentMode === "Wallet" && values.amount > userData?.wallet?.balance) return;
      const rideId = localStorage.getItem("currentRide-user");
      if (values.paymentMode === "Wallet" || values.paymentMode === "Cash in hand") {
        const { data } = await axiosUser(userToken).post('payment', values, { params: { rideId } });
        if (data.message === "Success") {
          toast.success("Payment successful");
          localStorage.removeItem("currentRide-user");
          setpaymentModal(false);
          socket?.emit("paymentCompleted", values.paymentMode, values.amount);
          navigate('/');
        } else { toast.error(data.message); }
      } else if (values.paymentMode === "Stripe") {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        try {
          const { data } = await axiosUser(userToken).post("payment-stripe", values, { params: { rideId } });
          const result = await stripe?.redirectToCheckout({ sessionId: data.id });
          if (result?.error) toast.error(result.error.message || "Payment error.");
        } catch (error) { toast.error("An error occurred. Please try again."); }
      }
    }
  });

  const errors = () => {
    if (formik.errors) Object.values(formik.errors).forEach((e: any) => toast.error(e));
  };

  const [cancelModal, setcancelModal] = useState(false);
  const cancelRide = () => {
    if (socket) {
      const ride_id = localStorage.getItem("currentRide-user");
      socket.emit("rideCancelled", ride_id);
      localStorage.removeItem("currentRide-user");
      navigate('/');
      toast.success("Ride cancelled successfully!");
    }
  };

  // ─── Tab state: 1=driver info, 2=chat, 3=feedbacks ────────────────────────
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" color="pink.500" />
      </div>
    );
  }

  // ─── avg rating ────────────────────────────────────────────────────────────
  const avgRating = feedbacks?.length
    ? (feedbacks.reduce((s: number, f: any) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Google Font ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .safely-tab-btn {
          position: relative;
          padding: 8px 6px;
          font-size: 13px;
          font-weight: 500;
          color: #9ca3af;
          background: none;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.2s;
        }
        .safely-tab-btn.active {
          color: #e91e8c;
          font-weight: 700;
        }
        .safely-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: #e91e8c;
          border-radius: 2px 2px 0 0;
        }

        .safely-btn-pink {
          background: #e91e8c;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 22px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .safely-btn-pink:hover { background: #c7176f; transform: translateY(-1px); }
        .safely-btn-pink:active { transform: translateY(0); }

        .safely-btn-outline {
          background: transparent;
          color: #374151;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          padding: 9px 20px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .safely-btn-outline:hover { border-color: #e91e8c; background: #fdf0f7; }

        .safely-btn-danger {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 10px;
          padding: 9px 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .safely-btn-danger:hover { background: #fecaca; }

        .sos-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #e91e8c;
          color: white;
          border: none;
          border-radius: 999px;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 4px 24px rgba(233,30,140,0.45);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .sos-btn:hover { transform: scale(1.06); box-shadow: 0 8px 32px rgba(233,30,140,0.5); }

        .route-line {
          width: 2px;
          min-height: 36px;
          background: linear-gradient(to bottom, #e91e8c, #be185d);
          margin: 2px auto;
          border-radius: 2px;
        }

        .info-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fdf2f8;
          border: 1px solid #fce7f3;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .feedback-card {
          background: white;
          border: 1px solid #fce7f3;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 10px;
        }

        .rating-stars { display: flex; gap: 2px; }

        .driver-photo {
          width: 72px; height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #fce7f3;
          flex-shrink: 0;
        }

        .driver-photo-placeholder {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fce7f3, #fbcfe8);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 700; color: #e91e8c;
          flex-shrink: 0;
          border: 3px solid #fce7f3;
        }

        .otp-box {
          display: flex; align-items: center; justify-content: center;
          height: 64px;
          background: linear-gradient(135deg, #fdf0f7, #fce7f3);
          border-radius: 14px;
          border: 1.5px dashed #f9a8d4;
          letter-spacing: 8px;
          font-size: 32px;
          font-weight: 800;
          color: #9d174d;
        }

        .contact-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #e91e8c;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
        }
        .contact-btn:hover { background: #c7176f; }

        .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 8px;
        }

        .cancel-warn {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 12px;
          color: #991b1b;
          margin-bottom: 12px;
        }
      `}</style>

      {/* ── CANCEL MODAL ─────────────────────────────────────────────────────── */}
      <Dialog className="bg-transparent" open={cancelModal} handler={() => setcancelModal(false)}>
        {cancelModal && (
          <div style={{ background: 'white', borderRadius: 18, padding: '32px 28px', maxWidth: 420, margin: 'auto' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
              Cancel this ride?
            </h2>
            <div className="cancel-warn">
              Canceling after the driver is en route may inconvenience them and affect your account standing.
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 24 }}>
              Please proceed with caution. Repeated cancellations may impact your StreePath account.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="safely-btn-outline" onClick={() => setcancelModal(false)}>Keep Ride</button>
              <button className="safely-btn-danger" onClick={cancelRide}>Yes, Cancel</button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── PAYMENT MODAL ────────────────────────────────────────────────────── */}
      <Dialog className="bg-transparent" open={paymentModal} handler={handlePaymentModal}>
        {paymentModal && (
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', maxWidth: 460, margin: 'auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, background: '#fdf0f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Destination Reached!</h2>
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>Thank you for choosing StreePath. Please complete payment.</p>
              <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: 15, color: '#374151' }}>Fare charge</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#e91e8c' }}>₹{rideData?.price}</span>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <p className="section-label">Select payment method</p>
              <Accordion open={open === 1}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }} onClick={() => handleOpen(1)}>
                  <Radio onChange={formik.handleChange} value="Wallet" name="paymentMode" color="pink" crossOrigin={undefined} />
                  <AccordionHeader style={{ fontSize: 14 }}>StreePath Wallet</AccordionHeader>
                </div>
                <AccordionBody>
                  <div style={{ paddingLeft: 40, fontSize: 13, color: '#374151' }}>
                    Balance: <strong>₹{userData?.wallet?.balance}</strong>
                    {rideData && userData?.wallet?.balance < rideData?.price && (
                      <span style={{ color: '#dc2626', marginLeft: 8 }}>Insufficient balance</span>
                    )}
                  </div>
                </AccordionBody>
              </Accordion>

              <Accordion open={open === 2}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }} onClick={() => handleOpen(2)}>
                  <Radio onChange={formik.handleChange} value="Stripe" name="paymentMode" color="pink" crossOrigin={undefined} />
                  <AccordionHeader style={{ fontSize: 14 }}>Stripe — Pay online</AccordionHeader>
                </div>
                <AccordionBody>
                  <p style={{ paddingLeft: 40, fontSize: 13, color: '#6b7280' }}>Secure online payment via Stripe</p>
                </AccordionBody>
              </Accordion>

              <Accordion open={open === 3}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px 0' }} onClick={() => handleOpen(3)}>
                  <Radio onChange={formik.handleChange} value="Cash in hand" name="paymentMode" color="pink" crossOrigin={undefined} />
                  <AccordionHeader style={{ fontSize: 14 }}>Pay in Cash</AccordionHeader>
                </div>
                <AccordionBody>
                  <p style={{ paddingLeft: 40, fontSize: 13, color: '#6b7280' }}>Pay the fare charge directly in cash</p>
                </AccordionBody>
              </Accordion>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="safely-btn-pink" onClick={errors} style={{ width: '100%', borderRadius: 12, padding: '13px' }}>
                  Complete Payment
                </button>
              </div>
            </form>
          </div>
        )}
      </Dialog>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      {rideData && driverData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

          {/* LEFT: Driver Info Card */}
          <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #fce7f3', boxShadow: '0 2px 16px rgba(233,30,140,0.07)' }}>

            {/* ── Inner Tabs ── */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #f3f4f6', marginBottom: 20 }}>
              {(['Driver Information', 'Contact', 'Driver Feedbacks'] as const).map((label, i) => (
                <button
                  key={label}
                  className={`safely-tab-btn${activeTab === (i + 1) as 1 | 2 | 3 ? ' active' : ''}`}
                  onClick={() => setActiveTab((i + 1) as 1 | 2 | 3)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Tab 1: Driver Information ── */}
            {activeTab === 1 && (
              <div>
                {/* Driver header row */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                  {driverData?.driverImage
                    ? <img src={driverData.driverImage} alt={driverData.name} className="driver-photo" />
                    : <div className="driver-photo-placeholder">{driverData?.name?.[0]?.toUpperCase() || 'D'}</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{driverData?.name}</span>
                      {avgRating && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 999, padding: '2px 10px', fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                          <StarIcon /> {avgRating}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
                      Cab: <strong style={{ color: '#374151' }}>{driverData?.vehicle_details?.model}</strong>
                      &nbsp;·&nbsp;
                      <span style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{driverData?.vehicle_details?.registerationID?.toUpperCase()}</span>
                    </p>
                    <p style={{ fontSize: 13, color: '#374151', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <PhoneIcon /> <strong>9567632318</strong>
                    </p>
                  </div>
                </div>

                <div style={{ height: 1, background: '#fce7f3', marginBottom: 20 }} />

                {/* Ride Details */}
                <p className="section-label">Ride Details</p>

                {!rideConfirmed ? (
                  /* ─ Before pickup ─ */
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ marginTop: 3 }}><PinIcon color="#8b5cf6" /></div>
                        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.4 }}>{driverLocation || 'Fetching driver location…'}</p>
                      </div>
                      <div style={{ marginLeft: 8 }}><div className="route-line" style={{ minHeight: 24 }} /></div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ marginTop: 3 }}><PinIcon /></div>
                        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.4 }}>{rideData?.pickupLocation}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
                      <span className="info-pill"><ClockIcon /> Driver arrives in {duration || '…'}</span>
                    </div>

                    <p className="section-label" style={{ marginTop: 16 }}>OTP for driver confirmation</p>
                    <div className="otp-box">{rideData?.pin}</div>

                    <div style={{ marginTop: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <span>Canceling may affect your Safely account.</span>
                      <button className="safely-btn-danger" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, whiteSpace: 'nowrap' }} onClick={() => setcancelModal(true)}>Cancel ride</button>
                    </div>
                  </div>
                ) : (
                  /* ─ Ride in progress ─ */
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ marginTop: 3 }}><PinIcon color="#8b5cf6" /></div>
                        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.4 }}>{rideData?.pickupLocation}</p>
                      </div>
                      <div style={{ marginLeft: 8 }}><div className="route-line" /></div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ marginTop: 3 }}><PinIcon /></div>
                        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.4 }}>{rideData?.dropoffLocation}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                      <span className="info-pill"><ClockIcon /> {rideData?.duration}</span>
                      <span className="info-pill"><RouteIcon /> {rideData?.distance}</span>
                      <span className="info-pill"><CashIcon /> ₹{rideData?.price}</span>
                    </div>

                    <div style={{ marginTop: 20, background: 'linear-gradient(135deg, #fdf0f7, #fce7f3)', borderRadius: 14, padding: '14px 18px', textAlign: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#9d174d', lineHeight: 1.5 }}>
                        Your safety is our top priority. Have a smooth journey!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 2: Chat ── */}
            {activeTab === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', height: 380 }}>
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }} className="chat-container">
                  <ChatList />
                </div>
                <div style={{ marginTop: 8 }}>
                  <ChatInputField addMessage={addMessage} />
                </div>
              </div>
            )}

            {/* ── Tab 3: Driver Feedbacks ── */}
            {activeTab === 3 && (
              <div style={{ maxHeight: 380, overflowY: 'auto' }} className="chat-container">
                {feedbacks && feedbacks.length > 0 ? feedbacks.map((fb: any, i: number) => (
                  <div key={i} className="feedback-card">
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map(n => <StarIcon key={n} filled={n <= fb.rating} />)}
                    </div>
                    <p style={{ fontSize: 14, color: '#374151', marginTop: 8, marginBottom: 8, fontStyle: 'italic' }}>
                      "{fb.feedback}"
                    </p>
                    <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>{fb.formattedDate}</p>
                  </div>
                )) : (
                  <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, padding: '32px 0' }}>No feedbacks yet</p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Map */}
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 460, boxShadow: '0 2px 24px rgba(0,0,0,0.10)' }}>
            <GoogleMap
              center={center}
              zoom={zoom}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              options={{
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
              onLoad={(map) => setmap(map as google.maps.Map)}
            >
              {directionsResponse && (
                <DirectionsRenderer
                  directions={directionsResponse}
                  options={{
                    polylineOptions: { strokeColor: '#e91e8c', strokeWeight: 4 },
                    suppressMarkers: false,
                  }}
                />
              )}
            </GoogleMap>

            {/* SOS button overlay */}
            <div style={{ position: 'absolute', bottom: 20, right: 20 }}>
              <button className="sos-btn">
                <SosIcon /> SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {!rideData && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fce7f3" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
          <p style={{ fontSize: 16, fontWeight: 500 }}>No active rides</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Your current ride will appear here once confirmed.</p>
        </div>
      )}
    </div>
  );
};

export default UserCurrentRide;
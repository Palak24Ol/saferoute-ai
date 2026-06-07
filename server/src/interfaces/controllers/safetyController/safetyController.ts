import { Request, Response } from "express";
import SOSAlert from "../../../entities/sosAlert";
import EmergencyContact from "../../../entities/emergencyContact";
import IncidentReport from "../../../entities/incidentReport";
import user from "../../../entities/user";
import { sendMail } from "../../../services/nodemailer";
import { ObjectId } from "mongodb";

// ─────────────────────────────────────────────
//  SOS ALERTS
// ─────────────────────────────────────────────

export const triggerSOS = async (req: Request, res: Response) => {
    try {
        const userId = req.clientId;
        const { latitude, longitude, address } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Location is required for SOS" });
        }

        const userData = await user.findById(new ObjectId(userId as string));
        if (!userData) return res.status(404).json({ message: "User not found" });

        // Get emergency contacts for this user
        const contacts = await EmergencyContact.find({ user_id: userId });

        // Send email to each contact
        const notifiedContacts: { name: string; phone: string; email: string }[] = [];
        for (const contact of contacts) {
            try {
                const emailSubject = `🚨 SOS ALERT - ${userData.name} needs help!`;
                const emailText = `
EMERGENCY ALERT from SafeRoute AI

${userData.name} has triggered an SOS alert and may need immediate help.

📍 Location: ${address || "Unknown location"}
🗺  Maps Link: https://maps.google.com/?q=${latitude},${longitude}
📞 Their mobile: ${userData.mobile}
🕐 Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}

Please try to contact them immediately or call emergency services (112).

This message was sent automatically by SafeRoute AI.
                `.trim();

                await sendMail(contact.email, emailSubject, emailText);
                notifiedContacts.push({
                    name: contact.name,
                    phone: contact.phone,
                    email: contact.email,
                });
            } catch (mailErr) {
                console.error("Email failed for:", contact.email, mailErr);
            }
        }

        // Save the SOS alert
        const sosAlert = new SOSAlert({
            user_id: userId,
            userName: userData.name,
            userPhone: userData.mobile,
            latitude,
            longitude,
            address: address || "Location captured",
            contactsNotified: notifiedContacts,
            status: "active",
        });
        await sosAlert.save();

        res.status(200).json({
            message: "SOS alert triggered successfully",
            contactsNotified: notifiedContacts.length,
            alertId: sosAlert._id,
        });
    } catch (error) {
        console.error("SOS error:", error);
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getSOSHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.clientId;
        const alerts = await SOSAlert.find({ user_id: userId }).sort({ createdAt: -1 }).limit(10);
        res.json({ alerts });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getAllSOS = async (req: Request, res: Response) => {
    try {
        const alerts = await SOSAlert.find().sort({ createdAt: -1 });
        res.json({ alerts });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const resolveSOS = async (req: Request, res: Response) => {
    try {
        const { alertId } = req.body;
        await SOSAlert.findByIdAndUpdate(alertId, {
            status: "resolved",
            resolvedAt: new Date(),
        });
        res.json({ message: "SOS alert resolved" });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// ─────────────────────────────────────────────
//  EMERGENCY CONTACTS
// ─────────────────────────────────────────────

export const getEmergencyContacts = async (req: Request, res: Response) => {
    try {
        const userId = req.clientId;
        const contacts = await EmergencyContact.find({ user_id: userId });
        res.json({ contacts });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const addEmergencyContact = async (req: Request, res: Response) => {
    try {
        const userId = req.clientId;
        const { name, phone, email, relationship } = req.body;

        if (!name || !phone || !email) {
            return res.status(400).json({ message: "Name, phone and email are required" });
        }

        const existing = await EmergencyContact.countDocuments({ user_id: userId });
        if (existing >= 5) {
            return res.status(400).json({ message: "Maximum 5 emergency contacts allowed" });
        }

        const contact = new EmergencyContact({
            user_id: userId,
            name,
            phone,
            email,
            relationship: relationship || "Friend",
        });
        await contact.save();
        res.status(201).json({ message: "Contact added successfully", contact });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteEmergencyContact = async (req: Request, res: Response) => {
    try {
        const { contactId } = req.params;
        await EmergencyContact.findByIdAndDelete(contactId);
        res.json({ message: "Contact deleted" });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// ─────────────────────────────────────────────
//  INCIDENT REPORTS
// ─────────────────────────────────────────────

export const reportIncident = async (req: Request, res: Response) => {
    try {
        const userId = req.clientId;
        const { type, description, latitude, longitude, address, severity } = req.body;

        if (!type || !description || !latitude || !longitude) {
            return res.status(400).json({ message: "Type, description and location are required" });
        }

        const userData = await user.findById(new ObjectId(userId as string));

        const incident = new IncidentReport({
            user_id: userId,
            userName: userData?.name || "Anonymous",
            type,
            description,
            latitude,
            longitude,
            address: address || "",
            severity: severity || "medium",
        });
        await incident.save();
        res.status(201).json({ message: "Incident reported successfully", incident });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getAllIncidents = async (req: Request, res: Response) => {
    try {
        const incidents = await IncidentReport.find().sort({ createdAt: -1 });
        res.json({ incidents });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateIncidentStatus = async (req: Request, res: Response) => {
    try {
        const { incidentId, status, adminNotes } = req.body;
        await IncidentReport.findByIdAndUpdate(incidentId, { status, adminNotes });
        res.json({ message: "Incident updated" });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// ─────────────────────────────────────────────
//  SAFETY HEATMAP
// ─────────────────────────────────────────────

export const getHeatmapData = async (req: Request, res: Response) => {
    try {
        // Return all incident locations with weights
        const incidents = await IncidentReport.find({ status: { $ne: "resolved" } })
            .select("latitude longitude severity type createdAt")
            .lean();

        const heatmapPoints = incidents.map((inc) => {
            const weight = inc.severity === "high" ? 1.0 : inc.severity === "medium" ? 0.6 : 0.3;
            return {
                lat: inc.latitude,
                lng: inc.longitude,
                weight,
            };
        });

        res.json({ heatmapPoints });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// ─────────────────────────────────────────────
//  ROUTE DANGER SCORE
// ─────────────────────────────────────────────

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getRouteDangerScore = async (req: Request, res: Response) => {
    try {
        const { startLat, startLng, endLat, endLng } = req.query;

        if (!startLat || !startLng || !endLat || !endLng) {
            return res.status(400).json({ message: "Start and end coordinates required" });
        }

        const sLat = parseFloat(startLat as string);
        const sLng = parseFloat(startLng as string);
        const eLat = parseFloat(endLat as string);
        const eLng = parseFloat(endLng as string);

        // Build bounding box around the route (with ~2km buffer)
        const minLat = Math.min(sLat, eLat) - 0.02;
        const maxLat = Math.max(sLat, eLat) + 0.02;
        const minLng = Math.min(sLng, eLng) - 0.02;
        const maxLng = Math.max(sLng, eLng) + 0.02;

        const incidents = await IncidentReport.find({
            latitude: { $gte: minLat, $lte: maxLat },
            longitude: { $gte: minLng, $lte: maxLng },
            status: { $ne: "resolved" },
        }).lean();

        // Calculate weighted score
        let totalScore = 0;
        const now = Date.now();

        for (const inc of incidents) {
            // Distance from route (simplified: distance from midpoint)
            const midLat = (sLat + eLat) / 2;
            const midLng = (sLng + eLng) / 2;
            const dist = haversineDistance(inc.latitude, inc.longitude, midLat, midLng);
            if (dist > 3) continue; // Only consider incidents within 3km of route

            // Severity weight
            const severityWeight = inc.severity === "high" ? 15 : inc.severity === "medium" ? 8 : 3;

            // Recency decay: last 7 days = 100%, last 30 days = 60%, older = 30%
            const ageMs = now - new Date(inc.createdAt).getTime();
            const ageDays = ageMs / (1000 * 60 * 60 * 24);
            const recency = ageDays <= 7 ? 1.0 : ageDays <= 30 ? 0.6 : 0.3;

            // Distance decay: closer incidents weigh more
            const distDecay = Math.max(0, 1 - dist / 3);

            totalScore += severityWeight * recency * distDecay;
        }

        // Normalize to 0-100
        const dangerScore = Math.min(100, Math.round(totalScore));

        // Determine safety level
        const safetyLevel =
            dangerScore <= 20 ? "safe" :
            dangerScore <= 50 ? "moderate" :
            "danger";

        const color = safetyLevel === "safe" ? "#16a34a" : safetyLevel === "moderate" ? "#d97706" : "#dc2626";

        res.json({
            dangerScore,
            safetyLevel,
            color,
            incidentsNearby: incidents.length,
            message:
                safetyLevel === "safe"
                    ? "This route looks safe. No major incidents reported nearby."
                    : safetyLevel === "moderate"
                    ? "Some incidents reported near this route. Stay alert."
                    : "High risk area! Multiple incidents reported. Consider an alternate route.",
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

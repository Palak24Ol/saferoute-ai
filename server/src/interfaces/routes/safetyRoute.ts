import { Router } from "express";
import auth from "../../middlewares/auth";
import {
    triggerSOS,
    getSOSHistory,
    getAllSOS,
    resolveSOS,
    getEmergencyContacts,
    addEmergencyContact,
    deleteEmergencyContact,
    reportIncident,
    getAllIncidents,
    updateIncidentStatus,
    getHeatmapData,
    getRouteDangerScore,
} from "../controllers/safetyController/safetyController";

const safetyRoute = Router();

// SOS routes (user)
safetyRoute.post("/sos/trigger", auth.verifyToken, triggerSOS);
safetyRoute.get("/sos/history", auth.verifyToken, getSOSHistory);

// Emergency contacts (user)
safetyRoute.get("/contacts", auth.verifyToken, getEmergencyContacts);
safetyRoute.post("/contacts", auth.verifyToken, addEmergencyContact);
safetyRoute.delete("/contacts/:contactId", auth.verifyToken, deleteEmergencyContact);

// Incident reporting (user)
safetyRoute.post("/incidents", auth.verifyToken, reportIncident);

// Heatmap and danger score (user - public-ish)
safetyRoute.get("/heatmap", auth.verifyToken, getHeatmapData);
safetyRoute.get("/danger-score", auth.verifyToken, getRouteDangerScore);

export default safetyRoute;

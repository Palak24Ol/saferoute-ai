import { Router } from "express";
import auth from "../../middlewares/auth";
import {
    getAllSOS,
    resolveSOS,
    getAllIncidents,
    updateIncidentStatus,
} from "../controllers/safetyController/safetyController";

const adminSafetyRoute = Router();

// Admin SOS management
adminSafetyRoute.get("/sos", auth.verifyToken, getAllSOS);
adminSafetyRoute.post("/sos/resolve", auth.verifyToken, resolveSOS);

// Admin incident management
adminSafetyRoute.get("/incidents", auth.verifyToken, getAllIncidents);
adminSafetyRoute.post("/incidents/update", auth.verifyToken, updateIncidentStatus);

export default adminSafetyRoute;

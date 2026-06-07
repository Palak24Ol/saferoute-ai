import mongoose, { Document, Schema } from "mongoose";

export interface IncidentReportInterface extends Document {
    user_id: string;
    userName: string;
    type: string; // "harassment" | "unsafe_area" | "accident" | "theft" | "other"
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    severity: string; // "low" | "medium" | "high"
    status: string;   // "pending" | "reviewed" | "resolved"
    adminNotes: string;
    createdAt: Date;
}

const IncidentReportSchema: Schema = new Schema({
    user_id: { type: String, required: true },
    userName: { type: String },
    type: { type: String, required: true },
    description: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, default: "" },
    severity: { type: String, default: "medium" },
    status: { type: String, default: "pending" },
    adminNotes: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IncidentReportInterface>("IncidentReport", IncidentReportSchema);

import mongoose, { Document, Schema } from "mongoose";

export interface SOSAlertInterface extends Document {
    user_id: string;
    userName: string;
    userPhone: string;
    latitude: number;
    longitude: number;
    address: string;
    contactsNotified: {
        name: string;
        phone: string;
        email: string;
    }[];
    status: string; // "active" | "resolved"
    resolvedAt?: Date;
    createdAt: Date;
}

const SOSAlertSchema: Schema = new Schema({
    user_id: { type: String, required: true },
    userName: { type: String, required: true },
    userPhone: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, default: "Location captured" },
    contactsNotified: [
        {
            name: { type: String },
            phone: { type: String },
            email: { type: String },
        },
    ],
    status: { type: String, default: "active" },
    resolvedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<SOSAlertInterface>("SOSAlert", SOSAlertSchema);

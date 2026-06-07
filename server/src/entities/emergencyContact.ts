import mongoose, { Document, Schema } from "mongoose";

export interface EmergencyContactInterface extends Document {
    user_id: string;
    name: string;
    phone: string;
    email: string;
    relationship: string;
}

const EmergencyContactSchema: Schema = new Schema({
    user_id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    relationship: { type: String, default: "Friend" },
});

export default mongoose.model<EmergencyContactInterface>("EmergencyContact", EmergencyContactSchema);

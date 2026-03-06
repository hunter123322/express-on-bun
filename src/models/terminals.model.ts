import mongoose, { Document, Schema, Model } from "mongoose";
import type { TerminalType } from "../types/types";

type TerminalDocument = TerminalType & Document

const TerminalsSchema = new Schema<TerminalDocument>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        municipality: { type: String, required: true },
        description: { type: String, required: true },
        cover_image: { type: String, required: true },
        terminal_type: { type: String, required: true },
        is_24_hours: { type: Boolean, default: false },
        operating_hours: { type: String, required: true },
        rating: { type: Number, default: 0 },
        routes_count: { type: Number, default: 1 },
        routes: { type: [String], required: true },
        facilities: { type: [String], required: true },
        transport_types: { type: [String], required: true },
        geo_lat: { type: Number, required: true },
        geo_lng: { type: Number, required: true },
        contact_info: {
            phone: { type: String },
            email: { type: String }
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

export const Terminals: Model<TerminalType> =
  mongoose.models.Terminals ||
  mongoose.model<TerminalType>("Terminals", TerminalsSchema);
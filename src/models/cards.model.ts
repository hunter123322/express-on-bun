import mongoose, { Document, Schema, Model } from "mongoose";
import type { CardsType } from "../types/types";

type CardDocument = CardsType & Document

const CardsSchema = new Schema<CardDocument>(
    {
        slug: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        cover_image: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: [String], required: true },
        municipality: { type: String, required: true },
        pricing_lowest: { type: Number, default: 0 },
        is_premium: { type: Boolean, default: false },
        fileSizeMB: { type: Number, default: 0 },
    },
    {
        timestamps: true, versionKey: false,
    }
)

export const CardsModel: Model<CardsType> =
    mongoose.models.CardsModel ||
    mongoose.model<CardsType>("CardsModel", CardsSchema)
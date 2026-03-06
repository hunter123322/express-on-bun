import mongoose, { Schema, Model, Document } from "mongoose"
import type { HotelType } from "../types/types"

type TouristSpotDocument = HotelType & Document

const CategoriesSchema = new Schema<TouristSpotDocument>(
    {
        slug: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        cover_image: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: [String], required: true },
        municipality: { type: String, required: true },
        geo_lat: { type: Number, default: 13.243772 },
        geo_lng: { type: Number, default: 123.672333 },
        activity_tags: { type: [String], required: true },
        contact_info: {
            phone: { type: String, default: "N/A" },
            email: { type: String, default: "N/A" },
            website: { type: String, default: "N/A" },
        },
        social_links: {
            facebook: { type: String, default: "N/A" },
            instagram: { type: String, default: "N/A" },
        },
        pricing_lowest: { type: Number, default: null },
        operating_hours: { type: String, default: null },
        rating: { type: Number, default: null },
        is_premium: { type: Boolean, default: false },
        view_count: { type: Number, default: 0 },
        fullURLMap: { type: String },
        fileSizeMB: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

export const Hotels: Model<HotelType> =
    mongoose.models.Hotels ||
    mongoose.model<HotelType>("Hotels", CategoriesSchema)
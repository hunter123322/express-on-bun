import mongoose, { Schema, Model, Document } from "mongoose"
import type { RecentActivitiesType } from "../types/types"


type RecentActivitiesSpotDocument = RecentActivitiesType & Document

const RecentActivitiesSchema = new Schema<RecentActivitiesSpotDocument>(
    {
        text: { type: String, required: true },
        slug: { type: String, required: true },

    },
    {
        timestamps: true,
        versionKey: false
    }
)


export const RecentActivities: Model<RecentActivitiesType> =
    mongoose.models.RecentActivities ||
    mongoose.model<RecentActivitiesType>("RecentActivities", RecentActivitiesSchema)
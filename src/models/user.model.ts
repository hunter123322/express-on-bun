import mongoose, { Schema, Model, Document } from "mongoose"
import type { UserType } from "../types/types";


type UserTypeDocument = UserType & Document

const UserSchema = new Schema<UserType>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "DEVELOPER"], required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const User: Model<UserType> =
    mongoose.models.User ||
    mongoose.model<UserType>("User", UserSchema)
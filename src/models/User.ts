import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  activeWorkspaceId?: Types.ObjectId;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String },
    activeWorkspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true, collection: "user" }
);

const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

export default User;

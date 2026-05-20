import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import type { LeadSource, LeadStatus, PaymentStatus } from "@/types";

export interface LeadDocument extends Document {
  workspaceId: Types.ObjectId;
  clientName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    other?: string;
  };
  source: LeadSource;
  country: string;
  city: string;
  status: LeadStatus;
  totalValue: number;
  paymentReceived: number;
  paymentStatus: PaymentStatus;
  assignedTo?: Types.ObjectId;
  lastContactedBy?: Types.ObjectId;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<LeadDocument>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    clientName: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    socialLinks: {
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
      other: { type: String, trim: true },
    },
    source: {
      type: String,
      enum: [
        "instagram",
        "facebook",
        "google_maps",
        "cold_calling",
        "whatsapp",
        "local",
        "referral",
        "other",
      ],
      required: true,
      index: true,
    },
    country: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [
        "new",
        "in_conversation",
        "follow_up_scheduled",
        "deal_closed",
        "lost",
      ],
      default: "new",
      index: true,
    },
    totalValue: { type: Number, default: 0, min: 0 },
    paymentReceived: { type: Number, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending",
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    lastContactedBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastContactedAt: { type: Date },
    nextFollowUpAt: { type: Date, index: true },
    notes: { type: String, maxlength: 5000 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "leads" }
);

LeadSchema.index({ workspaceId: 1, clientName: "text", city: "text", country: "text" });
LeadSchema.index({ workspaceId: 1, status: 1 });
LeadSchema.index({ workspaceId: 1, paymentStatus: 1 });
LeadSchema.index({ workspaceId: 1, source: 1 });

const Lead: Model<LeadDocument> =
  mongoose.models.Lead || mongoose.model<LeadDocument>("Lead", LeadSchema);

export default Lead;

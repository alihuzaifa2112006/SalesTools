import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import type { ActivityType } from "@/types";

export interface ActivityLogDocument extends Document {
  workspaceId: Types.ObjectId;
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  type: ActivityType;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<ActivityLogDocument>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "call",
        "message",
        "email",
        "meeting",
        "note",
        "status_change",
        "payment",
      ],
      required: true,
    },
    content: { type: String, required: true, maxlength: 5000 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "activity_logs" }
);

ActivityLogSchema.index({ leadId: 1, createdAt: -1 });
ActivityLogSchema.index({ workspaceId: 1, createdAt: -1 });

const ActivityLog: Model<ActivityLogDocument> =
  mongoose.models.ActivityLog ||
  mongoose.model<ActivityLogDocument>("ActivityLog", ActivityLogSchema);

export default ActivityLog;

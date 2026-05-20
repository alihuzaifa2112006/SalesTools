import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import type { IWorkspace, WorkspaceRole } from "@/types";

export interface IWorkspaceMemberDoc {
  userId: Types.ObjectId;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface WorkspaceDocument
  extends Omit<IWorkspace, "_id" | "members" | "ownerId">,
    Document {
  ownerId: Types.ObjectId;
  members: IWorkspaceMemberDoc[];
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMemberDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WorkspaceSchema = new Schema<WorkspaceDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, maxlength: 500 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [WorkspaceMemberSchema],
    inviteToken: { type: String, select: false },
    inviteExpiresAt: { type: Date, select: false },
  },
  { timestamps: true, collection: "workspaces" }
);

WorkspaceSchema.index({ "members.userId": 1 });

const Workspace: Model<WorkspaceDocument> =
  mongoose.models.Workspace ||
  mongoose.model<WorkspaceDocument>("Workspace", WorkspaceSchema);

export default Workspace;

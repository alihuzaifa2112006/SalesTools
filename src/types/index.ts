export type LeadSource =
  | "instagram"
  | "facebook"
  | "google_maps"
  | "cold_calling"
  | "whatsapp"
  | "local"
  | "referral"
  | "other";

export type LeadStatus =
  | "new"
  | "in_conversation"
  | "follow_up_scheduled"
  | "deal_closed"
  | "lost";

export type PaymentStatus = "pending" | "partial" | "paid" | "overdue";

export type WorkspaceRole = "owner" | "admin" | "member";

export type ActivityType =
  | "call"
  | "message"
  | "email"
  | "meeting"
  | "note"
  | "status_change"
  | "payment";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  activeWorkspaceId?: string;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface IWorkspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  members: IWorkspaceMember[];
  inviteToken?: string;
  inviteExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id: string;
  workspaceId: string;
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
  assignedTo?: string;
  lastContactedBy?: string;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLog {
  _id: string;
  workspaceId: string;
  leadId: string;
  userId: string;
  type: ActivityType;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  workspaceId?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  activeWorkspaceId?: string;
}

export interface DashboardStats {
  totalLeads: number;
  conversionRate: number;
  pendingPayments: number;
  totalRevenue: number;
  leadsBySource: { source: string; count: number }[];
  monthlySales: { month: string; revenue: number; leads: number }[];
}

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "google_maps", label: "Google Maps" },
  { value: "cold_calling", label: "Cold Calling" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "local", label: "Local" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-slate-100 text-slate-700" },
  { value: "in_conversation", label: "In Conversation", color: "bg-blue-100 text-blue-700" },
  { value: "follow_up_scheduled", label: "Follow-Up Scheduled", color: "bg-amber-100 text-amber-700" },
  { value: "deal_closed", label: "Deal Closed", color: "bg-emerald-100 text-emerald-700" },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-700" },
];

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-orange-100 text-orange-700" },
  { value: "partial", label: "Partial", color: "bg-yellow-100 text-yellow-700" },
  { value: "paid", label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-700" },
];

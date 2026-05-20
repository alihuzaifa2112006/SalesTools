import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  workspaceName: z.string().min(2).max(100).trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export const workspaceSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(500).trim().optional(),
});

export const leadSchema = z.object({
  clientName: z.string().min(1).max(200).trim(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  socialLinks: z
    .object({
      instagram: z.string().url().optional().or(z.literal("")),
      facebook: z.string().url().optional().or(z.literal("")),
      other: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  source: z.enum([
    "instagram",
    "facebook",
    "google_maps",
    "cold_calling",
    "whatsapp",
    "local",
    "referral",
    "other",
  ]),
  country: z.string().min(1).max(100).trim(),
  city: z.string().min(1).max(100).trim(),
  status: z
    .enum([
      "new",
      "in_conversation",
      "follow_up_scheduled",
      "deal_closed",
      "lost",
    ])
    .optional(),
  totalValue: z.number().min(0).optional(),
  paymentReceived: z.number().min(0).optional(),
  assignedTo: z.string().optional(),
  nextFollowUpAt: z.string().datetime().optional().or(z.literal("")),
  notes: z.string().max(5000).optional(),
});

export const activityLogSchema = z.object({
  leadId: z.string().min(1),
  type: z.enum([
    "call",
    "message",
    "email",
    "meeting",
    "note",
    "status_change",
    "payment",
  ]),
  content: z.string().min(1).max(5000).trim(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export function zodFirstError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message || "Validation failed";
}

export const joinWorkspaceSchema = z.object({
  inviteToken: z.string().min(1),
});

import z from "zod";

// User Role Schema
export const UserRoleSchema = z.enum(['korisnik', 'tehnicar', 'administracija']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Ticket Status Schema
export const TicketStatusSchema = z.enum(['nova', 'u_tijeku', 'ceka_se_dio', 'cekanje_porezne', 'zatvoreno']);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

// Ticket Urgency Schema
export const TicketUrgencySchema = z.enum(['niska', 'srednja', 'visoka', 'kriticna']);
export type TicketUrgency = z.infer<typeof TicketUrgencySchema>;

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  role: UserRoleSchema,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// Location Schema
export const LocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Location = z.infer<typeof LocationSchema>;

// Machine Schema
export const MachineSchema = z.object({
  id: z.number(),
  machine_id: z.string(),
  location_id: z.number(),
  model: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Machine = z.infer<typeof MachineSchema>;

// Ticket Schema
export const TicketSchema = z.object({
  id: z.number(),
  ticket_number: z.string(),
  user_id: z.string(),
  technician_id: z.string().nullable(),
  location_id: z.number(),
  machine_id: z.string(),
  title: z.string(),
  description: z.string(),
  status: TicketStatusSchema,
  urgency: TicketUrgencySchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type Ticket = z.infer<typeof TicketSchema>;

// Create Ticket Schema
export const CreateTicketSchema = z.object({
  location_id: z.number(),
  machine_id: z.string(),
  title: z.string().min(5, 'Naslov mora imati najmanje 5 znakova'),
  description: z.string().min(10, 'Opis mora imati najmanje 10 znakova'),
  urgency: TicketUrgencySchema,
});
export type CreateTicket = z.infer<typeof CreateTicketSchema>;

// Ticket Comment Schema
export const TicketCommentSchema = z.object({
  id: z.number(),
  ticket_id: z.number(),
  user_id: z.string(),
  comment: z.string(),
  is_internal: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TicketComment = z.infer<typeof TicketCommentSchema>;

// Ticket Attachment Schema
export const TicketAttachmentSchema = z.object({
  id: z.number(),
  ticket_id: z.number(),
  filename: z.string(),
  file_url: z.string(),
  file_type: z.string().nullable(),
  file_size: z.number().nullable(),
  uploaded_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TicketAttachment = z.infer<typeof TicketAttachmentSchema>;

// Croatian translations for status and urgency
export const StatusLabels: Record<TicketStatus, string> = {
  nova: 'Nova',
  u_tijeku: 'U tijeku',
  ceka_se_dio: 'Čeka se dio',
  cekanje_porezne: 'Čekanje porezne',
  zatvoreno: 'Zatvoreno',
};

export const UrgencyLabels: Record<TicketUrgency, string> = {
  niska: 'Niska',
  srednja: 'Srednja',
  visoka: 'Visoka',
  kriticna: 'Kritična',
};

export const RoleLabels: Record<UserRole, string> = {
  korisnik: 'Korisnik',
  tehnicar: 'Tehničar',
  administracija: 'Administracija',
};

// Status colors for UI
export const StatusColors: Record<TicketStatus, string> = {
  nova: 'bg-blue-100 text-blue-800',
  u_tijeku: 'bg-yellow-100 text-yellow-800',
  ceka_se_dio: 'bg-orange-100 text-orange-800',
  cekanje_porezne: 'bg-purple-100 text-purple-800',
  zatvoreno: 'bg-gray-100 text-gray-800',
};

// Urgency colors for UI
export const UrgencyColors: Record<TicketUrgency, string> = {
  niska: 'bg-green-100 text-green-800',
  srednja: 'bg-yellow-100 text-yellow-800',
  visoka: 'bg-orange-100 text-orange-800',
  kriticna: 'bg-red-100 text-red-800',
};

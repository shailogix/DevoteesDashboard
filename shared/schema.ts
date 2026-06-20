import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal, jsonb, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  role: varchar("role").notNull().default("user"),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Devotee storage table  
export const devotees = pgTable("devotees", {
  id: serial("id").primaryKey(),
  devoteeId: varchar("devotee_id").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique(),
  phone: varchar("phone"),
  whatsappNumber: varchar("whatsapp_number"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  country: varchar("country"),
  occupation: varchar("occupation"),
  spiritualLevel: varchar("spiritual_level"),
  joinDate: timestamp("join_date"),
  mentorId: integer("mentor_id"),
  familyId: integer("family_id"),
  profileImage: varchar("profile_image"),
  notes: text("notes"),
  specialSkills: text("special_skills"),
  previousExperience: text("previous_experience"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  medicalConditions: text("medical_conditions"),
  dietaryPreferences: text("dietary_preferences"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family storage table
export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  familyName: varchar("family_name").notNull(),
  headOfFamily: integer("head_of_family"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  country: varchar("country"),
  phone: varchar("phone"),
  email: varchar("email"),
  totalMembers: integer("total_members"),
  emergencyContact: varchar("emergency_contact"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mentor storage table
export const mentors = pgTable("mentors", {
  id: serial("id").primaryKey(),
  devoteeId: integer("devotee_id").notNull(),
  specialization: varchar("specialization"),
  experience: text("experience"),
  qualifications: text("qualifications"),
  availableHours: varchar("available_hours"),
  contactPreference: varchar("contact_preference"),
  maxMentees: integer("max_mentees"),
  currentMentees: integer("current_mentees"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events storage table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  eventType: varchar("event_type").notNull(),
  location: varchar("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  startTime: varchar("start_time"),
  endTime: varchar("end_time"),
  capacity: integer("capacity"),
  registrationRequired: boolean("registration_required").default(false),
  registrationDeadline: timestamp("registration_deadline"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  status: varchar("status").notNull().default("planned"),
  imageUrl: varchar("image_url"),
  isArchived: boolean("is_archived").notNull().default(false),
  archivedAt: timestamp("archived_at"),
  maxParticipants: integer("max_participants"),
  createdBy: varchar("created_by"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance storage table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  devoteeId: integer("devotee_id").notNull(),
  eventId: integer("event_id"),
  attendanceDate: timestamp("attendance_date").notNull(),
  checkInTime: varchar("check_in_time"),
  checkOutTime: varchar("check_out_time"),
  status: varchar("status").notNull().default("present"),
  notes: text("notes"),
  recordedBy: varchar("recorded_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Donations storage table
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  devoteeId: integer("devotee_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("INR"),
  donationType: varchar("donation_type").notNull(),
  purpose: text("purpose"),
  donationDate: timestamp("donation_date").notNull(),
  paymentMethod: varchar("payment_method"),
  transactionId: varchar("transaction_id"),
  receiptNumber: varchar("receipt_number"),
  taxDeductible: boolean("tax_deductible").default(false),
  anonymousDonation: boolean("anonymous_donation").default(false),
  notes: text("notes"),
  recordedBy: varchar("recorded_by"),
  status: varchar("status").notNull().default("received"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Participation storage table
export const eventParticipation = pgTable("event_participation", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  devoteeId: integer("devotee_id").notNull(),
  registrationDate: timestamp("registration_date"),
  status: varchar("status").notNull().default("registered"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Volunteering storage table
export const volunteering = pgTable("volunteering", {
  id: serial("id").primaryKey(),
  devoteeId: integer("devotee_id").notNull(),
  activityType: varchar("activity_type").notNull(),
  description: text("description"),
  location: varchar("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  hoursCommitted: integer("hours_committed"),
  hoursCompleted: integer("hours_completed"),
  skills: text("skills"),
  status: varchar("status").notNull().default("active"),
  supervisorId: integer("supervisor_id"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Groups storage table - Enhanced for dynamic groups
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  groupName: varchar("group_name").notNull(),
  description: text("description"),
  groupType: varchar("group_type").notNull(),
  capacity: integer("capacity"),
  currentMembers: integer("current_members").default(0),
  location: varchar("location"),
  meetingSchedule: varchar("meeting_schedule"),
  leaderId: integer("leader_id"),
  requirements: text("requirements"),
  customFields: jsonb("custom_fields"),
  createdBy: varchar("created_by"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dynamic group entries table
export const groupEntries = pgTable("group_entries", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  entryData: jsonb("entry_data").notNull(),
  uniqueMemberId: varchar("unique_member_id").unique(),
  qrIdentifier: text("qr_identifier"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mandals table for dropdown support
export const mandals = pgTable("mandals", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  hindiName: varchar("hindi_name"),
  code: varchar("code", { length: 2 }).unique().notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sabha locations table
export const sabhaLocations = pgTable("sabha_locations", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Group Memberships storage table
export const groupMemberships = pgTable("group_memberships", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  devoteeId: integer("devotee_id").notNull(),
  role: varchar("role").notNull().default("member"),
  joinDate: timestamp("join_date"),
  status: varchar("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dashboard Layouts storage table
export const dashboardLayouts = pgTable("dashboard_layouts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  layoutName: varchar("layout_name").notNull(),
  layoutData: text("layout_data").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dev Configuration storage table (persistent dev config)
export const devConfig = pgTable("dev_config", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dev Macros storage table
export const devMacros = pgTable("dev_macros", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),
  runCount: integer("run_count").default(0),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Log storage table
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 50 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  userId: varchar("user_id", { length: 100 }).notNull(),
  beforeData: jsonb("before_data"),
  afterData: jsonb("after_data"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Visual Overrides storage table
export const visualOverrides = pgTable("visual_overrides", {
  id: serial("id").primaryKey(),
  selector: varchar("selector", { length: 500 }).notNull(),
  property: varchar("property", { length: 100 }).notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rollback Slots storage table
export const rollbackSlots = pgTable("rollback_slots", {
  id: serial("id").primaryKey(),
  slotIndex: integer("slot_index").notNull(),
  name: varchar("name", { length: 255 }),
  overrides: jsonb("overrides").notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Page Registry storage table (dynamic pages)
export const pageRegistry = pgTable("page_registry", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  sections: jsonb("sections").notNull(),
  dataSource: varchar("data_source", { length: 100 }),
  filters: jsonb("filters"),
  permissions: jsonb("permissions"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema Registry storage table (dynamic database schemas)
export const schemaRegistry = pgTable("schema_registry", {
  id: serial("id").primaryKey(),
  tableName: varchar("table_name", { length: 100 }).unique().notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull(),
  relations: jsonb("relations"),
  displayColumns: jsonb("display_columns"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Route Registry storage table (dynamic API routes)
export const routeRegistry = pgTable("route_registry", {
  id: serial("id").primaryKey(),
  method: varchar("method", { length: 10 }).notNull(),
  path: varchar("path", { length: 255 }).notNull(),
  label: varchar("label", { length: 255 }),
  description: text("description"),
  sqlQuery: text("sql_query").notNull(),
  parameters: jsonb("parameters"),
  requiredRole: varchar("required_role", { length: 50 }).default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Preferences storage table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  theme: varchar("theme").default("devotional"),
  dashboardLayout: varchar("dashboard_layout"),
  notifications: text("notifications"),
  language: varchar("language").default("en"),
  timezone: varchar("timezone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  dashboardLayouts: many(dashboardLayouts),
}));

export const devoteesRelations = relations(devotees, ({ one, many }) => ({
  family: one(families, {
    fields: [devotees.familyId],
    references: [families.id],
  }),
  mentor: one(mentors, {
    fields: [devotees.mentorId],
    references: [mentors.id],
  }),
  attendance: many(attendance),
  donations: many(donations),
  volunteering: many(volunteering),
  groupMemberships: many(groupMemberships),
}));

export const familiesRelations = relations(families, ({ many }) => ({
  members: many(devotees),
}));

export const mentorsRelations = relations(mentors, ({ many }) => ({
  mentees: many(devotees),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  devotee: one(devotees, {
    fields: [attendance.devoteeId],
    references: [devotees.id],
  }),
  event: one(events, {
    fields: [attendance.eventId],
    references: [events.id],
  }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  devotee: one(devotees, {
    fields: [donations.devoteeId],
    references: [devotees.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  attendance: many(attendance),
  eventParticipation: many(eventParticipation),
}));

export const eventParticipationRelations = relations(eventParticipation, ({ one }) => ({
  event: one(events, {
    fields: [eventParticipation.eventId],
    references: [events.id],
  }),
  devotee: one(devotees, {
    fields: [eventParticipation.devoteeId],
    references: [devotees.id],
  }),
}));

export const volunteeringRelations = relations(volunteering, ({ one }) => ({
  devotee: one(devotees, {
    fields: [volunteering.devoteeId],
    references: [devotees.id],
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  leader: one(devotees, {
    fields: [groups.leaderId],
    references: [devotees.id],
  }),
  memberships: many(groupMemberships),
  entries: many(groupEntries),
}));

export const groupEntriesRelations = relations(groupEntries, ({ one }) => ({
  group: one(groups, {
    fields: [groupEntries.groupId],
    references: [groups.id],
  }),
}));

export const mandalsRelations = relations(mandals, ({ many }) => ({
}));

export const sabhaLocationsRelations = relations(sabhaLocations, ({ many }) => ({
}));

export const groupMembershipsRelations = relations(groupMemberships, ({ one }) => ({
  group: one(groups, {
    fields: [groupMemberships.groupId],
    references: [groups.id],
  }),
  devotee: one(devotees, {
    fields: [groupMemberships.devoteeId],
    references: [devotees.id],
  }),
}));

export const dashboardLayoutsRelations = relations(dashboardLayouts, ({ one }) => ({
  user: one(users, {
    fields: [dashboardLayouts.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const devConfigRelations = relations(devConfig, ({}) => ({}));
export const devMacrosRelations = relations(devMacros, ({}) => ({}));
export const auditLogRelations = relations(auditLog, ({}) => ({}));
export const visualOverridesRelations = relations(visualOverrides, ({}) => ({}));
export const rollbackSlotsRelations = relations(rollbackSlots, ({}) => ({}));
export const pageRegistryRelations = relations(pageRegistry, ({}) => ({}));
export const schemaRegistryRelations = relations(schemaRegistry, ({}) => ({}));
export const routeRegistryRelations = relations(routeRegistry, ({}) => ({}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertDevoteeSchema = createInsertSchema(devotees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFamilySchema = createInsertSchema(families).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMentorSchema = createInsertSchema(mentors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVolunteeringSchema = createInsertSchema(volunteering).omit({
  id: true,
  createdAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupEntrySchema = createInsertSchema(groupEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMandalSchema = createInsertSchema(mandals).omit({
  id: true,
  createdAt: true,
});

export const insertSabhaLocationSchema = createInsertSchema(sabhaLocations).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardLayoutSchema = createInsertSchema(dashboardLayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDevConfigSchema = createInsertSchema(devConfig).omit({
  id: true,
  updatedAt: true,
});

export const insertDevMacroSchema = createInsertSchema(devMacros).omit({
  id: true,
  runCount: true,
  lastRunAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  timestamp: true,
});

export const insertVisualOverrideSchema = createInsertSchema(visualOverrides).omit({
  id: true,
  createdAt: true,
});

export const insertRollbackSlotSchema = createInsertSchema(rollbackSlots).omit({
  id: true,
  savedAt: true,
});

export const insertPageRegistrySchema = createInsertSchema(pageRegistry).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSchemaRegistrySchema = createInsertSchema(schemaRegistry).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRouteRegistrySchema = createInsertSchema(routeRegistry).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertDevotee = z.infer<typeof insertDevoteeSchema>;
export type Devotee = typeof devotees.$inferSelect;

export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;

export type InsertMentor = z.infer<typeof insertMentorSchema>;
export type Mentor = typeof mentors.$inferSelect;

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertVolunteering = z.infer<typeof insertVolunteeringSchema>;
export type Volunteering = typeof volunteering.$inferSelect;

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

export type InsertGroupEntry = z.infer<typeof insertGroupEntrySchema>;
export type GroupEntry = typeof groupEntries.$inferSelect;

export type InsertMandal = z.infer<typeof insertMandalSchema>;
export type Mandal = typeof mandals.$inferSelect;

export type InsertSabhaLocation = z.infer<typeof insertSabhaLocationSchema>;
export type SabhaLocation = typeof sabhaLocations.$inferSelect;

export type InsertDashboardLayout = z.infer<typeof insertDashboardLayoutSchema>;
export type DashboardLayout = typeof dashboardLayouts.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

export type InsertDevConfig = z.infer<typeof insertDevConfigSchema>;
export type DevConfigEntry = typeof devConfig.$inferSelect;

export type InsertDevMacro = z.infer<typeof insertDevMacroSchema>;
export type DevMacro = typeof devMacros.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLogEntry = typeof auditLog.$inferSelect;

export type InsertVisualOverride = z.infer<typeof insertVisualOverrideSchema>;
export type VisualOverride = typeof visualOverrides.$inferSelect;

export type InsertRollbackSlot = z.infer<typeof insertRollbackSlotSchema>;
export type RollbackSlot = typeof rollbackSlots.$inferSelect;

export type InsertPageRegistry = z.infer<typeof insertPageRegistrySchema>;
export type PageRegistryEntry = typeof pageRegistry.$inferSelect;

export type InsertSchemaRegistry = z.infer<typeof insertSchemaRegistrySchema>;
export type SchemaRegistryEntry = typeof schemaRegistry.$inferSelect;

export type InsertRouteRegistry = z.infer<typeof insertRouteRegistrySchema>;
export type RouteRegistryEntry = typeof routeRegistry.$inferSelect;

// ─── Notification (in-memory only, not persisted in DB) ──────────────────────
export const notificationSchema = z.object({
  id: z.number(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["info", "success", "warning", "error"]),
  isRead: z.boolean(),
  isPinned: z.boolean(),
  relatedEntity: z.string().optional(),
  relatedId: z.number().optional(),
  createdAt: z.date(),
});

export const insertNotificationSchema = notificationSchema.omit({ id: true, createdAt: true });

export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

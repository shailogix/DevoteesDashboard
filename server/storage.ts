import {
  users,
  devotees,
  families,
  mentors,
  attendance,
  donations,
  events,
  eventParticipation,
  volunteering,
  groups,
  groupMemberships,
  groupEntries,
  mandals,
  sabhaLocations,
  dashboardLayouts,
  userPreferences,
  devConfig,
  devMacros,
  auditLog,
  visualOverrides,
  rollbackSlots,
  pageRegistry,
  schemaRegistry,
  routeRegistry,
  type User,
  type UpsertUser,
  type Devotee,
  type InsertDevotee,
  type Family,
  type InsertFamily,
  type Mentor,
  type InsertMentor,
  type Attendance,
  type InsertAttendance,
  type Donation,
  type InsertDonation,
  type Event,
  type InsertEvent,
  type Volunteering,
  type InsertVolunteering,
  type Group,
  type InsertGroup,
  type GroupEntry,
  type InsertGroupEntry,
  type Mandal,
  type InsertMandal,
  type SabhaLocation,
  type InsertSabhaLocation,
  type DashboardLayout,
  type InsertDashboardLayout,
  type UserPreferences,
  type InsertUserPreferences,
  type DevConfigEntry,
  type InsertDevConfig,
  type DevMacro,
  type InsertDevMacro,
  type AuditLogEntry,
  type InsertAuditLog,
  type VisualOverride,
  type InsertVisualOverride,
  type RollbackSlot,
  type InsertRollbackSlot,
  type PageRegistryEntry,
  type InsertPageRegistry,
  type SchemaRegistryEntry,
  type InsertSchemaRegistry,
  type RouteRegistryEntry,
  type InsertRouteRegistry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sum, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;

  getDevotees(): Promise<Devotee[]>;
  getDevotee(id: number): Promise<Devotee | undefined>;
  getDevoteesByFamily(familyId: number): Promise<Devotee[]>;
  createDevotee(devotee: InsertDevotee): Promise<Devotee>;
  updateDevotee(id: number, devotee: Partial<InsertDevotee>): Promise<Devotee>;
  deleteDevotee(id: number): Promise<boolean>;

  getFamilies(): Promise<Family[]>;
  getFamily(id: number): Promise<Family | undefined>;
  createFamily(family: InsertFamily): Promise<Family>;
  updateFamily(id: number, family: Partial<InsertFamily>): Promise<Family>;
  deleteFamily(id: number): Promise<boolean>;

  getMentors(): Promise<Mentor[]>;
  getMentor(id: number): Promise<Mentor | undefined>;
  createMentor(mentor: InsertMentor): Promise<Mentor>;
  updateMentor(id: number, mentor: Partial<InsertMentor>): Promise<Mentor>;
  deleteMentor(id: number): Promise<boolean>;

  getAttendance(devoteeId?: number, eventId?: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendance: Partial<InsertAttendance>): Promise<Attendance>;
  deleteAttendance(id: number): Promise<boolean>;

  getDonations(devoteeId?: number): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonation(id: number, donation: Partial<InsertDonation>): Promise<Donation>;
  deleteDonation(id: number): Promise<boolean>;

  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;
  archiveEvent(id: number): Promise<Event>;
  unarchiveEvent(id: number): Promise<Event>;
  autoArchivePastEvents(): Promise<number>;

  getVolunteering(devoteeId?: number): Promise<Volunteering[]>;
  createVolunteering(volunteering: InsertVolunteering): Promise<Volunteering>;
  updateVolunteering(id: number, volunteering: Partial<InsertVolunteering>): Promise<Volunteering>;
  deleteVolunteering(id: number): Promise<boolean>;

  getGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group>;
  deleteGroup(id: number): Promise<boolean>;

  getGroupEntries(groupId?: number): Promise<GroupEntry[]>;
  createGroupEntry(entry: InsertGroupEntry): Promise<GroupEntry>;
  updateGroupEntry(id: number, entry: Partial<InsertGroupEntry>): Promise<GroupEntry>;
  deleteGroupEntry(id: number): Promise<boolean>;

  getMandals(): Promise<Mandal[]>;
  createMandal(mandal: InsertMandal): Promise<Mandal>;

  getSabhaLocations(): Promise<SabhaLocation[]>;
  createSabhaLocation(location: InsertSabhaLocation): Promise<SabhaLocation>;

  getDashboardLayouts(userId: string): Promise<DashboardLayout[]>;
  createDashboardLayout(layout: InsertDashboardLayout): Promise<DashboardLayout>;
  updateDashboardLayout(id: number, layout: Partial<InsertDashboardLayout>): Promise<DashboardLayout>;
  deleteDashboardLayout(id: number): Promise<boolean>;

  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;

  // Dev Config
  getDevConfig(key: string): Promise<DevConfigEntry | undefined>;
  getAllDevConfig(): Promise<DevConfigEntry[]>;
  setDevConfig(key: string, value: any): Promise<DevConfigEntry>;
  deleteDevConfig(key: string): Promise<boolean>;

  // Dev Macros
  getDevMacros(): Promise<DevMacro[]>;
  getDevMacro(id: number): Promise<DevMacro | undefined>;
  createDevMacro(macro: InsertDevMacro): Promise<DevMacro>;
  updateDevMacro(id: number, macro: Partial<InsertDevMacro>): Promise<DevMacro>;
  deleteDevMacro(id: number): Promise<boolean>;
  incrementMacroRunCount(id: number): Promise<DevMacro>;

  // Audit Log
  getAuditLog(limit?: number, entity?: string, action?: string): Promise<AuditLogEntry[]>;
  addAuditLogEntry(entry: InsertAuditLog): Promise<AuditLogEntry>;

  // Visual Overrides
  getVisualOverrides(): Promise<VisualOverride[]>;
  setVisualOverride(override: InsertVisualOverride): Promise<VisualOverride>;
  clearVisualOverrides(): Promise<boolean>;

  // Rollback Slots
  getRollbackSlots(): Promise<RollbackSlot[]>;
  getRollbackSlot(index: number): Promise<RollbackSlot | undefined>;
  createRollbackSlot(slot: InsertRollbackSlot): Promise<RollbackSlot>;
  deleteRollbackSlot(index: number): Promise<boolean>;

  // Page Registry
  getPageRegistry(): Promise<PageRegistryEntry[]>;
  getPageRegistryEntry(id: number): Promise<PageRegistryEntry | undefined>;
  getPageRegistryEntryBySlug(slug: string): Promise<PageRegistryEntry | undefined>;
  createPageRegistryEntry(entry: InsertPageRegistry): Promise<PageRegistryEntry>;
  updatePageRegistryEntry(id: number, entry: Partial<InsertPageRegistry>): Promise<PageRegistryEntry>;
  deletePageRegistryEntry(id: number): Promise<boolean>;

  // Schema Registry
  getSchemaRegistry(): Promise<SchemaRegistryEntry[]>;
  getSchemaRegistryEntry(id: number): Promise<SchemaRegistryEntry | undefined>;
  getSchemaRegistryEntryByTableName(tableName: string): Promise<SchemaRegistryEntry | undefined>;
  createSchemaRegistryEntry(entry: InsertSchemaRegistry): Promise<SchemaRegistryEntry>;
  updateSchemaRegistryEntry(id: number, entry: Partial<InsertSchemaRegistry>): Promise<SchemaRegistryEntry>;
  deleteSchemaRegistryEntry(id: number): Promise<boolean>;

  // Route Registry
  getRouteRegistry(): Promise<RouteRegistryEntry[]>;
  getRouteRegistryEntry(id: number): Promise<RouteRegistryEntry | undefined>;
  getRouteRegistryEntryByPath(path: string): Promise<RouteRegistryEntry | undefined>;
  createRouteRegistryEntry(entry: InsertRouteRegistry): Promise<RouteRegistryEntry>;
  updateRouteRegistryEntry(id: number, entry: Partial<InsertRouteRegistry>): Promise<RouteRegistryEntry>;
  deleteRouteRegistryEntry(id: number): Promise<boolean>;

  getStats(): Promise<{
    totalDevotees: number;
    activeFamilies: number;
    totalDonations: number;
    avgAttendance: number;
  }>;

  getDonationTrends(): Promise<Array<{ month: string; amount: number }>>;
  getAttendanceTrends(): Promise<Array<{ month: string; present: number; absent: number }>>;
  getVolunteeringStats(): Promise<Array<{ activity: string; hours: number }>>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: { ...userData, updatedAt: new Date() },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getDevotees(): Promise<Devotee[]> {
    return await db.select().from(devotees).orderBy(desc(devotees.createdAt));
  }

  async getDevotee(id: number): Promise<Devotee | undefined> {
    const [devotee] = await db.select().from(devotees).where(eq(devotees.id, id));
    return devotee;
  }

  async getDevoteesByFamily(familyId: number): Promise<Devotee[]> {
    return await db.select().from(devotees).where(eq(devotees.familyId, familyId));
  }

  async createDevotee(devotee: InsertDevotee): Promise<Devotee> {
    const [newDevotee] = await db.insert(devotees).values(devotee).returning();
    return newDevotee;
  }

  async updateDevotee(id: number, devotee: Partial<InsertDevotee>): Promise<Devotee> {
    const [updatedDevotee] = await db
      .update(devotees)
      .set({ ...devotee, updatedAt: new Date() })
      .where(eq(devotees.id, id))
      .returning();
    return updatedDevotee;
  }

  async deleteDevotee(id: number): Promise<boolean> {
    const result = await db.delete(devotees).where(eq(devotees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getFamilies(): Promise<Family[]> {
    return await db.select().from(families).orderBy(desc(families.createdAt));
  }

  async getFamily(id: number): Promise<Family | undefined> {
    const [family] = await db.select().from(families).where(eq(families.id, id));
    return family;
  }

  async createFamily(family: InsertFamily): Promise<Family> {
    const [newFamily] = await db.insert(families).values(family).returning();
    return newFamily;
  }

  async updateFamily(id: number, family: Partial<InsertFamily>): Promise<Family> {
    const [updatedFamily] = await db
      .update(families)
      .set({ ...family, updatedAt: new Date() })
      .where(eq(families.id, id))
      .returning();
    return updatedFamily;
  }

  async deleteFamily(id: number): Promise<boolean> {
    const result = await db.delete(families).where(eq(families.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMentors(): Promise<Mentor[]> {
    return await db.select().from(mentors).orderBy(desc(mentors.createdAt));
  }

  async getMentor(id: number): Promise<Mentor | undefined> {
    const [mentor] = await db.select().from(mentors).where(eq(mentors.id, id));
    return mentor;
  }

  async createMentor(mentor: InsertMentor): Promise<Mentor> {
    const [newMentor] = await db.insert(mentors).values(mentor).returning();
    return newMentor;
  }

  async updateMentor(id: number, mentor: Partial<InsertMentor>): Promise<Mentor> {
    const [updatedMentor] = await db
      .update(mentors)
      .set({ ...mentor, updatedAt: new Date() })
      .where(eq(mentors.id, id))
      .returning();
    return updatedMentor;
  }

  async deleteMentor(id: number): Promise<boolean> {
    const result = await db.delete(mentors).where(eq(mentors.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAttendance(devoteeId?: number, eventId?: number): Promise<Attendance[]> {
    if (devoteeId && eventId) {
      return await db.select().from(attendance)
        .where(and(eq(attendance.devoteeId, devoteeId), eq(attendance.eventId, eventId)))
        .orderBy(desc(attendance.attendanceDate));
    } else if (devoteeId) {
      return await db.select().from(attendance)
        .where(eq(attendance.devoteeId, devoteeId))
        .orderBy(desc(attendance.attendanceDate));
    } else if (eventId) {
      return await db.select().from(attendance)
        .where(eq(attendance.eventId, eventId))
        .orderBy(desc(attendance.attendanceDate));
    }
    return await db.select().from(attendance).orderBy(desc(attendance.attendanceDate));
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return newAttendance;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set(attendanceData)
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance;
  }

  async deleteAttendance(id: number): Promise<boolean> {
    const result = await db.delete(attendance).where(eq(attendance.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getDonations(devoteeId?: number): Promise<Donation[]> {
    if (devoteeId) {
      return await db.select().from(donations)
        .where(eq(donations.devoteeId, devoteeId))
        .orderBy(desc(donations.donationDate));
    }
    return await db.select().from(donations).orderBy(desc(donations.donationDate));
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    return newDonation;
  }

  async updateDonation(id: number, donation: Partial<InsertDonation>): Promise<Donation> {
    const [updatedDonation] = await db
      .update(donations)
      .set(donation)
      .where(eq(donations.id, id))
      .returning();
    return updatedDonation;
  }

  async deleteDonation(id: number): Promise<boolean> {
    const result = await db.delete(donations).where(eq(donations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async archiveEvent(id: number): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ isArchived: true, archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async unarchiveEvent(id: number): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ isArchived: false, archivedAt: null, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async autoArchivePastEvents(): Promise<number> {
    const now = new Date();
    const result = await db
      .update(events)
      .set({ isArchived: true, archivedAt: now, updatedAt: now })
      .where(and(eq(events.isArchived, false), lte(events.endDate, now)))
      .returning();
    return result.length;
  }

  async getVolunteering(devoteeId?: number): Promise<Volunteering[]> {
    if (devoteeId) {
      return await db.select().from(volunteering)
        .where(eq(volunteering.devoteeId, devoteeId))
        .orderBy(desc(volunteering.startDate));
    }
    return await db.select().from(volunteering).orderBy(desc(volunteering.startDate));
  }

  async createVolunteering(volunteeringData: InsertVolunteering): Promise<Volunteering> {
    const [newVolunteering] = await db.insert(volunteering).values(volunteeringData).returning();
    return newVolunteering;
  }

  async updateVolunteering(id: number, volunteeringData: Partial<InsertVolunteering>): Promise<Volunteering> {
    const [updatedVolunteering] = await db
      .update(volunteering)
      .set(volunteeringData)
      .where(eq(volunteering.id, id))
      .returning();
    return updatedVolunteering;
  }

  async deleteVolunteering(id: number): Promise<boolean> {
    const result = await db.delete(volunteering).where(eq(volunteering.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getGroups(): Promise<Group[]> {
    return await db.select().from(groups).orderBy(desc(groups.createdAt));
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  async updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group> {
    const [updatedGroup] = await db
      .update(groups)
      .set({ ...group, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getGroupEntries(groupId?: number): Promise<GroupEntry[]> {
    if (groupId) {
      return await db.select().from(groupEntries)
        .where(eq(groupEntries.groupId, groupId))
        .orderBy(desc(groupEntries.createdAt));
    }
    return await db.select().from(groupEntries).orderBy(desc(groupEntries.createdAt));
  }

  async createGroupEntry(entry: InsertGroupEntry): Promise<GroupEntry> {
    const [newEntry] = await db.insert(groupEntries).values(entry).returning();
    return newEntry;
  }

  async updateGroupEntry(id: number, entry: Partial<InsertGroupEntry>): Promise<GroupEntry> {
    const [updatedEntry] = await db
      .update(groupEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(groupEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteGroupEntry(id: number): Promise<boolean> {
    const result = await db.delete(groupEntries).where(eq(groupEntries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMandals(): Promise<Mandal[]> {
    return await db.select().from(mandals).where(eq(mandals.isActive, true));
  }

  async createMandal(mandal: InsertMandal): Promise<Mandal> {
    const [newMandal] = await db.insert(mandals).values(mandal).returning();
    return newMandal;
  }

  async getSabhaLocations(): Promise<SabhaLocation[]> {
    return await db.select().from(sabhaLocations).where(eq(sabhaLocations.isActive, true));
  }

  async createSabhaLocation(location: InsertSabhaLocation): Promise<SabhaLocation> {
    const [newLocation] = await db.insert(sabhaLocations).values(location).returning();
    return newLocation;
  }

  async getDashboardLayouts(userId: string): Promise<DashboardLayout[]> {
    return await db.select().from(dashboardLayouts).where(eq(dashboardLayouts.userId, userId));
  }

  async createDashboardLayout(layout: InsertDashboardLayout): Promise<DashboardLayout> {
    const [newLayout] = await db.insert(dashboardLayouts).values(layout).returning();
    return newLayout;
  }

  async updateDashboardLayout(id: number, layout: Partial<InsertDashboardLayout>): Promise<DashboardLayout> {
    const [updatedLayout] = await db
      .update(dashboardLayouts)
      .set({ ...layout, updatedAt: new Date() })
      .where(eq(dashboardLayouts.id, id))
      .returning();
    return updatedLayout;
  }

  async deleteDashboardLayout(id: number): Promise<boolean> {
    const result = await db.delete(dashboardLayouts).where(eq(dashboardLayouts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [upsertedPreferences] = await db
      .insert(userPreferences)
      .values(preferences)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...preferences, updatedAt: new Date() },
      })
      .returning();
    return upsertedPreferences;
  }

  async getStats(): Promise<{
    totalDevotees: number;
    activeFamilies: number;
    totalDonations: number;
    avgAttendance: number;
  }> {
    const [devoteesCount] = await db.select({ count: count() }).from(devotees).where(eq(devotees.isActive, true));
    const [familiesCount] = await db.select({ count: count() }).from(families).where(eq(families.isActive, true));
    const [donationsSum] = await db.select({ sum: sum(donations.amount) }).from(donations);

    const [totalAttendance] = await db.select({ count: count() }).from(attendance);
    const [presentAttendance] = await db.select({ count: count() }).from(attendance).where(eq(attendance.status, 'present'));

    const avgAttendance = totalAttendance.count > 0
      ? Math.round((presentAttendance.count / totalAttendance.count) * 100)
      : 0;

    return {
      totalDevotees: devoteesCount.count,
      activeFamilies: familiesCount.count,
      totalDonations: parseFloat(donationsSum.sum || "0"),
      avgAttendance,
    };
  }

  async getDonationTrends(): Promise<Array<{ month: string; amount: number }>> {
    const rows = await db.execute(sql`
      SELECT
        TO_CHAR(donation_date, 'Mon YYYY') AS month,
        TO_CHAR(donation_date, 'YYYY-MM') AS month_key,
        SUM(amount::numeric) AS amount
      FROM donations
      WHERE donation_date >= NOW() - INTERVAL '6 months'
      GROUP BY month, month_key
      ORDER BY month_key ASC
    `);
    return (rows.rows as any[]).map(r => ({
      month: r.month as string,
      amount: parseFloat(r.amount as string) || 0,
    }));
  }

  async getAttendanceTrends(): Promise<Array<{ month: string; present: number; absent: number }>> {
    const rows = await db.execute(sql`
      SELECT
        TO_CHAR(attendance_date, 'Mon YYYY') AS month,
        TO_CHAR(attendance_date, 'YYYY-MM') AS month_key,
        SUM(CASE WHEN status = 'present' OR status = 'late' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 'absent' OR status = 'excused' THEN 1 ELSE 0 END) AS absent
      FROM attendance
      WHERE attendance_date >= NOW() - INTERVAL '6 months'
      GROUP BY month, month_key
      ORDER BY month_key ASC
    `);
    return (rows.rows as any[]).map(r => ({
      month: r.month as string,
      present: parseInt(r.present as string) || 0,
      absent: parseInt(r.absent as string) || 0,
    }));
  }

  async getVolunteeringStats(): Promise<Array<{ activity: string; hours: number }>> {
    const rows = await db.execute(sql`
      SELECT
        activity_type AS activity,
        COALESCE(SUM(hours_completed), SUM(hours_committed), 0) AS hours
      FROM volunteering
      GROUP BY activity_type
      ORDER BY hours DESC
      LIMIT 10
    `);
    return (rows.rows as any[]).map(r => ({
      activity: r.activity as string,
      hours: parseInt(r.hours as string) || 0,
    }));
  }

  // ─── Dev Config ─────────────────────────────────────────────────────────────
  async getDevConfig(key: string): Promise<DevConfigEntry | undefined> {
    const [entry] = await db.select().from(devConfig).where(eq(devConfig.key, key));
    return entry;
  }

  async getAllDevConfig(): Promise<DevConfigEntry[]> {
    return await db.select().from(devConfig);
  }

  async setDevConfig(key: string, value: any): Promise<DevConfigEntry> {
    const [entry] = await db
      .insert(devConfig)
      .values({ key, value })
      .onConflictDoUpdate({
        target: devConfig.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return entry;
  }

  async deleteDevConfig(key: string): Promise<boolean> {
    const result = await db.delete(devConfig).where(eq(devConfig.key, key));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Dev Macros ─────────────────────────────────────────────────────────────
  async getDevMacros(): Promise<DevMacro[]> {
    return await db.select().from(devMacros).orderBy(desc(devMacros.createdAt));
  }

  async getDevMacro(id: number): Promise<DevMacro | undefined> {
    const [macro] = await db.select().from(devMacros).where(eq(devMacros.id, id));
    return macro;
  }

  async createDevMacro(macro: InsertDevMacro): Promise<DevMacro> {
    const [newMacro] = await db.insert(devMacros).values(macro).returning();
    return newMacro;
  }

  async updateDevMacro(id: number, macro: Partial<InsertDevMacro>): Promise<DevMacro> {
    const [updatedMacro] = await db
      .update(devMacros)
      .set({ ...macro, updatedAt: new Date() })
      .where(eq(devMacros.id, id))
      .returning();
    return updatedMacro;
  }

  async deleteDevMacro(id: number): Promise<boolean> {
    const result = await db.delete(devMacros).where(eq(devMacros.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementMacroRunCount(id: number): Promise<DevMacro> {
    const [updated] = await db
      .update(devMacros)
      .set({ runCount: sql`${devMacros.runCount} + 1`, lastRunAt: new Date() })
      .where(eq(devMacros.id, id))
      .returning();
    return updated;
  }

  // ─── Audit Log ──────────────────────────────────────────────────────────────
  async getAuditLog(limit = 100, entity?: string, action?: string): Promise<AuditLogEntry[]> {
    let query = db.select().from(auditLog).orderBy(desc(auditLog.timestamp));
    if (entity) {
      query = query.where(eq(auditLog.entity, entity)) as any;
    }
    if (action) {
      query = query.where(eq(auditLog.action, action)) as any;
    }
    const entries = await query;
    return entries.slice(0, limit);
  }

  async addAuditLogEntry(entry: InsertAuditLog): Promise<AuditLogEntry> {
    const [newEntry] = await db.insert(auditLog).values(entry).returning();
    return newEntry;
  }

  // ─── Visual Overrides ─────────────────────────────────────────────────────
  async getVisualOverrides(): Promise<VisualOverride[]> {
    return await db.select().from(visualOverrides);
  }

  async setVisualOverride(override: InsertVisualOverride): Promise<VisualOverride> {
    const [existing] = await db
      .select()
      .from(visualOverrides)
      .where(eq(visualOverrides.selector, override.selector));
    if (existing) {
      const [updated] = await db
        .update(visualOverrides)
        .set({ property: override.property, value: override.value })
        .where(eq(visualOverrides.selector, override.selector))
        .returning();
      return updated;
    }
    const [newOverride] = await db.insert(visualOverrides).values(override).returning();
    return newOverride;
  }

  async clearVisualOverrides(): Promise<boolean> {
    const result = await db.delete(visualOverrides);
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Rollback Slots ─────────────────────────────────────────────────────────
  async getRollbackSlots(): Promise<RollbackSlot[]> {
    return await db.select().from(rollbackSlots).orderBy(rollbackSlots.slotIndex);
  }

  async getRollbackSlot(index: number): Promise<RollbackSlot | undefined> {
    const [slot] = await db.select().from(rollbackSlots).where(eq(rollbackSlots.slotIndex, index));
    return slot;
  }

  async createRollbackSlot(slot: InsertRollbackSlot): Promise<RollbackSlot> {
    const [existing] = await db.select().from(rollbackSlots).where(eq(rollbackSlots.slotIndex, slot.slotIndex));
    if (existing) {
      const [updated] = await db
        .update(rollbackSlots)
        .set({ overrides: slot.overrides, name: slot.name, savedAt: new Date() })
        .where(eq(rollbackSlots.slotIndex, slot.slotIndex))
        .returning();
      return updated;
    }
    const [newSlot] = await db.insert(rollbackSlots).values(slot).returning();
    return newSlot;
  }

  async deleteRollbackSlot(index: number): Promise<boolean> {
    const result = await db.delete(rollbackSlots).where(eq(rollbackSlots.slotIndex, index));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Page Registry ──────────────────────────────────────────────────
  async getPageRegistry(): Promise<PageRegistryEntry[]> {
    return await db.select().from(pageRegistry).where(eq(pageRegistry.isActive, true)).orderBy(pageRegistry.label);
  }

  async getPageRegistryEntry(id: number): Promise<PageRegistryEntry | undefined> {
    const [entry] = await db.select().from(pageRegistry).where(eq(pageRegistry.id, id));
    return entry;
  }

  async getPageRegistryEntryBySlug(slug: string): Promise<PageRegistryEntry | undefined> {
    const [entry] = await db.select().from(pageRegistry).where(eq(pageRegistry.slug, slug));
    return entry;
  }

  async createPageRegistryEntry(entry: InsertPageRegistry): Promise<PageRegistryEntry> {
    const [newEntry] = await db.insert(pageRegistry).values(entry).returning();
    return newEntry;
  }

  async updatePageRegistryEntry(id: number, entry: Partial<InsertPageRegistry>): Promise<PageRegistryEntry> {
    const [updated] = await db.update(pageRegistry).set({ ...entry, updatedAt: new Date() }).where(eq(pageRegistry.id, id)).returning();
    return updated;
  }

  async deletePageRegistryEntry(id: number): Promise<boolean> {
    const result = await db.delete(pageRegistry).where(eq(pageRegistry.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Schema Registry ─────────────────────────────────────────
  async getSchemaRegistry(): Promise<SchemaRegistryEntry[]> {
    return await db.select().from(schemaRegistry).where(eq(schemaRegistry.isActive, true)).orderBy(schemaRegistry.label);
  }

  async getSchemaRegistryEntry(id: number): Promise<SchemaRegistryEntry | undefined> {
    const [entry] = await db.select().from(schemaRegistry).where(eq(schemaRegistry.id, id));
    return entry;
  }

  async getSchemaRegistryEntryByTableName(tableName: string): Promise<SchemaRegistryEntry | undefined> {
    const [entry] = await db.select().from(schemaRegistry).where(eq(schemaRegistry.tableName, tableName));
    return entry;
  }

  async createSchemaRegistryEntry(entry: InsertSchemaRegistry): Promise<SchemaRegistryEntry> {
    const [newEntry] = await db.insert(schemaRegistry).values(entry).returning();
    return newEntry;
  }

  async updateSchemaRegistryEntry(id: number, entry: Partial<InsertSchemaRegistry>): Promise<SchemaRegistryEntry> {
    const [updated] = await db.update(schemaRegistry).set({ ...entry, updatedAt: new Date() }).where(eq(schemaRegistry.id, id)).returning();
    return updated;
  }

  async deleteSchemaRegistryEntry(id: number): Promise<boolean> {
    const result = await db.delete(schemaRegistry).where(eq(schemaRegistry.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Route Registry ────────────────────────────────────────────
  async getRouteRegistry(): Promise<RouteRegistryEntry[]> {
    return await db.select().from(routeRegistry).where(eq(routeRegistry.isActive, true)).orderBy(routeRegistry.label);
  }

  async getRouteRegistryEntry(id: number): Promise<RouteRegistryEntry | undefined> {
    const [entry] = await db.select().from(routeRegistry).where(eq(routeRegistry.id, id));
    return entry;
  }

  async getRouteRegistryEntryByPath(path: string): Promise<RouteRegistryEntry | undefined> {
    const [entry] = await db.select().from(routeRegistry).where(eq(routeRegistry.path, path));
    return entry;
  }

  async createRouteRegistryEntry(entry: InsertRouteRegistry): Promise<RouteRegistryEntry> {
    const [newEntry] = await db.insert(routeRegistry).values(entry).returning();
    return newEntry;
  }

  async updateRouteRegistryEntry(id: number, entry: Partial<InsertRouteRegistry>): Promise<RouteRegistryEntry> {
    const [updated] = await db.update(routeRegistry).set(entry).where(eq(routeRegistry.id, id)).returning();
    return updated;
  }

  async deleteRouteRegistryEntry(id: number): Promise<boolean> {
    const result = await db.delete(routeRegistry).where(eq(routeRegistry.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

import { MemoryStorage } from "./memoryStorage";

class FallbackStorage implements IStorage {
  private primaryStorage: IStorage;
  private fallbackStorage: IStorage;
  private usingFallback = false;
  public memStore: MemoryStorage;

  constructor() {
    this.memStore = new MemoryStorage();
    this.primaryStorage = new DatabaseStorage();
    this.fallbackStorage = this.memStore;
  }

  private async executeWithFallback<T>(operation: (storage: IStorage) => Promise<T>): Promise<T> {
    if (this.usingFallback) {
      return await operation(this.fallbackStorage);
    }
    try {
      return await operation(this.primaryStorage);
    } catch (error: any) {
      if (!this.usingFallback) {
        console.warn("⚠️ Database operation failed, switching to in-memory storage:", error?.message);
        this.usingFallback = true;
      }
      return await operation(this.fallbackStorage);
    }
  }

  async getUser(id: string) { return this.executeWithFallback(s => s.getUser(id)); }
  async upsertUser(user: UpsertUser) { return this.executeWithFallback(s => s.upsertUser(user)); }

  async getDevotees() { return this.executeWithFallback(s => s.getDevotees()); }
  async getDevotee(id: number) { return this.executeWithFallback(s => s.getDevotee(id)); }
  async getDevoteesByFamily(familyId: number) { return this.executeWithFallback(s => s.getDevoteesByFamily(familyId)); }
  async createDevotee(devotee: InsertDevotee) { return this.executeWithFallback(s => s.createDevotee(devotee)); }
  async updateDevotee(id: number, devotee: Partial<InsertDevotee>) { return this.executeWithFallback(s => s.updateDevotee(id, devotee)); }
  async deleteDevotee(id: number) { return this.executeWithFallback(s => s.deleteDevotee(id)); }

  async getFamilies() { return this.executeWithFallback(s => s.getFamilies()); }
  async getFamily(id: number) { return this.executeWithFallback(s => s.getFamily(id)); }
  async createFamily(family: InsertFamily) { return this.executeWithFallback(s => s.createFamily(family)); }
  async updateFamily(id: number, family: Partial<InsertFamily>) { return this.executeWithFallback(s => s.updateFamily(id, family)); }
  async deleteFamily(id: number) { return this.executeWithFallback(s => s.deleteFamily(id)); }

  async getMentors() { return this.executeWithFallback(s => s.getMentors()); }
  async getMentor(id: number) { return this.executeWithFallback(s => s.getMentor(id)); }
  async createMentor(mentor: InsertMentor) { return this.executeWithFallback(s => s.createMentor(mentor)); }
  async updateMentor(id: number, mentor: Partial<InsertMentor>) { return this.executeWithFallback(s => s.updateMentor(id, mentor)); }
  async deleteMentor(id: number) { return this.executeWithFallback(s => s.deleteMentor(id)); }

  async getAttendance(devoteeId?: number, eventId?: number) { return this.executeWithFallback(s => s.getAttendance(devoteeId, eventId)); }
  async createAttendance(att: InsertAttendance) { return this.executeWithFallback(s => s.createAttendance(att)); }
  async updateAttendance(id: number, att: Partial<InsertAttendance>) { return this.executeWithFallback(s => s.updateAttendance(id, att)); }
  async deleteAttendance(id: number) { return this.executeWithFallback(s => s.deleteAttendance(id)); }

  async getDonations(devoteeId?: number) { return this.executeWithFallback(s => s.getDonations(devoteeId)); }
  async createDonation(donation: InsertDonation) { return this.executeWithFallback(s => s.createDonation(donation)); }
  async updateDonation(id: number, donation: Partial<InsertDonation>) { return this.executeWithFallback(s => s.updateDonation(id, donation)); }
  async deleteDonation(id: number) { return this.executeWithFallback(s => s.deleteDonation(id)); }

  async getEvents() { return this.executeWithFallback(s => s.getEvents()); }
  async getEvent(id: number) { return this.executeWithFallback(s => s.getEvent(id)); }
  async createEvent(event: InsertEvent) { return this.executeWithFallback(s => s.createEvent(event)); }
  async updateEvent(id: number, event: Partial<InsertEvent>) { return this.executeWithFallback(s => s.updateEvent(id, event)); }
  async deleteEvent(id: number) { return this.executeWithFallback(s => s.deleteEvent(id)); }
  async archiveEvent(id: number) { return this.executeWithFallback(s => s.archiveEvent(id)); }
  async unarchiveEvent(id: number) { return this.executeWithFallback(s => s.unarchiveEvent(id)); }
  async autoArchivePastEvents() { return this.executeWithFallback(s => s.autoArchivePastEvents()); }

  async getVolunteering(devoteeId?: number) { return this.executeWithFallback(s => s.getVolunteering(devoteeId)); }
  async createVolunteering(vol: InsertVolunteering) { return this.executeWithFallback(s => s.createVolunteering(vol)); }
  async updateVolunteering(id: number, vol: Partial<InsertVolunteering>) { return this.executeWithFallback(s => s.updateVolunteering(id, vol)); }
  async deleteVolunteering(id: number) { return this.executeWithFallback(s => s.deleteVolunteering(id)); }

  async getGroups() { return this.executeWithFallback(s => s.getGroups()); }
  async getGroup(id: number) { return this.executeWithFallback(s => s.getGroup(id)); }
  async createGroup(group: InsertGroup) { return this.executeWithFallback(s => s.createGroup(group)); }
  async updateGroup(id: number, group: Partial<InsertGroup>) { return this.executeWithFallback(s => s.updateGroup(id, group)); }
  async deleteGroup(id: number) { return this.executeWithFallback(s => s.deleteGroup(id)); }

  async getGroupEntries(groupId?: number) { return this.executeWithFallback(s => s.getGroupEntries(groupId)); }
  async createGroupEntry(entry: InsertGroupEntry) { return this.executeWithFallback(s => s.createGroupEntry(entry)); }
  async updateGroupEntry(id: number, entry: Partial<InsertGroupEntry>) { return this.executeWithFallback(s => s.updateGroupEntry(id, entry)); }
  async deleteGroupEntry(id: number) { return this.executeWithFallback(s => s.deleteGroupEntry(id)); }

  async getMandals() { return this.executeWithFallback(s => s.getMandals()); }
  async createMandal(mandal: InsertMandal) { return this.executeWithFallback(s => s.createMandal(mandal)); }

  async getSabhaLocations() { return this.executeWithFallback(s => s.getSabhaLocations()); }
  async createSabhaLocation(location: InsertSabhaLocation) { return this.executeWithFallback(s => s.createSabhaLocation(location)); }

  async getDashboardLayouts(userId: string) { return this.executeWithFallback(s => s.getDashboardLayouts(userId)); }
  async createDashboardLayout(layout: InsertDashboardLayout) { return this.executeWithFallback(s => s.createDashboardLayout(layout)); }
  async updateDashboardLayout(id: number, layout: Partial<InsertDashboardLayout>) { return this.executeWithFallback(s => s.updateDashboardLayout(id, layout)); }
  async deleteDashboardLayout(id: number) { return this.executeWithFallback(s => s.deleteDashboardLayout(id)); }

  async getUserPreferences(userId: string) { return this.executeWithFallback(s => s.getUserPreferences(userId)); }
  async upsertUserPreferences(preferences: InsertUserPreferences) { return this.executeWithFallback(s => s.upsertUserPreferences(preferences)); }

  async getAllUsers() { return this.executeWithFallback(s => s.getAllUsers()); }
  async updateUserRole(id: string, role: string) { return this.executeWithFallback(s => s.updateUserRole(id, role)); }

  async getStats() { return this.executeWithFallback(s => s.getStats()); }
  async getDonationTrends() { return this.executeWithFallback(s => s.getDonationTrends()); }
  async getAttendanceTrends() { return this.executeWithFallback(s => s.getAttendanceTrends()); }
  async getVolunteeringStats() { return this.executeWithFallback(s => s.getVolunteeringStats()); }

  // Dev Config
  async getDevConfig(key: string) { return this.executeWithFallback(s => s.getDevConfig(key)); }
  async getAllDevConfig() { return this.executeWithFallback(s => s.getAllDevConfig()); }
  async setDevConfig(key: string, value: any) { return this.executeWithFallback(s => s.setDevConfig(key, value)); }
  async deleteDevConfig(key: string) { return this.executeWithFallback(s => s.deleteDevConfig(key)); }

  // Dev Macros
  async getDevMacros() { return this.executeWithFallback(s => s.getDevMacros()); }
  async getDevMacro(id: number) { return this.executeWithFallback(s => s.getDevMacro(id)); }
  async createDevMacro(macro: InsertDevMacro) { return this.executeWithFallback(s => s.createDevMacro(macro)); }
  async updateDevMacro(id: number, macro: Partial<InsertDevMacro>) { return this.executeWithFallback(s => s.updateDevMacro(id, macro)); }
  async deleteDevMacro(id: number) { return this.executeWithFallback(s => s.deleteDevMacro(id)); }
  async incrementMacroRunCount(id: number) { return this.executeWithFallback(s => s.incrementMacroRunCount(id)); }

  // Audit Log
  async getAuditLog(limit?: number, entity?: string, action?: string) { return this.executeWithFallback(s => s.getAuditLog(limit, entity, action)); }
  async addAuditLogEntry(entry: InsertAuditLog) { return this.executeWithFallback(s => s.addAuditLogEntry(entry)); }

  // Visual Overrides
  async getVisualOverrides() { return this.executeWithFallback(s => s.getVisualOverrides()); }
  async setVisualOverride(override: InsertVisualOverride) { return this.executeWithFallback(s => s.setVisualOverride(override)); }
  async clearVisualOverrides() { return this.executeWithFallback(s => s.clearVisualOverrides()); }

  // Rollback Slots
  async getRollbackSlots() { return this.executeWithFallback(s => s.getRollbackSlots()); }
  async getRollbackSlot(index: number) { return this.executeWithFallback(s => s.getRollbackSlot(index)); }
  async createRollbackSlot(slot: InsertRollbackSlot) { return this.executeWithFallback(s => s.createRollbackSlot(slot)); }
  async deleteRollbackSlot(index: number) { return this.executeWithFallback(s => s.deleteRollbackSlot(index)); }

  // Page Registry
  async getPageRegistry() { return this.executeWithFallback(s => s.getPageRegistry()); }
  async getPageRegistryEntry(id: number) { return this.executeWithFallback(s => s.getPageRegistryEntry(id)); }
  async getPageRegistryEntryBySlug(slug: string) { return this.executeWithFallback(s => s.getPageRegistryEntryBySlug(slug)); }
  async createPageRegistryEntry(entry: InsertPageRegistry) { return this.executeWithFallback(s => s.createPageRegistryEntry(entry)); }
  async updatePageRegistryEntry(id: number, entry: Partial<InsertPageRegistry>) { return this.executeWithFallback(s => s.updatePageRegistryEntry(id, entry)); }
  async deletePageRegistryEntry(id: number) { return this.executeWithFallback(s => s.deletePageRegistryEntry(id)); }

  // Schema Registry
  async getSchemaRegistry() { return this.executeWithFallback(s => s.getSchemaRegistry()); }
  async getSchemaRegistryEntry(id: number) { return this.executeWithFallback(s => s.getSchemaRegistryEntry(id)); }
  async getSchemaRegistryEntryByTableName(tableName: string) { return this.executeWithFallback(s => s.getSchemaRegistryEntryByTableName(tableName)); }
  async createSchemaRegistryEntry(entry: InsertSchemaRegistry) { return this.executeWithFallback(s => s.createSchemaRegistryEntry(entry)); }
  async updateSchemaRegistryEntry(id: number, entry: Partial<InsertSchemaRegistry>) { return this.executeWithFallback(s => s.updateSchemaRegistryEntry(id, entry)); }
  async deleteSchemaRegistryEntry(id: number) { return this.executeWithFallback(s => s.deleteSchemaRegistryEntry(id)); }

  // Route Registry
  async getRouteRegistry() { return this.executeWithFallback(s => s.getRouteRegistry()); }
  async getRouteRegistryEntry(id: number) { return this.executeWithFallback(s => s.getRouteRegistryEntry(id)); }
  async getRouteRegistryEntryByPath(path: string) { return this.executeWithFallback(s => s.getRouteRegistryEntryByPath(path)); }
  async createRouteRegistryEntry(entry: InsertRouteRegistry) { return this.executeWithFallback(s => s.createRouteRegistryEntry(entry)); }
  async updateRouteRegistryEntry(id: number, entry: Partial<InsertRouteRegistry>) { return this.executeWithFallback(s => s.updateRouteRegistryEntry(id, entry)); }
  async deleteRouteRegistryEntry(id: number) { return this.executeWithFallback(s => s.deleteRouteRegistryEntry(id)); }
}

export const storage = new FallbackStorage();

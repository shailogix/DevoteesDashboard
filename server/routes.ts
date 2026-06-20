import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { MemoryStorage } from "./memoryStorage";
// import { setupAuth, isAuthenticated } from "./replitAuth";

import { randomBytes } from "crypto";

// Mock authentication for development
const isAuthenticated = (req: any, res: any, next: any) => {
  req.user = { claims: { sub: 'dev-user-1' } };
  next();
};

// GOD Mode session management — server-side authorization for privileged admin endpoints
const godModeTokens = new Set<string>();
const GOD_MODE_PASSWORD = "DevelopZ";

const requireGodMode = (req: any, res: any, next: any) => {
  const token = req.headers['x-god-mode-token'] as string | undefined;
  if (!token || !godModeTokens.has(token)) {
    return res.status(403).json({
      message: "GOD Mode access required. Activate Developer Mode to access this endpoint.",
      code: "GOD_MODE_REQUIRED"
    });
  }
  next();
};
import {
  insertDevoteeSchema,
  insertFamilySchema,
  insertMentorSchema,
  insertAttendanceSchema,
  insertDonationSchema,
  insertEventSchema,
  insertVolunteeringSchema,
  insertGroupSchema,
  insertGroupEntrySchema,
  insertMandalSchema,
  insertSabhaLocationSchema,
  insertDashboardLayoutSchema,
  insertUserPreferencesSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - temporarily disabled for development
  // await setupAuth(app);

  // Temporary mock auth for development
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // For development, return a mock user
      const mockUser = {
        id: 'dev-user-1',
        email: 'dev@example.com',
        firstName: 'Dev',
        lastName: 'User',
        profileImageUrl: null,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      res.json(mockUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Devotee routes - temporarily remove auth middleware
  app.get('/api/devotees', async (req, res) => {
    try {
      const devotees = await storage.getDevotees();
      res.json(devotees);
    } catch (error) {
      console.error("Error fetching devotees:", error);
      res.status(500).json({ message: "Failed to fetch devotees" });
    }
  });

  app.get('/api/devotees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const devotee = await storage.getDevotee(id);
      if (!devotee) {
        return res.status(404).json({ message: "Devotee not found" });
      }
      res.json(devotee);
    } catch (error) {
      console.error("Error fetching devotee:", error);
      res.status(500).json({ message: "Failed to fetch devotee" });
    }
  });

  app.post('/api/devotees', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDevoteeSchema.parse(req.body);
      const devotee = await storage.createDevotee(validatedData);
      res.status(201).json(devotee);
    } catch (error) {
      console.error("Error creating devotee:", error);
      res.status(400).json({ message: "Invalid devotee data" });
    }
  });

  app.put('/api/devotees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDevoteeSchema.partial().parse(req.body);
      const devotee = await storage.updateDevotee(id, validatedData);
      res.json(devotee);
    } catch (error) {
      console.error("Error updating devotee:", error);
      res.status(400).json({ message: "Invalid devotee data" });
    }
  });

  app.delete('/api/devotees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDevotee(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Devotee not found" });
      }
    } catch (error) {
      console.error("Error deleting devotee:", error);
      res.status(500).json({ message: "Failed to delete devotee" });
    }
  });

  // Devotee family members
  app.get('/api/devotees/:id/family', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const devotee = await storage.getDevotee(id);
      if (!devotee || !devotee.familyId) return res.json([]);
      const members = await storage.getDevoteesByFamily(devotee.familyId);
      res.json(members.filter((m: any) => m.id !== id));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });

  // Devotee analytics (attendance, donations, volunteering)
  app.get('/api/devotees/:id/analytics', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [attendance, donations, volunteering] = await Promise.all([
        storage.getAttendance(id),
        storage.getDonations(id),
        storage.getVolunteering(id),
      ]);
      res.json({ attendance, donations, volunteering });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Family routes
  app.get('/api/families', isAuthenticated, async (req, res) => {
    try {
      const families = await storage.getFamilies();
      res.json(families);
    } catch (error) {
      console.error("Error fetching families:", error);
      res.status(500).json({ message: "Failed to fetch families" });
    }
  });

  app.post('/api/families', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertFamilySchema.parse(req.body);
      const family = await storage.createFamily(validatedData);
      res.status(201).json(family);
    } catch (error) {
      console.error("Error creating family:", error);
      res.status(400).json({ message: "Invalid family data" });
    }
  });

  // Mentor routes
  app.get('/api/mentors', isAuthenticated, async (req, res) => {
    try {
      const mentors = await storage.getMentors();
      res.json(mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });

  app.post('/api/mentors', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMentorSchema.parse(req.body);
      const mentor = await storage.createMentor(validatedData);
      res.status(201).json(mentor);
    } catch (error) {
      console.error("Error creating mentor:", error);
      res.status(400).json({ message: "Invalid mentor data" });
    }
  });

  // Attendance routes
  app.get('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const devoteeId = req.query.devoteeId ? parseInt(req.query.devoteeId as string) : undefined;
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      const attendance = await storage.getAttendance(devoteeId, eventId);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse({
        ...req.body,
        recordedBy: req.user.claims.sub,
      });
      const attendance = await storage.createAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error creating attendance:", error);
      res.status(400).json({ message: "Invalid attendance data" });
    }
  });

  // Donation routes
  app.get('/api/donations', isAuthenticated, async (req, res) => {
    try {
      const devoteeId = req.query.devoteeId ? parseInt(req.query.devoteeId as string) : undefined;
      const donations = await storage.getDonations(devoteeId);
      res.json(donations);
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  app.post('/api/donations', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertDonationSchema.parse({
        ...req.body,
        recordedBy: req.user.claims.sub,
      });
      const donation = await storage.createDonation(validatedData);
      res.status(201).json(donation);
    } catch (error) {
      console.error("Error creating donation:", error);
      res.status(400).json({ message: "Invalid donation data" });
    }
  });

  // Event routes
  app.get('/api/events', isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.put('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.post('/api/events/:id/archive', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.archiveEvent(id);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to archive event" });
    }
  });

  app.post('/api/events/:id/unarchive', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.unarchiveEvent(id);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to unarchive event" });
    }
  });

  app.post('/api/events/auto-archive', isAuthenticated, async (req, res) => {
    try {
      const count = await storage.autoArchivePastEvents();
      res.json({ archived: count });
    } catch (error) {
      res.status(500).json({ message: "Failed to auto-archive events" });
    }
  });

  // Volunteering routes
  app.get('/api/volunteering', isAuthenticated, async (req, res) => {
    try {
      const devoteeId = req.query.devoteeId ? parseInt(req.query.devoteeId as string) : undefined;
      const volunteering = await storage.getVolunteering(devoteeId);
      res.json(volunteering);
    } catch (error) {
      console.error("Error fetching volunteering:", error);
      res.status(500).json({ message: "Failed to fetch volunteering" });
    }
  });

  app.post('/api/volunteering', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVolunteeringSchema.parse(req.body);
      const volunteering = await storage.createVolunteering(validatedData);
      res.status(201).json(volunteering);
    } catch (error) {
      console.error("Error creating volunteering:", error);
      res.status(400).json({ message: "Invalid volunteering data" });
    }
  });

  // Group routes
  app.get('/api/groups', isAuthenticated, async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post('/api/groups', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(400).json({ message: "Invalid group data" });
    }
  });

  app.put('/api/groups/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertGroupSchema.partial().parse(req.body);
      const group = await storage.updateGroup(id, validatedData);
      res.json(group);
    } catch (error) {
      console.error("Error updating group:", error);
      res.status(400).json({ message: "Invalid group data" });
    }
  });

  app.delete('/api/groups/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGroup(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).json({ message: "Failed to delete group" });
    }
  });

  // Group entries routes
  app.get('/api/group-entries', isAuthenticated, async (req, res) => {
    try {
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
      const entries = await storage.getGroupEntries(groupId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching group entries:", error);
      res.status(500).json({ message: "Failed to fetch group entries" });
    }
  });

  app.post('/api/group-entries', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertGroupEntrySchema.parse(req.body);
      const entry = await storage.createGroupEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating group entry:", error);
      res.status(400).json({ message: "Invalid group entry data" });
    }
  });

  // Mandal routes
  app.get('/api/mandals', isAuthenticated, async (req, res) => {
    try {
      const mandals = await storage.getMandals();
      res.json(mandals);
    } catch (error) {
      console.error("Error fetching mandals:", error);
      res.status(500).json({ message: "Failed to fetch mandals" });
    }
  });

  app.post('/api/mandals', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMandalSchema.parse(req.body);
      const mandal = await storage.createMandal(validatedData);
      res.status(201).json(mandal);
    } catch (error) {
      console.error("Error creating mandal:", error);
      res.status(400).json({ message: "Invalid mandal data" });
    }
  });

  // Sabha location routes
  app.get('/api/sabha-locations', isAuthenticated, async (req, res) => {
    try {
      const locations = await storage.getSabhaLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching sabha locations:", error);
      res.status(500).json({ message: "Failed to fetch sabha locations" });
    }
  });

  app.post('/api/sabha-locations', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSabhaLocationSchema.parse(req.body);
      const location = await storage.createSabhaLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating sabha location:", error);
      res.status(400).json({ message: "Invalid sabha location data" });
    }
  });

  // Dashboard layout routes
  app.get('/api/dashboard-layouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const layouts = await storage.getDashboardLayouts(userId);
      res.json(layouts);
    } catch (error) {
      console.error("Error fetching dashboard layouts:", error);
      res.status(500).json({ message: "Failed to fetch dashboard layouts" });
    }
  });

  app.post('/api/dashboard-layouts', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertDashboardLayoutSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
      });
      const layout = await storage.createDashboardLayout(validatedData);
      res.status(201).json(layout);
    } catch (error) {
      console.error("Error creating dashboard layout:", error);
      res.status(400).json({ message: "Invalid dashboard layout data" });
    }
  });

  // User preferences routes
  app.get('/api/user-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.post('/api/user-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
      });
      const preferences = await storage.upsertUserPreferences(validatedData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(400).json({ message: "Invalid user preferences data" });
    }
  });

  // Analytics routes
  app.get('/api/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/analytics', isAuthenticated, async (req, res) => {
    try {
      const [stats, donationTrends, attendanceTrends, volunteeringStats] = await Promise.all([
        storage.getStats(),
        storage.getDonationTrends(),
        storage.getAttendanceTrends(),
        storage.getVolunteeringStats(),
      ]);
      res.json({ stats, donationTrends, attendanceTrends, volunteeringStats });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Extended family routes
  app.put('/api/families/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFamilySchema.partial().parse(req.body);
      const family = await storage.updateFamily(id, validatedData);
      res.json(family);
    } catch (error) {
      console.error("Error updating family:", error);
      res.status(400).json({ message: "Failed to update family" });
    }
  });

  app.delete('/api/families/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFamily(id);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete family" });
    }
  });

  // Extended mentor routes
  app.get('/api/mentors/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mentor = await storage.getMentor(id);
      if (!mentor) return res.status(404).json({ message: "Mentor not found" });
      res.json(mentor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mentor" });
    }
  });

  app.put('/api/mentors/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mentor = await storage.updateMentor(id, req.body);
      res.json(mentor);
    } catch (error) {
      console.error("Error updating mentor:", error);
      res.status(400).json({ message: "Failed to update mentor" });
    }
  });

  app.delete('/api/mentors/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMentor(id);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete mentor" });
    }
  });

  // Extended donation routes
  app.put('/api/donations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.updateDonation(id, req.body);
      res.json(donation);
    } catch (error) {
      console.error("Error updating donation:", error);
      res.status(400).json({ message: "Failed to update donation" });
    }
  });

  app.delete('/api/donations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDonation(id);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete donation" });
    }
  });

  // Extended volunteering routes
  app.put('/api/volunteering/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vol = await storage.updateVolunteering(id, req.body);
      res.json(vol);
    } catch (error) {
      res.status(400).json({ message: "Failed to update volunteering record" });
    }
  });

  app.delete('/api/volunteering/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVolunteering(id);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete volunteering record" });
    }
  });

  // Attendance update/delete
  app.put('/api/attendance/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const att = await storage.updateAttendance(id, req.body);
      res.json(att);
    } catch (error) {
      res.status(400).json({ message: "Failed to update attendance" });
    }
  });

  app.delete('/api/attendance/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAttendance(id);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete attendance" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-1';
      const ms = (storage as any).memStore as MemoryStorage;
      const notifications = ms.getNotifications ? ms.getNotifications(userId) : [];
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-1';
      const ms = (storage as any).memStore as MemoryStorage;
      const notification = ms.createNotification ? ms.createNotification({ ...req.body, userId }) : null;
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ms = (storage as any).memStore as MemoryStorage;
      const notification = ms.markNotificationRead ? ms.markNotificationRead(id) : null;
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'dev-user-1';
      const ms = (storage as any).memStore as MemoryStorage;
      if (ms.markAllNotificationsRead) ms.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ms = (storage as any).memStore as MemoryStorage;
      const success = ms.deleteNotification ? ms.deleteNotification(id) : false;
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.put('/api/notifications/:id/pin', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ms = (storage as any).memStore as MemoryStorage;
      const updated = ms.pinNotification(id);
      if (!updated) return res.status(404).json({ message: "Notification not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to pin notification" });
    }
  });

  app.put('/api/notifications/:id/unpin', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ms = (storage as any).memStore as MemoryStorage;
      const updated = ms.unpinNotification(id);
      if (!updated) return res.status(404).json({ message: "Notification not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to unpin notification" });
    }
  });

  // Document routes — GET is authenticated; write ops require GOD Mode authorization
  app.get('/api/devotees/:id/documents', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ms = (storage as any).memStore as MemoryStorage;
      const docs = ms.getDocuments(id);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/devotees/:id/documents', requireGodMode, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { type, filename, base64 } = req.body;
      if (!type || !filename || !base64) {
        return res.status(400).json({ message: "type, filename, and base64 are required" });
      }
      const ms = (storage as any).memStore as MemoryStorage;
      const doc = ms.addDocument(id, { type, filename, base64 });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: "Failed to add document" });
    }
  });

  app.delete('/api/devotees/:id/documents/:docId', requireGodMode, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { docId } = req.params;
      const ms = (storage as any).memStore as MemoryStorage;
      const success = ms.deleteDocument(id, docId);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Users management routes (admin/manager)
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const ms = (storage as any).memStore as MemoryStorage;
      const users = ms.getAllUsers ? ms.getAllUsers() : [];
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = req.params.id;
      const user = await storage.upsertUser({ id, ...req.body });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  // Dev mode config (store/retrieve application config)
  const devConfig: Record<string, any> = {
    appInfo: {
      name: "Madhav Parivar",
      subtitle: "Devotional Community Management",
      logoSymbol: "॥",
      logoGradientFrom: "primary",
      logoGradientTo: "secondary",
    },
    navigation: {
      items: [
        { id: "dashboard", name: "Dashboard", href: "/", icon: "Home", visible: true, order: 0 },
        { id: "devotees", name: "Devotees", href: "/devotees", icon: "Users", visible: true, order: 1 },
        { id: "families", name: "Families", href: "/families", icon: "Building", visible: true, order: 2 },
        { id: "mentors", name: "Mentors", href: "/mentors", icon: "GraduationCap", visible: true, order: 3 },
        { id: "attendance", name: "Attendance", href: "/attendance", icon: "Calendar", visible: true, order: 4 },
        { id: "donations", name: "Donations", href: "/donations", icon: "Heart", visible: true, order: 5 },
        { id: "events", name: "Events", href: "/events", icon: "CalendarDays", visible: true, order: 6 },
        { id: "volunteering", name: "Volunteering", href: "/volunteering", icon: "HandHeart", visible: true, order: 7 },
        { id: "analytics", name: "Analytics", href: "/analytics", icon: "BarChart3", visible: true, order: 8 },
        { id: "id-cards", name: "ID Card Generator", href: "/id-cards", icon: "CreditCard", visible: true, order: 9 },
        { id: "settings", name: "Settings", href: "/settings", icon: "Settings", visible: true, order: 10 },
      ],
    },
    theme: {
      activePreset: "devotional",
      customColors: {
        primary: "24 100% 60%",
        secondary: "343 100% 25%",
        accent: "51 100% 50%",
        background: "60 29% 94%",
        foreground: "210 20% 18%",
        card: "0 0% 100%",
        border: "20 5.9% 90%",
        muted: "54 23% 89%",
      },
      borderRadius: "0.5",
      useCustom: false,
    },
    customFields: [
      { id: "spiritual_name", label: "Spiritual Name", type: "text", entity: "devotee", required: false, placeholder: "Enter spiritual name" },
      { id: "initiation_date", label: "Initiation Date", type: "date", entity: "devotee", required: false, placeholder: "" },
      { id: "preferred_seva", label: "Preferred Seva", type: "dropdown", entity: "devotee", required: false, options: ["Puja", "Kitchen", "Outreach", "Education", "Music", "IT Support"], placeholder: "Select seva" },
    ],
    roleProfiles: {
      admin: {
        label: "Administrator",
        visiblePages: ["dashboard","devotees","families","mentors","attendance","donations","events","volunteering","analytics","id-cards","settings","dev-studio"],
        canEdit: true,
        canDelete: true,
      },
      manager: {
        label: "Manager",
        visiblePages: ["dashboard","devotees","families","mentors","attendance","donations","events","volunteering","analytics","id-cards"],
        canEdit: true,
        canDelete: false,
      },
      volunteer: {
        label: "Volunteer",
        visiblePages: ["dashboard","devotees","attendance","events"],
        canEdit: false,
        canDelete: false,
      },
    },
    snapshots: [] as Array<{ id: string; name: string; createdAt: string; config: any }>,
    featureFlags: {
      donations: true,
      analytics: true,
      volunteering: true,
      idCards: true,
      groups: true,
      mentors: true,
      events: true,
      attendance: true,
    } as Record<string, boolean>,
    receiptTemplate: {
      orgName: "Madhav Parivar",
      orgSubtitle: "Devotional Community Management",
      orgAddress: "Community Hall, Athwa, Surat, Gujarat - 395001",
      orgPhone: "+91 98765 43210",
      orgEmail: "info@madhavparivar.org",
      orgWebsite: "www.madhavparivar.org",
      orgRegNo: "Trust Reg. No. MP/2020/001",
      section80G: "80G Certificate No. MP/80G/2020",
      authorizedSignatory: "Community Administrator",
      receiptFooter: "Jai Shri Krishna • This receipt is computer generated and is valid without signature.",
      showLogo: true,
      logoText: "॥ MP ॥",
      primaryColor: "#b45309",
      receiptTitle: "Donation Receipt",
    },
    analyticsDashboards: [] as Array<{ id: string; title: string; icon: string; panels: any[] }>,
    cardThemes: [] as Array<{ id: string; name: string; colors: any; logo?: string; bgImage?: string }>,
    visualOverrides: {} as Record<string, any>,
    rollbackSlots: [] as Array<{ index: number; name: string; savedAt: string; overrides: Record<string, any> }>,
    rollbackNextIndex: 0,
  };

  // ─── GOD MODE SESSION ACTIVATION ────────────────────────────────────────────
  app.post('/api/admin/activate', isAuthenticated, async (req, res) => {
    const { password } = req.body;
    if (password !== GOD_MODE_PASSWORD) {
      return res.status(401).json({ message: "Invalid GOD Mode password" });
    }
    const token = randomBytes(32).toString('hex');
    godModeTokens.add(token);
    res.json({ token, message: "GOD Mode activated" });
  });

  app.delete('/api/admin/activate', (req, res) => {
    const token = req.headers['x-god-mode-token'] as string | undefined;
    if (token) godModeTokens.delete(token);
    res.json({ message: "GOD Mode deactivated" });
  });

  app.get('/api/dev-config', isAuthenticated, async (req, res) => {
    res.json(devConfig);
  });

  app.put('/api/dev-config', isAuthenticated, async (req, res) => {
    Object.assign(devConfig, req.body);
    res.json(devConfig);
  });

  app.patch('/api/dev-config/app-info', isAuthenticated, async (req, res) => {
    devConfig.appInfo = { ...devConfig.appInfo, ...req.body };
    res.json(devConfig.appInfo);
  });

  app.patch('/api/dev-config/navigation', isAuthenticated, async (req, res) => {
    devConfig.navigation = { ...devConfig.navigation, ...req.body };
    res.json(devConfig.navigation);
  });

  app.patch('/api/dev-config/theme', isAuthenticated, async (req, res) => {
    devConfig.theme = { ...devConfig.theme, ...req.body };
    res.json(devConfig.theme);
  });

  app.patch('/api/dev-config/custom-fields', isAuthenticated, async (req, res) => {
    devConfig.customFields = req.body.fields;
    res.json(devConfig.customFields);
  });

  app.patch('/api/dev-config/role-profiles', isAuthenticated, async (req, res) => {
    devConfig.roleProfiles = { ...devConfig.roleProfiles, ...req.body };
    res.json(devConfig.roleProfiles);
  });

  app.post('/api/dev-config/snapshot', isAuthenticated, async (req, res) => {
    const { name } = req.body;
    const snapshot = {
      id: `snap_${Date.now()}`,
      name: name || `Snapshot ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      config: JSON.parse(JSON.stringify({ appInfo: devConfig.appInfo, navigation: devConfig.navigation, theme: devConfig.theme, customFields: devConfig.customFields, roleProfiles: devConfig.roleProfiles })),
    };
    devConfig.snapshots.unshift(snapshot);
    if (devConfig.snapshots.length > 10) devConfig.snapshots.pop();
    res.json(snapshot);
  });

  app.post('/api/dev-config/restore/:snapshotId', isAuthenticated, async (req, res) => {
    const snap = devConfig.snapshots.find((s: any) => s.id === req.params.snapshotId);
    if (!snap) return res.status(404).json({ message: "Snapshot not found" });
    Object.assign(devConfig, snap.config);
    res.json({ message: "Restored", config: snap.config });
  });

  app.get('/api/dev-config/export', isAuthenticated, async (req, res) => {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      appInfo: devConfig.appInfo,
      navigation: devConfig.navigation,
      theme: devConfig.theme,
      customFields: devConfig.customFields,
      roleProfiles: devConfig.roleProfiles,
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="madhav-parivar-config.json"');
    res.json(exportData);
  });

  app.post('/api/dev-config/import', isAuthenticated, async (req, res) => {
    try {
      const { appInfo, navigation, theme, customFields, roleProfiles } = req.body;
      if (appInfo) devConfig.appInfo = appInfo;
      if (navigation) devConfig.navigation = navigation;
      if (theme) devConfig.theme = theme;
      if (customFields) devConfig.customFields = customFields;
      if (roleProfiles) devConfig.roleProfiles = roleProfiles;
      res.json({ message: "Config imported successfully", config: devConfig });
    } catch (e) {
      res.status(400).json({ message: "Invalid config format" });
    }
  });

  // ─── GOD MODE: AUDIT LOG ───────────────────────────────────────────────────
  const auditLog: any[] = [];
  const addAudit = (action: string, entity: string, entityId: any, userId: string, before: any, after: any) => {
    auditLog.unshift({ id: auditLog.length + 1, timestamp: new Date().toISOString(), action, entity, entityId, userId, before, after });
    if (auditLog.length > 500) auditLog.pop();
  };
  (app as any)._addAudit = addAudit;

  app.get('/api/admin/audit', isAuthenticated, async (req: any, res) => {
    const { entity, action, limit = "100" } = req.query;
    let logs = [...auditLog];
    if (entity) logs = logs.filter(l => l.entity === entity);
    if (action) logs = logs.filter(l => l.action === action);
    res.json(logs.slice(0, Number(limit)));
  });

  // ─── GOD MODE: MACROS ──────────────────────────────────────────────────────
  const macros: any[] = [];
  let macroIdCounter = 1;

  app.get('/api/admin/macros', isAuthenticated, async (_req, res) => res.json(macros));

  app.post('/api/admin/macros', isAuthenticated, async (req: any, res) => {
    const macro = { id: macroIdCounter++, ...req.body, createdAt: new Date().toISOString(), runCount: 0, lastRunAt: null };
    macros.unshift(macro);
    res.status(201).json(macro);
  });

  app.put('/api/admin/macros/:id', isAuthenticated, async (req: any, res) => {
    const idx = macros.findIndex(m => m.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ message: "Macro not found" });
    macros[idx] = { ...macros[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json(macros[idx]);
  });

  app.delete('/api/admin/macros/:id', isAuthenticated, async (req, res) => {
    const idx = macros.findIndex(m => m.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ message: "Macro not found" });
    macros.splice(idx, 1);
    res.json({ message: "Macro deleted" });
  });

  app.post('/api/admin/macros/:id/run', isAuthenticated, async (req: any, res) => {
    const macro = macros.find(m => m.id === Number(req.params.id));
    if (!macro) return res.status(404).json({ message: "Macro not found" });
    const results: any[] = [];
    for (const step of (macro.steps || [])) {
      try {
        if (step.type === "create_devotee" && step.data) {
          const d = await storage.createDevotee(step.data);
          addAudit("CREATE", "devotee", d.id, req.user?.claims?.sub || "macro", null, d);
          results.push({ step: step.label, status: "ok", result: d });
        } else if (step.type === "create_event" && step.data) {
          const e = await storage.createEvent(step.data);
          addAudit("CREATE", "event", e.id, req.user?.claims?.sub || "macro", null, e);
          results.push({ step: step.label, status: "ok", result: e });
        } else if (step.type === "create_attendance" && step.data) {
          const a = await storage.createAttendance(step.data);
          addAudit("CREATE", "attendance", a.id, req.user?.claims?.sub || "macro", null, a);
          results.push({ step: step.label, status: "ok", result: a });
        } else {
          results.push({ step: step.label || "unknown", status: "skipped", note: "Step type not supported" });
        }
      } catch (err: any) {
        results.push({ step: step.label || "unknown", status: "error", error: err.message });
      }
    }
    macro.runCount = (macro.runCount || 0) + 1;
    macro.lastRunAt = new Date().toISOString();
    addAudit("RUN_MACRO", "macro", macro.id, req.user?.claims?.sub || "system", null, { name: macro.name, steps: macro.steps?.length });
    res.json({ macro: macro.name, results, ranAt: macro.lastRunAt });
  });

  // ─── GOD MODE: BULK OPERATIONS ─────────────────────────────────────────────
  app.post('/api/admin/bulk', isAuthenticated, async (req: any, res) => {
    const { entity, operation, ids, data } = req.body;
    const userId = req.user?.claims?.sub || "system";
    const results: any[] = [];
    try {
      for (const id of (ids || [])) {
        if (entity === "devotees") {
          if (operation === "delete") {
            const before = await storage.getDevotee(id);
            await storage.deleteDevotee(id);
            addAudit("DELETE", "devotee", id, userId, before, null);
            results.push({ id, status: "deleted" });
          } else if (operation === "update" && data) {
            const before = await storage.getDevotee(id);
            const after = await storage.updateDevotee(id, data);
            addAudit("UPDATE", "devotee", id, userId, before, after);
            results.push({ id, status: "updated" });
          }
        } else if (entity === "events") {
          if (operation === "delete") {
            const before = await storage.getEvent(id);
            await storage.deleteEvent(id);
            addAudit("DELETE", "event", id, userId, before, null);
            results.push({ id, status: "deleted" });
          }
        } else if (entity === "attendance") {
          if (operation === "delete") {
            await storage.deleteAttendance(id);
            addAudit("DELETE", "attendance", id, userId, null, null);
            results.push({ id, status: "deleted" });
          }
        }
      }
      res.json({ operation, entity, count: results.length, results });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── GOD MODE: FULL DATA EXPORT ────────────────────────────────────────────
  app.get('/api/admin/export/data', isAuthenticated, async (req, res) => {
    try {
      const [devotees, families, events, attendance, donations, volunteering, mentors, groups, mandals, locations] = await Promise.all([
        storage.getDevotees(),
        storage.getFamilies(),
        storage.getEvents(),
        storage.getAttendance(),
        storage.getDonations(),
        storage.getVolunteering(),
        storage.getMentors(),
        storage.getGroups(),
        storage.getMandals(),
        storage.getSabhaLocations(),
      ]);
      const exportData = {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        appName: "Madhav Parivar",
        counts: { devotees: devotees.length, families: families.length, events: events.length, attendance: attendance.length, donations: donations.length, volunteering: volunteering.length },
        data: { devotees, families, events, attendance, donations, volunteering, mentors, groups, mandals, sabhaLocations: locations },
      };
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="madhav-parivar-data-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ─── GOD MODE: FULL DATA IMPORT ────────────────────────────────────────────
  app.post('/api/admin/import/data', isAuthenticated, async (req: any, res) => {
    try {
      const { data } = req.body;
      const userId = req.user?.claims?.sub || "system";
      const results: Record<string, number> = {};
      if (data?.devotees) {
        for (const d of data.devotees) {
          try { await storage.createDevotee(d); results.devotees = (results.devotees || 0) + 1; } catch {}
        }
      }
      if (data?.families) {
        for (const f of data.families) {
          try { await storage.createFamily(f); results.families = (results.families || 0) + 1; } catch {}
        }
      }
      if (data?.events) {
        for (const e of data.events) {
          try { await storage.createEvent(e); results.events = (results.events || 0) + 1; } catch {}
        }
      }
      addAudit("IMPORT_DATA", "system", null, userId, null, results);
      res.json({ message: "Data imported successfully", imported: results });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── GOD MODE: RELATIONAL DATA ─────────────────────────────────────────────
  app.get('/api/admin/relations/:entity/:id', isAuthenticated, async (req, res) => {
    const { entity, id } = req.params;
    const numId = Number(id);
    try {
      if (entity === "devotee") {
        const devotee = await storage.getDevotee(numId);
        if (!devotee) return res.status(404).json({ message: "Not found" });
        const [family, mentor, attendance, donations, volunteering] = await Promise.all([
          devotee.familyId ? storage.getFamily(devotee.familyId) : null,
          devotee.mentorId ? storage.getMentor(devotee.mentorId) : null,
          storage.getAttendance(numId),
          storage.getDonations(numId),
          storage.getVolunteering(numId),
        ]);
        res.json({ devotee, family, mentor, attendanceCount: attendance.length, donationsCount: donations.length, volunteeringCount: volunteering.length, attendanceRate: attendance.length ? Math.round((attendance.filter((a: any) => a.status === "present").length / attendance.length) * 100) : 0 });
      } else if (entity === "family") {
        const family = await storage.getFamily(numId);
        if (!family) return res.status(404).json({ message: "Not found" });
        const members = await storage.getDevoteesByFamily(numId);
        res.json({ family, members, memberCount: members.length });
      } else if (entity === "event") {
        const event = await storage.getEvent(numId);
        if (!event) return res.status(404).json({ message: "Not found" });
        const attendance = (await storage.getAttendance(undefined, numId));
        const presentCount = attendance.filter((a: any) => a.status === "present").length;
        res.json({ event, attendanceCount: attendance.length, presentCount, attendanceRate: attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0 });
      } else {
        res.status(400).json({ message: "Unknown entity type" });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ─── GOD MODE: LINK DEVOTEE TO FAMILY/MENTOR ──────────────────────────────
  app.patch('/api/admin/link', isAuthenticated, async (req: any, res) => {
    const { devoteeId, familyId, mentorId } = req.body;
    const userId = req.user?.claims?.sub || "system";
    try {
      const before = await storage.getDevotee(devoteeId);
      const updates: any = {};
      if (familyId !== undefined) updates.familyId = familyId;
      if (mentorId !== undefined) updates.mentorId = mentorId;
      const after = await storage.updateDevotee(devoteeId, updates);
      addAudit("LINK", "devotee", devoteeId, userId, before, after);
      res.json(after);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── PATCH ALIASES (for all entities — fixes DataBrowser PATCH calls) ──────
  app.patch('/api/devotees/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDevoteeSchema.partial().parse(req.body);
      const devotee = await storage.updateDevotee(id, validatedData);
      res.json(devotee);
    } catch (error) { res.status(400).json({ message: "Invalid devotee data" }); }
  });
  app.patch('/api/families/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFamilySchema.partial().parse(req.body);
      const family = await storage.updateFamily(id, validatedData);
      res.json(family);
    } catch (error) { res.status(400).json({ message: "Invalid family data" }); }
  });
  app.patch('/api/mentors/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mentor = await storage.updateMentor(id, req.body);
      res.json(mentor);
    } catch (error) { res.status(400).json({ message: "Invalid mentor data" }); }
  });
  app.patch('/api/donations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.updateDonation(id, req.body);
      res.json(donation);
    } catch (error) { res.status(400).json({ message: "Invalid donation data" }); }
  });
  app.patch('/api/volunteering/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vol = await storage.updateVolunteering(id, req.body);
      res.json(vol);
    } catch (error) { res.status(400).json({ message: "Invalid volunteering data" }); }
  });
  app.patch('/api/attendance/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const att = await storage.updateAttendance(id, req.body);
      res.json(att);
    } catch (error) { res.status(400).json({ message: "Invalid attendance data" }); }
  });
  app.patch('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, validatedData);
      res.json(event);
    } catch (error) { res.status(400).json({ message: "Invalid event data" }); }
  });

  // ─── FAMILY MEMBERS ─────────────────────────────────────────────────────────
  app.get('/api/families/:id/members', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const members = await storage.getDevoteesByFamily(id);
      res.json(members);
    } catch (error) { res.status(500).json({ message: "Failed to fetch family members" }); }
  });

  // ─── ADMIN: QUERY CONSOLE ───────────────────────────────────────────────────
  app.get('/api/admin/query', isAuthenticated, async (req, res) => {
    try {
      const { entity = "devotees", search = "", limit = "100" } = req.query as any;
      let data: any[] = [];
      switch (entity) {
        case "devotees": data = await storage.getDevotees(); break;
        case "families": data = await storage.getFamilies(); break;
        case "events": data = await storage.getEvents(); break;
        case "attendance": data = await storage.getAttendance(); break;
        case "donations": data = await storage.getDonations(); break;
        case "volunteering": data = await storage.getVolunteering(); break;
        case "mentors": data = await storage.getMentors(); break;
        case "groups": data = await storage.getGroups(); break;
        default: data = [];
      }
      if (search) {
        const q = search.toLowerCase();
        data = data.filter((row: any) =>
          Object.values(row).some(v => v && String(v).toLowerCase().includes(q))
        );
      }
      res.json({ entity, count: data.length, results: data.slice(0, Number(limit)) });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ─── ADMIN: FEATURE FLAGS ───────────────────────────────────────────────────
  app.get('/api/admin/feature-flags', isAuthenticated, async (_req, res) => {
    res.json(devConfig.featureFlags);
  });
  app.patch('/api/admin/feature-flags', isAuthenticated, requireGodMode, async (req, res) => {
    const allowed = ['donations','analytics','volunteering','idCards','groups','mentors','events','attendance'];
    for (const key of allowed) {
      if (key in req.body && typeof req.body[key] === 'boolean') {
        (devConfig.featureFlags as any)[key] = req.body[key];
      }
    }
    res.json(devConfig.featureFlags);
  });

  // ─── ADMIN: RECEIPT TEMPLATE ────────────────────────────────────────────────
  app.get('/api/admin/receipt-template', isAuthenticated, async (_req, res) => {
    res.json(devConfig.receiptTemplate);
  });
  app.patch('/api/admin/receipt-template', isAuthenticated, requireGodMode, async (req, res) => {
    devConfig.receiptTemplate = { ...devConfig.receiptTemplate, ...req.body };
    res.json(devConfig.receiptTemplate);
  });

  // ─── ADMIN: ANALYTICS DASHBOARDS ────────────────────────────────────────────
  app.get('/api/admin/analytics-dashboards', isAuthenticated, async (_req, res) => {
    res.json(devConfig.analyticsDashboards);
  });
  app.post('/api/admin/analytics-dashboards', isAuthenticated, requireGodMode, async (req, res) => {
    const dashboard = { ...req.body, id: `dash_${Date.now()}` };
    devConfig.analyticsDashboards.push(dashboard);
    res.json(dashboard);
  });
  app.put('/api/admin/analytics-dashboards/:id', isAuthenticated, requireGodMode, async (req, res) => {
    const idx = devConfig.analyticsDashboards.findIndex((d: any) => d.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Dashboard not found' });
    devConfig.analyticsDashboards[idx] = { ...devConfig.analyticsDashboards[idx], ...req.body };
    res.json(devConfig.analyticsDashboards[idx]);
  });
  app.delete('/api/admin/analytics-dashboards/:id', isAuthenticated, requireGodMode, async (req, res) => {
    devConfig.analyticsDashboards = devConfig.analyticsDashboards.filter((d: any) => d.id !== req.params.id);
    res.json({ deleted: true });
  });

  // ─── ADMIN: CARD THEMES ──────────────────────────────────────────────────────
  app.get('/api/admin/card-themes', isAuthenticated, async (_req, res) => {
    res.json(devConfig.cardThemes);
  });
  app.post('/api/admin/card-themes', isAuthenticated, requireGodMode, async (req, res) => {
    const theme = { ...req.body, id: `theme_${Date.now()}` };
    devConfig.cardThemes.push(theme);
    res.json(theme);
  });
  app.put('/api/admin/card-themes/:id', isAuthenticated, requireGodMode, async (req, res) => {
    const idx = devConfig.cardThemes.findIndex((t: any) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Theme not found' });
    devConfig.cardThemes[idx] = { ...devConfig.cardThemes[idx], ...req.body };
    res.json(devConfig.cardThemes[idx]);
  });
  app.delete('/api/admin/card-themes/:id', isAuthenticated, requireGodMode, async (req, res) => {
    devConfig.cardThemes = devConfig.cardThemes.filter((t: any) => t.id !== req.params.id);
    res.json({ deleted: true });
  });

  // ─── ADMIN: VISUAL OVERRIDES ────────────────────────────────────────────────
  app.get('/api/admin/visual-overrides', isAuthenticated, async (_req, res) => {
    res.json(devConfig.visualOverrides);
  });
  app.patch('/api/admin/visual-overrides', isAuthenticated, requireGodMode, async (req, res) => {
    Object.assign(devConfig.visualOverrides, req.body);
    res.json(devConfig.visualOverrides);
  });
  app.delete('/api/admin/visual-overrides', isAuthenticated, requireGodMode, async (_req, res) => {
    devConfig.visualOverrides = {};
    res.json({ cleared: true });
  });

  // ─── ADMIN: ROLLBACK SLOTS (5-slot circular buffer) ──────────────────────
  app.get('/api/admin/rollback-slots', isAuthenticated, async (_req, res) => {
    res.json({
      slots: devConfig.rollbackSlots,
      nextIndex: devConfig.rollbackNextIndex,
      currentOverrides: devConfig.visualOverrides,
    });
  });
  app.post('/api/admin/rollback-slots', isAuthenticated, requireGodMode, async (req, res) => {
    const { name } = req.body;
    const slotIndex = devConfig.rollbackNextIndex % 5;
    const slot = {
      index: slotIndex,
      name: name || `Save ${new Date().toLocaleString()}`,
      savedAt: new Date().toISOString(),
      overrides: JSON.parse(JSON.stringify(devConfig.visualOverrides)),
    };
    if (devConfig.rollbackSlots.length > slotIndex) {
      devConfig.rollbackSlots[slotIndex] = slot;
    } else {
      devConfig.rollbackSlots.push(slot);
    }
    devConfig.rollbackNextIndex = (devConfig.rollbackNextIndex + 1);
    res.json(slot);
  });
  app.post('/api/admin/rollback-slots/:index/restore', isAuthenticated, requireGodMode, async (req, res) => {
    const idx = parseInt(req.params.index);
    const slot = devConfig.rollbackSlots.find((s: any) => s.index === idx);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    devConfig.visualOverrides = JSON.parse(JSON.stringify(slot.overrides));
    res.json({ restored: true, slot, overrides: devConfig.visualOverrides });
  });

  // ─── ADMIN: SEED MANAGER ────────────────────────────────────────────────────
  app.get('/api/admin/seed/counts', isAuthenticated, async (_req, res) => {
    try {
      const [devotees, families, events, attendance, donations, volunteering, mentors, groups] = await Promise.all([
        storage.getDevotees(), storage.getFamilies(), storage.getEvents(),
        storage.getAttendance(), storage.getDonations(), storage.getVolunteering(),
        storage.getMentors(), storage.getGroups(),
      ]);
      res.json({
        devotees: devotees.length, families: families.length, events: events.length,
        attendance: attendance.length, donations: donations.length, volunteering: volunteering.length,
        mentors: mentors.length, groups: groups.length,
      });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.post('/api/admin/seed/reset', isAuthenticated, requireGodMode, async (req: any, res) => {
    try {
      const ms = (storage as any).memStore;
      if (ms && ms.resetAndReseed) {
        ms.resetAndReseed();
        addAudit("SEED_RESET", "system", null, req.user?.claims?.sub || "god-mode", null, { action: "Full reset and reseed" });
        res.json({ message: "Data reset and reseeded successfully" });
      } else {
        res.status(400).json({ message: "Reset not available (non-memory storage)" });
      }
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.post('/api/admin/seed/add', isAuthenticated, requireGodMode, async (req: any, res) => {
    try {
      const { count = 5, entity = "devotees" } = req.body;
      const userId = req.user?.claims?.sub || "god-mode";
      const created: any[] = [];
      for (let i = 0; i < Math.min(count, 50); i++) {
        const num = Math.floor(Math.random() * 9000) + 1000;
        if (entity === "devotees") {
          const names = ["Arjun", "Priya", "Ram", "Sita", "Krishna", "Radha", "Vishnu", "Lakshmi", "Shiva", "Parvati"];
          const lastNames = ["Sharma", "Patel", "Verma", "Gupta", "Singh", "Kumar", "Das", "Rao"];
          const first = names[Math.floor(Math.random() * names.length)];
          const last = lastNames[Math.floor(Math.random() * lastNames.length)];
          const d = await storage.createDevotee({
            devoteeId: `MP-T${num}`,
            firstName: first,
            lastName: last,
            email: `test.${num}@parivar.org`,
            isActive: true,
            spiritualLevel: ["Novice", "Practitioner", "Advanced"][Math.floor(Math.random() * 3)],
          } as any);
          addAudit("CREATE", "devotee", d.id, userId, null, d);
          created.push(d);
        } else if (entity === "events") {
          const titles = ["Satsang", "Puja", "Bhajan Night", "Seva Day", "Retreat"];
          const e = await storage.createEvent({
            title: `${titles[Math.floor(Math.random() * titles.length)]} ${num}`,
            eventType: "spiritual",
            startDate: new Date(Date.now() + Math.random() * 30 * 86400000),
            status: "planned",
            isActive: true,
          } as any);
          created.push(e);
        } else if (entity === "donations") {
          const methods = ["Cash", "Online", "Cheque"];
          const amounts = [101, 251, 501, 1001, 2001, 5001];
          const purposes = ["Temple Maintenance", "Festival Fund", "Education", "Medical Aid", "General Donation"];
          const d = await storage.createDonation({
            devoteeId: Math.ceil(Math.random() * 20),
            amount: amounts[Math.floor(Math.random() * amounts.length)].toString(),
            donationDate: new Date(Date.now() - Math.random() * 90 * 86400000),
            paymentMethod: methods[Math.floor(Math.random() * methods.length)],
            purpose: purposes[Math.floor(Math.random() * purposes.length)],
            isActive: true,
          } as any);
          created.push(d);
        } else if (entity === "volunteering") {
          const activities = ["Event Setup", "Prasad Preparation", "Decoration", "Registration", "Cleaning", "Sound System"];
          const v = await storage.createVolunteering({
            devoteeId: Math.ceil(Math.random() * 20),
            activityType: activities[Math.floor(Math.random() * activities.length)],
            hoursCompleted: Math.floor(Math.random() * 8) + 1,
            date: new Date(Date.now() - Math.random() * 60 * 86400000),
            status: "completed",
            isActive: true,
          } as any);
          created.push(v);
        }
      }
      res.json({ created: created.length, entity, message: `Added ${created.length} ${entity} records`, records: created });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  const httpServer = createServer(app);
  return httpServer;
}
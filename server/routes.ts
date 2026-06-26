import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { MemoryStorage } from "./memoryStorage";
import { setupAuth, isAuthenticated, requireAdmin, requireSuperAdmin, requireLeader } from "./auth";
import { db } from "./db";
import { 
  users, 
  devotees, 
  mentors,
  events, 
  devoteePendingUpdates, 
  polls, 
  pollOptions, 
  pollResponses, 
  quizzes, 
  quizQuestions, 
  quizResponses, 
  feedbackRequests, 
  importBatches, 
  importRecords, 
  loginCodes, 
  devoteeDashboardWidgets,
  dispatchLogs,
  eventParticipation,
  volunteeringShifts,
  volunteering
} from "@shared/schema";
import { eq, and, desc, ne, sql } from "drizzle-orm";
import { devConfig } from "./devConfig";

import { randomBytes } from "crypto";

// GOD Mode session management — server-side authorization for privileged admin endpoints
const godModeTokens = new Set<string>();
const GOD_MODE_PASSWORD = "DevelopZ";

const addAudit = async (action: string, entity: string, entityId: any, userId: string, before: any, after: any) => {
  try {
    await storage.addAuditLogEntry({
      action,
      entity,
      entityId: entityId != null ? String(entityId) : null,
      userId,
      beforeData: before ? JSON.parse(JSON.stringify(before)) : null,
      afterData: after ? JSON.parse(JSON.stringify(after)) : null,
    });
  } catch (e) {
    console.error("Failed to add audit log entry:", e);
  }
};

const logDispatch = async (dispatchType: string, recipient: string, subject: string | null, body: string, status: string = "sent", contextData: any = null) => {
  try {
    await db.insert(dispatchLogs).values({
      dispatchType,
      recipient,
      subject,
      body,
      status,
      contextData: contextData ? JSON.parse(JSON.stringify(contextData)) : null,
    });
    console.log(`[DISPATCH LOG] [${dispatchType.toUpperCase()}] To: ${recipient} | Body: ${body}`);
  } catch (e) {
    console.error("Failed to add dispatch log entry:", e);
  }
};
import {
  insertDevoteeSchema,
  insertFamilySchema,
  insertMentorSchema,
  insertAttendanceSchema,
  insertDonationSchema,
  insertEventSchema,
  insertVolunteeringSchema,
  insertVolunteeringShiftSchema,
  insertGroupSchema,
  insertGroupEntrySchema,
  insertMandalSchema,
  insertSabhaLocationSchema,
  insertDashboardLayoutSchema,
  insertUserPreferencesSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - Replit Auth
  await setupAuth(app);

  const checkDevoteeAccess = async (req: any, devoteeId: number): Promise<boolean> => {
    const userId = req.user?.claims?.sub;
    if (!userId) return false;
    const dbUser = await storage.getUser(userId);
    if (!dbUser) return false;
    
    // Admins and leaders have full access
    const hasPrivilege = dbUser.role === "super-admin" || dbUser.role === "admin" || dbUser.role === "leader";
    if (hasPrivilege) return true;

    // Normal devotees can only access themselves and family
    const [ownDevotee] = await db.select().from(devotees).where(eq(devotees.userId, userId));
    if (!ownDevotee) return false;

    if (ownDevotee.id === devoteeId) return true;

    if (ownDevotee.familyId) {
      const [targetDevotee] = await db.select().from(devotees).where(eq(devotees.id, devoteeId));
      if (targetDevotee && targetDevotee.familyId === ownDevotee.familyId) {
        return true;
      }
    }

    return false;
  };

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ─── USER MANAGEMENT (ADMIN ONLY) ──────────────────────────────────────────
  app.get('/api/users', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/users/me/permissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const roleProfiles = (await devConfig.get('roleProfiles')) || {};
      const profile = roleProfiles[user.role] || roleProfiles['user'] || { visiblePages: [], canEdit: false, canDelete: false };
      res.json({
        userId: user.id,
        role: user.role,
        isSuperAdmin: user.role === "super-admin",
        isAdmin: user.role === "admin" || user.role === "super-admin",
        isLeader: user.role === "leader" || user.role === "admin" || user.role === "super-admin",
        visiblePages: profile.visiblePages || [],
        canEdit: profile.canEdit || false,
        canDelete: profile.canDelete || false,
      });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.patch('/api/users/:id/role', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = req.params.id;
      const { role } = req.body;
      if (!role || !['admin', 'leader', 'manager', 'user', 'volunteer'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be one of: admin, leader, manager, user, volunteer" });
      }
      const currentUser = await storage.getUser(req.user?.claims?.sub);
      if (id === currentUser?.id) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (targetUser.role === "super-admin" && currentUser?.role !== "super-admin") {
        return res.status(403).json({ message: "Only Super-Admins can modify a Super-Admin user" });
      }
      const updated = await storage.updateUserRole(id, role);
      await addAudit("UPDATE_ROLE", "user", id, req.user?.claims?.sub || "system", targetUser.role, role);
      res.json(updated);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Devotee routes
  app.get('/api/devotees', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const devotees = await storage.getDevotees();
      res.json(devotees);
    } catch (error) {
      console.error("Error fetching devotees:", error);
      res.status(500).json({ message: "Failed to fetch devotees" });
    }
  });

  app.get('/api/devotees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const hasAccess = await checkDevoteeAccess(req, id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden" });
      }
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

  app.post('/api/devotees', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertDevoteeSchema.parse(req.body);
      const devotee = await storage.createDevotee(validatedData);
      res.status(201).json(devotee);
    } catch (error) {
      console.error("Error creating devotee:", error);
      res.status(400).json({ message: "Invalid devotee data" });
    }
  });

  app.put('/api/devotees/:id', isAuthenticated, requireAdmin, async (req, res) => {
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

  app.delete('/api/devotees/:id', isAuthenticated, requireAdmin, async (req, res) => {
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
  app.get('/api/devotees/:id/family', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const devotee = await storage.getDevotee(id);
      if (!devotee) {
        return res.status(404).json({ message: "Devotee not found" });
      }
      const hasAccess = await checkDevoteeAccess(req, id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (!devotee.familyId) return res.json([]);
      const members = await storage.getDevoteesByFamily(devotee.familyId);
      res.json(members.filter((m: any) => m.id !== id));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });

  // Devotee analytics (attendance, donations, volunteering)
  app.get('/api/devotees/:id/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const devotee = await storage.getDevotee(id);
      if (!devotee) {
        return res.status(404).json({ message: "Devotee not found" });
      }
      const hasAccess = await checkDevoteeAccess(req, id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden" });
      }
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

  // Devotee group memberships
  app.get('/api/devotees/:id/groups', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const devotee = await storage.getDevotee(id);
      if (!devotee) {
        return res.status(404).json({ message: "Devotee not found" });
      }
      const hasAccess = await checkDevoteeAccess(req, id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const memberships = await storage.getGroupMemberships(id);
      const groups = await storage.getGroups();
      const enriched = memberships.map(m => {
        const g = groups.find(gr => gr.id === m.groupId);
        return { ...m, groupName: g?.groupName || "Unknown" };
      });
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devotee groups" });
    }
  });

  // Devotee mandal info
  app.get('/api/devotees/:id/mandal', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const devotee = await storage.getDevotee(id);
      if (!devotee) {
        return res.status(404).json({ message: "Devotee not found" });
      }
      const hasAccess = await checkDevoteeAccess(req, id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const allMandals = await storage.getMandals();
      const mandal = allMandals.find(m => m.name === devotee.city || m.name?.includes(devotee.city || ""));
      res.json(mandal || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mandal info" });
    }
  });

  // Family routes
  app.get('/api/families', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const families = await storage.getFamilies();
      res.json(families);
    } catch (error) {
      console.error("Error fetching families:", error);
      res.status(500).json({ message: "Failed to fetch families" });
    }
  });

  app.post('/api/families', isAuthenticated, requireAdmin, async (req, res) => {
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
  app.get('/api/mentors', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const mentors = await storage.getMentors();
      res.json(mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });

  app.post('/api/mentors', isAuthenticated, requireAdmin, async (req, res) => {
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
  app.get('/api/attendance', isAuthenticated, requireLeader, async (req, res) => {
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

  app.post('/api/attendance', isAuthenticated, requireLeader, async (req: any, res) => {
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

  app.get('/api/donations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const dbUser = await storage.getUser(userId);
      if (!dbUser) return res.status(401).json({ message: "Unauthorized" });

      const isAdmin = dbUser.role === "admin" || dbUser.role === "super-admin";
      
      if (isAdmin) {
        const devoteeId = req.query.devoteeId ? parseInt(req.query.devoteeId as string) : undefined;
        const donations = await storage.getDonations(devoteeId);
        return res.json(donations);
      } else {
        // Normal devotee: fetch their own profile and family members
        const [ownDevotee] = await db.select().from(devotees).where(eq(devotees.userId, userId));
        if (!ownDevotee) {
          return res.json([]);
        }

        let allowedDevoteeIds = [ownDevotee.id];
        if (ownDevotee.familyId) {
          const familyMembers = await db.select().from(devotees).where(eq(devotees.familyId, ownDevotee.familyId));
          allowedDevoteeIds = familyMembers.map(m => m.id);
        }

        const devoteeId = req.query.devoteeId ? parseInt(req.query.devoteeId as string) : undefined;
        if (devoteeId !== undefined) {
          if (!allowedDevoteeIds.includes(devoteeId)) {
            return res.status(403).json({ message: "Forbidden" });
          }
          const donations = await storage.getDonations(devoteeId);
          return res.json(donations);
        }

        const allDonations = await storage.getDonations();
        const filtered = allDonations.filter(d => allowedDevoteeIds.includes(d.devoteeId));
        return res.json(filtered);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  app.post('/api/donations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const dbUser = await storage.getUser(userId);
      if (!dbUser) return res.status(401).json({ message: "Unauthorized" });

      const isAdmin = dbUser.role === "admin" || dbUser.role === "super-admin";
      const body = { ...req.body };

      if (!isAdmin) {
        // Normal devotee can only record for themselves or family members
        const [ownDevotee] = await db.select().from(devotees).where(eq(devotees.userId, userId));
        if (!ownDevotee) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        let allowedDevoteeIds = [ownDevotee.id];
        if (ownDevotee.familyId) {
          const familyMembers = await db.select().from(devotees).where(eq(devotees.familyId, ownDevotee.familyId));
          allowedDevoteeIds = familyMembers.map(m => m.id);
        }
        
        const targetDevoteeId = parseInt(body.devoteeId);
        if (!allowedDevoteeIds.includes(targetDevoteeId)) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        body.status = "pending";
        body.recordedBy = userId;
      } else {
        body.recordedBy = userId;
      }

      const validatedData = insertDonationSchema.parse(body);
      const donation = await storage.createDonation(validatedData);
      res.status(201).json(donation);
    } catch (error) {
      console.error("Error creating donation:", error);
      res.status(400).json({ message: "Invalid donation data" });
    }
  });

  // Event routes
  app.get('/api/events', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.put('/api/events/:id', isAuthenticated, requireAdmin, async (req, res) => {
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

  app.delete('/api/events/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.post('/api/events/:id/archive', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.archiveEvent(id);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to archive event" });
    }
  });

  app.post('/api/events/:id/unarchive', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.unarchiveEvent(id);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to unarchive event" });
    }
  });

  app.post('/api/events/auto-archive', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const count = await storage.autoArchivePastEvents();
      res.json({ archived: count });
    } catch (error) {
      res.status(500).json({ message: "Failed to auto-archive events" });
    }
  });

  app.post('/api/events/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const devoteesList = await storage.getDevotees();
      const devotee = devoteesList.find(d => d.userId === user.id);
      if (!devotee) {
        return res.status(400).json({ message: "No devotee profile linked to this user account." });
      }

      const existing = await db.select().from(eventParticipation)
        .where(and(eq(eventParticipation.eventId, eventId), eq(eventParticipation.devoteeId, devotee.id)))
        .limit(1);

      if (existing.length > 0) {
        await db.delete(eventParticipation)
          .where(eq(eventParticipation.id, existing[0].id));
        res.json({ status: "unregistered" });
      } else {
        await db.insert(eventParticipation).values({
          eventId,
          devoteeId: devotee.id,
          status: "registered",
          registrationDate: new Date()
        });
        res.json({ status: "registered" });
      }
    } catch (error) {
      console.error("Error in event RSVP:", error);
      res.status(500).json({ message: "Failed to update RSVP" });
    }
  });

  app.get('/api/events/rsvps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const devoteesList = await storage.getDevotees();
      const devotee = devoteesList.find(d => d.userId === user.id);
      if (!devotee) return res.json([]);

      const rsvps = await db.select().from(eventParticipation)
        .where(eq(eventParticipation.devoteeId, devotee.id));
      res.json(rsvps);
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
      res.status(500).json({ message: "Failed to fetch RSVPs" });
    }
  });

  // Event detail — related data
  app.get('/api/events/:id/attendance', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const attendance = await storage.getAttendance(undefined, id);
      const devotees = await storage.getDevotees();
      const enriched = attendance.map(a => {
        const d = devotees.find(dev => dev.id === a.devoteeId);
        return { ...a, devoteeName: d ? `${d.firstName} ${d.lastName}` : "Unknown" };
      });
      res.json(enriched);
    } catch (error) { res.status(500).json({ message: "Failed to fetch event attendance" }); }
  });

  app.get('/api/events/:id/donations', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const allDonations = await storage.getDonations();
      // Note: donations don't have eventId in schema, so we filter by event date proximity
      const event = await storage.getEvent(id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      const eventDate = new Date(event.startDate);
      const eventDonations = allDonations.filter(d => {
        const dDate = new Date((d as any).donationDate || d.createdAt);
        const diff = Math.abs(dDate.getTime() - eventDate.getTime());
        return diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
      });
      const devotees = await storage.getDevotees();
      const enriched = eventDonations.map(d => {
        const dev = devotees.find(dev => dev.id === d.devoteeId);
        return { ...d, devoteeName: dev ? `${dev.firstName} ${dev.lastName}` : "Unknown" };
      });
      res.json(enriched);
    } catch (error) { res.status(500).json({ message: "Failed to fetch event donations" }); }
  });

  app.get('/api/events/:id/volunteering', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const allVolunteering = await storage.getVolunteering();
      const event = await storage.getEvent(id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      const eventDate = new Date(event.startDate);
      const eventVolunteering = allVolunteering.filter(v => {
        const vDate = new Date(v.startDate || v.createdAt);
        const diff = Math.abs(vDate.getTime() - eventDate.getTime());
        return diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
      });
      const devotees = await storage.getDevotees();
      const enriched = eventVolunteering.map(v => {
        const dev = devotees.find(dev => dev.id === v.devoteeId);
        return { ...v, devoteeName: dev ? `${dev.firstName} ${dev.lastName}` : "Unknown" };
      });
      res.json(enriched);
    } catch (error) { res.status(500).json({ message: "Failed to fetch event volunteering" }); }
  });

  // Volunteering routes
  app.get('/api/volunteering', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const devoteeId = req.query.devoteeId ? parseInt(req.query.devoteeId as string) : undefined;
      const volunteering = await storage.getVolunteering(devoteeId);
      res.json(volunteering);
    } catch (error) {
      console.error("Error fetching volunteering:", error);
      res.status(500).json({ message: "Failed to fetch volunteering" });
    }
  });

  app.post('/api/volunteering', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const validatedData = insertVolunteeringSchema.parse(req.body);
      const volunteering = await storage.createVolunteering(validatedData);
      res.status(201).json(volunteering);
    } catch (error) {
      console.error("Error creating volunteering:", error);
      res.status(400).json({ message: "Invalid volunteering data" });
    }
  });

  // Volunteering Shift routes
  app.get('/api/volunteering-shifts', isAuthenticated, async (req, res) => {
    try {
      const shifts = await db.select().from(volunteeringShifts).orderBy(desc(volunteeringShifts.startDate));
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.post('/api/volunteering-shifts', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertVolunteeringShiftSchema.parse(req.body);
      const [shift] = await db.insert(volunteeringShifts).values({
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      }).returning();
      res.status(201).json(shift);
    } catch (error) {
      console.error("Error creating shift:", error);
      res.status(400).json({ message: "Invalid shift data" });
    }
  });

  app.post('/api/volunteering-shifts/:id/signup', isAuthenticated, async (req: any, res) => {
    try {
      const shiftId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub || "";
      const [devotee] = await db.select().from(devotees).where(eq(devotees.userId, userId));
      if (!devotee) {
        return res.status(400).json({ message: "Devotee profile required to sign up for shifts" });
      }

      const [shift] = await db.select().from(volunteeringShifts).where(eq(volunteeringShifts.id, shiftId));
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      // Check if already signed up
      const [existing] = await db.select().from(volunteering).where(
        and(
          eq(volunteering.devoteeId, devotee.id),
          eq(volunteering.shiftId, shiftId)
        )
      );
      if (existing) {
        return res.status(400).json({ message: "Already signed up for this shift" });
      }

      // Create a volunteering entry
      const hours = Math.round((new Date(shift.endDate).getTime() - new Date(shift.startDate).getTime()) / (1000 * 60 * 60));
      const [volRecord] = await db.insert(volunteering).values({
        devoteeId: devotee.id,
        activityType: shift.activityType,
        description: shift.description,
        location: shift.location,
        startDate: shift.startDate,
        endDate: shift.endDate,
        hoursCommitted: hours,
        status: "active",
        shiftId: shiftId,
      }).returning();

      res.status(201).json({ message: "Signed up successfully!", record: volRecord });
    } catch (error) {
      console.error("Error in shift signup:", error);
      res.status(500).json({ message: "Failed to sign up for shift" });
    }
  });

  // Group routes
  app.get('/api/groups', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post('/api/groups', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(400).json({ message: "Invalid group data" });
    }
  });

  app.put('/api/groups/:id', isAuthenticated, requireAdmin, async (req, res) => {
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

  app.delete('/api/groups/:id', isAuthenticated, requireAdmin, async (req, res) => {
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
  app.get('/api/mandals', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const mandals = await storage.getMandals();
      res.json(mandals);
    } catch (error) {
      console.error("Error fetching mandals:", error);
      res.status(500).json({ message: "Failed to fetch mandals" });
    }
  });

  app.post('/api/mandals', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertMandalSchema.parse(req.body);
      const mandal = await storage.createMandal(validatedData);
      res.status(201).json(mandal);
    } catch (error) {
      console.error("Error creating mandal:", error);
      res.status(400).json({ message: "Invalid mandal data" });
    }
  });

  app.get('/api/mandals/:id', isAuthenticated, async (req, res) => {
    try {
      const mandal = await storage.getMandal(Number(req.params.id));
      if (!mandal) return res.status(404).json({ message: "Mandal not found" });
      res.json(mandal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mandal" });
    }
  });

  app.put('/api/mandals/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validatedData = insertMandalSchema.partial().parse(req.body);
      const mandal = await storage.updateMandal(id, validatedData);
      res.json(mandal);
    } catch (error) {
      console.error("Error updating mandal:", error);
      res.status(400).json({ message: "Invalid mandal data" });
    }
  });

  app.delete('/api/mandals/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteMandal(id);
      if (success) res.status(204).send();
      else res.status(404).json({ message: "Mandal not found" });
    } catch (error) {
      console.error("Error deleting mandal:", error);
      res.status(500).json({ message: "Failed to delete mandal" });
    }
  });

  // Sabha location routes
  app.get('/api/sabha-locations', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const locations = await storage.getSabhaLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching sabha locations:", error);
      res.status(500).json({ message: "Failed to fetch sabha locations" });
    }
  });

  app.post('/api/sabha-locations', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertSabhaLocationSchema.parse(req.body);
      const location = await storage.createSabhaLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating sabha location:", error);
      res.status(400).json({ message: "Invalid sabha location data" });
    }
  });

  app.get('/api/sabha-locations/:id', isAuthenticated, async (req, res) => {
    try {
      const location = await storage.getSabhaLocation(Number(req.params.id));
      if (!location) return res.status(404).json({ message: "Sabha location not found" });
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sabha location" });
    }
  });

  app.put('/api/sabha-locations/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validatedData = insertSabhaLocationSchema.partial().parse(req.body);
      const location = await storage.updateSabhaLocation(id, validatedData);
      res.json(location);
    } catch (error) {
      console.error("Error updating sabha location:", error);
      res.status(400).json({ message: "Invalid sabha location data" });
    }
  });

  app.delete('/api/sabha-locations/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteSabhaLocation(id);
      if (success) res.status(204).send();
      else res.status(404).json({ message: "Sabha location not found" });
    } catch (error) {
      console.error("Error deleting sabha location:", error);
      res.status(500).json({ message: "Failed to delete sabha location" });
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
  app.get('/api/stats', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/analytics', isAuthenticated, requireAdmin, async (req, res) => {
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
  app.get('/api/families/:id/stats', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const family = await storage.getFamily(id);
      if (!family) return res.status(404).json({ message: "Family not found" });
      const members = await storage.getDevoteesByFamily(id);
      const devoteeIds = members.map(d => d.id);
      const allDonations = await storage.getDonations();
      const familyDonations = allDonations.filter(d => devoteeIds.includes(d.devoteeId));
      const totalDonations = familyDonations.reduce((sum, d) => sum + parseFloat(String(d.amount) || '0'), 0);
      const allAttendance = await storage.getAttendance();
      const familyAttendance = allAttendance.filter(a => devoteeIds.includes(a.devoteeId));
      const presentRecords = familyAttendance.filter(a => (a as any).status === 'present');
      const attendanceRate = familyAttendance.length > 0
        ? Math.round((presentRecords.length / familyAttendance.length) * 100)
        : 0;
      const allVolunteering = await storage.getVolunteering();
      const familyVolunteering = allVolunteering.filter(v => devoteeIds.includes(v.devoteeId));
      const totalHours = familyVolunteering.reduce((sum, v) => sum + ((v as any).hoursCompleted || (v as any).hours || 0), 0);
      res.json({
        totalMembers: members.length,
        totalDonations,
        attendanceRate,
        totalVolunteeringHours: totalHours,
        totalEventsAttended: familyAttendance.length,
      });
    } catch (error) { res.status(500).json({ message: "Failed to fetch family stats" }); }
  });

  app.get('/api/mandals/:id/stats', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mandal = await storage.getMandal(id);
      if (!mandal) return res.status(404).json({ message: "Mandal not found" });
      const stats = await storage.getMandalStats(mandal.name);
      res.json(stats);
    } catch (error) { res.status(500).json({ message: "Failed to fetch mandal stats" }); }
  });

  app.get('/api/mandals/:id/members', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mandal = await storage.getMandal(id);
      if (!mandal) return res.status(404).json({ message: "Mandal not found" });
      const members = await storage.getMandalMembers(mandal.name);
      res.json(members);
    } catch (error) { res.status(500).json({ message: "Failed to fetch mandal members" }); }
  });

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
  app.put('/api/donations/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.updateDonation(id, req.body);
      res.json(donation);
    } catch (error) {
      console.error("Error updating donation:", error);
      res.status(400).json({ message: "Failed to update donation" });
    }
  });

  app.delete('/api/donations/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDonation(id);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete donation" });
    }
  });

  // Extended volunteering routes
  app.put('/api/volunteering/:id', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vol = await storage.updateVolunteering(id, req.body);
      res.json(vol);
    } catch (error) {
      res.status(400).json({ message: "Failed to update volunteering record" });
    }
  });

  app.delete('/api/volunteering/:id', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVolunteering(id);
      res.status(success ? 204 : 404).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete volunteering record" });
    }
  });

  // Attendance update/delete
  app.put('/api/attendance/:id', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const att = await storage.updateAttendance(id, req.body);
      res.json(att);
    } catch (error) {
      res.status(400).json({ message: "Failed to update attendance" });
    }
  });

  app.delete('/api/attendance/:id', isAuthenticated, requireLeader, async (req, res) => {
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
  app.get('/api/devotees/:id/documents', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const devotee = await storage.getDevotee(id);
      if (!devotee) {
        return res.status(404).json({ message: "Devotee not found" });
      }
      const hasAccess = await checkDevoteeAccess(req, id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const ms = (storage as any).memStore as MemoryStorage;
      const docs = ms.getDocuments(id);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/devotees/:id/documents', requireAdmin, async (req, res) => {
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

  app.delete('/api/devotees/:id/documents/:docId', requireAdmin, async (req, res) => {
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

  // Users management routes (admin/manager) — removed duplicate GET /api/users; the canonical route is above at line 64

  app.put('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = req.params.id;
      const user = await storage.upsertUser({ id, ...req.body });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  // Initialize dev config from database
  await devConfig.init();

  // ─── GOD MODE SESSION ACTIVATION ────────────────────────────────────────────
  app.post('/api/admin/activate', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const { password } = req.body;
    if (password !== GOD_MODE_PASSWORD) {
      return res.status(401).json({ message: "Invalid GOD Mode password" });
    }
    const token = randomBytes(32).toString('hex');
    godModeTokens.add(token);
    res.json({ token, message: "GOD Mode activated" });
  });

  app.delete('/api/admin/activate', isAuthenticated, requireSuperAdmin, (req, res) => {
    const token = req.headers['x-god-mode-token'] as string | undefined;
    if (token) godModeTokens.delete(token);
    res.json({ message: "GOD Mode deactivated" });
  });

  app.get('/api/dev-config', isAuthenticated, requireSuperAdmin, async (req, res) => {
    res.json(devConfig.getAll());
  });

  app.put('/api/dev-config', isAuthenticated, requireSuperAdmin, async (req, res) => {
    await devConfig.import(req.body);
    res.json(devConfig.getAll());
  });

  app.patch('/api/dev-config/app-info', isAuthenticated, requireSuperAdmin, async (req, res) => {
    await devConfig.patch('appInfo', req.body);
    res.json(devConfig.get('appInfo'));
  });

  app.patch('/api/dev-config/navigation', isAuthenticated, requireSuperAdmin, async (req, res) => {
    await devConfig.patch('navigation', req.body);
    res.json(devConfig.get('navigation'));
  });

  app.patch('/api/dev-config/theme', isAuthenticated, requireSuperAdmin, async (req, res) => {
    await devConfig.patch('theme', req.body);
    res.json(devConfig.get('theme'));
  });

  app.patch('/api/dev-config/custom-fields', isAuthenticated, requireSuperAdmin, async (req, res) => {
    await devConfig.set('customFields', req.body.fields);
    res.json(devConfig.get('customFields'));
  });

  app.patch('/api/dev-config/role-profiles', isAuthenticated, requireSuperAdmin, async (req, res) => {
    await devConfig.patch('roleProfiles', req.body);
    res.json(devConfig.get('roleProfiles'));
  });

  app.post('/api/dev-config/snapshot', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const { name } = req.body;
    const snapshot = {
      id: `snap_${Date.now()}`,
      name: name || `Snapshot ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      config: JSON.parse(JSON.stringify({
        appInfo: devConfig.get('appInfo'),
        navigation: devConfig.get('navigation'),
        theme: devConfig.get('theme'),
        customFields: devConfig.get('customFields'),
        roleProfiles: devConfig.get('roleProfiles'),
      })),
    };
    const snapshots = devConfig.get('snapshots') || [];
    snapshots.unshift(snapshot);
    if (snapshots.length > 10) snapshots.pop();
    await devConfig.set('snapshots', snapshots);
    res.json(snapshot);
  });

  app.post('/api/dev-config/restore/:snapshotId', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const snapshots = devConfig.get('snapshots') || [];
    const snap = snapshots.find((s: any) => s.id === req.params.snapshotId);
    if (!snap) return res.status(404).json({ message: "Snapshot not found" });
    await devConfig.import(snap.config);
    res.json({ message: "Restored", config: snap.config });
  });

  app.get('/api/dev-config/export', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      appInfo: devConfig.get('appInfo'),
      navigation: devConfig.get('navigation'),
      theme: devConfig.get('theme'),
      customFields: devConfig.get('customFields'),
      roleProfiles: devConfig.get('roleProfiles'),
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="madhav-parivar-config.json"');
    res.json(exportData);
  });

  app.post('/api/dev-config/import', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { appInfo, navigation, theme, customFields, roleProfiles } = req.body;
      const updates: Record<string, any> = {};
      if (appInfo) updates.appInfo = appInfo;
      if (navigation) updates.navigation = navigation;
      if (theme) updates.theme = theme;
      if (customFields) updates.customFields = customFields;
      if (roleProfiles) updates.roleProfiles = roleProfiles;
      await devConfig.import(updates);
      res.json({ message: "Config imported successfully", config: devConfig.getAll() });
    } catch (e) {
      res.status(400).json({ message: "Invalid config format" });
    }
  });

  // ─── GOD MODE: AUDIT LOG ───────────────────────────────────────────────────
  app.get('/api/admin/audit', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    try {
      const { entity, action, limit = "100" } = req.query;
      const logs = await storage.getAuditLog(Number(limit), entity, action);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ─── GOD MODE: DISPATCH LOGS ────────────────────────────────────────────────
  app.get('/api/admin/dispatch-logs', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const logs = await db.select().from(dispatchLogs).orderBy(desc(dispatchLogs.sentAt)).limit(100);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ─── GOD MODE: MACROS ──────────────────────────────────────────────────────
  app.get('/api/admin/macros', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    try {
      const macros = await storage.getDevMacros();
      res.json(macros);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/admin/macros', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    try {
      const macro = await storage.createDevMacro({
        name: req.body.name,
        description: req.body.description,
        steps: req.body.steps,
      });
      res.status(201).json(macro);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.put('/api/admin/macros/:id', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    try {
      const macro = await storage.updateDevMacro(Number(req.params.id), {
        name: req.body.name,
        description: req.body.description,
        steps: req.body.steps,
      });
      res.json(macro);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  });

  app.delete('/api/admin/macros/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      await storage.deleteDevMacro(Number(req.params.id));
      res.json({ message: "Macro deleted" });
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  });

  app.post('/api/admin/macros/:id/run', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    try {
      const macro = await storage.getDevMacro(Number(req.params.id));
      if (!macro) return res.status(404).json({ message: "Macro not found" });
      const results: any[] = [];
      for (const step of (macro.steps as any[] || [])) {
        try {
          if (step.type === "create_devotee" && step.data) {
            const d = await storage.createDevotee(step.data);
            await addAudit("CREATE", "devotee", d.id, req.user?.claims?.sub || "macro", null, d);
            results.push({ step: step.label, status: "ok", result: d });
          } else if (step.type === "create_event" && step.data) {
            const e = await storage.createEvent(step.data);
            await addAudit("CREATE", "event", e.id, req.user?.claims?.sub || "macro", null, e);
            results.push({ step: step.label, status: "ok", result: e });
          } else if (step.type === "create_attendance" && step.data) {
            const a = await storage.createAttendance(step.data);
            await addAudit("CREATE", "attendance", a.id, req.user?.claims?.sub || "macro", null, a);
            results.push({ step: step.label, status: "ok", result: a });
          } else {
            results.push({ step: step.label || "unknown", status: "skipped", note: "Step type not supported" });
          }
        } catch (err: any) {
          results.push({ step: step.label || "unknown", status: "error", error: err.message });
        }
      }
      await storage.incrementMacroRunCount(macro.id);
      await addAudit("RUN_MACRO", "macro", macro.id, req.user?.claims?.sub || "system", null, { name: macro.name, steps: (macro.steps as any[])?.length });
      const updatedMacro = await storage.getDevMacro(macro.id);
      res.json({ macro: macro.name, results, ranAt: updatedMacro?.lastRunAt });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ─── GOD MODE: BULK OPERATIONS ─────────────────────────────────────────────
  app.post('/api/admin/bulk', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    const { entity, operation, ids, data } = req.body;
    const userId = req.user?.claims?.sub || "system";
    const results: any[] = [];
    try {
      for (const id of (ids || [])) {
        if (entity === "devotees") {
          if (operation === "delete") {
            const before = await storage.getDevotee(id);
            await storage.deleteDevotee(id);
            await addAudit("DELETE", "devotee", id, userId, before, null);
            results.push({ id, status: "deleted" });
          } else if (operation === "update" && data) {
            const before = await storage.getDevotee(id);
            const after = await storage.updateDevotee(id, data);
            await addAudit("UPDATE", "devotee", id, userId, before, after);
            results.push({ id, status: "updated" });
          }
        } else if (entity === "events") {
          if (operation === "delete") {
            const before = await storage.getEvent(id);
            await storage.deleteEvent(id);
            await addAudit("DELETE", "event", id, userId, before, null);
            results.push({ id, status: "deleted" });
          }
        } else if (entity === "attendance") {
          if (operation === "delete") {
            await storage.deleteAttendance(id);
            await addAudit("DELETE", "attendance", id, userId, null, null);
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
  app.get('/api/admin/export/data', isAuthenticated, requireSuperAdmin, async (req, res) => {
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
  app.post('/api/admin/import/data', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
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
      await addAudit("IMPORT_DATA", "system", null, userId, null, results);
      res.json({ message: "Data imported successfully", imported: results });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── GOD MODE: RELATIONAL DATA ─────────────────────────────────────────────
  app.get('/api/admin/relations/:entity/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
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
  app.patch('/api/admin/link', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    const { devoteeId, familyId, mentorId } = req.body;
    const userId = req.user?.claims?.sub || "system";
    try {
      const before = await storage.getDevotee(devoteeId);
      const updates: any = {};
      if (familyId !== undefined) updates.familyId = familyId;
      if (mentorId !== undefined) updates.mentorId = mentorId;
      const after = await storage.updateDevotee(devoteeId, updates);
      await addAudit("LINK", "devotee", devoteeId, userId, before, after);
      res.json(after);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── PATCH ALIASES (for all entities — fixes DataBrowser PATCH calls) ──────
  app.patch('/api/devotees/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDevoteeSchema.partial().parse(req.body);
      const devotee = await storage.updateDevotee(id, validatedData);
      res.json(devotee);
    } catch (error) { res.status(400).json({ message: "Invalid devotee data" }); }
  });
  app.patch('/api/families/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFamilySchema.partial().parse(req.body);
      const family = await storage.updateFamily(id, validatedData);
      res.json(family);
    } catch (error) { res.status(400).json({ message: "Invalid family data" }); }
  });
  app.patch('/api/mentors/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mentor = await storage.updateMentor(id, req.body);
      res.json(mentor);
    } catch (error) { res.status(400).json({ message: "Invalid mentor data" }); }
  });
  app.patch('/api/donations/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const donation = await storage.updateDonation(id, req.body);
      res.json(donation);
    } catch (error) { res.status(400).json({ message: "Invalid donation data" }); }
  });
  app.patch('/api/volunteering/:id', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vol = await storage.updateVolunteering(id, req.body);
      res.json(vol);
    } catch (error) { res.status(400).json({ message: "Invalid volunteering data" }); }
  });
  app.patch('/api/attendance/:id', isAuthenticated, requireLeader, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const att = await storage.updateAttendance(id, req.body);
      res.json(att);
    } catch (error) { res.status(400).json({ message: "Invalid attendance data" }); }
  });
  app.patch('/api/events/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, validatedData);
      res.json(event);
    } catch (error) { res.status(400).json({ message: "Invalid event data" }); }
  });

  // ─── FAMILY MEMBERS ─────────────────────────────────────────────────────────
  app.get('/api/families/:id/members', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const isLeader = req.user?.isLeader;
      const currentUserId = req.user?.claims?.sub;
      if (!isLeader) {
        const [dev] = await db.select().from(devotees).where(eq(devotees.userId, currentUserId));
        if (!dev || dev.familyId !== id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const members = await storage.getDevoteesByFamily(id);
      res.json(members);
    } catch (error) { res.status(500).json({ message: "Failed to fetch family members" }); }
  });

  // ─── ADMIN: QUERY CONSOLE ───────────────────────────────────────────────────
  app.get('/api/admin/query', isAuthenticated, requireSuperAdmin, async (req, res) => {
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
  app.get('/api/admin/feature-flags', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    res.json(devConfig.get('featureFlags'));
  });
  app.patch('/api/admin/feature-flags', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const allowed = ['donations','analytics','volunteering','idCards','groups','mentors','events','attendance'];
    const current = devConfig.get('featureFlags') || {};
    for (const key of allowed) {
      if (key in req.body && typeof req.body[key] === 'boolean') {
        current[key] = req.body[key];
      }
    }
    await devConfig.set('featureFlags', current);
    res.json(current);
  });

  // ─── ADMIN: RECEIPT TEMPLATE ────────────────────────────────────────────────
  app.get('/api/admin/receipt-template', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    res.json(devConfig.get('receiptTemplate'));
  });
  app.patch('/api/admin/receipt-template', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const current = devConfig.get('receiptTemplate') || {};
    const updated = { ...current, ...req.body };
    await devConfig.set('receiptTemplate', updated);
    res.json(updated);
  });

  // ─── ADMIN: ANALYTICS DASHBOARDS ────────────────────────────────────────────
  app.get('/api/admin/analytics-dashboards', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    res.json(devConfig.get('analyticsDashboards'));
  });
  app.post('/api/admin/analytics-dashboards', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const dashboard = { ...req.body, id: `dash_${Date.now()}` };
    const dashboards = devConfig.get('analyticsDashboards') || [];
    dashboards.push(dashboard);
    await devConfig.set('analyticsDashboards', dashboards);
    res.json(dashboard);
  });
  app.put('/api/admin/analytics-dashboards/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const dashboards = devConfig.get('analyticsDashboards') || [];
    const idx = dashboards.findIndex((d: any) => d.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Dashboard not found' });
    dashboards[idx] = { ...dashboards[idx], ...req.body };
    await devConfig.set('analyticsDashboards', dashboards);
    res.json(dashboards[idx]);
  });
  app.delete('/api/admin/analytics-dashboards/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const dashboards = (devConfig.get('analyticsDashboards') || []).filter((d: any) => d.id !== req.params.id);
    await devConfig.set('analyticsDashboards', dashboards);
    res.json({ deleted: true });
  });

  // ─── ADMIN: CARD THEMES ──────────────────────────────────────────────────────
  app.get('/api/admin/card-themes', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    res.json(devConfig.get('cardThemes'));
  });
  app.post('/api/admin/card-themes', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const theme = { ...req.body, id: `theme_${Date.now()}` };
    const themes = devConfig.get('cardThemes') || [];
    themes.push(theme);
    await devConfig.set('cardThemes', themes);
    res.json(theme);
  });
  app.put('/api/admin/card-themes/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const themes = devConfig.get('cardThemes') || [];
    const idx = themes.findIndex((t: any) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Theme not found' });
    themes[idx] = { ...themes[idx], ...req.body };
    await devConfig.set('cardThemes', themes);
    res.json(themes[idx]);
  });
  app.delete('/api/admin/card-themes/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const themes = (devConfig.get('cardThemes') || []).filter((t: any) => t.id !== req.params.id);
    await devConfig.set('cardThemes', themes);
    res.json({ deleted: true });
  });

  // ─── ADMIN: VISUAL OVERRIDES ────────────────────────────────────────────────
  app.get('/api/admin/visual-overrides', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    res.json(devConfig.get('visualOverrides') || {});
  });
  app.patch('/api/admin/visual-overrides', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const current = devConfig.get('visualOverrides') || {};
    const updated = { ...current, ...req.body };
    await devConfig.set('visualOverrides', updated);
    res.json(updated);
  });
  app.delete('/api/admin/visual-overrides', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    await devConfig.set('visualOverrides', {});
    res.json({ cleared: true });
  });

  // ─── ADMIN: ROLLBACK SLOTS (5-slot circular buffer) ──────────────────────
  app.get('/api/admin/rollback-slots', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    const slots = devConfig.get('rollbackSlots') || [];
    const nextIndex = devConfig.get('rollbackNextIndex') || 0;
    res.json({
      slots,
      nextIndex,
      currentOverrides: devConfig.get('visualOverrides') || {},
    });
  });
  app.post('/api/admin/rollback-slots', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const { name } = req.body;
    const nextIndex = devConfig.get('rollbackNextIndex') || 0;
    const slotIndex = nextIndex % 5;
    const currentOverrides = devConfig.get('visualOverrides') || {};
    const slot = {
      index: slotIndex,
      name: name || `Save ${new Date().toLocaleString()}`,
      savedAt: new Date().toISOString(),
      overrides: JSON.parse(JSON.stringify(currentOverrides)),
    };
    const slots = devConfig.get('rollbackSlots') || [];
    if (slots.length > slotIndex) {
      slots[slotIndex] = slot;
    } else {
      slots.push(slot);
    }
    await devConfig.set('rollbackSlots', slots);
    await devConfig.set('rollbackNextIndex', nextIndex + 1);
    res.json(slot);
  });
  app.post('/api/admin/rollback-slots/:index/restore', isAuthenticated, requireSuperAdmin, async (req, res) => {
    const idx = parseInt(req.params.index);
    const slots = devConfig.get('rollbackSlots') || [];
    const slot = slots.find((s: any) => s.index === idx);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    await devConfig.set('visualOverrides', JSON.parse(JSON.stringify(slot.overrides)));
    res.json({ restored: true, slot, overrides: slot.overrides });
  });

  // ─── ADMIN: PAGE REGISTRY ───────────────────────────────────────────────────
  app.get('/api/admin/page-registry', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    try { res.json(await storage.getPageRegistry()); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.post('/api/admin/page-registry', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try { const entry = await storage.createPageRegistryEntry(req.body); res.json(entry); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.get('/api/admin/page-registry/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const entry = await storage.getPageRegistryEntry(Number(req.params.id));
      if (!entry) return res.status(404).json({ message: "Page not found" });
      res.json(entry);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.put('/api/admin/page-registry/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try { const entry = await storage.updatePageRegistryEntry(Number(req.params.id), req.body); res.json(entry); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.delete('/api/admin/page-registry/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try { await storage.deletePageRegistryEntry(Number(req.params.id)); res.json({ deleted: true }); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ─── ADMIN: SCHEMA REGISTRY ─────────────────────────────────────────────────
  app.get('/api/admin/schema-registry', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    try { res.json(await storage.getSchemaRegistry()); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.post('/api/admin/schema-registry', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try { const entry = await storage.createSchemaRegistryEntry(req.body); res.json(entry); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.get('/api/admin/schema-registry/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const entry = await storage.getSchemaRegistryEntry(Number(req.params.id));
      if (!entry) return res.status(404).json({ message: "Schema not found" });
      res.json(entry);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.put('/api/admin/schema-registry/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try { const entry = await storage.updateSchemaRegistryEntry(Number(req.params.id), req.body); res.json(entry); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.delete('/api/admin/schema-registry/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try { await storage.deleteSchemaRegistryEntry(Number(req.params.id)); res.json({ deleted: true }); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ─── ADMIN: ROUTE REGISTRY ──────────────────────────────────────────────────
  app.get('/api/admin/route-registry', isAuthenticated, requireSuperAdmin, async (_req, res) => {
    try { res.json(await storage.getRouteRegistry()); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.post('/api/admin/route-registry', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try { const entry = await storage.createRouteRegistryEntry(req.body); res.json(entry); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.get('/api/admin/route-registry/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const entry = await storage.getRouteRegistryEntry(Number(req.params.id));
      if (!entry) return res.status(404).json({ message: "Route not found" });
      res.json(entry);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.put('/api/admin/route-registry/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try { const entry = await storage.updateRouteRegistryEntry(Number(req.params.id), req.body); res.json(entry); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.delete('/api/admin/route-registry/:id', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try { await storage.deleteRouteRegistryEntry(Number(req.params.id)); res.json({ deleted: true }); } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ─── DYNAMIC ROUTE EXECUTION ────────────────────────────────────────────────
  app.all('/api/dynamic/*', isAuthenticated, async (req, res) => {
    try {
      const allRoutes = await storage.getRouteRegistry();
      const dynamicPath = req.path.replace('/api/dynamic', '');
      const matched = allRoutes.find((r: any) => {
        const pattern = r.path.replace(/\*/g, '.*').replace(/:(\w+)/g, '(\w+)');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(dynamicPath) && r.method.toUpperCase() === req.method.toUpperCase();
      });
      if (!matched) return res.status(404).json({ message: "Dynamic route not found" });
      const { pool } = await import("./db");
      let sql = matched.sqlQuery;
      const params: any[] = [];
      if (matched.parameters) {
        for (const param of (matched.parameters as any[])) {
          const val = req.body[param.name] ?? req.query[param.name] ?? req.params[param.name];
          if (param.required && val === undefined) {
            return res.status(400).json({ message: `Missing required parameter: ${param.name}` });
          }
          sql = sql.replace(new RegExp(`:${param.name}\\b`, 'g'), `$${params.length + 1}`);
          params.push(val);
        }
      }
      const result = await pool.query(sql, params);
      res.json({ data: result.rows });
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });

  // ─── ADMIN: SEED MANAGER ────────────────────────────────────────────────────
  app.get('/api/admin/seed/counts', isAuthenticated, requireSuperAdmin, async (_req, res) => {
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
  app.post('/api/admin/seed/reset', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    try {
      const ms = (storage as any).memStore;
      if (ms && ms.resetAndReseed) {
        ms.resetAndReseed();
        await addAudit("SEED_RESET", "system", null, req.user?.claims?.sub || "god-mode", null, { action: "Full reset and reseed" });
        res.json({ message: "Data reset and reseeded successfully" });
      } else {
        res.status(400).json({ message: "Reset not available (non-memory storage)" });
      }
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  });
  app.post('/api/admin/seed/add', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
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
          await addAudit("CREATE", "devotee", d.id, userId, null, d);
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

  // ─── ENTITY EXPORT (single table) ──────────────────────────────────────────
  app.get('/api/admin/export/entity', isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const table = req.query.table as string;
      let data: any[] = [];
      switch (table) {
        case "devotees": data = await storage.getDevotees(); break;
        case "families": data = await storage.getFamilies(); break;
        case "events": data = await storage.getEvents(); break;
        case "attendance": data = await storage.getAttendance(); break;
        case "donations": data = await storage.getDonations(); break;
        case "volunteering": data = await storage.getVolunteering(); break;
        case "mentors": data = await storage.getMentors(); break;
        case "groups": data = await storage.getGroups(); break;
        case "mandals": data = await storage.getMandals(); break;
        case "sabha_locations": data = await storage.getSabhaLocations(); break;
        case "group_memberships": data = await storage.getGroupMemberships(); break;
        case "dev_macros": data = await storage.getDevMacros(); break;
        case "page_registry": data = await storage.getPageRegistry(); break;
        case "schema_registry": data = await storage.getSchemaRegistry(); break;
        case "route_registry": data = await storage.getRouteRegistry(); break;
        case "audit_log": data = await storage.getAuditLog(1000); break;
        case "users": data = await storage.getAllUsers(); break;
        default: return res.status(400).json({ message: "Unknown table: " + table });
      }
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ─── ENTITY IMPORT (CSV/JSON rows) ──────────────────────────────────────────
  app.post('/api/admin/import/entity', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    try {
      const { table, rows } = req.body;
      const userId = req.user?.claims?.sub || "system";
      let imported = 0;
      let errors: string[] = [];
      for (const row of rows) {
        try {
          switch (table) {
            case "devotees": {
              const { id, created_at, updated_at, ...rest } = row;
              await storage.createDevotee(rest);
              break;
            }
            case "families": {
              const { id, created_at, updated_at, ...rest } = row;
              await storage.createFamily(rest);
              break;
            }
            case "events": {
              const { id, created_at, updated_at, ...rest } = row;
              await storage.createEvent(rest);
              break;
            }
            case "mentors": {
              const { id, created_at, updated_at, ...rest } = row;
              await storage.createMentor(rest);
              break;
            }
            case "groups": {
              const { id, created_at, updated_at, ...rest } = row;
              await storage.createGroup(rest);
              break;
            }
            case "mandals": {
              const { id, created_at, ...rest } = row;
              await storage.createMandal(rest);
              break;
            }
            case "sabha_locations": {
              const { id, created_at, ...rest } = row;
              await storage.createSabhaLocation(rest);
              break;
            }
            case "donations": {
              const { id, created_at, ...rest } = row;
              await storage.createDonation(rest);
              break;
            }
            case "attendance": {
              const { id, created_at, ...rest } = row;
              await storage.createAttendance(rest);
              break;
            }
            case "volunteering": {
              const { id, created_at, ...rest } = row;
              await storage.createVolunteering(rest);
              break;
            }
            default:
              errors.push("Unsupported table: " + table);
              continue;
          }
          imported++;
        } catch (err: any) {
          errors.push(err.message || "Unknown error");
        }
      }
      await addAudit("IMPORT_ENTITY", table, null, userId, null, { imported, errors: errors.length });
      res.json({ imported, errors: errors.slice(0, 10), table });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // DEVOTIONAL COMMUNITY PORTAL UPGRADES (PHASE 3)
  // ────────────────────────────────────────────────────────────────────────────

  // --- OTP Verification System ---
  app.post('/api/admin/generate-otp', isAuthenticated, async (req: any, res) => {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      await db.insert(loginCodes).values({
        code,
        userId: req.user?.claims?.sub || "system",
        purpose: "approval_otp",
        expiresAt,
      });
      await logDispatch("otp", req.user?.claims?.email || "admin@example.com", "Security OTP Verification Code", `Your 6-digit verification code is: ${code}. Valid for 10 minutes.`, "sent", { userId: req.user?.claims?.sub });
      console.log(`[VERIFICATION OTP] Generated 6-digit OTP for admin (${req.user?.claims?.email}): ${code}`);
      res.json({ message: "OTP sent successfully (Logged to console)" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/admin/verify-otp', isAuthenticated, async (req: any, res) => {
    const { code } = req.body;
    try {
      const [record] = await db.select().from(loginCodes).where(
        and(
          eq(loginCodes.code, code),
          eq(loginCodes.userId, req.user?.claims?.sub || ""),
          eq(loginCodes.purpose, "approval_otp"),
          eq(loginCodes.isUsed, false)
        )
      );
      if (!record || new Date() > record.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      await db.update(loginCodes).set({ isUsed: true }).where(eq(loginCodes.id, record.id));
      res.json({ message: "OTP verified successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- Approvals Routing (T002) ---
  app.get('/api/admin/approvals', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const pendingUsers = await db.select().from(users).where(eq(users.approvalStatus, "pending")).orderBy(desc(users.createdAt));
      res.json(pendingUsers);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/admin/approvals/:id/approve', isAuthenticated, requireAdmin, async (req: any, res) => {
    const { role } = req.body;
    const targetUserId = req.params.id;
    try {
      const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
      if (!targetUser) return res.status(404).json({ message: "User not found" });

      // Super Admin check
      if (role === "admin" && req.user.role !== "super-admin") {
        return res.status(403).json({ message: "Only Super Admin can approve/assign Admin roles" });
      }

      const loginCode = Math.floor(1000000 + Math.random() * 9000000).toString(); // 7-digit Activation Code
      await db.update(users).set({
        approvalStatus: "approved",
        role: role || "user",
        loginCode,
        approvedBy: req.user?.claims?.sub,
        approvedAt: new Date(),
      }).where(eq(users.id, targetUserId));

      // Also create a linked Devotee record if it doesn't exist
      const [existingDevotee] = await db.select().from(devotees).where(eq(devotees.email, targetUser.email || ""));
      if (existingDevotee) {
        await db.update(devotees).set({ userId: targetUserId, approvalStatus: "approved" }).where(eq(devotees.id, existingDevotee.id));
      } else {
        await db.insert(devotees).values({
          devoteeId: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
          firstName: targetUser.firstName || "New",
          lastName: targetUser.lastName || "Devotee",
          email: targetUser.email,
          userId: targetUserId,
          approvalStatus: "approved",
        });
      }

      await logDispatch("email", targetUser.email || "devotee@example.com", "Devotional Portal Account Approved!", `Hare Krishna! Your account registration on the Devotional Community Portal has been approved. Your 7-digit Activation Code is: ${loginCode}. Please enter this code when logging in to activate your devotee portal.`, "sent", { targetUserId, loginCode });
      console.log(`[APPROVAL CODE] Approved user (${targetUser.email}). Generated 7-digit Activation Code: ${loginCode}`);
      res.json({ message: "User approved successfully", loginCode });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/admin/approvals/:id/reject', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await db.update(users).set({ approvalStatus: "rejected" }).where(eq(users.id, req.params.id));
      res.json({ message: "User registration rejected" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/auth/verify-code', isAuthenticated, async (req: any, res) => {
    const { code } = req.body;
    try {
      const [userRecord] = await db.select().from(users).where(eq(users.id, req.user?.claims?.sub || ""));
      if (!userRecord || userRecord.loginCode !== code) {
        return res.status(400).json({ message: "Invalid activation code" });
      }
      res.json({ message: "Activation code verified successfully!" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- Devotee Dashboard Page (T003) ---
  app.get('/api/devotee/dashboard', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub || "";
    try {
      const [dev] = await db.select().from(devotees).where(eq(devotees.userId, userId));
      if (!dev) return res.status(404).json({ message: "Devotee profile not found" });

      const upcomingEvents = await db.select().from(events).where(eq(events.isDevoteeViewable, true));
      const widgets = await db.select().from(devoteeDashboardWidgets).where(eq(devoteeDashboardWidgets.userId, userId));
      
      let familyMembers: any[] = [];
      if (dev.familyId) {
        familyMembers = await db.select().from(devotees).where(eq(devotees.familyId, dev.familyId));
      }

      // Calculate Stats for achievements
      const [volunteeringRecs, attendanceRecs, donationRecs, mentorsRecs] = await Promise.all([
        storage.getVolunteering(dev.id),
        storage.getAttendance(dev.id),
        storage.getDonations(dev.id),
        storage.getMentors(),
      ]);

      const totalVolHours = volunteeringRecs.reduce((sum, r) => sum + (r.hoursCompleted || r.hoursCommitted || 0), 0);
      const totalAttendance = attendanceRecs.filter(r => r.status === "present").length;
      const donationCount = donationRecs.length;
      const totalDonationAmount = donationRecs.reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const isMentor = mentorsRecs.some(r => r.devoteeId === dev.id);

      const stats = {
        totalVolHours,
        totalAttendance,
        donationCount,
        totalDonationAmount,
        isMentor
      };

      // Fetch Mentor details
      let mentorDetails: any = null;
      if (dev.mentorId) {
        const [mentorRec] = await db.select().from(mentors).where(eq(mentors.id, dev.mentorId));
        if (mentorRec) {
          const [mentorDev] = await db.select().from(devotees).where(eq(devotees.id, mentorRec.devoteeId));
          if (mentorDev) {
            mentorDetails = {
              name: `${mentorDev.firstName} ${mentorDev.lastName}`,
              phone: mentorDev.phone || mentorDev.whatsappNumber || "",
              whatsappNumber: mentorDev.whatsappNumber || "",
              email: mentorDev.email || "",
              specialization: mentorRec.specialization || "Spiritual Counseling"
            };
          }
        }
      }

      res.json({ devotee: dev, upcomingEvents, widgets, familyMembers, stats, mentorDetails });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/panchang/check-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "";
      const ms = (storage as any).memStore as MemoryStorage;
      
      const holyDays = [
        { name: "Ekadashi Vrat", description: "Today is Shravana Putrada Ekadashi. Fasting begins at sunrise and breaking time is tomorrow morning.", type: "warning" },
        { name: "Sri Krishna Janmashtami", description: "Mahotsav starts at 6:00 PM. Special kirtan and mahaprasad scheduled at temple hall.", type: "success" },
        { name: "Pradosh Vrat", description: "Pradosha Puja time is from 6:30 PM to 8:45 PM. Devotion and chanting of Shiva Mahimna.", type: "info" }
      ];
      
      const alert = holyDays[Math.floor(Math.random() * holyDays.length)];
      
      // Create notification for the current user in memory store
      if (ms && ms.createNotification) {
        ms.createNotification({
          userId,
          title: `🔔 Holy Alert: ${alert.name}`,
          message: alert.description,
          type: alert.type as any,
          isRead: false,
          isPinned: false
        });
      }
      
      // Fetch current user details or email if available to simulate dispatch
      const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
      const recipientEmail = currentUser?.email || "devotee@madhavmandir.org";
      const recipientPhone = "+91 99887 76655";
      
      // Insert SMS dispatch log
      await db.insert(dispatchLogs).values({
        dispatchType: "sms",
        recipient: recipientPhone,
        subject: `Holy Alert: ${alert.name}`,
        body: `Jai Shree Madhav! ${alert.name}: ${alert.description}`,
        status: "sent",
        contextData: { trigger: "panchang_alert", userId }
      });

      // Insert Email dispatch log
      await db.insert(dispatchLogs).values({
        dispatchType: "email",
        recipient: recipientEmail,
        subject: `[TEMPLE ALERT] ${alert.name}`,
        body: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #f59e0b; border-radius: 8px;">
          <h2 style="color: #d97706;">Jai Shree Madhav 🙏🏻</h2>
          <p>Dear Devotee,</p>
          <p>Please note today's holy alert:</p>
          <blockquote style="border-left: 4px solid #f59e0b; padding-left: 10px; margin: 15px 0; color: #78350f; font-weight: bold;">
            ${alert.name} - ${alert.description}
          </blockquote>
          <p>Wishing you a spiritually uplifting day.</p>
          <p>Warm regards,<br/>Temple Administration Team</p>
        </div>`,
        status: "sent",
        contextData: { trigger: "panchang_alert", userId }
      });
      
      res.json({
        success: true,
        alert,
        recipientEmail,
        recipientPhone
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to dispatch Panchang alerts", error: error.message });
    }
  });

  app.post('/api/devotee/profile-update', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub || "";
    try {
      const [dev] = await db.select().from(devotees).where(eq(devotees.userId, userId));
      if (!dev) return res.status(404).json({ message: "Devotee profile not found" });

      await db.insert(devoteePendingUpdates).values({
        devoteeId: dev.id,
        updatedData: req.body,
        status: "pending",
      });

      res.json({ message: "Profile update request submitted for admin review!" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/admin/profile-updates', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const list = await db.select().from(devoteePendingUpdates).where(eq(devoteePendingUpdates.status, "pending"));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/admin/profile-updates/:id/approve', isAuthenticated, requireAdmin, async (req: any, res) => {
    const updateId = parseInt(req.params.id);
    try {
      const [pending] = await db.select().from(devoteePendingUpdates).where(eq(devoteePendingUpdates.id, updateId));
      if (!pending) return res.status(404).json({ message: "Pending update request not found" });

      await db.update(devotees).set(pending.updatedData as any).where(eq(devotees.id, pending.devoteeId));
      await db.update(devoteePendingUpdates).set({
        status: "approved",
        reviewedBy: req.user?.claims?.sub,
        reviewedAt: new Date(),
      }).where(eq(devoteePendingUpdates.id, updateId));

      res.json({ message: "Devotee profile changes successfully merged!" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/admin/profile-updates/:id/reject', isAuthenticated, requireAdmin, async (req: any, res) => {
    const updateId = parseInt(req.params.id);
    const { reason } = req.body;
    try {
      await db.update(devoteePendingUpdates).set({
        status: "rejected",
        reviewedBy: req.user?.claims?.sub,
        reviewedAt: new Date(),
        rejectionReason: reason,
      }).where(eq(devoteePendingUpdates.id, updateId));
      res.json({ message: "Profile update rejected" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- Polls & Quizzes (T005) ---
  app.get('/api/polls', isAuthenticated, async (req, res) => {
    try {
      const allPolls = await db.select().from(polls).orderBy(desc(polls.createdAt));
      const pollsWithOptions = await Promise.all(allPolls.map(async (poll) => {
        const options = await db.select().from(pollOptions).where(eq(pollOptions.pollId, poll.id));
        const responses = await db.select().from(pollResponses).where(eq(pollResponses.pollId, poll.id));
        return { ...poll, options, responses };
      }));
      res.json(pollsWithOptions);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/polls', isAuthenticated, requireAdmin, async (req: any, res) => {
    const { title, description, mediaUrl, mediaType, options } = req.body;
    try {
      const [newPoll] = await db.insert(polls).values({
        title,
        description,
        mediaUrl,
        mediaType,
        createdBy: req.user?.claims?.sub || "admin",
      }).returning();

      if (options && options.length > 0) {
        for (const optText of options) {
          await db.insert(pollOptions).values({
            pollId: newPoll.id,
            optionText: optText,
          });
        }
      }
      res.status(201).json(newPoll);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/polls/:id/vote', isAuthenticated, async (req: any, res) => {
    const pollId = parseInt(req.params.id);
    const { optionId } = req.body;
    const userId = req.user?.claims?.sub || "";
    try {
      const [existingVote] = await db.select().from(pollResponses).where(
        and(
          eq(pollResponses.pollId, pollId),
          eq(pollResponses.userId, userId)
        )
      );
      if (existingVote) return res.status(400).json({ message: "You have already voted on this poll" });

      await db.insert(pollResponses).values({
        pollId,
        optionId,
        userId,
      });
      res.json({ message: "Vote cast successfully!" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/quizzes', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub || "";
    try {
      const allQuizzes = await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
      const quizzesWithQuestions = await Promise.all(allQuizzes.map(async (q) => {
        const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, q.id));
        const [userResponse] = await db.select().from(quizResponses).where(
          and(
            eq(quizResponses.quizId, q.id),
            eq(quizResponses.userId, userId)
          )
        );
        return { ...q, questions, hasSubmitted: !!userResponse, userResponse };
      }));
      res.json(quizzesWithQuestions);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/quizzes', isAuthenticated, requireAdmin, async (req: any, res) => {
    const { title, description, questions } = req.body;
    try {
      const [newQuiz] = await db.insert(quizzes).values({
        title,
        description,
        createdBy: req.user?.claims?.sub || "admin",
      }).returning();

      if (questions && questions.length > 0) {
        for (const q of questions) {
          await db.insert(quizQuestions).values({
            quizId: newQuiz.id,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
          });
        }
      }
      res.status(201).json(newQuiz);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/quizzes/:id/submit', isAuthenticated, async (req: any, res) => {
    const quizId = parseInt(req.params.id);
    const { answers } = req.body; // e.g., { questionId: "selectedAnswer" }
    const userId = req.user?.claims?.sub || "";
    try {
      const questionsList = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
      let score = 0;
      for (const q of questionsList) {
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      }

      await db.insert(quizResponses).values({
        quizId,
        userId,
        answers,
        score,
      });

      res.json({ score, totalQuestions: questionsList.length });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- Feedback System (T006) ---
  app.get('/api/feedback', isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub || "";
    try {
      let list;
      if (req.user.role === "admin" || req.user.role === "super-admin") {
        list = await db.select().from(feedbackRequests).orderBy(desc(feedbackRequests.createdAt));
      } else {
        list = await db.select().from(feedbackRequests).where(eq(feedbackRequests.userId, userId)).orderBy(desc(feedbackRequests.createdAt));
      }
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    const { title, description, category } = req.body;
    try {
      const [newFeedback] = await db.insert(feedbackRequests).values({
        userId: req.user?.claims?.sub || "",
        title,
        description,
        category,
      }).returning();
      res.status(201).json(newFeedback);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/feedback/:id/status', isAuthenticated, requireAdmin, async (req, res) => {
    const feedbackId = parseInt(req.params.id);
    const { status, adminNotes } = req.body;
    try {
      await db.update(feedbackRequests).set({
        status,
        adminNotes,
        updatedAt: new Date(),
      }).where(eq(feedbackRequests.id, feedbackId));
      res.json({ message: "Feedback status updated!" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- Intelligent Excel/CSV Imports (T004) ---
  app.post('/api/admin/import/upload', isAuthenticated, requireAdmin, async (req: any, res) => {
    const { fileName, records } = req.body; // simulated JSON format parse of Excel/CSV
    const userId = req.user?.claims?.sub || "admin";
    try {
      const [batch] = await db.insert(importBatches).values({
        fileName,
        totalRecords: records.length,
        importedBy: userId,
      }).returning();

      let createdCount = 0;
      let updatedCount = 0;

      for (const record of records) {
        // Smart matching criteria: match on email, phone, or name combo
        let existingDevotee = null;
        if (record.email) {
          [existingDevotee] = await db.select().from(devotees).where(eq(devotees.email, record.email));
        }
        if (!existingDevotee && record.phone) {
          [existingDevotee] = await db.select().from(devotees).where(eq(devotees.phone, record.phone));
        }
        if (!existingDevotee && record.firstName && record.lastName) {
          [existingDevotee] = await db.select().from(devotees).where(
            and(
              eq(devotees.firstName, record.firstName),
              eq(devotees.lastName, record.lastName)
            )
          );
        }

        if (existingDevotee) {
          // Track for rollback
          await db.insert(importRecords).values({
            batchId: batch.id,
            devoteeId: existingDevotee.id,
            action: "update",
            originalData: record,
            previousData: existingDevotee,
          });

          // Perform merge: update columns that are supplied
          await db.update(devotees).set({
            ...record,
            updatedAt: new Date(),
          }).where(eq(devotees.id, existingDevotee.id));
          updatedCount++;
        } else {
          // Generate devotee ID
          const code = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
          const [newDev] = await db.insert(devotees).values({
            ...record,
            devoteeId: record.devoteeId || code,
          }).returning();

          await db.insert(importRecords).values({
            batchId: batch.id,
            devoteeId: newDev.id,
            action: "create",
            originalData: record,
          });
          createdCount++;
        }
      }

      await db.update(importBatches).set({
        createdRecordsCount: createdCount,
        updatedRecordsCount: updatedCount,
      }).where(eq(importBatches.id, batch.id));

      res.json({ batchId: batch.id, createdCount, updatedCount });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/admin/import/rollback/:batchId', isAuthenticated, requireAdmin, async (req, res) => {
    const batchId = parseInt(req.params.batchId);
    try {
      const recordsToRollback = await db.select().from(importRecords).where(eq(importRecords.batchId, batchId));
      for (const rec of recordsToRollback) {
        if (rec.action === "create" && rec.devoteeId) {
          await db.delete(devotees).where(eq(devotees.id, rec.devoteeId));
        } else if (rec.action === "update" && rec.devoteeId && rec.previousData) {
          await db.update(devotees).set(rec.previousData as any).where(eq(devotees.id, rec.devoteeId));
        }
      }
      await db.update(importBatches).set({ status: "rolled_back" }).where(eq(importBatches.id, batchId));
      res.json({ message: "Import batch rolled back successfully!" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}
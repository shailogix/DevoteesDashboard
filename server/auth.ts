import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not provided. Auth will not work.");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: any) {
  const allUsers = await storage.getAllUsers();
  const isFirstUser = allUsers.length === 0;
  
  const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : "";
  const firstName = profile.name?.givenName || profile.displayName || "Unknown";
  const lastName = profile.name?.familyName || "";
  const profileImageUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "";

  const isSuperAdmin = email === "shailogix7469@gmail.com";
  const role = isSuperAdmin ? "super-admin" : (isFirstUser ? "admin" : "user");
  const approvalStatus = isSuperAdmin ? "approved" : "pending";

  const userData = {
    id: profile.id,
    email: email,
    firstName: firstName,
    lastName: lastName,
    profileImageUrl: profileImageUrl,
    role: role,
    approvalStatus: approvalStatus,
  };
  await storage.upsertUser(userData);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `/api/callback`,
          passReqToCallback: true,
        },
        async (req: any, accessToken: any, refreshToken: any, params: any, profile: any, done: any) => {
          try {
            await upsertUser(profile);
            const user = {
              id: profile.id,
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: params.expires_in ? Math.floor(Date.now() / 1000) + params.expires_in : undefined,
              claims: {
                sub: profile.id,
                email: profile.emails?.[0]?.value,
              }
            };
            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      accessType: "offline",
      prompt: "consent",
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.redirect("/");
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const dbUser = await storage.getUser(user.claims?.sub || user.id);
    if (dbUser) {
      user.role = dbUser.role;
      user.isAdmin = dbUser.role === "admin" || dbUser.role === "super-admin";
      user.isLeader = dbUser.role === "leader" || dbUser.role === "admin" || dbUser.role === "super-admin";
      user.isSuperAdmin = dbUser.role === "super-admin";
      user.claims = user.claims || { sub: dbUser.id, email: dbUser.email };
      user.approvalStatus = dbUser.approvalStatus;

      // Allow getting current user profile info, block all other API requests for unapproved users
      const isAuthUserRoute = req.path === "/auth/user" || req.path === "/api/auth/user";
      if (!isAuthUserRoute && dbUser.approvalStatus !== "approved" && dbUser.role !== "super-admin") {
        return res.status(403).json({ message: "Account pending approval", approvalStatus: dbUser.approvalStatus });
      }
    }
  } catch (e) {
    // silently ignore enrichment failure
  }
  return next();
};

export const requireSuperAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await storage.getUser(user.claims?.sub || user.id);
  if (!dbUser || dbUser.role !== "super-admin") {
    return res.status(403).json({ message: "Super-Admin access required" });
  }
  return next();
};

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await storage.getUser(user.claims?.sub || user.id);
  if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "super-admin")) {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
};

// Allows super-admin, admin, and leader roles
export const requireLeader: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await storage.getUser(user.claims?.sub || user.id);
  if (!dbUser || (dbUser.role !== "leader" && dbUser.role !== "admin" && dbUser.role !== "super-admin")) {
    return res.status(403).json({ message: "Leader access required" });
  }
  return next();
};

export const requireRole = (role: string): RequestHandler => async (req, res, next) => {
  const user = req.user as any;
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await storage.getUser(user.claims?.sub || user.id);
  if (!dbUser || (dbUser.role !== role && dbUser.role !== "super-admin")) {
    return res.status(403).json({ message: `${role} role required` });
  }
  return next();
};

import {
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
} from "@shared/schema";
import { type IStorage } from "./storage";

// Notification type (not in DB schema, kept in memory)
export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  isPinned: boolean;
  relatedEntity?: string;
  relatedId?: number;
  createdAt: Date;
}

// Document type for devotee documents
export interface DevoteeDocument {
  id: string;
  devoteeId: number;
  type: string;
  filename: string;
  base64: string;
  uploadedAt: Date;
}

// In-memory storage implementation
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private devotees: Map<number, Devotee> = new Map();
  private families: Map<number, Family> = new Map();
  private mentors: Map<number, Mentor> = new Map();
  private attendance: Map<number, Attendance> = new Map();
  private donations: Map<number, Donation> = new Map();
  private events: Map<number, Event> = new Map();
  private volunteering: Map<number, Volunteering> = new Map();
  private groups: Map<number, Group> = new Map();
  private groupEntries: Map<number, GroupEntry> = new Map();
  private mandals: Map<number, Mandal> = new Map();
  private sabhaLocations: Map<number, SabhaLocation> = new Map();
  private dashboardLayouts: Map<number, DashboardLayout> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();
  public notifications: Map<number, Notification> = new Map();
  public documentStore: Map<number, DevoteeDocument[]> = new Map();

  // Dev Config (in-memory fallback)
  public devConfigStore: Map<string, any> = new Map();

  // Dev Macros (in-memory fallback)
  public devMacros: Map<number, any> = new Map();
  private macroCounter = 1;

  // Audit Log (in-memory fallback)
  public auditLogEntries: any[] = [];

  // Visual Overrides (in-memory fallback)
  public visualOverridesStore: Record<string, any> = {};

  // Rollback Slots (in-memory fallback)
  public rollbackSlots: any[] = [];
  public rollbackNextIndex = 0;

  // Counter for auto-incrementing IDs
  private counters = {
    devotees: 1,
    families: 1,
    mentors: 1,
    attendance: 1,
    donations: 1,
    events: 1,
    volunteering: 1,
    groups: 1,
    groupEntries: 1,
    mandals: 1,
    sabhaLocations: 1,
    dashboardLayouts: 1,
    notifications: 1,
  };

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const now = new Date();
    const d = (daysAgo: number) => { const dt = new Date(now); dt.setDate(dt.getDate() - daysAgo); return dt; };
    const future = (daysAhead: number) => { const dt = new Date(now); dt.setDate(dt.getDate() + daysAhead); return dt; };

    // ─── FAMILIES ──────────────────────────────────────────────────────────
    const sampleFamilies: Family[] = [
      { id: 1, familyName: "Sharma Family", headOfFamily: 1, address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", phone: "9876543210", email: "sharma.family@email.com", totalMembers: 4, emergencyContact: "Ramesh Sharma", notes: "Founding family of the organization", isActive: true, createdAt: d(1800), updatedAt: now },
      { id: 2, familyName: "Patel Family", headOfFamily: 5, address: "17 Krishna Lane, Athwa", city: "Surat", state: "Gujarat", pincode: "395001", country: "India", phone: "9876543220", email: "patel.family@email.com", totalMembers: 3, emergencyContact: "Suresh Patel", notes: "Major donors and event organizers", isActive: true, createdAt: d(1500), updatedAt: now },
      { id: 3, familyName: "Desai Family", headOfFamily: 8, address: "5 Radha Niwas, Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390007", country: "India", phone: "9876543230", email: "desai.family@email.com", totalMembers: 3, emergencyContact: "Nilesh Desai", notes: "Senior mentors and teachers", isActive: true, createdAt: d(1200), updatedAt: now },
      { id: 4, familyName: "Mehta Family", headOfFamily: 11, address: "88 Satellite Road, Satellite", city: "Ahmedabad", state: "Gujarat", pincode: "380015", country: "India", phone: "9898765432", email: "mehta.family@email.com", totalMembers: 4, emergencyContact: "Vikram Mehta", notes: "Recently joined; very enthusiastic", isActive: true, createdAt: d(800), updatedAt: now },
      { id: 5, familyName: "Joshi Family", headOfFamily: 15, address: "22 Hanuman Chowk, Old City", city: "Surat", state: "Gujarat", pincode: "395003", country: "India", phone: "9712345678", email: "joshi.family@email.com", totalMembers: 3, emergencyContact: "Dinesh Joshi", notes: "Long-standing volunteers", isActive: true, createdAt: d(1000), updatedAt: now },
      { id: 6, familyName: "Shah Family", headOfFamily: 18, address: "9 Govardhan Society, Manjalpur", city: "Vadodara", state: "Gujarat", pincode: "390011", country: "India", phone: "9824567890", email: "shah.family@email.com", totalMembers: 2, emergencyContact: "Bharat Shah", notes: "Active in kirtan group", isActive: true, createdAt: d(600), updatedAt: now },
    ];
    sampleFamilies.forEach(f => { this.families.set(f.id, f); this.counters.families = Math.max(this.counters.families, f.id + 1); });

    // ─── DEVOTEES ──────────────────────────────────────────────────────────
    const sampleDevotees: Devotee[] = [
      // Sharma Family (familyId: 1)
      { id: 1, devoteeId: "MP-001", firstName: "Ramesh", lastName: "Sharma", email: "ramesh.sharma@email.com", phone: "9876543210", whatsappNumber: "9876543210", dateOfBirth: new Date("1975-03-15"), gender: "Male", address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", occupation: "Civil Engineer", spiritualLevel: "Advanced", joinDate: d(1800), mentorId: 2, familyId: 1, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh&backgroundColor=b6e3f4", notes: "Founding member. Leads the Ahmedabad seva team.", specialSkills: "Kirtan leadership, Project management", previousExperience: "5 years in ISKCON before joining", emergencyContact: "Sunita Sharma", emergencyPhone: "9876543211", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(1800), updatedAt: now },
      { id: 2, devoteeId: "MP-002", firstName: "Sunita", lastName: "Sharma", email: "sunita.sharma@email.com", phone: "9876543211", whatsappNumber: "9876543211", dateOfBirth: new Date("1978-07-22"), gender: "Female", address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", occupation: "School Teacher", spiritualLevel: "Intermediate", joinDate: d(1600), mentorId: 2, familyId: 1, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita&backgroundColor=ffdfbf", notes: "Leads women's weekly satsang every Thursday.", specialSkills: "Bhajan singing, Children's education", previousExperience: "3 years in local satsang group", emergencyContact: "Ramesh Sharma", emergencyPhone: "9876543210", medicalConditions: null, dietaryPreferences: "Vegan", isActive: true, createdAt: d(1600), updatedAt: now },
      { id: 3, devoteeId: "MP-003", firstName: "Arjun", lastName: "Sharma", email: "arjun.sharma@email.com", phone: "9876543212", whatsappNumber: "9876543212", dateOfBirth: new Date("2000-11-05"), gender: "Male", address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", occupation: "Engineering Student, IIT Ahmedabad", spiritualLevel: "Beginner", joinDate: d(600), mentorId: 1, familyId: 1, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=c0aede", notes: "Youth group leader. Plays mridanga.", specialSkills: "Mridanga, Social media management", previousExperience: null, emergencyContact: "Ramesh Sharma", emergencyPhone: "9876543210", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(600), updatedAt: now },
      { id: 4, devoteeId: "MP-004", firstName: "Priya", lastName: "Sharma", email: "priya.sharma@email.com", phone: "9876543213", whatsappNumber: "9876543213", dateOfBirth: new Date("2003-05-18"), gender: "Female", address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", occupation: "Class 12 Student", spiritualLevel: "Beginner", joinDate: d(400), mentorId: null, familyId: 1, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffd5dc", notes: "Helps with decoration and art for festivals.", specialSkills: "Rangoli, Art and crafts, Flower arrangement", previousExperience: null, emergencyContact: "Sunita Sharma", emergencyPhone: "9876543211", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(400), updatedAt: now },
      // Patel Family (familyId: 2)
      { id: 5, devoteeId: "MP-005", firstName: "Suresh", lastName: "Patel", email: "suresh.patel@email.com", phone: "9876543220", whatsappNumber: "9876543220", dateOfBirth: new Date("1968-09-30"), gender: "Male", address: "17 Krishna Lane, Athwa", city: "Surat", state: "Gujarat", pincode: "395001", country: "India", occupation: "Textile Businessman", spiritualLevel: "Teacher", joinDate: d(2000), mentorId: null, familyId: 2, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh&backgroundColor=b6e3f4", notes: "Primary donor for building fund and festivals. Manages event finances.", specialSkills: "Event management, Finance, Public speaking", previousExperience: "10 years in Vaishnav seva, former temple trustee", emergencyContact: "Meena Patel", emergencyPhone: "9876543221", medicalConditions: "Type-2 Diabetes — diet controlled", dietaryPreferences: "Vegan", isActive: true, createdAt: d(2000), updatedAt: now },
      { id: 6, devoteeId: "MP-006", firstName: "Meena", lastName: "Patel", email: "meena.patel@email.com", phone: "9876543221", whatsappNumber: "9876543221", dateOfBirth: new Date("1972-02-14"), gender: "Female", address: "17 Krishna Lane, Athwa", city: "Surat", state: "Gujarat", pincode: "395001", country: "India", occupation: "Paediatrician, Civil Hospital", spiritualLevel: "Advanced", joinDate: d(1900), mentorId: 2, familyId: 2, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meena&backgroundColor=ffdfbf", notes: "Provides free medical check-ups at annual camps.", specialSkills: "Medical first-aid, Counseling, Mother-child health", previousExperience: "8 years active seva", emergencyContact: "Suresh Patel", emergencyPhone: "9876543220", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(1900), updatedAt: now },
      { id: 7, devoteeId: "MP-007", firstName: "Rohan", lastName: "Patel", email: "rohan.patel@email.com", phone: "9876543222", whatsappNumber: "9876543222", dateOfBirth: new Date("1998-08-20"), gender: "Male", address: "17 Krishna Lane, Athwa", city: "Surat", state: "Gujarat", pincode: "395001", country: "India", occupation: "Software Engineer, TCS", spiritualLevel: "Intermediate", joinDate: d(800), mentorId: 1, familyId: 2, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan&backgroundColor=c0aede", notes: "Built and manages the organization website and digital presence.", specialSkills: "Web development, Graphic design, Photography", previousExperience: "2 years volunteer", emergencyContact: "Suresh Patel", emergencyPhone: "9876543220", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(800), updatedAt: now },
      // Desai Family (familyId: 3)
      { id: 8, devoteeId: "MP-008", firstName: "Nilesh", lastName: "Desai", email: "nilesh.desai@email.com", phone: "9876543230", whatsappNumber: "9876543230", dateOfBirth: new Date("1965-12-10"), gender: "Male", address: "5 Radha Niwas, Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390007", country: "India", occupation: "Sanskrit Professor, M.S. University", spiritualLevel: "Mentor", joinDate: d(2500), mentorId: null, familyId: 3, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nilesh&backgroundColor=b6e3f4", notes: "Most senior mentor. Conducts Bhagavad Gita classes and vedic workshops.", specialSkills: "Sanskrit, Vedic chanting, Philosophy, Academic teaching", previousExperience: "20 years as spiritual teacher", emergencyContact: "Kavita Desai", emergencyPhone: "9876543231", medicalConditions: "Mild hypertension — under medication", dietaryPreferences: "Sattvic Vegetarian", isActive: true, createdAt: d(2500), updatedAt: now },
      { id: 9, devoteeId: "MP-009", firstName: "Kavita", lastName: "Desai", email: "kavita.desai@email.com", phone: "9876543231", whatsappNumber: "9876543231", dateOfBirth: new Date("1970-04-25"), gender: "Female", address: "5 Radha Niwas, Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390007", country: "India", occupation: "Homemaker and Caterer", spiritualLevel: "Advanced", joinDate: d(2300), mentorId: 2, familyId: 3, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita&backgroundColor=ffd5dc", notes: "Heads prasad kitchen. Organizes prasad for 500+ people.", specialSkills: "Large-scale cooking, Event decoration, Logistics", previousExperience: "15 years prasad seva", emergencyContact: "Nilesh Desai", emergencyPhone: "9876543230", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(2300), updatedAt: now },
      { id: 10, devoteeId: "MP-010", firstName: "Tanvi", lastName: "Desai", email: "tanvi.desai@email.com", phone: "9876543232", whatsappNumber: "9876543232", dateOfBirth: new Date("2002-01-30"), gender: "Female", address: "5 Radha Niwas, Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390007", country: "India", occupation: "BCA Student, Maharaja Sayajirao University", spiritualLevel: "Beginner", joinDate: d(300), mentorId: null, familyId: 3, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvi&backgroundColor=c0aede", notes: "Performs classical dance at festivals.", specialSkills: "Bharatanatyam, Harmonium, Event compering", previousExperience: null, emergencyContact: "Kavita Desai", emergencyPhone: "9876543231", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(300), updatedAt: now },
      // Mehta Family (familyId: 4)
      { id: 11, devoteeId: "MP-011", firstName: "Vikram", lastName: "Mehta", email: "vikram.mehta@email.com", phone: "9898765432", whatsappNumber: "9898765432", dateOfBirth: new Date("1980-06-12"), gender: "Male", address: "88 Satellite Road, Satellite", city: "Ahmedabad", state: "Gujarat", pincode: "380015", country: "India", occupation: "Chartered Accountant", spiritualLevel: "Intermediate", joinDate: d(900), mentorId: 1, familyId: 4, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram&backgroundColor=b6e3f4", notes: "Manages annual audits and financial reporting for the organization.", specialSkills: "Accounting, Tax planning, Public relations", previousExperience: "1 year in another satsang", emergencyContact: "Rekha Mehta", emergencyPhone: "9898765433", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(900), updatedAt: now },
      { id: 12, devoteeId: "MP-012", firstName: "Rekha", lastName: "Mehta", email: "rekha.mehta@email.com", phone: "9898765433", whatsappNumber: "9898765433", dateOfBirth: new Date("1983-09-05"), gender: "Female", address: "88 Satellite Road, Satellite", city: "Ahmedabad", state: "Gujarat", pincode: "380015", country: "India", occupation: "Interior Designer", spiritualLevel: "Beginner", joinDate: d(700), mentorId: null, familyId: 4, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rekha&backgroundColor=ffdfbf", notes: "Designs stage and venue decor for major events.", specialSkills: "Interior design, Stage decoration, Floral art", previousExperience: null, emergencyContact: "Vikram Mehta", emergencyPhone: "9898765432", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(700), updatedAt: now },
      { id: 13, devoteeId: "MP-013", firstName: "Aakash", lastName: "Mehta", email: "aakash.mehta@email.com", phone: "9898765434", whatsappNumber: "9898765434", dateOfBirth: new Date("2006-03-22"), gender: "Male", address: "88 Satellite Road, Satellite", city: "Ahmedabad", state: "Gujarat", pincode: "380015", country: "India", occupation: "High School Student", spiritualLevel: "Beginner", joinDate: d(250), mentorId: null, familyId: 4, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aakash&backgroundColor=c0aede", notes: "Active in bal satsang.", specialSkills: "Cricket, Quiz hosting", previousExperience: null, emergencyContact: "Vikram Mehta", emergencyPhone: "9898765432", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(250), updatedAt: now },
      { id: 14, devoteeId: "MP-014", firstName: "Nisha", lastName: "Mehta", email: "nisha.mehta@email.com", phone: "9898765435", whatsappNumber: "9898765435", dateOfBirth: new Date("2009-11-15"), gender: "Female", address: "88 Satellite Road, Satellite", city: "Ahmedabad", state: "Gujarat", pincode: "380015", country: "India", occupation: "Primary School Student", spiritualLevel: "Beginner", joinDate: d(180), mentorId: null, familyId: 4, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nisha&backgroundColor=ffd5dc", notes: "Participates in children's drama at festivals.", specialSkills: "Drama, Storytelling", previousExperience: null, emergencyContact: "Rekha Mehta", emergencyPhone: "9898765433", medicalConditions: "Mild asthma — uses inhaler", dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(180), updatedAt: now },
      // Joshi Family (familyId: 5)
      { id: 15, devoteeId: "MP-015", firstName: "Dinesh", lastName: "Joshi", email: "dinesh.joshi@email.com", phone: "9712345678", whatsappNumber: "9712345678", dateOfBirth: new Date("1972-07-04"), gender: "Male", address: "22 Hanuman Chowk, Old City", city: "Surat", state: "Gujarat", pincode: "395003", country: "India", occupation: "Government School Principal", spiritualLevel: "Advanced", joinDate: d(1400), mentorId: 2, familyId: 5, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dinesh&backgroundColor=b6e3f4", notes: "Manages registration desk and volunteer coordination at events.", specialSkills: "Administration, Public speaking, Youth mentoring", previousExperience: "8 years in Bal Vikas program", emergencyContact: "Hansa Joshi", emergencyPhone: "9712345679", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(1400), updatedAt: now },
      { id: 16, devoteeId: "MP-016", firstName: "Hansa", lastName: "Joshi", email: "hansa.joshi@email.com", phone: "9712345679", whatsappNumber: "9712345679", dateOfBirth: new Date("1976-03-18"), gender: "Female", address: "22 Hanuman Chowk, Old City", city: "Surat", state: "Gujarat", pincode: "395003", country: "India", occupation: "Ayurvedic Doctor", spiritualLevel: "Advanced", joinDate: d(1200), mentorId: 2, familyId: 5, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hansa&backgroundColor=ffdfbf", notes: "Conducts Ayurvedic health camps. Active in women's satsang.", specialSkills: "Ayurveda, Yoga, Pranayama, Natural remedies", previousExperience: "6 years yoga instructor", emergencyContact: "Dinesh Joshi", emergencyPhone: "9712345678", medicalConditions: null, dietaryPreferences: "Sattvic Vegetarian", isActive: true, createdAt: d(1200), updatedAt: now },
      { id: 17, devoteeId: "MP-017", firstName: "Krunal", lastName: "Joshi", email: "krunal.joshi@email.com", phone: "9712345680", whatsappNumber: "9712345680", dateOfBirth: new Date("2001-09-28"), gender: "Male", address: "22 Hanuman Chowk, Old City", city: "Surat", state: "Gujarat", pincode: "395003", country: "India", occupation: "Commerce Graduate, Job seeking", spiritualLevel: "Beginner", joinDate: d(350), mentorId: null, familyId: 5, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Krunal&backgroundColor=c0aede", notes: "Helps with kirtan sound system setup.", specialSkills: "Sound engineering, Tabla", previousExperience: null, emergencyContact: "Dinesh Joshi", emergencyPhone: "9712345678", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(350), updatedAt: now },
      // Shah Family (familyId: 6)
      { id: 18, devoteeId: "MP-018", firstName: "Bharat", lastName: "Shah", email: "bharat.shah@email.com", phone: "9824567890", whatsappNumber: "9824567890", dateOfBirth: new Date("1969-01-08"), gender: "Male", address: "9 Govardhan Society, Manjalpur", city: "Vadodara", state: "Gujarat", pincode: "390011", country: "India", occupation: "Retired Bank Manager", spiritualLevel: "Intermediate", joinDate: d(700), mentorId: 2, familyId: 6, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bharat&backgroundColor=b6e3f4", notes: "Assists with bank transactions and cheque management for donations.", specialSkills: "Banking, Finance, Ledger keeping", previousExperience: "35 years banking career", emergencyContact: "Jyoti Shah", emergencyPhone: "9824567891", medicalConditions: "Knee arthritis — limited standing", dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(700), updatedAt: now },
      { id: 19, devoteeId: "MP-019", firstName: "Jyoti", lastName: "Shah", email: "jyoti.shah@email.com", phone: "9824567891", whatsappNumber: "9824567891", dateOfBirth: new Date("1973-05-30"), gender: "Female", address: "9 Govardhan Society, Manjalpur", city: "Vadodara", state: "Gujarat", pincode: "390011", country: "India", occupation: "Classical Musician", spiritualLevel: "Advanced", joinDate: d(650), mentorId: 2, familyId: 6, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jyoti&backgroundColor=ffd5dc", notes: "Leads kirtan sessions. Trained in Hindustani classical vocal.", specialSkills: "Classical vocal, Harmonium, Sitar, Music training", previousExperience: "10 years kirtan performer", emergencyContact: "Bharat Shah", emergencyPhone: "9824567890", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(650), updatedAt: now },
      // Independent
      { id: 20, devoteeId: "MP-020", firstName: "Paresh", lastName: "Trivedi", email: "paresh.trivedi@email.com", phone: "9988776655", whatsappNumber: "9988776655", dateOfBirth: new Date("1985-10-20"), gender: "Male", address: "15 Mangal Murti Society, Vasna", city: "Ahmedabad", state: "Gujarat", pincode: "380007", country: "India", occupation: "Lawyer, High Court", spiritualLevel: "Intermediate", joinDate: d(500), mentorId: 1, familyId: null, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Paresh&backgroundColor=b6e3f4", notes: "Provides free legal advice for the organization. Handles property and trust matters.", specialSkills: "Legal drafting, Public interest litigation, Trust law", previousExperience: "2 years in another religious trust", emergencyContact: "Mina Trivedi", emergencyPhone: "9988776656", medicalConditions: null, dietaryPreferences: "Vegetarian", isActive: true, createdAt: d(500), updatedAt: now },
    ];
    sampleDevotees.forEach(dv => { this.devotees.set(dv.id, dv); this.counters.devotees = Math.max(this.counters.devotees, dv.id + 1); });

    // Imported from external Madhav Parivar instance
    const importedDevotees: Devotee[] = [
      { id: 101, devoteeId: 'IMP-0001', firstName: 'Rajesh', lastName: 'Sharma', email: 'rajesh.sharma@email.com', phone: '9876500001', whatsappNumber: '9876500001', dateOfBirth: new Date('1960-01-01T00:00:00.000Z'), gender: 'Male' as any, address: '1, Main Street, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', occupation: 'Software Engineer', spiritualLevel: 'Seeker', joinDate: new Date('2020-01-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 1', emergencyPhone: '9876549000', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 102, devoteeId: 'IMP-0002', firstName: 'Priya', lastName: 'Gupta', email: 'priya.gupta@email.com', phone: '9876500002', whatsappNumber: '9876500002', dateOfBirth: new Date('1961-02-01T00:00:00.000Z'), gender: 'Female' as any, address: '2, Main Street, Delhi', city: 'Delhi', state: 'Delhi', pincode: '400002', country: 'India', occupation: 'Doctor', spiritualLevel: 'Practitioner', joinDate: new Date('2020-01-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 2', emergencyPhone: '9876549001', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 103, devoteeId: 'IMP-0003', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@email.com', phone: '9876500003', whatsappNumber: '9876500003', dateOfBirth: new Date('1962-03-01T00:00:00.000Z'), gender: 'Male' as any, address: '3, Main Street, Bangalore', city: 'Bangalore', state: 'Karnataka', pincode: '400003', country: 'India', occupation: 'Teacher', spiritualLevel: 'Devotee', joinDate: new Date('2020-02-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 3', emergencyPhone: '9876549002', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 104, devoteeId: 'IMP-0004', firstName: 'Sunita', lastName: 'Singh', email: 'sunita.singh@email.com', phone: '9876500004', whatsappNumber: '9876500004', dateOfBirth: new Date('1963-04-01T00:00:00.000Z'), gender: 'Male' as any, address: '4, Main Street, Pune', city: 'Pune', state: 'Maharashtra', pincode: '400004', country: 'India', occupation: 'Business Owner', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2020-03-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 4', emergencyPhone: '9876549003', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 105, devoteeId: 'IMP-0005', firstName: 'Vikram', lastName: 'Verma', email: 'vikram.verma@email.com', phone: '9876500005', whatsappNumber: '9876500005', dateOfBirth: new Date('1964-05-01T00:00:00.000Z'), gender: 'Female' as any, address: '5, Main Street, Hyderabad', city: 'Hyderabad', state: 'Telangana', pincode: '400005', country: 'India', occupation: 'Accountant', spiritualLevel: 'Senior Devotee', joinDate: new Date('2020-04-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 5', emergencyPhone: '9876549004', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 106, devoteeId: 'IMP-0006', firstName: 'Meera', lastName: 'Agarwal', email: 'meera.agarwal@email.com', phone: '9876500006', whatsappNumber: '9876500006', dateOfBirth: new Date('1965-06-01T00:00:00.000Z'), gender: 'Male' as any, address: '6, Main Street, Chennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '400006', country: 'India', occupation: 'Lawyer', spiritualLevel: 'Seeker', joinDate: new Date('2020-05-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 6', emergencyPhone: '9876549005', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 107, devoteeId: 'IMP-0007', firstName: 'Deepak', lastName: 'Mehta', email: 'deepak.mehta@email.com', phone: '9876500007', whatsappNumber: '9876500007', dateOfBirth: new Date('1966-07-01T00:00:00.000Z'), gender: 'Female' as any, address: '7, Main Street, Kolkata', city: 'Kolkata', state: 'West Bengal', pincode: '400007', country: 'India', occupation: 'Engineer', spiritualLevel: 'Practitioner', joinDate: new Date('2020-05-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 7', emergencyPhone: '9876549006', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 108, devoteeId: 'IMP-0008', firstName: 'Kavita', lastName: 'Joshi', email: 'kavita.joshi@email.com', phone: '9876500008', whatsappNumber: '9876500008', dateOfBirth: new Date('1967-08-01T00:00:00.000Z'), gender: 'Male' as any, address: '8, Main Street, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', pincode: '400008', country: 'India', occupation: 'Professor', spiritualLevel: 'Devotee', joinDate: new Date('2020-06-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 8', emergencyPhone: '9876549007', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 109, devoteeId: 'IMP-0009', firstName: 'Suresh', lastName: 'Yadav', email: 'suresh.yadav@email.com', phone: '9876500009', whatsappNumber: '9876500009', dateOfBirth: new Date('1968-09-01T00:00:00.000Z'), gender: 'Male' as any, address: '9, Main Street, Jaipur', city: 'Jaipur', state: 'Rajasthan', pincode: '400009', country: 'India', occupation: 'Retired', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2020-07-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 9', emergencyPhone: '9876549008', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 110, devoteeId: 'IMP-0010', firstName: 'Anita', lastName: 'Mishra', email: 'anita.mishra@email.com', phone: '9876500010', whatsappNumber: '9876500010', dateOfBirth: new Date('1969-10-01T00:00:00.000Z'), gender: 'Female' as any, address: '10, Main Street, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '400010', country: 'India', occupation: 'Homemaker', spiritualLevel: 'Senior Devotee', joinDate: new Date('2020-08-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 10', emergencyPhone: '9876549009', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 111, devoteeId: 'IMP-0011', firstName: 'Ravi', lastName: 'Tiwari', email: 'ravi.tiwari@email.com', phone: '9876500011', whatsappNumber: '9876500011', dateOfBirth: new Date('1970-11-01T00:00:00.000Z'), gender: 'Male' as any, address: '11, Main Street, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400011', country: 'India', occupation: 'Software Engineer', spiritualLevel: 'Seeker', joinDate: new Date('2020-09-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 11', emergencyPhone: '9876549010', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 112, devoteeId: 'IMP-0012', firstName: 'Geeta', lastName: 'Pandey', email: 'geeta.pandey@email.com', phone: '9876500012', whatsappNumber: '9876500012', dateOfBirth: new Date('1971-12-01T00:00:00.000Z'), gender: 'Female' as any, address: '12, Main Street, Delhi', city: 'Delhi', state: 'Delhi', pincode: '400012', country: 'India', occupation: 'Doctor', spiritualLevel: 'Practitioner', joinDate: new Date('2020-09-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 12', emergencyPhone: '9876549011', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 113, devoteeId: 'IMP-0013', firstName: 'Manoj', lastName: 'Dubey', email: 'manoj.dubey@email.com', phone: '9876500013', whatsappNumber: '9876500013', dateOfBirth: new Date('1972-01-01T00:00:00.000Z'), gender: 'Male' as any, address: '13, Main Street, Bangalore', city: 'Bangalore', state: 'Karnataka', pincode: '400013', country: 'India', occupation: 'Teacher', spiritualLevel: 'Devotee', joinDate: new Date('2020-10-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 13', emergencyPhone: '9876549012', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 114, devoteeId: 'IMP-0014', firstName: 'Sanjay', lastName: 'Chaturvedi', email: 'sanjay.chaturvedi@email.com', phone: '9876500014', whatsappNumber: '9876500014', dateOfBirth: new Date('1973-02-01T00:00:00.000Z'), gender: 'Male' as any, address: '14, Main Street, Pune', city: 'Pune', state: 'Maharashtra', pincode: '400014', country: 'India', occupation: 'Business Owner', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2020-11-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 14', emergencyPhone: '9876549013', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 115, devoteeId: 'IMP-0015', firstName: 'Rekha', lastName: 'Srivastava', email: 'rekha.srivastava@email.com', phone: '9876500015', whatsappNumber: '9876500015', dateOfBirth: new Date('1974-03-01T00:00:00.000Z'), gender: 'Female' as any, address: '15, Main Street, Hyderabad', city: 'Hyderabad', state: 'Telangana', pincode: '400015', country: 'India', occupation: 'Accountant', spiritualLevel: 'Senior Devotee', joinDate: new Date('2020-12-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2020. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 15', emergencyPhone: '9876549014', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 116, devoteeId: 'IMP-0016', firstName: 'Anil', lastName: 'Dixit', email: 'anil.dixit@email.com', phone: '9876500016', whatsappNumber: '9876500016', dateOfBirth: new Date('1975-04-01T00:00:00.000Z'), gender: 'Male' as any, address: '16, Main Street, Chennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '400016', country: 'India', occupation: 'Lawyer', spiritualLevel: 'Seeker', joinDate: new Date('2021-01-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 16', emergencyPhone: '9876549015', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 117, devoteeId: 'IMP-0017', firstName: 'Pooja', lastName: 'Bajpai', email: 'pooja.bajpai@email.com', phone: '9876500017', whatsappNumber: '9876500017', dateOfBirth: new Date('1976-05-01T00:00:00.000Z'), gender: 'Female' as any, address: '17, Main Street, Kolkata', city: 'Kolkata', state: 'West Bengal', pincode: '400017', country: 'India', occupation: 'Engineer', spiritualLevel: 'Practitioner', joinDate: new Date('2021-01-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 17', emergencyPhone: '9876549016', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 118, devoteeId: 'IMP-0018', firstName: 'Rahul', lastName: 'Saxena', email: 'rahul.saxena@email.com', phone: '9876500018', whatsappNumber: '9876500018', dateOfBirth: new Date('1977-06-01T00:00:00.000Z'), gender: 'Male' as any, address: '18, Main Street, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', pincode: '400018', country: 'India', occupation: 'Professor', spiritualLevel: 'Devotee', joinDate: new Date('2021-02-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 18', emergencyPhone: '9876549017', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 119, devoteeId: 'IMP-0019', firstName: 'Nandita', lastName: 'Shukla', email: 'nandita.shukla@email.com', phone: '9876500019', whatsappNumber: '9876500019', dateOfBirth: new Date('1978-07-01T00:00:00.000Z'), gender: 'Male' as any, address: '19, Main Street, Jaipur', city: 'Jaipur', state: 'Rajasthan', pincode: '400019', country: 'India', occupation: 'Retired', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2021-03-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 19', emergencyPhone: '9876549018', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 120, devoteeId: 'IMP-0020', firstName: 'Ashok', lastName: 'Tripathi', email: 'ashok.tripathi@email.com', phone: '9876500020', whatsappNumber: '9876500020', dateOfBirth: new Date('1979-08-01T00:00:00.000Z'), gender: 'Female' as any, address: '20, Main Street, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '400020', country: 'India', occupation: 'Homemaker', spiritualLevel: 'Senior Devotee', joinDate: new Date('2021-04-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 20', emergencyPhone: '9876549019', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 121, devoteeId: 'IMP-0021', firstName: 'Lata', lastName: 'Awasthi', email: 'lata.awasthi@email.com', phone: '9876500021', whatsappNumber: '9876500021', dateOfBirth: new Date('1980-09-01T00:00:00.000Z'), gender: 'Male' as any, address: '21, Main Street, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400021', country: 'India', occupation: 'Software Engineer', spiritualLevel: 'Seeker', joinDate: new Date('2021-05-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 21', emergencyPhone: '9876549020', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 122, devoteeId: 'IMP-0022', firstName: 'Mukesh', lastName: 'Kesharwani', email: 'mukesh.kesharwani@email.com', phone: '9876500022', whatsappNumber: '9876500022', dateOfBirth: new Date('1981-10-01T00:00:00.000Z'), gender: 'Female' as any, address: '22, Main Street, Delhi', city: 'Delhi', state: 'Delhi', pincode: '400022', country: 'India', occupation: 'Doctor', spiritualLevel: 'Practitioner', joinDate: new Date('2021-05-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 22', emergencyPhone: '9876549021', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 123, devoteeId: 'IMP-0023', firstName: 'Usha', lastName: 'Upadhyay', email: 'usha.upadhyay@email.com', phone: '9876500023', whatsappNumber: '9876500023', dateOfBirth: new Date('1982-11-01T00:00:00.000Z'), gender: 'Male' as any, address: '23, Main Street, Bangalore', city: 'Bangalore', state: 'Karnataka', pincode: '400023', country: 'India', occupation: 'Teacher', spiritualLevel: 'Devotee', joinDate: new Date('2021-06-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 23', emergencyPhone: '9876549022', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 124, devoteeId: 'IMP-0024', firstName: 'Ramesh', lastName: 'Maurya', email: 'ramesh.maurya@email.com', phone: '9876500024', whatsappNumber: '9876500024', dateOfBirth: new Date('1983-12-01T00:00:00.000Z'), gender: 'Male' as any, address: '24, Main Street, Pune', city: 'Pune', state: 'Maharashtra', pincode: '400024', country: 'India', occupation: 'Business Owner', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2021-07-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 24', emergencyPhone: '9876549023', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 125, devoteeId: 'IMP-0025', firstName: 'Shobha', lastName: 'Bajaj', email: 'shobha.bajaj@email.com', phone: '9876500025', whatsappNumber: '9876500025', dateOfBirth: new Date('1984-01-01T00:00:00.000Z'), gender: 'Female' as any, address: '25, Main Street, Hyderabad', city: 'Hyderabad', state: 'Telangana', pincode: '400025', country: 'India', occupation: 'Accountant', spiritualLevel: 'Senior Devotee', joinDate: new Date('2021-08-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 25', emergencyPhone: '9876549024', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 126, devoteeId: 'IMP-0026', firstName: 'Dinesh', lastName: 'Goyal', email: 'dinesh.goyal@email.com', phone: '9876500026', whatsappNumber: '9876500026', dateOfBirth: new Date('1985-02-01T00:00:00.000Z'), gender: 'Male' as any, address: '26, Main Street, Chennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '400026', country: 'India', occupation: 'Lawyer', spiritualLevel: 'Seeker', joinDate: new Date('2021-09-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 26', emergencyPhone: '9876549025', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 127, devoteeId: 'IMP-0027', firstName: 'Asha', lastName: 'Kapoor', email: 'asha.kapoor@email.com', phone: '9876500027', whatsappNumber: '9876500027', dateOfBirth: new Date('1986-03-01T00:00:00.000Z'), gender: 'Female' as any, address: '27, Main Street, Kolkata', city: 'Kolkata', state: 'West Bengal', pincode: '400027', country: 'India', occupation: 'Engineer', spiritualLevel: 'Practitioner', joinDate: new Date('2021-09-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 27', emergencyPhone: '9876549026', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 128, devoteeId: 'IMP-0028', firstName: 'Naresh', lastName: 'Malhotra', email: 'naresh.malhotra@email.com', phone: '9876500028', whatsappNumber: '9876500028', dateOfBirth: new Date('1987-04-01T00:00:00.000Z'), gender: 'Male' as any, address: '28, Main Street, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', pincode: '400028', country: 'India', occupation: 'Professor', spiritualLevel: 'Devotee', joinDate: new Date('2021-10-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 28', emergencyPhone: '9876549027', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 129, devoteeId: 'IMP-0029', firstName: 'Sudha', lastName: 'Khanna', email: 'sudha.khanna@email.com', phone: '9876500029', whatsappNumber: '9876500029', dateOfBirth: new Date('1988-05-01T00:00:00.000Z'), gender: 'Male' as any, address: '29, Main Street, Jaipur', city: 'Jaipur', state: 'Rajasthan', pincode: '400029', country: 'India', occupation: 'Retired', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2021-11-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 29', emergencyPhone: '9876549028', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 130, devoteeId: 'IMP-0030', firstName: 'Vinod', lastName: 'Batra', email: 'vinod.batra@email.com', phone: '9876500030', whatsappNumber: '9876500030', dateOfBirth: new Date('1989-06-01T00:00:00.000Z'), gender: 'Female' as any, address: '30, Main Street, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '400030', country: 'India', occupation: 'Homemaker', spiritualLevel: 'Senior Devotee', joinDate: new Date('2021-12-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2021. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 30', emergencyPhone: '9876549029', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 131, devoteeId: 'IMP-0031', firstName: 'Seema', lastName: 'Anand', email: 'seema.anand@email.com', phone: '9876500031', whatsappNumber: '9876500031', dateOfBirth: new Date('1990-07-01T00:00:00.000Z'), gender: 'Male' as any, address: '31, Main Street, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400031', country: 'India', occupation: 'Software Engineer', spiritualLevel: 'Seeker', joinDate: new Date('2022-01-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 31', emergencyPhone: '9876549030', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 132, devoteeId: 'IMP-0032', firstName: 'Harish', lastName: 'Sood', email: 'harish.sood@email.com', phone: '9876500032', whatsappNumber: '9876500032', dateOfBirth: new Date('1991-08-01T00:00:00.000Z'), gender: 'Female' as any, address: '32, Main Street, Delhi', city: 'Delhi', state: 'Delhi', pincode: '400032', country: 'India', occupation: 'Doctor', spiritualLevel: 'Practitioner', joinDate: new Date('2022-01-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 32', emergencyPhone: '9876549031', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 133, devoteeId: 'IMP-0033', firstName: 'Kamla', lastName: 'Bhatt', email: 'kamla.bhatt@email.com', phone: '9876500033', whatsappNumber: '9876500033', dateOfBirth: new Date('1992-09-01T00:00:00.000Z'), gender: 'Male' as any, address: '33, Main Street, Bangalore', city: 'Bangalore', state: 'Karnataka', pincode: '400033', country: 'India', occupation: 'Teacher', spiritualLevel: 'Devotee', joinDate: new Date('2022-02-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 33', emergencyPhone: '9876549032', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 134, devoteeId: 'IMP-0034', firstName: 'Sunil', lastName: 'Nair', email: 'sunil.nair@email.com', phone: '9876500034', whatsappNumber: '9876500034', dateOfBirth: new Date('1993-10-01T00:00:00.000Z'), gender: 'Male' as any, address: '34, Main Street, Pune', city: 'Pune', state: 'Maharashtra', pincode: '400034', country: 'India', occupation: 'Business Owner', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2022-03-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 34', emergencyPhone: '9876549033', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 135, devoteeId: 'IMP-0035', firstName: 'Radha', lastName: 'Pillai', email: 'radha.pillai@email.com', phone: '9876500035', whatsappNumber: '9876500035', dateOfBirth: new Date('1994-11-01T00:00:00.000Z'), gender: 'Female' as any, address: '35, Main Street, Hyderabad', city: 'Hyderabad', state: 'Telangana', pincode: '400035', country: 'India', occupation: 'Accountant', spiritualLevel: 'Senior Devotee', joinDate: new Date('2022-04-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 35', emergencyPhone: '9876549034', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 136, devoteeId: 'IMP-0036', firstName: 'Girish', lastName: 'Menon', email: 'girish.menon@email.com', phone: '9876500036', whatsappNumber: '9876500036', dateOfBirth: new Date('1960-12-01T00:00:00.000Z'), gender: 'Male' as any, address: '36, Main Street, Chennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '400036', country: 'India', occupation: 'Lawyer', spiritualLevel: 'Seeker', joinDate: new Date('2022-05-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 36', emergencyPhone: '9876549035', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 137, devoteeId: 'IMP-0037', firstName: 'Rani', lastName: 'Reddy', email: 'rani.reddy@email.com', phone: '9876500037', whatsappNumber: '9876500037', dateOfBirth: new Date('1961-01-01T00:00:00.000Z'), gender: 'Female' as any, address: '37, Main Street, Kolkata', city: 'Kolkata', state: 'West Bengal', pincode: '400037', country: 'India', occupation: 'Engineer', spiritualLevel: 'Practitioner', joinDate: new Date('2022-05-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 37', emergencyPhone: '9876549036', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 138, devoteeId: 'IMP-0038', firstName: 'Ganesh', lastName: 'Rao', email: 'ganesh.rao@email.com', phone: '9876500038', whatsappNumber: '9876500038', dateOfBirth: new Date('1962-02-01T00:00:00.000Z'), gender: 'Male' as any, address: '38, Main Street, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', pincode: '400038', country: 'India', occupation: 'Professor', spiritualLevel: 'Devotee', joinDate: new Date('2022-06-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 38', emergencyPhone: '9876549037', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 139, devoteeId: 'IMP-0039', firstName: 'Saraswati', lastName: 'Iyer', email: 'saraswati.iyer@email.com', phone: '9876500039', whatsappNumber: '9876500039', dateOfBirth: new Date('1963-03-01T00:00:00.000Z'), gender: 'Male' as any, address: '39, Main Street, Jaipur', city: 'Jaipur', state: 'Rajasthan', pincode: '400039', country: 'India', occupation: 'Retired', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2022-07-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 39', emergencyPhone: '9876549038', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 140, devoteeId: 'IMP-0040', firstName: 'Bijoy', lastName: 'Das', email: 'bijoy.das@email.com', phone: '9876500040', whatsappNumber: '9876500040', dateOfBirth: new Date('1964-04-01T00:00:00.000Z'), gender: 'Female' as any, address: '40, Main Street, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '400040', country: 'India', occupation: 'Homemaker', spiritualLevel: 'Senior Devotee', joinDate: new Date('2022-08-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 40', emergencyPhone: '9876549039', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 141, devoteeId: 'IMP-0041', firstName: 'Mala', lastName: 'Bose', email: 'mala.bose@email.com', phone: '9876500041', whatsappNumber: '9876500041', dateOfBirth: new Date('1965-05-01T00:00:00.000Z'), gender: 'Male' as any, address: '41, Main Street, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400041', country: 'India', occupation: 'Software Engineer', spiritualLevel: 'Seeker', joinDate: new Date('2022-09-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 41', emergencyPhone: '9876549040', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 142, devoteeId: 'IMP-0042', firstName: 'Tapan', lastName: 'Dey', email: 'tapan.dey@email.com', phone: '9876500042', whatsappNumber: '9876500042', dateOfBirth: new Date('1966-06-01T00:00:00.000Z'), gender: 'Female' as any, address: '42, Main Street, Delhi', city: 'Delhi', state: 'Delhi', pincode: '400042', country: 'India', occupation: 'Doctor', spiritualLevel: 'Practitioner', joinDate: new Date('2022-09-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 42', emergencyPhone: '9876549041', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 143, devoteeId: 'IMP-0043', firstName: 'Rupa', lastName: 'Banerjee', email: 'rupa.banerjee@email.com', phone: '9876500043', whatsappNumber: '9876500043', dateOfBirth: new Date('1967-07-01T00:00:00.000Z'), gender: 'Male' as any, address: '43, Main Street, Bangalore', city: 'Bangalore', state: 'Karnataka', pincode: '400043', country: 'India', occupation: 'Teacher', spiritualLevel: 'Devotee', joinDate: new Date('2022-10-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 43', emergencyPhone: '9876549042', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 144, devoteeId: 'IMP-0044', firstName: 'Subrata', lastName: 'Chakraborty', email: 'subrata.chakraborty@email.com', phone: '9876500044', whatsappNumber: '9876500044', dateOfBirth: new Date('1968-08-01T00:00:00.000Z'), gender: 'Male' as any, address: '44, Main Street, Pune', city: 'Pune', state: 'Maharashtra', pincode: '400044', country: 'India', occupation: 'Business Owner', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2022-11-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 44', emergencyPhone: '9876549043', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 145, devoteeId: 'IMP-0045', firstName: 'Madhuri', lastName: 'Mukherjee', email: 'madhuri.mukherjee@email.com', phone: '9876500045', whatsappNumber: '9876500045', dateOfBirth: new Date('1969-09-01T00:00:00.000Z'), gender: 'Female' as any, address: '45, Main Street, Hyderabad', city: 'Hyderabad', state: 'Telangana', pincode: '400045', country: 'India', occupation: 'Accountant', spiritualLevel: 'Senior Devotee', joinDate: new Date('2022-12-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2022. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 45', emergencyPhone: '9876549044', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 146, devoteeId: 'IMP-0046', firstName: 'Pranab', lastName: 'Roy', email: 'pranab.roy@email.com', phone: '9876500046', whatsappNumber: '9876500046', dateOfBirth: new Date('1970-10-01T00:00:00.000Z'), gender: 'Male' as any, address: '46, Main Street, Chennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '400046', country: 'India', occupation: 'Lawyer', spiritualLevel: 'Seeker', joinDate: new Date('2023-01-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2023. Active member of the community.', specialSkills: 'Singing', previousExperience: null, emergencyContact: 'Emergency Contact 46', emergencyPhone: '9876549045', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 147, devoteeId: 'IMP-0047', firstName: 'Lakshmi', lastName: 'Kumar', email: 'lakshmi.kumar@email.com', phone: '9876500047', whatsappNumber: '9876500047', dateOfBirth: new Date('1971-11-01T00:00:00.000Z'), gender: 'Female' as any, address: '47, Main Street, Kolkata', city: 'Kolkata', state: 'West Bengal', pincode: '400047', country: 'India', occupation: 'Engineer', spiritualLevel: 'Practitioner', joinDate: new Date('2023-01-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2023. Active member of the community.', specialSkills: 'Cooking', previousExperience: null, emergencyContact: 'Emergency Contact 47', emergencyPhone: '9876549046', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
      { id: 148, devoteeId: 'IMP-0048', firstName: 'Govind', lastName: 'Prasad', email: 'govind.prasad@email.com', phone: '9876500048', whatsappNumber: '9876500048', dateOfBirth: new Date('1972-12-01T00:00:00.000Z'), gender: 'Male' as any, address: '48, Main Street, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', pincode: '400048', country: 'India', occupation: 'Professor', spiritualLevel: 'Devotee', joinDate: new Date('2023-02-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2023. Active member of the community.', specialSkills: 'Teaching', previousExperience: null, emergencyContact: 'Emergency Contact 48', emergencyPhone: '9876549047', medicalConditions: null, dietaryPreferences: 'Jain Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 149, devoteeId: 'IMP-0049', firstName: 'Shakuntala', lastName: 'Jha', email: 'shakuntala.jha@email.com', phone: '9876500049', whatsappNumber: '9876500049', dateOfBirth: new Date('1973-01-01T00:00:00.000Z'), gender: 'Male' as any, address: '49, Main Street, Jaipur', city: 'Jaipur', state: 'Rajasthan', pincode: '400049', country: 'India', occupation: 'Retired', spiritualLevel: 'Advanced Devotee', joinDate: new Date('2023-03-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2023. Active member of the community.', specialSkills: 'Driving', previousExperience: null, emergencyContact: 'Emergency Contact 49', emergencyPhone: '9876549048', medicalConditions: null, dietaryPreferences: 'Vegetarian', isActive: true, createdAt: now, updatedAt: now },
      { id: 150, devoteeId: 'IMP-0050', firstName: 'Mahesh', lastName: 'Thakur', email: 'mahesh.thakur@email.com', phone: '9876500050', whatsappNumber: '9876500050', dateOfBirth: new Date('1974-02-01T00:00:00.000Z'), gender: 'Female' as any, address: '50, Main Street, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '400050', country: 'India', occupation: 'Homemaker', spiritualLevel: 'Senior Devotee', joinDate: new Date('2023-04-01T00:00:00.000Z'), mentorId: null, familyId: null, profileImage: null, notes: 'Devotee since 2023. Active member of the community.', specialSkills: 'Carpentry', previousExperience: null, emergencyContact: 'Emergency Contact 50', emergencyPhone: '9876549049', medicalConditions: null, dietaryPreferences: 'Vegan', isActive: true, createdAt: now, updatedAt: now },
    ];
    importedDevotees.forEach(dv => { this.devotees.set(dv.id, dv); this.counters.devotees = Math.max(this.counters.devotees, dv.id + 1); });

    // ─── GROUPS ────────────────────────────────────────────────────────────
    const sampleGroups: Group[] = [
      { id: 1, groupName: "Youth Satsang (Yuva Mandal)", description: "For devotees aged 16-30. Meets every Saturday evening for kirtan and discussion.", mentorId: 1, createdAt: d(600), updatedAt: now },
      { id: 2, groupName: "Family Circle", description: "Family devotional activities, parenting support, and joint festivals.", mentorId: null, createdAt: d(400), updatedAt: now },
      { id: 3, groupName: "Kirtan Mandali", description: "Weekly kirtan and bhajan group. Open to all levels. Meets every Wednesday.", mentorId: null, createdAt: d(700), updatedAt: now },
      { id: 4, groupName: "Seva Squad", description: "Volunteers for event setup, prasad, decoration, and logistics.", mentorId: null, createdAt: d(500), updatedAt: now },
      { id: 5, groupName: "Gita Study Circle", description: "Bhagavad Gita chapter-by-chapter study led by Prof. Nilesh Desai. Meets every Tuesday.", mentorId: null, createdAt: d(800), updatedAt: now },
      { id: 6, groupName: "Women's Satsang (Mahila Mandal)", description: "Women's devotional meetings every Thursday at the center.", mentorId: null, createdAt: d(550), updatedAt: now },
      { id: 7, groupName: "Health and Wellness Group", description: "Yoga, Pranayama, and Ayurvedic health awareness led by Dr. Hansa Joshi.", mentorId: null, createdAt: d(300), updatedAt: now },
      { id: 8, groupName: "Golok Dham Satsang", description: "Exclusive study and meditation circle focused on the spiritual realm of Golok Vrindavan and its pastimes.", mentorId: 1, createdAt: d(200), updatedAt: now },
      { id: 9, groupName: "IWC – Interfaith Wellness Circle", description: "Interfaith dialogue, community wellness events, and spiritual exchange with other traditions.", mentorId: null, createdAt: d(180), updatedAt: now },
      { id: 10, groupName: "Katha Pravachan Group", description: "Monthly katha and pravachan sessions featuring visiting saints and in-house speakers from the community.", mentorId: 2, createdAt: d(250), updatedAt: now },
      { id: 11, groupName: "Narayan Bhakt Sabha", description: "Dedicated followers of Lord Narayan who gather weekly for Vishnu Sahasranama chanting and Purana readings.", mentorId: null, createdAt: d(150), updatedAt: now },
      { id: 12, groupName: "International Working Committee", description: "Global coordination committee overseeing international Madhav Parivar operations, policy, and outreach.", mentorId: null, createdAt: d(120), updatedAt: now },
      { id: 13, groupName: "International Katha Committee", description: "Organizes and coordinates international katha events, pravachan series, and visiting saints' schedules worldwide.", mentorId: null, createdAt: d(110), updatedAt: now },
      { id: 14, groupName: "Shri Golok Dhaam", description: "Devotees dedicated to the spiritual and physical development of Shri Golok Dhaam — the divine abode project.", mentorId: 1, createdAt: d(100), updatedAt: now },
      { id: 15, groupName: "Braj Basi", description: "Members with roots or deep connection to Braj Dham, Vrindavan and Mathura, fostering Braj culture and devotion.", mentorId: null, createdAt: d(90), updatedAt: now },
      { id: 16, groupName: "Nav Braj Mandal", description: "New generation Braj Mandal — youth and young adults cultivating Braj bhakti through kirtan, seva and parikrama.", mentorId: null, createdAt: d(80), updatedAt: now },
    ];
    sampleGroups.forEach(g => { this.groups.set(g.id, g); this.counters.groups = Math.max(this.counters.groups, g.id + 1); });

    // ─── EVENTS ────────────────────────────────────────────────────────────
    const sampleEvents: Event[] = [
      // Upcoming events
      { id: 1, title: "Janmashtami Mahotsav 2026", description: "Grand all-night celebration of Lord Sri Krishna's birth. Programme includes bhajan-kirtan, drama by youth group, midnight abhishek, and prasad for all. Dress code: Traditional Indian attire.", eventType: "festival", location: "Main Sabha Hall, Navrangpura, Ahmedabad", startDate: future(18), endDate: future(18), startTime: "18:00", endTime: "06:00", capacity: 500, registrationRequired: true, registrationDeadline: future(12), cost: "0", status: "planned", imageUrl: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=600&q=80", isArchived: false, archivedAt: null, maxParticipants: 500, createdBy: "admin", isActive: true, createdAt: d(40), updatedAt: now },
      { id: 2, title: "Weekly Sunday Satsang", description: "Our regular Sunday morning gathering featuring kirtan, reading from scripture, and a 30-minute discourse. Prasad served after. All are welcome.", eventType: "satsang", location: "Community Hall, Athwa, Surat", startDate: future(6), endDate: future(6), startTime: "09:00", endTime: "11:30", capacity: 150, registrationRequired: false, registrationDeadline: null, cost: "0", status: "planned", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", isArchived: false, archivedAt: null, maxParticipants: 150, createdBy: "admin", isActive: true, createdAt: d(7), updatedAt: now },
      { id: 3, title: "Bhagavad Gita Intensive Workshop", description: "3-day residential workshop covering key chapters of the Bhagavad Gita. Led by Prof. Nilesh Desai. Includes morning yoga, vedic chanting, group discussions, and evening satsang. Fee covers materials and meals.", eventType: "workshop", location: "Radha Niwas Ashram, Alkapuri, Vadodara", startDate: future(28), endDate: future(30), startTime: "07:00", endTime: "20:00", capacity: 50, registrationRequired: true, registrationDeadline: future(22), cost: "1500", status: "planned", imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80", isArchived: false, archivedAt: null, maxParticipants: 50, createdBy: "admin", isActive: true, createdAt: d(25), updatedAt: now },
      { id: 4, title: "Annual General Meeting 2026", description: "Yearly review and planning meeting for all senior devotees and family heads. Budget review, new initiatives, volunteer appreciation, and prasad.", eventType: "meeting", location: "Main Sabha Hall, Navrangpura, Ahmedabad", startDate: future(50), endDate: future(50), startTime: "10:00", endTime: "14:00", capacity: 100, registrationRequired: true, registrationDeadline: future(44), cost: "0", status: "planned", imageUrl: null, isArchived: false, archivedAt: null, maxParticipants: 100, createdBy: "admin", isActive: true, createdAt: d(10), updatedAt: now },
      { id: 5, title: "Ayurveda and Yoga Health Camp", description: "Free health camp conducted by Dr. Hansa Joshi. Includes Ayurvedic pulse diagnosis, personalized diet tips, one-hour yoga session, and herbal medicine guidance. Pre-registration mandatory.", eventType: "workshop", location: "Community Hall, Athwa, Surat", startDate: future(12), endDate: future(12), startTime: "08:00", endTime: "13:00", capacity: 80, registrationRequired: true, registrationDeadline: future(8), cost: "0", status: "planned", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", isArchived: false, archivedAt: null, maxParticipants: 80, createdBy: "admin", isActive: true, createdAt: d(15), updatedAt: now },
      { id: 6, title: "Kirtan Utsav Inter-group Competition", description: "Annual kirtan competition between our 5 mandals. Teams of 6. Judged on melody, devotion, and audience participation. Trophy and certificates for winners. Audience welcome.", eventType: "satsang", location: "Govardhan Bhavan, Manjalpur, Vadodara", startDate: future(35), endDate: future(35), startTime: "17:00", endTime: "21:00", capacity: 200, registrationRequired: false, registrationDeadline: null, cost: "0", status: "planned", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80", isArchived: false, archivedAt: null, maxParticipants: 200, createdBy: "admin", isActive: true, createdAt: d(20), updatedAt: now },
      // Recent completed events
      { id: 7, title: "Guru Purnima Celebration 2025", description: "Grand celebration in honour of our spiritual teachers. Special guru-puja, discourse, and felicitation of senior mentors.", eventType: "festival", location: "Main Sabha Hall, Ahmedabad", startDate: d(14), endDate: d(14), startTime: "07:00", endTime: "13:00", capacity: 350, registrationRequired: false, registrationDeadline: null, cost: "0", status: "completed", imageUrl: "https://images.unsplash.com/photo-1517217568890-f2a4c6beb4e7?w=600&q=80", isArchived: false, archivedAt: null, maxParticipants: 350, createdBy: "admin", isActive: true, createdAt: d(70), updatedAt: d(14) },
      { id: 8, title: "Monthly Satsang February 2026", description: "Monthly devotional assembly with katha, kirtan, and community lunch.", eventType: "satsang", location: "Community Hall, Surat", startDate: d(35), endDate: d(35), startTime: "09:00", endTime: "12:00", capacity: 200, registrationRequired: false, registrationDeadline: null, cost: "0", status: "completed", imageUrl: null, isArchived: false, archivedAt: null, maxParticipants: 200, createdBy: "admin", isActive: true, createdAt: d(65), updatedAt: d(35) },
      { id: 9, title: "New Year Satsang and Prasad", description: "Welcome the New Year with kirtan, blessings, and communal prasad.", eventType: "satsang", location: "Main Sabha Hall, Ahmedabad", startDate: d(72), endDate: d(72), startTime: "10:00", endTime: "13:00", capacity: 250, registrationRequired: false, registrationDeadline: null, cost: "0", status: "completed", imageUrl: null, isArchived: false, archivedAt: null, maxParticipants: 250, createdBy: "admin", isActive: true, createdAt: d(100), updatedAt: d(72) },
      // Archived events
      { id: 10, title: "Diwali Puja and Celebration 2025", description: "Annual Diwali celebration with lakshmi puja, aarti, and fireworks.", eventType: "festival", location: "Main Sabha Hall, Ahmedabad", startDate: d(150), endDate: d(150), startTime: "18:00", endTime: "22:00", capacity: 400, registrationRequired: false, registrationDeadline: null, cost: "0", status: "completed", imageUrl: "https://images.unsplash.com/photo-1574500697956-0f7bb2f2d132?w=600&q=80", isArchived: true, archivedAt: d(148), maxParticipants: 400, createdBy: "admin", isActive: true, createdAt: d(180), updatedAt: d(148) },
      { id: 11, title: "Monthly Satsang October 2025", description: "Monthly gathering.", eventType: "satsang", location: "Community Hall, Surat", startDate: d(165), endDate: d(165), startTime: "09:00", endTime: "11:30", capacity: 150, registrationRequired: false, registrationDeadline: null, cost: "0", status: "completed", imageUrl: null, isArchived: true, archivedAt: d(163), maxParticipants: 150, createdBy: "admin", isActive: true, createdAt: d(195), updatedAt: d(163) },
      { id: 12, title: "Navratri Garba Night 2025", description: "9-night Navratri celebration with traditional garba and aarti.", eventType: "festival", location: "Govardhan Bhavan, Vadodara", startDate: d(190), endDate: d(182), startTime: "20:00", endTime: "00:30", capacity: 600, registrationRequired: true, registrationDeadline: d(200), cost: "100", status: "completed", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80", isArchived: true, archivedAt: d(181), maxParticipants: 600, createdBy: "admin", isActive: true, createdAt: d(220), updatedAt: d(181) },
    ];
    sampleEvents.forEach(e => { this.events.set(e.id, e); this.counters.events = Math.max(this.counters.events, e.id + 1); });

    // ─── MENTORS ───────────────────────────────────────────────────────────
    const sampleMentors: any[] = [
      { id: 1, devoteeId: 8, specialization: "Bhagavad Gita and Vedic Philosophy", experience: "20 years", qualifications: "M.A. Sanskrit, Ph.D. Vedic Studies", availableHours: "Weekends 9am-1pm", contactPreference: "whatsapp", maxMentees: 20, currentMentees: 12, isActive: true, createdAt: d(2500), updatedAt: now },
      { id: 2, devoteeId: 5, specialization: "Community Building and Event Management", experience: "10 years", qualifications: "MBA, Certified Event Manager", availableHours: "Mon/Wed/Fri evenings", contactPreference: "phone", maxMentees: 15, currentMentees: 8, isActive: true, createdAt: d(2000), updatedAt: now },
      { id: 3, devoteeId: 1, specialization: "Kirtan and Devotional Music", experience: "15 years", qualifications: "Sangit Visharad, Harmonium & Mridanga certified", availableHours: "Daily 6am-8am, Sundays", contactPreference: "phone", maxMentees: 25, currentMentees: 18, isActive: true, createdAt: d(1800), updatedAt: now },
      { id: 4, devoteeId: 19, specialization: "Vocal Training and Bhajan", experience: "10 years", qualifications: "Hindustani Classical Vocal - Senior Grade", availableHours: "Tue/Thu evenings, Sundays", contactPreference: "phone", maxMentees: 15, currentMentees: 9, isActive: true, createdAt: d(1600), updatedAt: now },
      { id: 5, devoteeId: 16, specialization: "Ayurveda, Yoga and Health", experience: "6 years", qualifications: "BAMS, Yoga Instructor Certificate", availableHours: "Weekends, Wed evenings", contactPreference: "whatsapp", maxMentees: 20, currentMentees: 14, isActive: true, createdAt: d(1400), updatedAt: now },
      { id: 6, devoteeId: 11, specialization: "Finance, Accounts and Donations Management", experience: "8 years", qualifications: "CA, CFA", availableHours: "Weekends 10am-2pm", contactPreference: "email", maxMentees: 10, currentMentees: 5, isActive: true, createdAt: d(1200), updatedAt: now },
      { id: 7, devoteeId: 20, specialization: "Legal Affairs and Trust Management", experience: "7 years", qualifications: "LLB, Advocate High Court", availableHours: "Sat/Sun 4pm-7pm", contactPreference: "phone", maxMentees: 8, currentMentees: 4, isActive: true, createdAt: d(1000), updatedAt: now },
      { id: 8, devoteeId: 6, specialization: "Seva Coordination and Youth Programs", experience: "5 years", qualifications: "B.Ed., Youth Welfare Certificate", availableHours: "Fridays, Weekends", contactPreference: "whatsapp", maxMentees: 30, currentMentees: 22, isActive: true, createdAt: d(800), updatedAt: now },
      { id: 9, devoteeId: 9, specialization: "Children's Bal Satsang and Education", experience: "4 years", qualifications: "M.Ed., Bal Sanstha Training", availableHours: "Sundays 10am-1pm", contactPreference: "phone", maxMentees: 20, currentMentees: 16, isActive: true, createdAt: d(600), updatedAt: now },
      { id: 10, devoteeId: 18, specialization: "Banking, Finance and Corpus Fund", experience: "35 years banking", qualifications: "Retired Bank Manager, JAIIB/CAIIB", availableHours: "Weekdays 10am-12pm", contactPreference: "phone", maxMentees: 5, currentMentees: 2, isActive: true, createdAt: d(400), updatedAt: now },
    ];
    sampleMentors.forEach(m => { this.mentors.set(m.id, m as any); this.counters.mentors = Math.max(this.counters.mentors, m.id + 1); });

    // ─── USERS (admin/manager/user roles) ─────────────────────────────────
    const sampleUsers: User[] = [
      { id: "dev-user-1", role: "developer", email: "dev@madhavparivar.org", firstName: "Dev", lastName: "Admin", profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DevAdmin&backgroundColor=b6e3f4", isActive: true, createdAt: d(3000), updatedAt: now },
      { id: "admin-user-1", role: "admin", email: "admin@madhavparivar.org", firstName: "Ramesh", lastName: "Sharma", profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh&backgroundColor=b6e3f4", isActive: true, createdAt: d(1800), updatedAt: now },
      { id: "manager-user-1", role: "manager", email: "manager@madhavparivar.org", firstName: "Suresh", lastName: "Patel", profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh&backgroundColor=ffdfbf", isActive: true, createdAt: d(1500), updatedAt: now },
      { id: "user-1", role: "user", email: "vikram.mehta@email.com", firstName: "Vikram", lastName: "Mehta", profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram&backgroundColor=c0aede", isActive: true, createdAt: d(900), updatedAt: now },
      { id: "user-2", role: "user", email: "nilesh.desai@email.com", firstName: "Nilesh", lastName: "Desai", profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nilesh&backgroundColor=ffd5dc", isActive: true, createdAt: d(1200), updatedAt: now },
    ];
    sampleUsers.forEach(u => { this.users.set(u.id, u); });

    // ─── ATTENDANCE ────────────────────────────────────────────────────────
    const sampleAttendance: Attendance[] = [];
    let attId = 1;
    const completedEventIds = [7, 8, 9, 10, 11, 12];
    const allDevIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20];
    const eventDaysAgo: Record<number, number> = { 7: 14, 8: 35, 9: 72, 10: 150, 11: 165, 12: 190 };

    completedEventIds.forEach(evId => {
      const daysAgo = eventDaysAgo[evId] || 30;
      allDevIds.forEach(dvId => {
        const threshold = dvId <= 9 ? 0.12 : 0.28;
        const status = Math.random() > threshold ? "present" : "absent";
        sampleAttendance.push({ id: attId++, devoteeId: dvId, eventId: evId, attendanceDate: d(daysAgo), status, checkInTime: status === "present" ? "09:10" : null, checkOutTime: status === "present" ? "12:00" : null, notes: null, markedBy: "admin", createdAt: d(daysAgo), updatedAt: d(daysAgo) });
      });
    });

    // 12 months of historical attendance for key devotees
    [1, 2, 5, 6, 8, 9, 15, 16, 19].forEach(dvId => {
      for (let month = 1; month <= 12; month++) {
        const dt = new Date(now); dt.setMonth(dt.getMonth() - month);
        [1, 2, 3].forEach(w => {
          const dt2 = new Date(dt); dt2.setDate(w * 7);
          sampleAttendance.push({ id: attId++, devoteeId: dvId, eventId: 8, attendanceDate: dt2, status: Math.random() > 0.15 ? "present" : "absent", checkInTime: "09:00", checkOutTime: "11:30", notes: null, markedBy: "admin", createdAt: dt2, updatedAt: dt2 });
        });
      }
    });
    sampleAttendance.forEach(a => { this.attendance.set(a.id, a); this.counters.attendance = Math.max(this.counters.attendance, a.id + 1); });

    // ─── DONATIONS ──────────────────────────────────────────────────────────
    const sampleDonations: Donation[] = [];
    let donId = 1;
    const donTypes = ["Anna Seva", "Festival Fund", "Building Fund", "General Seva", "Medical Camp"];
    const payMethods = ["Cash", "Online Transfer", "Cheque", "UPI"];

    const majorDonors: Array<{ id: number; baseAmt: number }> = [
      { id: 5, baseAmt: 10000 },
      { id: 1, baseAmt: 2000 },
      { id: 8, baseAmt: 1500 },
      { id: 11, baseAmt: 3000 },
      { id: 15, baseAmt: 1000 },
    ];
    majorDonors.forEach(({ id, baseAmt }) => {
      for (let month = 0; month < 12; month++) {
        const dt = new Date(now); dt.setMonth(dt.getMonth() - month);
        const variance = Math.floor(Math.random() * 5) * 500;
        const rid = donId;
        sampleDonations.push({ id: donId++, devoteeId: id, amount: String(baseAmt + variance), currency: 'INR', donationType: donTypes[month % donTypes.length], purpose: donTypes[month % donTypes.length], donationDate: dt, paymentMethod: payMethods[month % payMethods.length], receiptNumber: "RCP-" + String(rid).padStart(4, "0"), transactionId: null, taxDeductible: false, notes: month === 0 ? "Regular monthly contribution" : null, anonymousDonation: false, recordedBy: 'admin', status: 'received', createdAt: dt } as any);
      }
    });

    [2, 6, 9, 16, 18, 19, 20].forEach((dvId, i) => {
      [90, 180, 270, 365].forEach((daysAgo, j) => {
        const rid = donId;
        sampleDonations.push({ id: donId++, devoteeId: dvId, amount: String((Math.floor(Math.random() * 6) + 1) * 500), currency: 'INR', donationType: donTypes[(i + j) % donTypes.length], purpose: donTypes[(i + j) % donTypes.length], donationDate: d(daysAgo), paymentMethod: j % 2 === 0 ? "Cash" : "UPI", receiptNumber: "RCP-" + String(rid).padStart(4, "0"), transactionId: null, taxDeductible: false, notes: null, anonymousDonation: false, recordedBy: 'admin', status: 'received', createdAt: d(daysAgo) } as any);
      });
    });

    // Large special donations
    [
      { dvId: 5, amt: 50000, type: "Building Fund", method: "Cheque", note: "Donation for new hall construction", dAgo: 200 },
      { dvId: 5, amt: 25000, type: "Festival Fund", method: "Cheque", note: "Navratri stage and sound sponsorship", dAgo: 195 },
      { dvId: 11, amt: 15000, type: "Festival Fund", method: "Online Transfer", note: "Janmashtami stage and sound", dAgo: 50 },
      { dvId: 8, amt: 10000, type: "Anna Seva", method: "Online Transfer", note: "Monthly prasad contribution", dAgo: 30 },
      { dvId: 1, amt: 5000, type: "General Seva", method: "UPI", note: "Annual seva contribution", dAgo: 120 },
      { dvId: 15, amt: 7500, type: "Medical Camp", method: "Cash", note: "Medical camp sponsorship", dAgo: 80 },
      { dvId: 19, amt: 3000, type: "Festival Fund", method: "Cash", note: "Janmashtami kirtan program", dAgo: 60 },
    ].forEach(don => {
      const rid = donId;
      sampleDonations.push({ id: donId++, devoteeId: don.dvId, amount: String(don.amt), currency: 'INR', donationType: don.type, purpose: don.type, donationDate: d(don.dAgo), paymentMethod: don.method, receiptNumber: "RCP-" + String(rid).padStart(4, "0"), transactionId: null, taxDeductible: true, notes: don.note, anonymousDonation: false, recordedBy: 'admin', status: 'received', createdAt: d(don.dAgo) } as any);
    });
    sampleDonations.forEach(dn => { this.donations.set(dn.id, dn); this.counters.donations = Math.max(this.counters.donations, dn.id + 1); });

    // ─── VOLUNTEERING ──────────────────────────────────────────────────────
    const sampleVolunteering: Volunteering[] = [];
    let volId = 1;
    const volActivities = ["Event Setup and Teardown", "Prasad Distribution", "Registration and Check-in", "Kirtan Support", "Stage Decoration", "Kitchen Seva", "Children's Program", "Medical Assistance", "Photography", "Sound and AV Setup", "Parking Management", "Cleaning and Housekeeping"];

    const activeVolunteers: Array<{ id: number; intensity: number }> = [
      { id: 1, intensity: 3 }, { id: 2, intensity: 2 }, { id: 3, intensity: 2 },
      { id: 5, intensity: 4 }, { id: 6, intensity: 3 }, { id: 7, intensity: 2 },
      { id: 8, intensity: 2 }, { id: 9, intensity: 3 }, { id: 15, intensity: 3 },
      { id: 16, intensity: 2 }, { id: 17, intensity: 1 }, { id: 19, intensity: 2 },
    ];

    activeVolunteers.forEach(({ id, intensity }) => {
      for (let month = 0; month < 12; month++) {
        const dt = new Date(now); dt.setMonth(dt.getMonth() - month);
        for (let act = 0; act < intensity; act++) {
          const dt2 = new Date(dt); dt2.setDate((act + 1) * 7);
          const actType = volActivities[(month * intensity + act) % volActivities.length];
          const hrs = Math.floor(Math.random() * 5) + 2;
          sampleVolunteering.push({ id: volId++, devoteeId: id, activityType: actType, startDate: dt2, endDate: dt2, hoursCommitted: hrs, hoursCompleted: hrs, description: actType + " for monthly event", status: "completed", supervisorId: 8, feedback: "Well done", skills: actType, location: "Main Sabha Hall", createdAt: dt2 } as any);
        }
      }
    });
    sampleVolunteering.forEach(v => { this.volunteering.set(v.id, v); this.counters.volunteering = Math.max(this.counters.volunteering, v.id + 1); });

    // ─── MANDALS ───────────────────────────────────────────────────────────
    const sampleMandals: Mandal[] = [
      { id: 1, name: "Ahmedabad Central Mandal", code: "ACM-001", contactPerson: "Ramesh Sharma", contactPhone: "9876543210", createdAt: d(900), updatedAt: now },
      { id: 2, name: "Surat Mandal", code: "SRT-002", contactPerson: "Suresh Patel", contactPhone: "9876543220", createdAt: d(700), updatedAt: now },
      { id: 3, name: "Vadodara Mandal", code: "VDR-003", contactPerson: "Nilesh Desai", contactPhone: "9876543230", createdAt: d(500), updatedAt: now },
    ];
    sampleMandals.forEach(m => { this.mandals.set(m.id, m); this.counters.mandals = Math.max(this.counters.mandals, m.id + 1); });

    // ─── SABHA LOCATIONS ──────────────────────────────────────────────────
    const sampleLocations: SabhaLocation[] = [
      { id: 1, name: "Main Sabha Hall Ahmedabad", address: "42 Tulsi Nagar, Navrangpura, Ahmedabad 380009", zipCode: "380009", facilities: ["PA Sound System", "AC 1000 sq ft", "Projector and Screen", "Parking 50 cars", "Full Kitchen", "Stage 30x20 ft"], createdAt: d(900), updatedAt: now },
      { id: 2, name: "Community Hall Surat", address: "17 Krishna Lane, Athwa, Surat 395001", zipCode: "395001", facilities: ["PA System", "Fans and Coolers", "Projection screen", "Parking 30 cars", "Pantry"], createdAt: d(600), updatedAt: now },
      { id: 3, name: "Radha Niwas Ashram Vadodara", address: "5 Alkapuri, Vadodara 390007", zipCode: "390007", facilities: ["Open courtyard 2000 sq ft", "Sound system", "Dormitory 30 beds", "Full kitchen", "Garden"], createdAt: d(400), updatedAt: now },
    ];
    sampleLocations.forEach(l => { this.sabhaLocations.set(l.id, l); this.counters.sabhaLocations = Math.max(this.counters.sabhaLocations, l.id + 1); });

    // ─── NOTIFICATIONS ─────────────────────────────────────────────────────
    const sampleNotifications: Notification[] = [
      { id: 1, userId: "dev-user-1", title: "New Devotee Registered", message: "Paresh Trivedi has been added to the system", type: "success", isRead: false, isPinned: false, relatedEntity: "devotee", relatedId: 20, createdAt: d(1) },
      { id: 2, userId: "dev-user-1", title: "Upcoming Event", message: "Janmashtami Mahotsav 2026 is scheduled in 18 days. Registration opens immediately. Please coordinate with Yuva Mandal for their drama performance.", type: "info", isRead: false, isPinned: true, relatedEntity: "event", relatedId: 1, createdAt: d(2) },
      { id: 3, userId: "dev-user-1", title: "Donation Received", message: "₹50,000 donation received from Suresh Patel for Building Fund", type: "success", isRead: false, isPinned: false, relatedEntity: "donation", createdAt: d(3) },
      { id: 4, userId: "dev-user-1", title: "Low Attendance Alert", message: "Attendance for last satsang was below 60% — please follow up with the Seva Squad to understand root cause and improve outreach", type: "warning", isRead: false, isPinned: false, relatedEntity: "attendance", createdAt: d(5) },
      { id: 5, userId: "dev-user-1", title: "Mentor Assignment Needed", message: "5 devotees are without assigned mentors", type: "warning", isRead: true, isPinned: false, relatedEntity: "mentor", createdAt: d(7) },
      { id: 6, userId: "dev-user-1", title: "Event Archived", message: "Diwali Puja 2025 has been automatically archived", type: "info", isRead: true, isPinned: false, relatedEntity: "event", relatedId: 10, createdAt: d(10) },
      { id: 7, userId: "dev-user-1", title: "Profile Update", message: "Ramesh Sharma updated their profile information", type: "info", isRead: true, isPinned: false, relatedEntity: "devotee", relatedId: 1, createdAt: d(12) },
      { id: 8, userId: "dev-user-1", title: "Volunteer Hours Logged", message: "12 new volunteering records logged this week", type: "success", isRead: true, isPinned: false, relatedEntity: "volunteering", createdAt: d(14) },
    ];
    sampleNotifications.forEach(n => { this.notifications.set(n.id, n); this.counters.notifications = Math.max(this.counters.notifications, n.id + 1); });
  }

  // Helper: get devotees by family ID
  async getDevoteesByFamily(familyId: number): Promise<Devotee[]> {
    return Array.from(this.devotees.values()).filter(d => d.familyId === familyId);
  }

  // Helper: archive an event
  async archiveEvent(id: number): Promise<Event> {
    const event = this.events.get(id);
    if (!event) throw new Error(`Event ${id} not found`);
    const updated = { ...event, isArchived: true, archivedAt: new Date(), updatedAt: new Date() };
    this.events.set(id, updated as Event);
    return updated as Event;
  }

  // Helper: auto-archive past events
  async autoArchivePastEvents(): Promise<number> {
    const now = new Date();
    let count = 0;
    this.events.forEach((event, id) => {
      if (!event.isArchived && event.endDate && new Date(event.endDate) < now) {
        const updated = { ...event, isArchived: true, archivedAt: now, updatedAt: now };
        this.events.set(id, updated as Event);
        count++;
      }
    });
    return count;
  }

  // Helper: unarchive an event
  async unarchiveEvent(id: number): Promise<Event> {
    const event = this.events.get(id);
    if (!event) throw new Error(`Event ${id} not found`);
    const updated = { ...event, isArchived: false, archivedAt: null, updatedAt: new Date() };
    this.events.set(id, updated as Event);
    return updated as Event;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      id: userData.id,
      role: userData.role || "user",
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isActive: userData.isActive ?? true,
      createdAt: this.users.get(userData.id)?.createdAt || now,
      updatedAt: now,
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Devotee operations
  async getDevotees(): Promise<Devotee[]> {
    return Array.from(this.devotees.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getDevotee(id: number): Promise<Devotee | undefined> {
    return this.devotees.get(id);
  }

  async createDevotee(devoteeData: InsertDevotee): Promise<Devotee> {
    const now = new Date();
    const id = this.counters.devotees++;
    const devotee: Devotee = {
      id,
      devoteeId: devoteeData.devoteeId,
      firstName: devoteeData.firstName,
      lastName: devoteeData.lastName,
      email: devoteeData.email || null,
      phone: devoteeData.phone || null,
      whatsappNumber: devoteeData.whatsappNumber || null,
      dateOfBirth: devoteeData.dateOfBirth || null,
      gender: devoteeData.gender || null,
      address: devoteeData.address || null,
      city: devoteeData.city || null,
      state: devoteeData.state || null,
      pincode: devoteeData.pincode || null,
      country: devoteeData.country || null,
      occupation: devoteeData.occupation || null,
      spiritualLevel: devoteeData.spiritualLevel || null,
      joinDate: devoteeData.joinDate || null,
      mentorId: devoteeData.mentorId || null,
      familyId: devoteeData.familyId || null,
      profileImage: devoteeData.profileImage || null,
      notes: devoteeData.notes || null,
      specialSkills: devoteeData.specialSkills || null,
      previousExperience: devoteeData.previousExperience || null,
      emergencyContact: devoteeData.emergencyContact || null,
      emergencyPhone: devoteeData.emergencyPhone || null,
      medicalConditions: devoteeData.medicalConditions || null,
      dietaryPreferences: devoteeData.dietaryPreferences || null,
      isActive: devoteeData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.devotees.set(id, devotee);
    return devotee;
  }

  async updateDevotee(id: number, devoteeData: Partial<InsertDevotee>): Promise<Devotee> {
    const existingDevotee = this.devotees.get(id);
    if (!existingDevotee) {
      throw new Error(`Devotee with id ${id} not found`);
    }
    const updatedDevotee: Devotee = {
      ...existingDevotee,
      ...devoteeData,
      updatedAt: new Date(),
    };
    this.devotees.set(id, updatedDevotee);
    return updatedDevotee;
  }

  async deleteDevotee(id: number): Promise<boolean> {
    return this.devotees.delete(id);
  }

  // Family operations
  async getFamilies(): Promise<Family[]> {
    return Array.from(this.families.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getFamily(id: number): Promise<Family | undefined> {
    return this.families.get(id);
  }

  async createFamily(familyData: InsertFamily): Promise<Family> {
    const now = new Date();
    const id = this.counters.families++;
    const family: Family = {
      id,
      familyName: familyData.familyName,
      headOfFamily: familyData.headOfFamily || null,
      address: familyData.address || null,
      city: familyData.city || null,
      state: familyData.state || null,
      pincode: familyData.pincode || null,
      country: familyData.country || null,
      phone: familyData.phone || null,
      email: familyData.email || null,
      totalMembers: familyData.totalMembers || null,
      emergencyContact: familyData.emergencyContact || null,
      notes: familyData.notes || null,
      isActive: familyData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.families.set(id, family);
    return family;
  }

  async updateFamily(id: number, familyData: Partial<InsertFamily>): Promise<Family> {
    const existingFamily = this.families.get(id);
    if (!existingFamily) {
      throw new Error(`Family with id ${id} not found`);
    }
    const updatedFamily: Family = {
      ...existingFamily,
      ...familyData,
      updatedAt: new Date(),
    };
    this.families.set(id, updatedFamily);
    return updatedFamily;
  }

  async deleteFamily(id: number): Promise<boolean> {
    return this.families.delete(id);
  }

  // Mentor operations
  async getMentors(): Promise<Mentor[]> {
    return Array.from(this.mentors.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getMentor(id: number): Promise<Mentor | undefined> {
    return this.mentors.get(id);
  }

  async createMentor(mentorData: InsertMentor): Promise<Mentor> {
    const now = new Date();
    const id = this.counters.mentors++;
    const mentor: Mentor = {
      id,
      devoteeId: mentorData.devoteeId,
      specialization: mentorData.specialization || null,
      experience: mentorData.experience || null,
      qualifications: mentorData.qualifications || null,
      availableHours: mentorData.availableHours || null,
      contactPreference: mentorData.contactPreference || null,
      maxMentees: mentorData.maxMentees || null,
      currentMentees: mentorData.currentMentees || null,
      isActive: mentorData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.mentors.set(id, mentor);
    return mentor;
  }

  async updateMentor(id: number, mentorData: Partial<InsertMentor>): Promise<Mentor> {
    const existingMentor = this.mentors.get(id);
    if (!existingMentor) {
      throw new Error(`Mentor with id ${id} not found`);
    }
    const updatedMentor: Mentor = {
      ...existingMentor,
      ...mentorData,
      updatedAt: new Date(),
    };
    this.mentors.set(id, updatedMentor);
    return updatedMentor;
  }

  async deleteMentor(id: number): Promise<boolean> {
    return this.mentors.delete(id);
  }

  // Attendance operations
  async getAttendance(devoteeId?: number, eventId?: number): Promise<Attendance[]> {
    let result = Array.from(this.attendance.values());
    
    if (devoteeId) {
      result = result.filter(a => a.devoteeId === devoteeId);
    }
    
    if (eventId) {
      result = result.filter(a => a.eventId === eventId);
    }
    
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const now = new Date();
    const id = this.counters.attendance++;
    const attendance: Attendance = {
      id,
      ...attendanceData,
      createdAt: now,
      updatedAt: now,
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance> {
    const existingAttendance = this.attendance.get(id);
    if (!existingAttendance) {
      throw new Error(`Attendance record with id ${id} not found`);
    }
    const updatedAttendance: Attendance = {
      ...existingAttendance,
      ...attendanceData,
      updatedAt: new Date(),
    };
    this.attendance.set(id, updatedAttendance);
    return updatedAttendance;
  }

  async deleteAttendance(id: number): Promise<boolean> {
    return this.attendance.delete(id);
  }

  // Donation operations
  async getDonations(devoteeId?: number): Promise<Donation[]> {
    let result = Array.from(this.donations.values());
    
    if (devoteeId) {
      result = result.filter(d => d.devoteeId === devoteeId);
    }
    
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createDonation(donationData: InsertDonation): Promise<Donation> {
    const now = new Date();
    const id = this.counters.donations++;
    const donation: Donation = {
      id,
      ...donationData,
      createdAt: now,
      updatedAt: now,
    };
    this.donations.set(id, donation);
    return donation;
  }

  async updateDonation(id: number, donationData: Partial<InsertDonation>): Promise<Donation> {
    const existingDonation = this.donations.get(id);
    if (!existingDonation) {
      throw new Error(`Donation with id ${id} not found`);
    }
    const updatedDonation: Donation = {
      ...existingDonation,
      ...donationData,
      updatedAt: new Date(),
    };
    this.donations.set(id, updatedDonation);
    return updatedDonation;
  }

  async deleteDonation(id: number): Promise<boolean> {
    return this.donations.delete(id);
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const now = new Date();
    const id = this.counters.events++;
    const event: Event = {
      id,
      title: eventData.title,
      description: eventData.description || null,
      eventType: eventData.eventType,
      location: eventData.location || null,
      startDate: eventData.startDate,
      endDate: eventData.endDate || null,
      startTime: eventData.startTime || null,
      endTime: eventData.endTime || null,
      capacity: eventData.capacity || null,
      registrationRequired: eventData.registrationRequired || false,
      registrationDeadline: eventData.registrationDeadline || null,
      cost: eventData.cost || null,
      status: eventData.status || "planned",
      imageUrl: (eventData as any).imageUrl || null,
      isArchived: (eventData as any).isArchived || false,
      archivedAt: (eventData as any).archivedAt || null,
      maxParticipants: (eventData as any).maxParticipants || eventData.capacity || null,
      createdBy: eventData.createdBy || null,
      isActive: eventData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) {
      throw new Error(`Event with id ${id} not found`);
    }
    const updatedEvent: Event = {
      ...existingEvent,
      ...eventData,
      updatedAt: new Date(),
    };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Volunteering operations
  async getVolunteering(devoteeId?: number): Promise<Volunteering[]> {
    let result = Array.from(this.volunteering.values());
    
    if (devoteeId) {
      result = result.filter(v => v.devoteeId === devoteeId);
    }
    
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createVolunteering(volunteeringData: InsertVolunteering): Promise<Volunteering> {
    const now = new Date();
    const id = this.counters.volunteering++;
    const volunteering: Volunteering = {
      id,
      ...volunteeringData,
      createdAt: now,
      updatedAt: now,
    };
    this.volunteering.set(id, volunteering);
    return volunteering;
  }

  async updateVolunteering(id: number, volunteeringData: Partial<InsertVolunteering>): Promise<Volunteering> {
    const existingVolunteering = this.volunteering.get(id);
    if (!existingVolunteering) {
      throw new Error(`Volunteering record with id ${id} not found`);
    }
    const updatedVolunteering: Volunteering = {
      ...existingVolunteering,
      ...volunteeringData,
      updatedAt: new Date(),
    };
    this.volunteering.set(id, updatedVolunteering);
    return updatedVolunteering;
  }

  async deleteVolunteering(id: number): Promise<boolean> {
    return this.volunteering.delete(id);
  }

  // Group operations
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(groupData: InsertGroup): Promise<Group> {
    const now = new Date();
    const id = this.counters.groups++;
    const group: Group = {
      id,
      groupName: groupData.groupName,
      description: groupData.description || null,
      groupType: groupData.groupType,
      capacity: groupData.capacity || null,
      currentMembers: groupData.currentMembers || 0,
      location: groupData.location || null,
      meetingSchedule: groupData.meetingSchedule || null,
      leaderId: groupData.leaderId || null,
      requirements: groupData.requirements || null,
      customFields: groupData.customFields || null,
      createdBy: groupData.createdBy || null,
      isActive: groupData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: number, groupData: Partial<InsertGroup>): Promise<Group> {
    const existingGroup = this.groups.get(id);
    if (!existingGroup) {
      throw new Error(`Group with id ${id} not found`);
    }
    const updatedGroup: Group = {
      ...existingGroup,
      ...groupData,
      updatedAt: new Date(),
    };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }

  // Group entries operations
  async getGroupEntries(groupId?: number): Promise<GroupEntry[]> {
    let result = Array.from(this.groupEntries.values());
    
    if (groupId) {
      result = result.filter(ge => ge.groupId === groupId);
    }
    
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createGroupEntry(entryData: InsertGroupEntry): Promise<GroupEntry> {
    const now = new Date();
    const id = this.counters.groupEntries++;
    const entry: GroupEntry = {
      id,
      ...entryData,
      createdAt: now,
      updatedAt: now,
    };
    this.groupEntries.set(id, entry);
    return entry;
  }

  async updateGroupEntry(id: number, entryData: Partial<InsertGroupEntry>): Promise<GroupEntry> {
    const existingEntry = this.groupEntries.get(id);
    if (!existingEntry) {
      throw new Error(`Group entry with id ${id} not found`);
    }
    const updatedEntry: GroupEntry = {
      ...existingEntry,
      ...entryData,
      updatedAt: new Date(),
    };
    this.groupEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteGroupEntry(id: number): Promise<boolean> {
    return this.groupEntries.delete(id);
  }

  // Mandal operations
  async getMandals(): Promise<Mandal[]> {
    return Array.from(this.mandals.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createMandal(mandalData: InsertMandal): Promise<Mandal> {
    const now = new Date();
    const id = this.counters.mandals++;
    const mandal: Mandal = {
      id,
      ...mandalData,
      createdAt: now,
      updatedAt: now,
    };
    this.mandals.set(id, mandal);
    return mandal;
  }

  // Sabha location operations
  async getSabhaLocations(): Promise<SabhaLocation[]> {
    return Array.from(this.sabhaLocations.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createSabhaLocation(locationData: InsertSabhaLocation): Promise<SabhaLocation> {
    const now = new Date();
    const id = this.counters.sabhaLocations++;
    const location: SabhaLocation = {
      id,
      ...locationData,
      createdAt: now,
      updatedAt: now,
    };
    this.sabhaLocations.set(id, location);
    return location;
  }

  // Dashboard operations
  async getDashboardLayouts(userId: string): Promise<DashboardLayout[]> {
    return Array.from(this.dashboardLayouts.values())
      .filter(layout => layout.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createDashboardLayout(layoutData: InsertDashboardLayout): Promise<DashboardLayout> {
    const now = new Date();
    const id = this.counters.dashboardLayouts++;
    const layout: DashboardLayout = {
      id,
      ...layoutData,
      createdAt: now,
      updatedAt: now,
    };
    this.dashboardLayouts.set(id, layout);
    return layout;
  }

  async updateDashboardLayout(id: number, layoutData: Partial<InsertDashboardLayout>): Promise<DashboardLayout> {
    const existingLayout = this.dashboardLayouts.get(id);
    if (!existingLayout) {
      throw new Error(`Dashboard layout with id ${id} not found`);
    }
    const updatedLayout: DashboardLayout = {
      ...existingLayout,
      ...layoutData,
      updatedAt: new Date(),
    };
    this.dashboardLayouts.set(id, updatedLayout);
    return updatedLayout;
  }

  async deleteDashboardLayout(id: number): Promise<boolean> {
    return this.dashboardLayouts.delete(id);
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return this.userPreferences.get(userId);
  }

  async upsertUserPreferences(preferencesData: InsertUserPreferences): Promise<UserPreferences> {
    const now = new Date();
    const preferences: UserPreferences = {
      ...preferencesData,
      createdAt: this.userPreferences.get(preferencesData.userId)?.createdAt || now,
      updatedAt: now,
    };
    this.userPreferences.set(preferencesData.userId, preferences);
    return preferences;
  }

  // Notification operations
  getNotifications(userId?: string): Notification[] {
    const all = Array.from(this.notifications.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return userId ? all.filter(n => n.userId === userId || n.userId === "dev-user-1") : all;
  }

  createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const id = this.counters.notifications++;
    const notification: Notification = { isPinned: false, ...data, id, createdAt: new Date() };
    this.notifications.set(id, notification);
    return notification;
  }

  markNotificationRead(id: number): Notification | undefined {
    const n = this.notifications.get(id);
    if (!n) return undefined;
    const updated = { ...n, isRead: true };
    this.notifications.set(id, updated);
    return updated;
  }

  markAllNotificationsRead(userId: string): void {
    this.notifications.forEach((n, id) => {
      if (n.userId === userId || n.userId === "dev-user-1") {
        this.notifications.set(id, { ...n, isRead: true });
      }
    });
  }

  deleteNotification(id: number): boolean {
    return this.notifications.delete(id);
  }

  pinNotification(id: number): Notification | undefined {
    const n = this.notifications.get(id);
    if (!n) return undefined;
    const updated = { ...n, isPinned: true };
    this.notifications.set(id, updated);
    return updated;
  }

  unpinNotification(id: number): Notification | undefined {
    const n = this.notifications.get(id);
    if (!n) return undefined;
    const updated = { ...n, isPinned: false };
    this.notifications.set(id, updated);
    return updated;
  }

  // Document operations
  getDocuments(devoteeId: number): DevoteeDocument[] {
    return this.documentStore.get(devoteeId) || [];
  }

  addDocument(devoteeId: number, doc: Omit<DevoteeDocument, 'id' | 'devoteeId' | 'uploadedAt'>): DevoteeDocument {
    const existing = this.documentStore.get(devoteeId) || [];
    const newDoc: DevoteeDocument = {
      ...doc,
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      devoteeId,
      uploadedAt: new Date(),
    };
    this.documentStore.set(devoteeId, [...existing, newDoc]);
    return newDoc;
  }

  deleteDocument(devoteeId: number, docId: string): boolean {
    const existing = this.documentStore.get(devoteeId) || [];
    const filtered = existing.filter(d => d.id !== docId);
    if (filtered.length === existing.length) return false;
    this.documentStore.set(devoteeId, filtered);
    return true;
  }

  // User listing (for admin/manager views)
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Analytics operations
  async getStats(): Promise<{
    totalDevotees: number;
    activeFamilies: number;
    totalDonations: number;
    avgAttendance: number;
  }> {
    const totalDevotees = this.devotees.size;
    const activeFamilies = this.families.size;
    
    const donations = Array.from(this.donations.values());
    const totalDonations = donations.reduce((sum, donation) => sum + parseFloat(String(donation.amount) || '0'), 0);
    
    const attendanceRecords = Array.from(this.attendance.values());
    const presentRecords = attendanceRecords.filter(a => (a as any).status === 'present');
    const avgAttendance = attendanceRecords.length > 0 
      ? Math.round((presentRecords.length / attendanceRecords.length) * 100)
      : 0;

    return {
      totalDevotees,
      activeFamilies,
      totalDonations,
      avgAttendance,
    };
  }

  // Extended analytics: donation trends by month
  async getDonationTrends(): Promise<Array<{ month: string; amount: number }>> {
    const donations = Array.from(this.donations.values());
    const byMonth: Record<string, number> = {};
    donations.forEach(d => {
      const date = new Date((d as any).donationDate || d.createdAt);
      const key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      byMonth[key] = (byMonth[key] || 0) + parseFloat(String(d.amount) || '0');
    });
    return Object.entries(byMonth).map(([month, amount]) => ({ month, amount })).slice(-12);
  }

  // Extended analytics: attendance trends by month
  async getAttendanceTrends(): Promise<Array<{ month: string; present: number; absent: number }>> {
    const records = Array.from(this.attendance.values());
    const byMonth: Record<string, { present: number; absent: number }> = {};
    records.forEach(a => {
      const date = new Date(a.attendanceDate || a.createdAt);
      const key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (!byMonth[key]) byMonth[key] = { present: 0, absent: 0 };
      if ((a as any).status === 'present') byMonth[key].present++;
      else byMonth[key].absent++;
    });
    return Object.entries(byMonth).map(([month, data]) => ({ month, ...data })).slice(-12);
  }

  // Reset all data and re-seed with demo data
  resetAndReseed() {
    this.devotees.clear();
    this.families.clear();
    this.mentors.clear();
    this.attendance.clear();
    this.donations.clear();
    this.events.clear();
    this.volunteering.clear();
    this.groups.clear();
    this.groupEntries.clear();
    this.mandals.clear();
    this.sabhaLocations.clear();
    this.dashboardLayouts.clear();
    this.notifications.clear();
    Object.keys(this.counters).forEach(k => (this.counters as any)[k] = 1);
    this.initializeSampleData();
  }

  // Extended analytics: volunteering hours by activity
  async getVolunteeringStats(): Promise<Array<{ activity: string; hours: number }>> {
    const records = Array.from(this.volunteering.values());
    const byActivity: Record<string, number> = {};
    records.forEach(v => {
      const act = (v as any).activityType || 'Other';
      byActivity[act] = (byActivity[act] || 0) + ((v as any).hoursCompleted || (v as any).hours || 0);
    });
    return Object.entries(byActivity).map(([activity, hours]) => ({ activity, hours })).sort((a, b) => b.hours - a.hours).slice(0, 8);
  }

  // ─── Dev Config (in-memory fallback) ────────────────────────────────────────
  async getDevConfig(key: string): Promise<any> {
    return this.devConfigStore.get(key);
  }
  async getAllDevConfig(): Promise<any[]> {
    return Array.from(this.devConfigStore.entries()).map(([key, value]) => ({ key, value, createdAt: new Date(), updatedAt: new Date() }));
  }
  async setDevConfig(key: string, value: any): Promise<any> {
    this.devConfigStore.set(key, value);
    return { key, value, createdAt: new Date(), updatedAt: new Date() };
  }
  async deleteDevConfig(key: string): Promise<boolean> {
    return this.devConfigStore.delete(key);
  }

  // ─── Dev Macros (in-memory fallback) ───────────────────────────────────────
  async getDevMacros(): Promise<any[]> {
    return Array.from(this.devMacros.values()).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
  async getDevMacro(id: number): Promise<any | undefined> {
    return this.devMacros.get(id);
  }
  async createDevMacro(macro: any): Promise<any> {
    const id = this.macroCounter++;
    const entry = { id, ...macro, runCount: 0, lastRunAt: null, createdAt: new Date(), updatedAt: new Date() };
    this.devMacros.set(id, entry);
    return entry;
  }
  async updateDevMacro(id: number, macro: any): Promise<any> {
    const existing = this.devMacros.get(id);
    if (!existing) throw new Error("Macro not found");
    const updated = { ...existing, ...macro, updatedAt: new Date() };
    this.devMacros.set(id, updated);
    return updated;
  }
  async deleteDevMacro(id: number): Promise<boolean> {
    return this.devMacros.delete(id);
  }
  async incrementMacroRunCount(id: number): Promise<any> {
    const macro = this.devMacros.get(id);
    if (!macro) throw new Error("Macro not found");
    macro.runCount = (macro.runCount || 0) + 1;
    macro.lastRunAt = new Date();
    this.devMacros.set(id, macro);
    return macro;
  }

  // ─── Audit Log (in-memory fallback) ───────────────────────────────────────
  async getAuditLog(limit?: number, entity?: string, action?: string): Promise<any[]> {
    let logs = [...this.auditLogEntries];
    if (entity) logs = logs.filter((l: any) => l.entity === entity);
    if (action) logs = logs.filter((l: any) => l.action === action);
    return logs.slice(0, limit || 100);
  }
  async addAuditLogEntry(entry: any): Promise<any> {
    const newEntry = { id: this.auditLogEntries.length + 1, timestamp: new Date().toISOString(), ...entry };
    this.auditLogEntries.unshift(newEntry);
    if (this.auditLogEntries.length > 500) this.auditLogEntries.pop();
    return newEntry;
  }

  // ─── Visual Overrides (in-memory fallback) ───────────────────────────────
  async getVisualOverrides(): Promise<any[]> {
    return Object.entries(this.visualOverridesStore).map(([key, value]) => ({ id: key, selector: key, value, createdAt: new Date(), updatedAt: new Date() }));
  }
  async setVisualOverride(override: any): Promise<any> {
    this.visualOverridesStore[override.selector] = override.value;
    return { id: override.selector, ...override, createdAt: new Date(), updatedAt: new Date() };
  }
  async clearVisualOverrides(): Promise<boolean> {
    this.visualOverridesStore = {};
    return true;
  }

  // ─── Rollback Slots (in-memory fallback) ─────────────────────────────────
  async getRollbackSlots(): Promise<any[]> {
    return this.rollbackSlots;
  }
  async getRollbackSlot(index: number): Promise<any | undefined> {
    return this.rollbackSlots.find((s: any) => s.slotIndex === index);
  }
  async createRollbackSlot(slot: any): Promise<any> {
    const entry = { ...slot, createdAt: new Date(), updatedAt: new Date() };
    this.rollbackSlots.push(entry);
    return entry;
  }
  async deleteRollbackSlot(index: number): Promise<boolean> {
    const before = this.rollbackSlots.length;
    this.rollbackSlots = this.rollbackSlots.filter((s: any) => s.slotIndex !== index);
    return this.rollbackSlots.length < before;
  }
}
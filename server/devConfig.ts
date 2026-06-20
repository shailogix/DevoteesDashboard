import { storage } from "./storage";

const DEFAULT_DEV_CONFIG: Record<string, any> = {
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
};

class DevConfig {
  private cache: Record<string, any> = {};
  private loaded = false;

  async init() {
    if (this.loaded) return;
    try {
      const allEntries = await storage.getAllDevConfig();
      if (allEntries.length === 0) {
        // First run — seed defaults into database
        console.log("Seeding default dev config into database...");
        for (const [key, value] of Object.entries(DEFAULT_DEV_CONFIG)) {
          await storage.setDevConfig(key, value);
          this.cache[key] = value;
        }
      } else {
        for (const entry of allEntries) {
          this.cache[entry.key] = entry.value;
        }
      }
      this.loaded = true;
    } catch (e) {
      console.warn("Failed to load dev config from DB, using defaults:", e);
      this.loaded = true;
    }
  }

  get(key: string): any {
    if (key in this.cache) {
      return this.cache[key];
    }
    return DEFAULT_DEV_CONFIG[key];
  }

  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key of Object.keys(DEFAULT_DEV_CONFIG)) {
      result[key] = this.get(key);
    }
    return result;
  }

  async set(key: string, value: any): Promise<void> {
    this.cache[key] = value;
    await storage.setDevConfig(key, value);
  }

  async patch(key: string, partialValue: any): Promise<void> {
    const current = this.get(key) || {};
    const updated = Array.isArray(current) ? partialValue : { ...current, ...partialValue };
    await this.set(key, updated);
  }

  async import(data: Partial<Record<string, any>>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        await this.set(key, value);
      }
    }
  }

  async reset(): Promise<void> {
    this.cache = {};
    for (const [key, value] of Object.entries(DEFAULT_DEV_CONFIG)) {
      await storage.setDevConfig(key, value);
    }
  }
}

export const devConfig = new DevConfig();

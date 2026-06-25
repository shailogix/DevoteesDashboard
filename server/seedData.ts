
import { storage } from "./storage";

export async function seedDemoData() {
  try {
    // Skip if data already seeded (check donations - indicates full seed)
    const existingDonations = await storage.getDonations();
    if (existingDonations.length > 0) {
      console.log("Demo data already present (donations exist), skipping seed.");
      return;
    }

    // Seed Mandals — skip if already exist
    const mandals = [
      { name: "Shri Ayodhya Mandal", hindiName: "श्री अयोध्या मंडल", code: "AY" },
      { name: "Shri Dwarkadhish Mandal", hindiName: "श्री द्वारकाधीश मंडल", code: "DW" },
      { name: "Shri Ganpati Mandal", hindiName: "श्री गणपति मंडल", code: "GP" },
      { name: "Shri Kalika Mandal", hindiName: "श्री कालिका मंडल", code: "KL" },
      { name: "Shri Kashi Varanasi Mandal", hindiName: "श्री काशी वाराणसी मंडल", code: "KV" },
      { name: "Shri Khatushyam Mandal", hindiName: "श्री खातूश्याम जी मंडल", code: "KS" },
      { name: "Shri Mahakaleswar Mandal", hindiName: "श्री महाकालेश्वर मंडल", code: "MK" },
      { name: "Shri Maharatnapur Mandal", hindiName: "श्री महारत्नपुर मंडल", code: "MR" },
      { name: "Shri Mathura Gop Vrindavan Mandal", hindiName: "श्री मथुरा गोप वृन्दावन मण्डल", code: "MG" },
      { name: "Shri Rameshwaram Mandal", hindiName: "श्री रामेश्वरम मंडल", code: "RM" },
      { name: "Nav Braj Bhoomi Mandal", hindiName: "नव ब्रज भूमि मंडल", code: "NB" },
      { name: "Odiya Mandal", hindiName: "ओडिया मंडल", code: "OD" },
      { name: "Sagar Paar", hindiName: "सागर पार", code: "SP" },
      { name: "Other", hindiName: "अन्य", code: "OT" },
      { name: "None", hindiName: "कोई नहीं", code: "NN" },
    ];

    const existingMandals = await storage.getMandals();
    const existingCodes = new Set(existingMandals.map((m) => m.code));
    for (const mandal of mandals) {
      if (existingCodes.has(mandal.code)) continue;
      try {
        await storage.createMandal({
          ...mandal,
          description: `Traditional mandal group for ${mandal.name}`,
          isActive: true,
        });
      } catch (e: any) {
        console.log("Skipping mandal seed (already exists):", mandal.code);
      }
    }

    // Seed Sabha Locations
    const sabhaLocations = [
      { name: "Mumbai Central Sabha", address: "Mumbai Central, Maharashtra", city: "Mumbai", state: "Maharashtra" },
      { name: "Delhi Satsang Bhawan", address: "Karol Bagh, New Delhi", city: "Delhi", state: "Delhi" },
      { name: "Bangalore Ashram", address: "Whitefield, Bangalore", city: "Bangalore", state: "Karnataka" },
      { name: "Pune Sabha Griha", address: "Shivaji Nagar, Pune", city: "Pune", state: "Maharashtra" },
      { name: "Hyderabad Center", address: "Banjara Hills, Hyderabad", city: "Hyderabad", state: "Telangana" },
    ];

    for (const location of sabhaLocations) {
      await storage.createSabhaLocation({
        ...location,
        isActive: true,
      });
    }

    // Create default groups
    const defaultGroups = [
      {
        groupName: "Families",
        groupType: "family",
        description: "Family groups management",
        customFields: [
          { id: "familyName", name: "Family Name", type: "text", maxLength: 50, required: true },
          { id: "headOfFamily", name: "Head of Family", type: "text", maxLength: 50, required: true },
          { id: "totalMembers", name: "Total Members", type: "number", required: false },
          { id: "fullAddress", name: "Full Address", type: "textarea", maxLength: 100, required: false },
          { id: "mobileNumber", name: "Mobile Number", type: "number", maxLength: 13, required: false },
        ],
        isActive: true,
      },
      {
        groupName: "Mentors",
        groupType: "mentor",
        description: "Spiritual mentors and guides",
        customFields: [
          { id: "firstName", name: "First Name", type: "text", maxLength: 20, required: true },
          { id: "surname", name: "Surname", type: "text", maxLength: 20, required: true },
          { id: "specialization", name: "Specialization", type: "text", required: false },
          { id: "experience", name: "Experience (Years)", type: "number", required: false },
          { id: "mobileNumber", name: "Mobile Number", type: "number", maxLength: 13, required: false },
          { id: "maxMentees", name: "Max Mentees", type: "number", required: false },
        ],
        isActive: true,
      },
      {
        groupName: "Volunteers",
        groupType: "volunteer",
        description: "Active volunteers and seva workers",
        customFields: [
          { id: "firstName", name: "First Name", type: "text", maxLength: 20, required: true },
          { id: "surname", name: "Surname", type: "text", maxLength: 20, required: true },
          { id: "mobileNumber", name: "Mobile Number", type: "number", maxLength: 13, required: false },
          { id: "volunteeringActivities", name: "Volunteering Activities", type: "textarea", required: false },
          { id: "availableHours", name: "Available Hours", type: "text", required: false },
          { id: "specialSkills", name: "Special Skills", type: "textarea", required: false },
        ],
        isActive: true,
      },
      {
        groupName: "Sabha List",
        groupType: "sabha",
        description: "Sabha attendees and participants",
        customFields: [
          { id: "firstName", name: "First Name", type: "text", maxLength: 20, required: true },
          { id: "surname", name: "Surname", type: "text", maxLength: 20, required: true },
          { id: "mobileNumber", name: "Mobile Number", type: "number", maxLength: 13, required: false },
          { id: "mandalName", name: "Mandal Name", type: "select", options: mandals.map(m => m.name), required: false },
          { id: "sabhaAttended", name: "Sabha Attended", type: "multiselect", options: sabhaLocations.map(s => s.name), required: false },
          { id: "dateOfJoining", name: "Date of Joining", type: "date", required: false },
        ],
        isActive: true,
      },
    ];

    for (const group of defaultGroups) {
      await storage.createGroup(group);
    }

    // Seed Families
    const familyData = [
      { familyName: "Sharma Family", headOfFamily: null, address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", phone: "9876543210", email: "sharma.family@email.com", totalMembers: 4, emergencyContact: "Ramesh Sharma", notes: "Founding family", isActive: true },
      { familyName: "Patel Family", headOfFamily: null, address: "17 Krishna Lane, Athwa", city: "Surat", state: "Gujarat", pincode: "395001", country: "India", phone: "9876543220", email: "patel.family@email.com", totalMembers: 3, emergencyContact: "Suresh Patel", notes: "Major donors", isActive: true },
      { familyName: "Desai Family", headOfFamily: null, address: "5 Radha Niwas, Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390007", country: "India", phone: "9876543230", email: "desai.family@email.com", totalMembers: 3, emergencyContact: "Nilesh Desai", notes: "Senior mentors", isActive: true },
      { familyName: "Mehta Family", headOfFamily: null, address: "88 Satellite Road, Satellite", city: "Ahmedabad", state: "Gujarat", pincode: "380015", country: "India", phone: "9898765432", email: "mehta.family@email.com", totalMembers: 4, emergencyContact: "Vikram Mehta", notes: "Recently joined", isActive: true },
      { familyName: "Joshi Family", headOfFamily: null, address: "22 Hanuman Chowk, Old City", city: "Surat", state: "Gujarat", pincode: "395003", country: "India", phone: "9712345678", email: "joshi.family@email.com", totalMembers: 3, emergencyContact: "Dinesh Joshi", notes: "Long-standing volunteers", isActive: true },
    ];
    const seededFamilies: any[] = [];
    for (const f of familyData) {
      const created = await storage.createFamily(f);
      seededFamilies.push(created);
    }

    // Seed Devotees (first pass, no mentorId)
    const devoteeData = [
      { devoteeId: "MP-001", firstName: "Ramesh", lastName: "Sharma", email: "ramesh.sharma@email.com", phone: "9876543210", whatsappNumber: "9876543210", dateOfBirth: new Date("1975-03-15"), gender: "Male", address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", occupation: "Civil Engineer", spiritualLevel: "Advanced", mentorId: null, familyId: seededFamilies[0]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh", notes: "Founding member", specialSkills: "Kirtan leadership", previousExperience: "5 years", emergencyContact: "Sunita Sharma", emergencyPhone: "9876543211", dietaryPreferences: "Vegetarian", isActive: true },
      { devoteeId: "MP-002", firstName: "Sunita", lastName: "Sharma", email: "sunita.sharma@email.com", phone: "9876543211", whatsappNumber: "9876543211", dateOfBirth: new Date("1978-07-22"), gender: "Female", address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", occupation: "School Teacher", spiritualLevel: "Intermediate", mentorId: null, familyId: seededFamilies[0]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita", notes: "Leads women's satsang", specialSkills: "Bhajan singing", previousExperience: "3 years", emergencyContact: "Ramesh Sharma", emergencyPhone: "9876543210", dietaryPreferences: "Vegan", isActive: true },
      { devoteeId: "MP-003", firstName: "Arjun", lastName: "Sharma", email: "arjun.sharma@email.com", phone: "9876543212", whatsappNumber: "9876543212", dateOfBirth: new Date("2000-11-05"), gender: "Male", address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", occupation: "Engineering Student", spiritualLevel: "Beginner", mentorId: null, familyId: seededFamilies[0]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun", notes: "Youth leader", specialSkills: "Mridanga", emergencyContact: "Ramesh Sharma", emergencyPhone: "9876543210", dietaryPreferences: "Vegetarian", isActive: true },
      { devoteeId: "MP-004", firstName: "Priya", lastName: "Sharma", email: "priya.sharma@email.com", phone: "9876543213", whatsappNumber: "9876543213", dateOfBirth: new Date("2003-05-18"), gender: "Female", address: "42 Tulsi Nagar, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", country: "India", occupation: "Class 12 Student", spiritualLevel: "Beginner", mentorId: null, familyId: seededFamilies[0]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", notes: "Art and decoration", specialSkills: "Rangoli", emergencyContact: "Sunita Sharma", emergencyPhone: "9876543211", dietaryPreferences: "Vegetarian", isActive: true },
      { devoteeId: "MP-005", firstName: "Suresh", lastName: "Patel", email: "suresh.patel@email.com", phone: "9876543220", whatsappNumber: "9876543220", dateOfBirth: new Date("1968-09-30"), gender: "Male", address: "17 Krishna Lane, Athwa", city: "Surat", state: "Gujarat", pincode: "395001", country: "India", occupation: "Textile Businessman", spiritualLevel: "Teacher", mentorId: null, familyId: seededFamilies[1]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh", notes: "Primary donor", specialSkills: "Event management", previousExperience: "10 years", emergencyContact: "Meena Patel", emergencyPhone: "9876543221", dietaryPreferences: "Vegan", isActive: true },
      { devoteeId: "MP-006", firstName: "Meena", lastName: "Patel", email: "meena.patel@email.com", phone: "9876543221", whatsappNumber: "9876543221", dateOfBirth: new Date("1972-02-14"), gender: "Female", address: "17 Krishna Lane, Athwa", city: "Surat", state: "Gujarat", pincode: "395001", country: "India", occupation: "Paediatrician", spiritualLevel: "Advanced", mentorId: null, familyId: seededFamilies[1]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meena", notes: "Medical seva", specialSkills: "First aid", previousExperience: "8 years", emergencyContact: "Suresh Patel", emergencyPhone: "9876543220", dietaryPreferences: "Vegetarian", isActive: true },
      { devoteeId: "MP-007", firstName: "Rohan", lastName: "Patel", email: "rohan.patel@email.com", phone: "9876543222", whatsappNumber: "9876543222", dateOfBirth: new Date("1998-08-20"), gender: "Male", address: "17 Krishna Lane, Athwa", city: "Surat", state: "Gujarat", pincode: "395001", country: "India", occupation: "Software Developer", spiritualLevel: "Intermediate", mentorId: null, familyId: seededFamilies[1]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan", notes: "Youth tech lead", specialSkills: "Web development", emergencyContact: "Suresh Patel", emergencyPhone: "9876543220", dietaryPreferences: "Vegetarian", isActive: true },
      { devoteeId: "MP-008", firstName: "Nilesh", lastName: "Desai", email: "nilesh.desai@email.com", phone: "9876543230", whatsappNumber: "9876543230", dateOfBirth: new Date("1960-05-10"), gender: "Male", address: "5 Radha Niwas, Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390007", country: "India", occupation: "Retired Professor", spiritualLevel: "Advanced", mentorId: null, familyId: seededFamilies[2]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nilesh", notes: "Senior teacher", specialSkills: "Scripture teaching", previousExperience: "20 years", emergencyContact: "Hema Desai", emergencyPhone: "9876543231", dietaryPreferences: "Vegetarian", isActive: true },
      { devoteeId: "MP-009", firstName: "Hema", lastName: "Desai", email: "hema.desai@email.com", phone: "9876543231", whatsappNumber: "9876543231", dateOfBirth: new Date("1962-11-25"), gender: "Female", address: "5 Radha Niwas, Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390007", country: "India", occupation: "Homemaker", spiritualLevel: "Advanced", mentorId: null, familyId: seededFamilies[2]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hema", notes: "Cooking seva", specialSkills: "Cooking", previousExperience: "15 years", emergencyContact: "Nilesh Desai", emergencyPhone: "9876543230", dietaryPreferences: "Vegetarian", isActive: true },
      { devoteeId: "MP-010", firstName: "Aditya", lastName: "Desai", email: "aditya.desai@email.com", phone: "9876543232", whatsappNumber: "9876543232", dateOfBirth: new Date("1995-03-08"), gender: "Male", address: "5 Radha Niwas, Alkapuri", city: "Vadodara", state: "Gujarat", pincode: "390007", country: "India", occupation: "Chartered Accountant", spiritualLevel: "Intermediate", mentorId: null, familyId: seededFamilies[2]?.id, profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya", notes: "Finance seva", specialSkills: "Accounting", emergencyContact: "Nilesh Desai", emergencyPhone: "9876543230", dietaryPreferences: "Vegetarian", isActive: true },
    ];
    const seededDevotees: any[] = [];
    for (const d of devoteeData) {
      const created = await storage.createDevotee(d);
      seededDevotees.push(created);
    }

    // Update family heads
    for (let i = 0; i < seededFamilies.length; i++) {
      const familyDevotees = seededDevotees.filter((d: any) => d.familyId === seededFamilies[i].id);
      if (familyDevotees.length > 0) {
        await storage.updateFamily(seededFamilies[i].id, { headOfFamily: familyDevotees[0].id });
      }
    }

    // Seed Mentors (need existing devoteeId)
    const mentorData = [
      { devoteeId: seededDevotees[7].id, specialization: "Vedic Studies", experience: "15", qualifications: "M.A. Sanskrit, Ph.D. Vedic Studies", availableHours: "Weekends", contactPreference: "phone", maxMentees: 20, currentMentees: 12, isActive: true },
      { devoteeId: seededDevotees[5].id, specialization: "Bhakti Yoga", experience: "10", qualifications: "Yoga Instructor Certificate", availableHours: "Evenings", contactPreference: "whatsapp", maxMentees: 15, currentMentees: 8, isActive: true },
      { devoteeId: seededDevotees[0].id, specialization: "Kirtan", experience: "8", qualifications: "Sangit Visharad", availableHours: "Daily mornings", contactPreference: "phone", maxMentees: 25, currentMentees: 18, isActive: true },
    ];
    const seededMentors: any[] = [];
    for (const m of mentorData) {
      const created = await storage.createMentor(m);
      seededMentors.push(created);
    }

    // Update devotees with mentorIds
    await storage.updateDevotee(seededDevotees[0].id, { mentorId: seededMentors[2]?.id });
    await storage.updateDevotee(seededDevotees[1].id, { mentorId: seededMentors[0]?.id });
    await storage.updateDevotee(seededDevotees[2].id, { mentorId: seededMentors[2]?.id });
    await storage.updateDevotee(seededDevotees[5].id, { mentorId: seededMentors[0]?.id });
    await storage.updateDevotee(seededDevotees[6].id, { mentorId: seededMentors[2]?.id });
    await storage.updateDevotee(seededDevotees[8].id, { mentorId: seededMentors[0]?.id });
    await storage.updateDevotee(seededDevotees[9].id, { mentorId: seededMentors[2]?.id });

    // Seed Events
    const now = new Date();
    const eventData = [
      { title: "Satsang at Ahmedabad", description: "Weekly satsang at Ahmedabad", eventType: "satsang", location: "Ahmedabad", startDate: new Date(now.getFullYear(), now.getMonth(), 5), endDate: new Date(now.getFullYear(), now.getMonth(), 5), startTime: "18:00", endTime: "20:00", status: "completed", isActive: true, cost: "0", registrationRequired: false, maxParticipants: 50 },
      { title: "Janmashtami Festival", description: "Grand Janmashtami celebration", eventType: "festival", location: "Ahmedabad", startDate: new Date(now.getFullYear(), now.getMonth(), 15), endDate: new Date(now.getFullYear(), now.getMonth(), 16), startTime: "08:00", endTime: "22:00", status: "completed", isActive: true, cost: "0", registrationRequired: true, maxParticipants: 200 },
      { title: "Youth Workshop", description: "Youth spiritual development workshop", eventType: "workshop", location: "Surat", startDate: new Date(now.getFullYear(), now.getMonth(), 20), endDate: new Date(now.getFullYear(), now.getMonth(), 20), startTime: "10:00", endTime: "16:00", status: "completed", isActive: true, cost: "100", registrationRequired: true, maxParticipants: 30 },
      { title: "Satsang at Surat", description: "Monthly satsang", eventType: "satsang", location: "Surat", startDate: new Date(now.getFullYear(), now.getMonth(), 25), endDate: new Date(now.getFullYear(), now.getMonth(), 25), startTime: "18:00", endTime: "20:00", status: "completed", isActive: true, cost: "0", registrationRequired: false, maxParticipants: 40 },
      { title: "Guru Purnima Celebration", description: "Annual Guru Purnima", eventType: "festival", location: "Vadodara", startDate: new Date(now.getFullYear(), now.getMonth(), 28), endDate: new Date(now.getFullYear(), now.getMonth(), 28), startTime: "09:00", endTime: "21:00", status: "completed", isActive: true, cost: "0", registrationRequired: true, maxParticipants: 150 },
      { title: "Upcoming Satsang", description: "Next week satsang", eventType: "satsang", location: "Ahmedabad", startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7), endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7), startTime: "18:00", endTime: "20:00", status: "planned", isActive: true, cost: "0", registrationRequired: false, maxParticipants: 50 },
    ];
    const seededEvents: any[] = [];
    for (const e of eventData) {
      const created = await storage.createEvent(e);
      seededEvents.push(created);
    }

    // Seed Attendance
    for (let i = 0; i < seededEvents.length; i++) {
      const event = seededEvents[i];
      if (event.status === "completed") {
        for (let j = 0; j < seededDevotees.length; j++) {
          const present = Math.random() > 0.2;
          await storage.createAttendance({
            devoteeId: seededDevotees[j].id,
            eventId: event.id,
            attendanceDate: event.startDate,
            status: present ? "present" : "absent",
            checkInTime: present ? `${event.startTime}:00` : null,
            notes: present ? "Attended" : "Could not attend",
          });
        }
      }
    }

    // Seed Donations
    const donationTypes = ["General", "Festival", "Building Fund", "Education", "Medical"];
    const paymentMethods = ["Cash", "Bank Transfer", "Online"];
    for (let i = 0; i < seededDevotees.length; i++) {
      const numDonations = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numDonations; j++) {
        const amount = Math.floor(Math.random() * 50) * 100 + 500;
        await storage.createDonation({
          devoteeId: seededDevotees[i].id,
          amount: String(amount),
          donationType: donationTypes[Math.floor(Math.random() * donationTypes.length)],
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          donationDate: new Date(now.getFullYear(), now.getMonth(), Math.floor(Math.random() * 28) + 1),
          receiptNumber: `REC-${seededDevotees[i].id}-${j + 1}`,
          notes: "Seeded donation",
        });
      }
    }

    // Seed Volunteering
    const activities = ["Event Setup", "Cooking", "Kirtan", "Registration", "Clean-up", "Decoration", "Photography", "Medical Support"];
    for (let i = 0; i < seededDevotees.length; i++) {
      const numActivities = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numActivities; j++) {
        const hours = Math.floor(Math.random() * 4) + 2;
        await storage.createVolunteering({
          devoteeId: seededDevotees[i].id,
          activityType: activities[Math.floor(Math.random() * activities.length)],
          startDate: new Date(now.getFullYear(), now.getMonth(), Math.floor(Math.random() * 28) + 1),
          hoursCompleted: hours,
          description: "Seeded seva activity",
          status: "completed",
        });
      }
    }

    // Seed Group Memberships
    const createdGroups = await storage.getGroups();
    const sabhaGroup = createdGroups.find(g => g.groupName === "Sabha List");
    if (sabhaGroup) {
      for (const dev of seededDevotees) {
        await storage.createGroupMembership({
          groupId: sabhaGroup.id,
          devoteeId: dev.id,
          joinDate: new Date(),
          status: "active",
          notes: "Auto-seeded",
        });
      }
    }

    console.log("Demo data seeded successfully!");
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}

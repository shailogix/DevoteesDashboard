
import { storage } from "./storage";

export async function seedDemoData() {
  try {
    // Seed Mandals from the image
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

    for (const mandal of mandals) {
      await storage.createMandal({
        ...mandal,
        description: `Traditional mandal group for ${mandal.name}`,
        isActive: true,
      });
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

    // Add demo entries to each group
    const createdGroups = await storage.getGroups();
    
    // Demo family entries
    const familyGroup = createdGroups.find(g => g.groupName === "Families");
    if (familyGroup) {
      const familyEntries = [
        {
          groupId: familyGroup.id,
          entryData: {
            familyName: "Sharma Family",
            headOfFamily: "Rajesh Sharma",
            totalMembers: 4,
            fullAddress: "A-123, Sector 15, Noida, UP",
            mobileNumber: "9876543210",
          },
          uniqueMemberId: "FAM001",
          qrIdentifier: "JAISHRIMADHAV_FAM001",
        },
        {
          groupId: familyGroup.id,
          entryData: {
            familyName: "Gupta Family",
            headOfFamily: "Suresh Gupta",
            totalMembers: 5,
            fullAddress: "B-456, Andheri West, Mumbai, MH",
            mobileNumber: "9876543211",
          },
          uniqueMemberId: "FAM002",
          qrIdentifier: "JAISHRIMADHAV_FAM002",
        },
      ];

      for (const entry of familyEntries) {
        await storage.createGroupEntry(entry);
      }
    }

    // Demo mentor entries
    const mentorGroup = createdGroups.find(g => g.groupName === "Mentors");
    if (mentorGroup) {
      const mentorEntries = [
        {
          groupId: mentorGroup.id,
          entryData: {
            firstName: "Pandit",
            surname: "Vishwanath",
            specialization: "Vedic Studies",
            experience: 15,
            mobileNumber: "9876543212",
            maxMentees: 20,
          },
          uniqueMemberId: "MEN001",
          qrIdentifier: "JAISHRIMADHAV_MEN001",
        },
        {
          groupId: mentorGroup.id,
          entryData: {
            firstName: "Mata",
            surname: "Saraswati",
            specialization: "Spiritual Counseling",
            experience: 12,
            mobileNumber: "9876543213",
            maxMentees: 15,
          },
          uniqueMemberId: "MEN002",
          qrIdentifier: "JAISHRIMADHAV_MEN002",
        },
      ];

      for (const entry of mentorEntries) {
        await storage.createGroupEntry(entry);
      }
    }

    console.log("Demo data seeded successfully!");
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}

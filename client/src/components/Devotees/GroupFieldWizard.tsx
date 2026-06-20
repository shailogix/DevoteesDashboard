
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { Group, Mandal, SabhaLocation } from "@shared/schema";

interface FieldDefinition {
  id: string;
  name: string;
  type: string;
  maxLength?: number;
  required: boolean;
  options?: string[];
  autoCalculated?: boolean;
  description?: string;
}

interface GroupFieldWizardProps {
  group?: Group | null;
  mandals: Mandal[];
  sabhaLocations: SabhaLocation[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function GroupFieldWizard({ group, mandals, sabhaLocations, onSubmit, onCancel }: GroupFieldWizardProps) {
  const [groupName, setGroupName] = useState(group?.groupName || "");
  const [groupType, setGroupType] = useState(group?.groupType || "");
  const [description, setDescription] = useState(group?.description || "");
  const [selectedFields, setSelectedFields] = useState<FieldDefinition[]>(
    group?.customFields as FieldDefinition[] || []
  );
  const [customField, setCustomField] = useState({ name: "", type: "text", maxLength: 50 });

  const predefinedFields: FieldDefinition[] = [
    { id: "firstName", name: "First Name", type: "text", maxLength: 20, required: true, description: "Text Only, 20 Chars" },
    { id: "middleName", name: "Middle Name", type: "text", maxLength: 20, required: false, description: "Text Only, 20 Chars" },
    { id: "surname", name: "Surname", type: "text", maxLength: 20, required: true, description: "Text Only, 20 Chars" },
    { id: "fullName", name: "Full Name", type: "computed", autoCalculated: true, required: false, description: "Auto concatenated from First, Middle, Last Name" },
    { id: "dateOfBirth", name: "Date of Birth", type: "date", required: false, description: "Date in DD-MONTH-YYYY format" },
    { id: "age", name: "Age", type: "computed", autoCalculated: true, required: false, description: "Auto calculated from DOB" },
    { id: "mobileNumber", name: "Mobile Number", type: "number", maxLength: 13, required: false, description: "Number Only, 13 Chars" },
    { id: "whatsappNumber", name: "WhatsApp Number", type: "number", maxLength: 13, required: false, description: "Number Only, 13 Chars" },
    { id: "telegramNumber", name: "Telegram Number", type: "number", maxLength: 13, required: false, description: "Number Only, 13 Chars" },
    { id: "telegramUsername", name: "Telegram Username", type: "text", required: false, description: "Alphanumeric Text" },
    { id: "telegramId", name: "Telegram ID", type: "number", maxLength: 13, required: false, description: "Number only, 13 chars" },
    { id: "dateOfJoining", name: "Date Of Joining Satsang", type: "date", required: false, description: "Date in DD-MONTH-YYYY format" },
    { id: "joiningDay", name: "Joining Day", type: "computed", autoCalculated: true, required: false, description: "Auto calculated day name" },
    { id: "tenure", name: "Tenure", type: "computed", autoCalculated: true, required: false, description: "Auto calculated from DOJ" },
    { id: "fullAddress", name: "Full Address", type: "textarea", maxLength: 100, required: false, description: "Alphanumeric with symbols, 100 chars" },
    { id: "pincode", name: "PinCode", type: "number", maxLength: 6, required: false, description: "Number only, 6 digits" },
    { id: "district", name: "District", type: "text", maxLength: 20, required: false, description: "Text only, 20 chars" },
    { id: "state", name: "State", type: "text", maxLength: 20, required: false, description: "Text only, 20 chars" },
    { id: "mapLocation", name: "Map Location", type: "location", required: false, description: "Auto created location link" },
    { id: "mandalName", name: "Mandal Name", type: "select", options: mandals.map(m => m.name), required: false, description: "Dropdown from mandal list" },
    { id: "addedInMandal", name: "Added In Mandal", type: "boolean", required: false, description: "Boolean YES/NO radio" },
    { id: "referencedBy", name: "Referenced by", type: "reference", required: false, description: "Existing name in database" },
    { id: "referenceGiven", name: "Reference Given", type: "text", required: false, description: "Add to Prospect Group" },
    { id: "vegetarianSince", name: "Vegetarian Since", type: "monthYear", required: false, description: "Month and Year dropdown" },
    { id: "addictionFreeSince", name: "Addiction Free Since", type: "monthYear", required: false, description: "Month and Year dropdown" },
    { id: "testDate", name: "Test Date", type: "date", required: false, description: "Date" },
    { id: "testTakenBy", name: "Test Taken By", type: "reference", required: false, description: "Name from Volunteers group" },
    { id: "passportPhoto", name: "Passport Size Photo", type: "file", required: false, description: "Image upload to Google Drive" },
    { id: "note", name: "Note", type: "textarea", required: false, description: "Text notes" },
    { id: "remarks", name: "Remarks", type: "textarea", required: false, description: "Text remarks" },
    { id: "familyId", name: "Family ID", type: "reference", required: false, description: "Existing ID in family group" },
    { id: "panNumber", name: "PAN Number", type: "pan", required: false, description: "Format: ABCPD1234E" },
    { id: "aadhaarNumber", name: "Aadhaar Number", type: "number", maxLength: 12, required: false, description: "12 Digit Numeric" },
    { id: "volunteerId", name: "Volunteer ID", type: "reference", required: false, description: "Existing ID in Volunteers group" },
    { id: "specialGroup", name: "Special Group", type: "multiselect", required: false, description: "Multiple group selection" },
    { id: "mentorName", name: "Mentor Name", type: "reference", required: false, description: "Existing name in database" },
    { id: "pratyakshSatsang", name: "Pratyaksh Satsang", type: "text", required: false, description: "Text field" },
    { id: "sabhaAttended", name: "Names of Sabha Attended", type: "multiselect", options: sabhaLocations.map(s => s.name), required: false, description: "Multiple selection" },
    { id: "sabhaCount", name: "Number of Sabha Attended", type: "computed", autoCalculated: true, required: false, description: "Auto calculated" },
    { id: "volunteeringActivities", name: "Volunteering Activities", type: "textarea", required: false, description: "Text field" },
    { id: "uniqueMemberId", name: "Unique Member ID", type: "computed", autoCalculated: true, required: false, description: "Auto generated encrypted ID" },
    { id: "qrIdentifier", name: "QR Identifier", type: "computed", autoCalculated: true, required: false, description: "QR code with unique ID" },
  ];

  const handleFieldToggle = (field: FieldDefinition, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, { ...field, required: false }]);
    } else {
      setSelectedFields(selectedFields.filter(f => f.id !== field.id));
    }
  };

  const handleFieldRequiredToggle = (fieldId: string, required: boolean) => {
    setSelectedFields(selectedFields.map(f => 
      f.id === fieldId ? { ...f, required } : f
    ));
  };

  const handleRemoveField = (fieldId: string) => {
    setSelectedFields(selectedFields.filter(f => f.id !== fieldId));
  };

  const handleAddCustomField = () => {
    if (customField.name) {
      const newField: FieldDefinition = {
        id: `custom_${Date.now()}`,
        name: customField.name,
        type: customField.type,
        maxLength: customField.maxLength,
        required: false,
      };
      setSelectedFields([...selectedFields, newField]);
      setCustomField({ name: "", type: "text", maxLength: 50 });
    }
  };

  const handleSubmit = () => {
    const groupData = {
      groupName,
      groupType,
      description,
      customFields: selectedFields,
      isActive: true,
    };
    onSubmit(groupData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="groupName">Group Name *</Label>
          <Input
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
          />
        </div>
        <div>
          <Label htmlFor="groupType">Group Type *</Label>
          <Select value={groupType} onValueChange={setGroupType}>
            <SelectTrigger>
              <SelectValue placeholder="Select group type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="devotee">Devotee Group</SelectItem>
              <SelectItem value="family">Family Group</SelectItem>
              <SelectItem value="mentor">Mentor Group</SelectItem>
              <SelectItem value="volunteer">Volunteer Group</SelectItem>
              <SelectItem value="sabha">Sabha Group</SelectItem>
              <SelectItem value="mandal">Mandal Group</SelectItem>
              <SelectItem value="custom">Custom Group</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter group description"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Fields for this Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
            {predefinedFields.map((field) => (
              <div key={field.id} className="flex items-start space-x-2 p-2 border rounded">
                <Checkbox
                  checked={selectedFields.some(f => f.id === field.id)}
                  onCheckedChange={(checked) => handleFieldToggle(field, checked as boolean)}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{field.name}</div>
                  <div className="text-xs text-muted-foreground">{field.description}</div>
                  {field.autoCalculated && (
                    <Badge variant="secondary" className="text-xs mt-1">Auto</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Fields ({selectedFields.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{field.name}</span>
                    {field.autoCalculated && (
                      <Badge variant="secondary" className="text-xs">Auto</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!field.autoCalculated && (
                      <Checkbox
                        checked={field.required}
                        onCheckedChange={(checked) => handleFieldRequiredToggle(field.id, checked as boolean)}
                      />
                    )}
                    <span className="text-xs text-muted-foreground">Required</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(field.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Custom Field</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Field name"
              value={customField.name}
              onChange={(e) => setCustomField({ ...customField, name: e.target.value })}
            />
            <Select
              value={customField.type}
              onValueChange={(value) => setCustomField({ ...customField, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="select">Select</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Max length"
              value={customField.maxLength}
              onChange={(e) => setCustomField({ ...customField, maxLength: parseInt(e.target.value) })}
            />
            <Button onClick={handleAddCustomField}>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Button onClick={handleSubmit} disabled={!groupName || !groupType}>
          {group ? "Update Group" : "Create Group"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

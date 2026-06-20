
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { EncryptionService } from "@/lib/encryption";
import { Group, Mandal, SabhaLocation } from "@shared/schema";

interface GroupEntryFormProps {
  group: Group;
  mandals: Mandal[];
  sabhaLocations: SabhaLocation[];
  onSubmit: () => void;
  onCancel: () => void;
}

export function GroupEntryForm({ group, mandals, sabhaLocations, onSubmit, onCancel }: GroupEntryFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/group-entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-entries"] });
      toast({
        title: "Success",
        description: "Entry added successfully",
      });
      onSubmit();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add entry",
        variant: "destructive",
      });
    },
  });

  const customFields = (group.customFields as any[]) || [];

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Auto-calculate fields
    if (fieldId === 'dateOfBirth' && value) {
      const birthDate = new Date(value);
      const now = new Date();
      const years = now.getFullYear() - birthDate.getFullYear();
      const months = now.getMonth() - birthDate.getMonth();
      const days = now.getDate() - birthDate.getDate();
      
      let ageText = '';
      if (years > 0) ageText += `${years} Years, `;
      if (months > 0) ageText += `${months} Months, `;
      if (days > 0) ageText += `${days} Days`;
      
      setFormData(prev => ({ ...prev, age: ageText.trim().replace(/,$/, '') }));
    }

    if (fieldId === 'dateOfJoining' && value) {
      const joinDate = new Date(value);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setFormData(prev => ({ ...prev, joiningDay: dayNames[joinDate.getDay()] }));
      
      // Calculate tenure
      const now = new Date();
      const years = now.getFullYear() - joinDate.getFullYear();
      const months = now.getMonth() - joinDate.getMonth();
      const days = now.getDate() - joinDate.getDate();
      
      let tenureText = '';
      if (years > 0) tenureText += `${years} Years, `;
      if (months > 0) tenureText += `${months} Months, `;
      if (days > 0) tenureText += `${days} Days`;
      
      setFormData(prev => ({ ...prev, tenure: tenureText.trim().replace(/,$/, '') }));
    }

    if (fieldId === 'firstName' || fieldId === 'middleName' || fieldId === 'surname') {
      const firstName = fieldId === 'firstName' ? value : (formData.firstName || '');
      const middleName = fieldId === 'middleName' ? value : (formData.middleName || '');
      const surname = fieldId === 'surname' ? value : (formData.surname || '');
      
      const fullName = [firstName, middleName, surname].filter(Boolean).join(' ');
      setFormData(prev => ({ ...prev, fullName }));
    }

    if (fieldId === 'sabhaAttended') {
      const selectedSabhas = Array.isArray(value) ? value : [];
      setFormData(prev => ({ ...prev, sabhaCount: selectedSabhas.length }));
    }
  };

  const handleSubmit = () => {
    // Auto-generate unique member ID if not present
    const dob = formData.dateOfBirth;
    const mobile = formData.mobileNumber;
    const mandalName = formData.mandalName;
    
    let uniqueMemberId = '';
    let qrIdentifier = '';
    
    if (dob && mobile && mandalName) {
      const mandal = mandals.find(m => m.name === mandalName);
      const mandalCode = mandal?.code || '00';
      
      uniqueMemberId = EncryptionService.generateUniqueId(dob, mandalCode, mobile);
      qrIdentifier = EncryptionService.createQRIdentifier(uniqueMemberId);
    }
    
    const entryData = {
      groupId: group.id,
      entryData: {
        ...formData,
        uniqueMemberId,
        qrIdentifier,
      },
      uniqueMemberId,
      qrIdentifier,
    };
    
    createEntryMutation.mutate(entryData);
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';

    if (field.autoCalculated) {
      return (
        <div key={field.id}>
          <Label>{field.name} <Badge variant="secondary" className="ml-2">Auto</Badge></Label>
          <Input value={value} disabled className="bg-muted" />
        </div>
      );
    }

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <Input
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              maxLength={field.maxLength}
              required={field.required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              maxLength={field.maxLength}
              required={field.required}
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              maxLength={field.maxLength}
              required={field.required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.name}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${field.id}_yes`} />
                <Label htmlFor={`${field.id}_yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${field.id}_no`} />
                <Label htmlFor={`${field.id}_no`}>No</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    checked={Array.isArray(value) && value.includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        handleFieldChange(field.id, [...currentValues, option]);
                      } else {
                        handleFieldChange(field.id, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  <Label>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'monthYear':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={value?.month || ''}
                onValueChange={(month) => handleFieldChange(field.id, { ...value, month })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={value?.year || ''}
                onValueChange={(year) => handleFieldChange(field.id, { ...value, year })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 50 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'pan':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <Input
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value.toUpperCase())}
              placeholder="ABCPD1234E"
              pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              maxLength={10}
              required={field.required}
            />
          </div>
        );

      case 'file':
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFieldChange(field.id, file.name);
                }
              }}
              required={field.required}
            />
          </div>
        );

      default:
        return (
          <div key={field.id}>
            <Label>{field.name} {field.required && '*'}</Label>
            <Input
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {customFields.map(renderField)}
        </div>
        
        <div className="flex items-center space-x-2 mt-6">
          <Button onClick={handleSubmit} disabled={createEntryMutation.isPending}>
            {createEntryMutation.isPending ? "Adding..." : "Add Entry"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

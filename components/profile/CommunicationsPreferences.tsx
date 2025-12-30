'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Mail, Globe } from 'lucide-react';
import { UserProfile, ProfileUpdatePayload } from '@/types/profile';

interface CommunicationsPreferencesProps {
  profile: UserProfile | null;
  onUpdate: (data: ProfileUpdatePayload) => Promise<void>;
  isLoading?: boolean;
}

const languages = [
  { value: 'US English', label: 'US English', flag: '🇺🇸' },
  { value: 'UK English', label: 'UK English', flag: '🇬🇧' },
  { value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
  { value: 'French', label: 'French', flag: '🇫🇷' },
  { value: 'German', label: 'German', flag: '🇩🇪' },
  { value: 'Chinese', label: 'Chinese', flag: '🇨🇳' },
];

export function CommunicationsPreferences({
  profile,
  onUpdate,
  isLoading = false,
}: CommunicationsPreferencesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    contact_email: profile?.contact_email || '',
    communication_language: profile?.communication_language || 'US English',
    receive_promotional_offers: profile?.receive_promotional_offers ?? true,
  });

  const handleSave = async () => {
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update communications preferences:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      contact_email: profile?.contact_email || '',
      communication_language: profile?.communication_language || 'US English',
      receive_promotional_offers: profile?.receive_promotional_offers ?? true,
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communications preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">
            Communications preferences
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            How you'd like to receive marketing and promotional updates.
          </CardDescription>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Contact email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  placeholder="somchai.sirpattanakunchai@example.com"
                  className="pl-10 font-normal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-xs text-muted-foreground">
                Communication language
              </Label>
              <Select
                value={formData.communication_language}
                onValueChange={(value) =>
                  setFormData({ ...formData, communication_language: value })
                }
              >
                <SelectTrigger id="language" className="font-normal">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotional" className="text-xs text-muted-foreground">
                Receive promotional offers
              </Label>
              <Select
                value={formData.receive_promotional_offers ? 'yes' : 'no'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    receive_promotional_offers: value === 'yes',
                  })
                }
              >
                <SelectTrigger id="promotional" className="font-normal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} size="sm">
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Contact email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-red-500" />
                <p className="text-sm font-normal">
                  {profile?.contact_email || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Communication language</p>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-normal">
                  {profile?.communication_language || 'US English'}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Receive promotional offers</p>
              <p className="text-sm font-normal">
                {profile?.receive_promotional_offers ? 'Yes' : 'No'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

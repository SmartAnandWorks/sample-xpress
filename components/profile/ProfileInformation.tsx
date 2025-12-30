'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2 } from 'lucide-react';
import { UserProfile, ProfileUpdatePayload } from '@/types/profile';

interface ProfileInformationProps {
  profile: UserProfile | null;
  onUpdate: (data: ProfileUpdatePayload) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileInformation({
  profile,
  onUpdate,
  isLoading = false,
}: ProfileInformationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: profile?.address || '',
    phone: profile?.phone || '',
  });

  const handleSave = async () => {
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      address: profile?.address || '',
      phone: profile?.phone || '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
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
        <CardTitle className="text-lg font-semibold">
          Personal information
        </CardTitle>
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
              <Label htmlFor="address" className="text-xs text-muted-foreground">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter your address"
                className="font-normal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs text-muted-foreground">
                Hand phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter your phone number"
                className="font-normal"
              />
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
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-normal">
                {profile?.address || 'Not provided'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Hand phone</p>
              <p className="text-sm font-normal">
                {profile?.phone || 'Not provided'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

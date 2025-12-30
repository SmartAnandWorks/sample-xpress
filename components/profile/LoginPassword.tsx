'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2 } from 'lucide-react';
import { UserProfile, ProfileUpdatePayload } from '@/types/profile';
import { format } from 'date-fns';

interface LoginPasswordProps {
  profile: UserProfile | null;
  onUpdate: (data: ProfileUpdatePayload) => Promise<void>;
  isLoading?: boolean;
}

export function LoginPassword({
  profile,
  onUpdate,
  isLoading = false,
}: LoginPasswordProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    authentication_method: profile?.authentication_method || '',
  });

  const handleSave = async () => {
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update authentication method:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      authentication_method: profile?.authentication_method || '',
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not available';
    try {
      return format(new Date(dateString), 'dd-MM-yyyy HH:mm');
    } catch {
      return 'Not available';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login & password</CardTitle>
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
          <CardTitle className="text-lg font-semibold">Login & password</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Settings to configure and secure your login credentials and password.
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
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Password</p>
          <p className="text-sm font-normal">
            Last Updated {formatDate(profile?.password_last_updated)}
          </p>
        </div>

        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="auth-method" className="text-xs text-muted-foreground">
                Authentication method
              </Label>
              <Input
                id="auth-method"
                value={formData.authentication_method}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    authentication_method: e.target.value,
                  })
                }
                placeholder="e.g., +65-2093 2398"
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
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Authentication method</p>
            <p className="text-sm font-normal">
              {profile?.authentication_method || 'Not provided'}
            </p>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Account management</p>
          <p className="text-sm font-normal">{profile?.account_status || 'Active'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

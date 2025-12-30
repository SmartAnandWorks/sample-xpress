'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileInformation } from '@/components/profile/ProfileInformation';
import { LoginPassword } from '@/components/profile/LoginPassword';
import { CommunicationsPreferences } from '@/components/profile/CommunicationsPreferences';
import { useProfile } from '@/hooks/useProfile';
import { ProfileUpdatePayload } from '@/types/profile';

export default function ProfilePage() {
  const { profile, isLoading, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('profile-information');

  const handleUpdate = async (data: ProfileUpdatePayload) => {
    await updateProfile(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-auto p-1 bg-white border border-gray-200 rounded-lg">
            <TabsTrigger
              value="profile-information"
              className="px-6 py-2.5 text-sm font-medium data-[state=active]:bg-gray-100"
            >
              Profile information
            </TabsTrigger>
            <TabsTrigger
              value="my-wallet"
              className="px-6 py-2.5 text-sm font-medium data-[state=active]:bg-gray-100"
            >
              My wallet
            </TabsTrigger>
            <TabsTrigger
              value="my-accounts"
              className="px-6 py-2.5 text-sm font-medium data-[state=active]:bg-gray-100"
            >
              My accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile-information" className="space-y-6">
            <ProfileInformation
              profile={profile}
              onUpdate={handleUpdate}
              isLoading={isLoading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LoginPassword
                profile={profile}
                onUpdate={handleUpdate}
                isLoading={isLoading}
              />
              <CommunicationsPreferences
                profile={profile}
                onUpdate={handleUpdate}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="my-wallet" className="space-y-6">
            <div className="bg-white border rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">My wallet</h3>
              <p className="text-muted-foreground">
                Wallet management features coming soon.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="my-accounts" className="space-y-6">
            <div className="bg-white border rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">My accounts</h3>
              <p className="text-muted-foreground">
                Account management features coming soon.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

# Enterprise Integration Guide

Complete step-by-step guide to integrate the Profile Management micro-frontend into your existing Next.js enterprise application.

## Table of Contents
1. [Quick Start (5 minutes)](#quick-start)
2. [Option A: Component-Level Integration (Recommended for Monorepos)](#option-a-component-level)
3. [Option B: Module Federation (Recommended for Multi-App)](#option-b-module-federation)
4. [Option C: iFrame Integration (Framework Agnostic)](#option-c-iframe)
5. [Option D: Standalone Service (Fully Decoupled)](#option-d-standalone-service)
6. [Shared Configuration](#shared-configuration)
7. [Authentication Integration](#authentication-integration)
8. [Database Integration](#database-integration)
9. [Common Issues & Solutions](#troubleshooting)

---

## Quick Start

### Minimum Requirements
- Existing Next.js 13+ project
- Supabase project (free tier available)
- Node.js 18+

### Step 1: Set Up Supabase (5 min)
```bash
# 1. Go to https://supabase.com
# 2. Create a new project
# 3. Copy your project URL and anon key
# 4. Run the migration in your Supabase SQL editor:

# This migration creates the user_profiles table with RLS
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  address text DEFAULT '',
  phone text DEFAULT '',
  authentication_method text DEFAULT '',
  account_status text DEFAULT 'Active',
  contact_email text DEFAULT '',
  communication_language text DEFAULT 'US English',
  receive_promotional_offers boolean DEFAULT true,
  password_last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
```

---

## Option A: Component-Level Integration

**Best for**: Monorepos, shared design systems, same tech stack

### Prerequisites
- Both apps in same monorepo (e.g., using Nx, Turborepo, or pnpm workspaces)
- Shared dependency versions

### Step-by-Step Setup

#### 1. Copy Profile Components to Your Project

```bash
# If using monorepo structure:
cp -r components/profile your-enterprise-app/components/
cp hooks/useProfile.ts your-enterprise-app/hooks/
cp types/profile.ts your-enterprise-app/types/
cp lib/supabase.ts your-enterprise-app/lib/
```

#### 2. Install Dependencies (if not already present)

```bash
# In your enterprise app
npm install @supabase/supabase-js date-fns lucide-react
```

#### 3. Update Environment Variables

```env
# .env.local in your enterprise app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 4. Use Components in Your App

**Option A1: Separate Page Route**
```typescript
// app/profile/page.tsx
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
      <div className="max-w-4xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile-information">Profile Information</TabsTrigger>
            <TabsTrigger value="wallet">My Wallet</TabsTrigger>
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="profile-information" className="space-y-6 mt-6">
            <ProfileInformation profile={profile} onUpdate={handleUpdate} isLoading={isLoading} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LoginPassword profile={profile} onUpdate={handleUpdate} isLoading={isLoading} />
              <CommunicationsPreferences profile={profile} onUpdate={handleUpdate} isLoading={isLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

**Option A2: Modal/Drawer Integration**
```typescript
// components/UserMenu.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProfileInformation } from '@/components/profile/ProfileInformation';
import { useProfile } from '@/hooks/useProfile';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { profile, updateProfile, isLoading } = useProfile();

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Edit Profile
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <ProfileInformation
            profile={profile}
            onUpdate={async (data) => {
              await updateProfile(data);
              setOpen(false);
            }}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Advantages
✅ No extra build complexity
✅ Easy debugging
✅ Full code access
✅ Easy to customize

### Disadvantages
❌ Tightly coupled
❌ Shared dependency versions required
❌ Hard to update independently

---

## Option B: Module Federation

**Best for**: Multiple Next.js apps, independent deployments, shared UI

### Step-by-Step Setup

#### 1. Configure Profile MFE as Remote

In profile micro-frontend's `next.config.js`:

```javascript
const NextFederationPlugin = require('@module-federation/nextjs-mf');

module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'profileMfe',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './ProfilePage': './app/profile/page.tsx',
          './ProfileInformation': './components/profile/ProfileInformation.tsx',
          './LoginPassword': './components/profile/LoginPassword.tsx',
          './CommunicationsPreferences': './components/profile/CommunicationsPreferences.tsx',
          './useProfile': './hooks/useProfile.ts',
        },
        shared: {
          react: { singleton: true, requiredVersion: '18.2.0' },
          'react-dom': { singleton: true, requiredVersion: '18.2.0' },
          '@supabase/supabase-js': { singleton: true },
          'tailwindcss': { singleton: true },
        },
      })
    );

    return config;
  },
};
```

#### 2. Configure Your Enterprise App as Host

In your enterprise app's `next.config.js`:

```javascript
const NextFederationPlugin = require('@module-federation/nextjs-mf');

module.exports = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'enterpriseApp',
        remotes: {
          profileMfe: process.env.NODE_ENV === 'production'
            ? 'profileMfe@https://profile-mfe.example.com/_next/static/chunks/remoteEntry.js'
            : 'profileMfe@http://localhost:3001/_next/static/chunks/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: '18.2.0' },
          'react-dom': { singleton: true, requiredVersion: '18.2.0' },
          '@supabase/supabase-js': { singleton: true },
          'tailwindcss': { singleton: true },
        },
      })
    );

    return config;
  },
};
```

#### 3. Use in Your Enterprise App

```typescript
// app/settings/profile/page.tsx
import dynamic from 'next/dynamic';

const ProfilePage = dynamic(
  () => import('profileMfe/ProfilePage'),
  { ssr: false, loading: () => <div>Loading profile...</div> }
);

export default function SettingsPage() {
  return <ProfilePage />;
}
```

#### 4. Environment-Based URLs

Create environment config file:

```typescript
// config/remoteEntries.ts
const remoteEntries = {
  development: {
    profileMfe: 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
  },
  staging: {
    profileMfe: 'https://profile-mfe-staging.example.com/_next/static/chunks/remoteEntry.js',
  },
  production: {
    profileMfe: 'https://profile-mfe.example.com/_next/static/chunks/remoteEntry.js',
  },
};

export default remoteEntries[process.env.NODE_ENV];
```

### Advantages
✅ Independent deployment
✅ Independent versioning
✅ Shared dependencies
✅ Scalable architecture

### Disadvantages
❌ Build complexity
❌ Harder to debug
❌ Dependency alignment required
❌ Network calls in production

### Install Module Federation
```bash
npm install @module-federation/nextjs-mf
```

---

## Option C: iFrame Integration

**Best for**: Complete isolation, different tech stacks, legacy apps

### Step-by-Step Setup

#### 1. Deploy Profile MFE Separately

```bash
# Deploy profile app to a CDN or server
npm run build
# Upload to: https://profile-app.example.com
```

#### 2. Create iFrame Wrapper Component

```typescript
// components/ProfileWidget.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface ProfileWidgetProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  userId?: string;
}

export function ProfileWidget({
  supabaseUrl,
  supabaseAnonKey,
  userId,
}: ProfileWidgetProps) {
  const [iframeUrl, setIframeUrl] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({
      supabaseUrl,
      supabaseAnonKey,
      ...(userId && { userId }),
    });

    setIframeUrl(`https://profile-app.example.com?${params.toString()}`);
  }, [supabaseUrl, supabaseAnonKey, userId]);

  return (
    <Card className="p-0 overflow-hidden">
      <iframe
        src={iframeUrl}
        title="User Profile"
        width="100%"
        height="800px"
        frameBorder="0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        style={{ minHeight: '800px' }}
      />
    </Card>
  );
}
```

#### 3. Usage in Your App

```typescript
// app/settings/page.tsx
'use client';

import { ProfileWidget } from '@/components/ProfileWidget';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <ProfileWidget
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
        userId={user?.id}
      />
    </div>
  );
}
```

#### 4. PostMessage Communication

**From iFrame (profile MFE):**
```typescript
// In profile app
window.parent.postMessage({
  type: 'PROFILE_UPDATED',
  payload: updatedProfile,
}, '*');

window.parent.postMessage({
  type: 'PROFILE_ERROR',
  error: errorMessage,
}, '*');
```

**From Parent App (enterprise app):**
```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== 'https://profile-app.example.com') return;

    if (event.data.type === 'PROFILE_UPDATED') {
      console.log('Profile updated:', event.data.payload);
      // Update parent app state
    }

    if (event.data.type === 'PROFILE_ERROR') {
      console.error('Profile error:', event.data.error);
      // Show error notification
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### Advantages
✅ Complete isolation
✅ Can use different frameworks
✅ Easy to deploy separately
✅ No version conflicts

### Disadvantages
❌ Communication overhead
❌ Cross-origin restrictions
❌ Harder to debug
❌ Limited styling control

---

## Option D: Standalone Service

**Best for**: Fully decoupled systems, microservices architecture

### Step-by-Step Setup

#### 1. Deploy Profile App as Service

```bash
# Option 1: Vercel
npm run build
npm install -g vercel
vercel --prod

# Option 2: Docker
docker build -t profile-mfe .
docker run -p 3001:3000 profile-mfe

# Option 3: Self-hosted
npm run build
npm run start
```

#### 2. Create API Client in Enterprise App

```typescript
// lib/profileApi.ts
export const profileApi = {
  async getProfile(userId: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PROFILE_SERVICE_URL}/api/profile/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PROFILE_API_TOKEN}`,
        },
      }
    );
    return response.json();
  },

  async updateProfile(userId: string, data: ProfileUpdatePayload) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PROFILE_SERVICE_URL}/api/profile/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PROFILE_API_TOKEN}`,
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },
};
```

#### 3. Environment Configuration

```env
# .env.local
NEXT_PUBLIC_PROFILE_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_PROFILE_API_TOKEN=your-api-token
```

#### 4. Create Custom Hook in Enterprise App

```typescript
// hooks/useProfileService.ts
import { useCallback, useState } from 'react';
import { profileApi } from '@/lib/profileApi';

export function useProfileService(userId: string) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profileApi.getProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const data = await profileApi.updateProfile(userId, updates);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [userId]);

  return { profile, loading, error, fetchProfile, updateProfile };
}
```

### Advantages
✅ Fully decoupled
✅ Can scale independently
✅ Multiple frontend apps can use it
✅ Easy to replace later

### Disadvantages
❌ Network latency
❌ API contract management
❌ More complex deployment
❌ Requires authentication tokens

---

## Shared Configuration

### Authentication Integration with Your System

**If using Supabase Auth:**
```typescript
// lib/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

**If using your own auth system:**
```typescript
// hooks/useProfileWithCustomAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { ProfileUpdatePayload, UserProfile } from '@/types/profile';
import { useAuth } from '@/hooks/useAuth'; // Your auth hook

export function useProfileWithCustomAuth() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    fetchProfile();
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      // Fetch from your API instead
      const response = await fetch(`/api/profile/${user?.id}`);
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdatePayload) => {
    try {
      const response = await fetch(`/api/profile/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      setProfile(data);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update');
    }
  };

  return { profile, isLoading, error, updateProfile, refetch: fetchProfile };
}
```

---

## Database Integration

### If Using Supabase (Recommended)

The migration is already created. Just:

1. Add to your Supabase SQL editor
2. Update environment variables in your app
3. Done!

### If Using Custom Database

Create equivalent table:

```typescript
// lib/profileDb.ts (if using Prisma)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const profileDb = {
  async getProfile(userId: string) {
    return prisma.userProfile.findUnique({
      where: { userId },
    });
  },

  async updateProfile(userId: string, data: ProfileUpdatePayload) {
    return prisma.userProfile.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  },

  async createProfile(userId: string, email: string) {
    return prisma.userProfile.create({
      data: {
        userId,
        contactEmail: email,
      },
    });
  },
};
```

Prisma Schema:
```prisma
model UserProfile {
  id                       String   @id @default(cuid())
  userId                   String   @unique
  address                  String   @default("")
  phone                    String   @default("")
  authenticationMethod     String   @default("")
  accountStatus            String   @default("Active")
  contactEmail             String   @default("")
  communicationLanguage    String   @default("US English")
  receivePromotionalOffers Boolean  @default(true)
  passwordLastUpdated      DateTime @default(now())
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt

  user                     User     @relation(fields: [userId], references: [id])

  @@map("user_profiles")
}
```

---

## Common Issues & Solutions

### Issue 1: CORS Errors

**Problem:** iFrame or Module Federation shows CORS errors

**Solutions:**
```typescript
// If using Module Federation, add headers in next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/_next/static/chunks/remoteEntry.js',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: 'https://your-enterprise-app.com',
        },
      ],
    },
  ],
};
```

### Issue 2: Styling Conflicts

**Problem:** Tailwind CSS conflicts between apps

**Solutions:**
```typescript
// Use CSS modules instead of global Tailwind
// components/profile/ProfileInformation.module.css
.container {
  /* styles */
}

// Or use CSS-in-JS
import styled from 'styled-components';

const Container = styled.div`
  /* styles */
`;
```

### Issue 3: Authentication State Not Syncing

**Problem:** User logs in to enterprise app but not visible in profile app

**Solution:**
```typescript
// Pass auth token to profile widget
<ProfileWidget
  token={authToken}
  onAuthChange={(newToken) => {
    // Update token in parent app
  }}
/>
```

### Issue 4: Different Supabase Projects

**Problem:** Enterprise app uses different Supabase project

**Solution:**
```typescript
// Create wrapper that uses parent app's Supabase instance
export function useProfileWithSharedSupabase(
  supabaseClient: SupabaseClient
) {
  // Use provided client instead of creating new one
  const fetchProfile = async () => {
    const { data } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .single();
    return data;
  };

  // ... rest of hook
}
```

### Issue 5: Version Conflicts

**Problem:** Different packages versions causing issues

**Solution (for Module Federation):**
```javascript
// Specify exact versions in shared dependencies
shared: {
  'react': {
    singleton: true,
    requiredVersion: '18.2.0', // Exact version required
    eager: true, // Load immediately
  },
},
```

---

## Recommended Integration Path

### For Most Enterprises:

1. **Start with Option A (Component-Level)** if:
   - Same monorepo
   - Same tech stack version
   - Single deployment
   - Need full control

2. **Move to Option B (Module Federation)** if:
   - Multiple Next.js apps
   - Need independent deployments
   - Want to share components

3. **Use Option C (iFrame)** if:
   - Different frameworks
   - Maximum isolation needed
   - Quick integration

4. **Option D (Standalone)** if:
   - Fully decoupled microservices
   - Multiple consumer apps
   - Complex scaling needs

---

## Testing Integration

```typescript
// __tests__/integration/profile-integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileInformation } from '@/components/profile/ProfileInformation';

describe('Profile Integration with Enterprise App', () => {
  it('displays profile data from enterprise database', async () => {
    const mockProfile = {
      // ... mock data
    };

    render(
      <ProfileInformation
        profile={mockProfile}
        onUpdate={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    });
  });
});
```

---

## Deployment Checklist

- [ ] Supabase project created and migrations applied
- [ ] Environment variables configured
- [ ] Authentication integration tested
- [ ] Database integration verified
- [ ] Components tested in isolated environment
- [ ] Integration tested in enterprise app
- [ ] Error handling tested
- [ ] Performance monitored
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Team trained on new UI
- [ ] Deployed to staging
- [ ] Deployed to production

---

## Support

For detailed questions about your specific setup, refer to:
- MICRO_FRONTEND_GUIDE.md - Comprehensive integration guide
- README.md - Component documentation
- Next.js Documentation - https://nextjs.org/docs
- Supabase Documentation - https://supabase.com/docs

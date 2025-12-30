# Micro-Frontend Integration Guide

This guide explains how to integrate the Profile Management micro-frontend into your enterprise application.

## Architecture Overview

This micro-frontend follows best practices for enterprise integration:

1. **Self-Contained**: All dependencies are bundled
2. **Type-Safe**: Full TypeScript support with exportable types
3. **Database-Backed**: Supabase integration for data persistence
4. **Independently Deployable**: Can be deployed separately from main application
5. **Framework Agnostic**: Can be integrated with any frontend framework

## Integration Methods

### Method 1: Module Federation (Recommended for Next.js)

Configure Module Federation in your main application's `next.config.js`:

```javascript
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new ModuleFederationPlugin({
          name: 'mainApp',
          remotes: {
            profileMfe: 'profileMfe@http://localhost:3001/_next/static/chunks/remoteEntry.js',
          },
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
          },
        })
      );
    }
    return config;
  },
};
```

### Method 2: iFrame Integration

For framework-agnostic integration:

```html
<iframe
  src="http://localhost:3000/profile"
  width="100%"
  height="800px"
  frameborder="0"
  sandbox="allow-scripts allow-same-origin allow-forms"
></iframe>
```

### Method 3: Component-Level Integration

Import components directly in a monorepo structure:

```typescript
import { ProfileInformation } from '@profile-mfe/components/profile/ProfileInformation';
import { useProfile } from '@profile-mfe/hooks/useProfile';

function MyApp() {
  const { profile, updateProfile } = useProfile();

  return (
    <ProfileInformation
      profile={profile}
      onUpdate={updateProfile}
    />
  );
}
```

## Environment Configuration

### Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Optional Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_ENVIRONMENT=production
```

## Database Setup

### Supabase Configuration

1. Create a Supabase project
2. The migration has already been applied with this schema:

```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  address text,
  phone text,
  authentication_method text,
  account_status text DEFAULT 'Active',
  contact_email text,
  communication_language text DEFAULT 'US English',
  receive_promotional_offers boolean DEFAULT true,
  password_last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

3. RLS policies are automatically applied for security

## API Integration

### Custom Endpoints

If you need to integrate with your own API instead of Supabase:

1. Create a new hook in `hooks/useProfileApi.ts`:

```typescript
export function useProfileApi() {
  const fetchProfile = async () => {
    const response = await fetch('/api/profile');
    return response.json();
  };

  const updateProfile = async (data: ProfileUpdatePayload) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  };

  return { fetchProfile, updateProfile };
}
```

2. Replace the Supabase hook in your components

## Styling Integration

### Tailwind CSS

The micro-frontend uses Tailwind CSS. To ensure styles work correctly:

1. Include the micro-frontend's CSS in your main application
2. Or use CSS isolation with Shadow DOM

### Custom Theming

Customize the color scheme in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      // ... more colors
    },
  },
}
```

## Authentication Integration

### Supabase Auth

The micro-frontend uses Supabase authentication by default:

```typescript
import { supabase } from '@/lib/supabase';

// Sign in
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Custom Auth Provider

To integrate with your own auth system:

1. Create an auth context:

```typescript
import { createContext, useContext } from 'react';

const AuthContext = createContext<{
  user: User | null;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}
```

2. Replace Supabase auth calls with your custom implementation

## Event Communication

### PostMessage API

For iFrame integration, use postMessage for communication:

```typescript
// In micro-frontend
window.parent.postMessage({
  type: 'PROFILE_UPDATED',
  payload: updatedProfile,
}, '*');

// In parent application
window.addEventListener('message', (event) => {
  if (event.data.type === 'PROFILE_UPDATED') {
    console.log('Profile updated:', event.data.payload);
  }
});
```

### Custom Events

For same-origin integration:

```typescript
// Dispatch event from micro-frontend
window.dispatchEvent(new CustomEvent('profile-updated', {
  detail: updatedProfile,
}));

// Listen in parent application
window.addEventListener('profile-updated', (event) => {
  console.log('Profile updated:', event.detail);
});
```

## Deployment

### Standalone Deployment

```bash
npm run build
npm run start
```

Deploy to any static hosting provider:
- Vercel
- Netlify
- AWS Amplify
- CloudFlare Pages

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### CDN Deployment

Build and upload to CDN:

```bash
npm run build
# Upload .next/static to CDN
```

## Performance Optimization

### Code Splitting

Already configured with Next.js automatic code splitting.

### Lazy Loading

Implement lazy loading for heavy components:

```typescript
import dynamic from 'next/dynamic';

const ProfileInformation = dynamic(
  () => import('@/components/profile/ProfileInformation'),
  { loading: () => <LoadingSpinner /> }
);
```

### Caching Strategy

Implement SWR or React Query for data caching:

```typescript
import useSWR from 'swr';

function useProfile() {
  const { data, error, mutate } = useSWR('/api/profile', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return { profile: data, error, refresh: mutate };
}
```

## Monitoring and Analytics

### Error Tracking

Integrate with Sentry or similar:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
});
```

### Analytics

Add analytics tracking:

```typescript
const handleUpdate = async (data: ProfileUpdatePayload) => {
  await updateProfile(data);

  // Track event
  analytics.track('Profile Updated', {
    fields: Object.keys(data),
  });
};
```

## Testing in Integration

### End-to-End Testing

Use Playwright or Cypress for E2E tests:

```typescript
import { test, expect } from '@playwright/test';

test('should update profile information', async ({ page }) => {
  await page.goto('http://localhost:3000/profile');

  await page.click('button:has-text("Edit")');
  await page.fill('input[id="address"]', 'New Address');
  await page.click('button:has-text("Save")');

  await expect(page.locator('text=New Address')).toBeVisible();
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure CORS headers in your server
2. **Authentication Issues**: Ensure Supabase credentials are correct
3. **Style Conflicts**: Use CSS modules or Shadow DOM for isolation
4. **Type Errors**: Ensure shared types are properly exported

### Debug Mode

Enable debug logging:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Profile data:', profile);
  console.log('Update payload:', data);
}
```

## Support and Maintenance

### Version Management

Use semantic versioning:
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

### Update Strategy

1. Test in staging environment
2. Run full test suite
3. Check for breaking changes
4. Update integration documentation
5. Deploy to production

## Best Practices

1. **Always use TypeScript**: Maintain type safety
2. **Test thoroughly**: Run all tests before deploying
3. **Monitor performance**: Use performance monitoring tools
4. **Document changes**: Keep integration guide updated
5. **Version control**: Use git tags for releases
6. **Security first**: Regular security audits and updates
7. **Accessibility**: Ensure WCAG compliance
8. **Responsive design**: Test on multiple devices

## Contact

For integration support, contact the development team or open an issue in the repository.

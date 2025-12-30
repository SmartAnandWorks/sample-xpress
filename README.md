# Profile Management Micro-Frontend

A production-ready Next.js micro-frontend application for managing user profiles in enterprise applications. Built with TypeScript, React, and Supabase.

## Features

- **Profile Information Management**: Edit user address and phone number
- **Login & Password Settings**: Manage authentication methods and view password history
- **Communications Preferences**: Configure email, language, and promotional preferences
- **Real-time Data Persistence**: Integrated with Supabase for secure data storage
- **Row-Level Security**: Comprehensive RLS policies ensure users can only access their own data
- **Comprehensive Test Coverage**: Full Jest test suite with high code coverage
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Tab Navigation**: Clean, intuitive interface with multiple sections

## Tech Stack

- **Framework**: Next.js 13.5.1 with App Router
- **Language**: TypeScript 5.2.2
- **UI Library**: React 18.2.0
- **Component Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS 3.3.3
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Testing**: Jest 30.2.0 with React Testing Library
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Project Structure

```
.
├── app/
│   ├── profile/
│   │   └── page.tsx              # Main profile page with tab navigation
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/
│   ├── profile/
│   │   ├── ProfileInformation.tsx           # Personal info component
│   │   ├── LoginPassword.tsx                # Login/password component
│   │   └── CommunicationsPreferences.tsx    # Communications component
│   └── ui/                       # shadcn/ui components
├── hooks/
│   └── useProfile.ts             # Profile data management hook
├── lib/
│   ├── supabase.ts               # Supabase client configuration
│   └── utils.ts                  # Utility functions
├── types/
│   └── profile.ts                # TypeScript type definitions
├── __tests__/
│   ├── components/               # Component tests
│   └── hooks/                    # Hook tests
├── jest.config.js                # Jest configuration
├── jest.setup.js                 # Jest setup file
└── tailwind.config.ts            # Tailwind configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. The database schema is already applied via Supabase migration. The following table structure is created:

**user_profiles** table:
- `id` (uuid, primary key, references auth.users)
- `address` (text)
- `phone` (text)
- `authentication_method` (text)
- `account_status` (text)
- `contact_email` (text)
- `communication_language` (text)
- `receive_promotional_offers` (boolean)
- `password_last_updated` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000/profile](http://localhost:3000/profile) to view the application.

### Building for Production

```bash
npm run build
npm run start
```

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Type Checking

```bash
npm run typecheck
```

## Component Documentation

### ProfileInformation

Displays and allows editing of user's personal information (address and phone).

**Props:**
- `profile`: UserProfile | null
- `onUpdate`: (data: ProfileUpdatePayload) => Promise<void>
- `isLoading`: boolean

### LoginPassword

Manages login credentials, authentication methods, and displays password update history.

**Props:**
- `profile`: UserProfile | null
- `onUpdate`: (data: ProfileUpdatePayload) => Promise<void>
- `isLoading`: boolean

### CommunicationsPreferences

Handles user's communication preferences including email, language, and promotional offers.

**Props:**
- `profile`: UserProfile | null
- `onUpdate`: (data: ProfileUpdatePayload) => Promise<void>
- `isLoading`: boolean

## Hooks

### useProfile

Custom hook for managing user profile data with Supabase integration.

**Returns:**
- `profile`: UserProfile | null
- `isLoading`: boolean
- `error`: Error | null
- `updateProfile`: (updates: ProfileUpdatePayload) => Promise<UserProfile>
- `refetch`: () => Promise<void>

## Security

This application implements comprehensive security measures:

1. **Row-Level Security (RLS)**: All database tables have RLS enabled
2. **User Isolation**: Users can only access and modify their own data
3. **Authentication Required**: All operations require authenticated users
4. **Type Safety**: Full TypeScript coverage prevents runtime errors

## Micro-Frontend Integration

This application is designed to be integrated into larger enterprise applications:

1. **Independent Deployment**: Can be deployed and versioned independently
2. **Modular Architecture**: Clean component boundaries
3. **Minimal Dependencies**: Only essential packages included
4. **Environment Configuration**: Easy configuration via environment variables
5. **Type Exports**: All types can be imported by parent applications

## Testing Strategy

The application includes comprehensive test coverage:

- **Unit Tests**: All components and hooks
- **Integration Tests**: Component interactions
- **User Event Testing**: Simulated user interactions
- **Edge Cases**: Null states, loading states, error handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- **Static Generation**: Pages are statically generated for optimal performance
- **Code Splitting**: Automatic code splitting by Next.js
- **Optimized Bundle**: Production build is fully optimized
- **Lazy Loading**: Components load on demand

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

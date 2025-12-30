import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Profile Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enterprise-grade micro-frontend for managing user profiles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="border-2 hover:border-gray-300 transition-colors">
            <CardHeader>
              <User className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage personal details including address and contact information
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-gray-300 transition-colors">
            <CardHeader>
              <Shield className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Row-level security with comprehensive authentication management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-gray-300 transition-colors">
            <CardHeader>
              <Settings className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Configure communication settings and language preferences
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/profile">
            <Button size="lg" className="text-lg px-8 py-6">
              Go to Profile Management
            </Button>
          </Link>
        </div>

        <Card className="mt-16 bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Tech Stack</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="font-semibold text-gray-900">Next.js 13</p>
              <p className="text-sm text-gray-600">Framework</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">TypeScript</p>
              <p className="text-sm text-gray-600">Language</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Supabase</p>
              <p className="text-sm text-gray-600">Database</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Jest</p>
              <p className="text-sm text-gray-600">Testing</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

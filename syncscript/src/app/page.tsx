'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to SyncScript
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Collaborative vault management system for organizing and sharing research sources with your team.
          </p>

          {session ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Organize Sources</CardTitle>
              <CardDescription>
                Create vaults to organize your research sources and PDFs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Keep all your research materials organized in dedicated vaults with easy access and management.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collaborate in Real-Time</CardTitle>
              <CardDescription>
                Work together with your team with live updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                See changes instantly as team members add or remove sources from shared vaults.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Control permissions with owner, contributor, and viewer roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Manage who can view, edit, or delete content with flexible role-based permissions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Credentials */}
        {!session && (
          <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Demo Credentials</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Owner:</strong> owner@demo.com / owner123</p>
              <p><strong>Contributor:</strong> contributor@demo.com / contributor123</p>
              <p><strong>Viewer:</strong> viewer@demo.com / viewer123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

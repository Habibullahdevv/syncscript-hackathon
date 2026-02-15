'use client';

import { useSession } from 'next-auth/react';

export default function RoleBadge() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Loading...
      </span>
    );
  }

  if (!session?.user?.role) {
    return null;
  }

  const role = session.user.role;

  const roleStyles = {
    owner: 'bg-red-100 text-red-800 border-red-200',
    contributor: 'bg-blue-100 text-blue-800 border-blue-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const roleStyle = roleStyles[role as keyof typeof roleStyles] || roleStyles.viewer;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${roleStyle}`}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

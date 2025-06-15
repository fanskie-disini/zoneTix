// components/ProtectedRoute.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const ProtectedRoute = ({ 
  children, 
  fallbackUrl = '/login',
  loadingComponent = null 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(fallbackUrl);
    }
  }, [user, loading, router, fallbackUrl]);

  // Show loading while checking authentication
  if (loading) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#72BAA9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Memuat...</p>
          </div>
        </div>
      )
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  // Render children if user is authenticated
  return children;
};

export default ProtectedRoute;
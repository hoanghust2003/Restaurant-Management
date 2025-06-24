'use client';

import { useAuth } from '@/app/contexts/AuthContext';

export default function AuthTestPage() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Auth Test Page</h2>
      <p>Loading: {loading ? 'true' : 'false'}</p>
      <p>Is Authenticated: {isAuthenticated ? 'true' : 'false'}</p>
      <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
    </div>
  );
}

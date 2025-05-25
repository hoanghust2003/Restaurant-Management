'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyImportsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/warehouse/imports');
  }, [router]);

  return null;
}

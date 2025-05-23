'use client';
import CustomerLayout from '@/app/layouts/CustomerLayout';

export default function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CustomerLayout>{children}</CustomerLayout>
  )
}

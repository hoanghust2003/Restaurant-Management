'use client';

import React from 'react';
import { Card, Typography, Divider } from 'antd';
import AdminLayout from '@/app/layouts/AdminLayout';
import MenuDebugTools from '@/app/components/debug/MenuDebugTools';
import { useAuth } from '@/app/contexts/AuthContext';

const { Title, Text } = Typography;

const DebugPage = () => {
  const { user, hasRole } = useAuth();
  const isAdmin = user && hasRole(['admin']);
  
  if (!isAdmin) {
    return (
      <AdminLayout title="Debug Tools">
        <div className="p-6">
          <Card>
            <Title level={3}>Access Denied</Title>
            <Text>You need admin privileges to access debug tools.</Text>
          </Card>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Debug Tools">
      <div className="p-6">
        <Card className="mb-6">
          <Title level={3}>Debug Tools</Title>
          <Text>These tools are for testing and debugging purposes only.</Text>
        </Card>
        
        <Divider orientation="left">Menu Management Tests</Divider>
        
        <MenuDebugTools />
        
        <Divider />
        
        <Card className="mt-4">
          <Title level={5}>Testing Instructions</Title>
          <Text>
            Use the Menu CRUD Test Tool above to verify that the menu management functionality is working properly.
            The test will create a test menu, update it, add and remove dishes, and finally delete it.
          </Text>
          <Text className="block mt-2">
            You can also run the test manually from the browser console by using the following code:
          </Text>
          <pre className="bg-gray-100 p-2 mt-2 overflow-auto">
            {`
// Make services accessible from window for testing
window.menuService = menuService;
window.dishService = dishService;

// Then manually run the test
await window.menuService.create({
  name: 'Test Menu',
  description: 'Test Description',
  dishIds: [] // Add dish IDs if needed
});
`}
          </pre>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DebugPage;

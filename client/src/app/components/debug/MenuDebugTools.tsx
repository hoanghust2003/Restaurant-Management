'use client';

import React, { useState } from 'react';
import { Button, Card, Typography, message } from 'antd';
import { menuService } from '@/app/services/menu.service';
import { dishService } from '@/app/services/dish.service';
import { CreateMenuDto } from '@/app/models/menu.model';

const { Text, Title } = Typography;

// This is a debug component for testing Menu CRUD operations
const MenuDebugTools = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{step: string, status: 'success' | 'error', message: string}>>([]);

  async function runMenuCRUDTest() {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addTestResult('Starting Menu CRUD Test...', 'success', 'Test initiated');
      
      // 1. Test creating a new menu
      addTestResult('1. Testing menu creation...', 'success', 'Attempting to create menu');
      
      const testMenu: CreateMenuDto = {
        name: 'Test Menu ' + new Date().toISOString(),
        description: 'This is a test menu created via debug tools',
        dishIds: [] as string[] // We'll add dishes later if any are available
      };
      
      // Get some dishes to add to the menu
      const dishes = await dishService.getAll();
      if (dishes && dishes.length > 0) {
        testMenu.dishIds = [dishes[0].id]; // Add the first dish to our test menu
        addTestResult('Found dishes', 'success', `Found ${dishes.length} dishes, adding dish '${dishes[0].name}' to test menu`);
      } else {
        addTestResult('No dishes found', 'success', 'No dishes found to add to the test menu');
      }
      
      // Create the menu
      const createdMenu = await menuService.create(testMenu);
      addTestResult('Menu created', 'success', `Menu created with ID: ${createdMenu.id}`);
      
      if (!createdMenu || !createdMenu.id) {
        throw new Error('Failed to create menu - no ID returned');
      }
      
      const menuId = createdMenu.id;
      
      // 2. Test retrieving the menu
      addTestResult('2. Testing menu retrieval...', 'success', 'Attempting to retrieve menu');
      const retrievedMenu = await menuService.getById(menuId);
      addTestResult('Menu retrieved', 'success', `Menu '${retrievedMenu.name}' retrieved successfully`);
      
      if (!retrievedMenu || retrievedMenu.id !== menuId) {
        throw new Error('Failed to retrieve the created menu');
      }
      
      // 3. Test updating the menu
      addTestResult('3. Testing menu update...', 'success', 'Attempting to update menu');
      const updateData = {
        name: retrievedMenu.name + ' (Updated)',
        description: retrievedMenu.description + ' - Updated description'
      };
      
      const updatedMenu = await menuService.update(menuId, updateData);
      addTestResult('Menu updated', 'success', `Menu updated to '${updatedMenu.name}'`);
      
      // 4. Test adding dishes to the menu
      if (dishes && dishes.length > 1) {
        addTestResult('4. Testing adding dishes to menu...', 'success', 'Attempting to add dishes to menu');
        const dishesToAdd = [dishes[1].id]; // Add another dish
        
        try {
          const menuWithDishes = await menuService.addDishes(menuId, dishesToAdd);
          addTestResult('Dishes added', 'success', `Added dish '${dishes[1].name}' to menu`);
        } catch (error) {
          addTestResult('Error adding dishes', 'error', `Failed to add dishes: ${error}`);
        }
      }
      
      // 5. Test removing dishes from the menu
      if (dishes && dishes.length > 0 && retrievedMenu.dishes && retrievedMenu.dishes.length > 0) {
        addTestResult('5. Testing removing dishes from menu...', 'success', 'Attempting to remove dishes from menu');
        const dishesToRemove = [retrievedMenu.dishes[0].id];
        
        try {
          const menuWithoutDishes = await menuService.removeDishes(menuId, dishesToRemove);
          addTestResult('Dishes removed', 'success', 'Removed dishes from menu');
        } catch (error) {
          addTestResult('Error removing dishes', 'error', `Failed to remove dishes: ${error}`);
        }
      }
      
      // 6. Test deleting the menu
      addTestResult('6. Testing menu deletion...', 'success', 'Attempting to delete menu');
      await menuService.delete(menuId);
      addTestResult('Menu deleted', 'success', 'Menu deleted successfully');
      
      addTestResult('MENU CRUD TEST COMPLETED', 'success', 'All tests completed successfully');
      message.success('Menu CRUD test completed successfully!');
    } catch (error: any) {
      addTestResult('TEST FAILED', 'error', `Error: ${error.message || 'Unknown error'}`);
      message.error('Menu CRUD test failed. Check console for details.');
      console.error('MENU CRUD TEST ERROR:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function addTestResult(step: string, status: 'success' | 'error', message: string) {
    setTestResults(prev => [...prev, { step, status, message }]);
  }

  return (
    <Card title="Menu CRUD Test Tool" className="my-4">
      <div className="mb-4">
        <Text>This tool tests the menu CRUD functionality to verify it's working correctly.</Text>
      </div>
      
      <Button 
        type="primary" 
        onClick={runMenuCRUDTest} 
        loading={isLoading}
        className="mb-4"
      >
        Run Menu CRUD Test
      </Button>
      
      {testResults.length > 0 && (
        <div className="mt-4 border rounded p-4 bg-gray-50">
          <Title level={5}>Test Results:</Title>
          <div className="max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="mb-2">
                <Text strong>{result.step}</Text>
                <div className="ml-4">
                  <Text 
                    type={result.status === 'success' ? 'success' : 'danger'}
                  >
                    {result.message}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default MenuDebugTools;

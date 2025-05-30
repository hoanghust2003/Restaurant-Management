// API testing script for Menu CRUD operations
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Setup axios for API calls
const baseURL = process.env.API_URL || 'http://localhost:8000'; // Updated to match server port from .env
const apiClient = axios.create({
  baseURL,
  timeout: 10000
});

let authToken;
let testMenuId;

async function loginAsAdmin() {
  console.log('Logging in as admin user...');
  
  try {
    const response = await apiClient.post('/auth/login', {
      email: process.env.ADMIN_EMAIL || 'admin@example.com', // Update with a valid admin email
      password: process.env.ADMIN_PASSWORD || 'admin123'    // Update with a valid admin password
    });
    
    authToken = response.data.access_token;
    console.log('Login successful, token obtained.');
    
    // Set auth token for future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    return true;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMenuCreation() {
  console.log('\n1. TESTING MENU CREATION');
  
  try {
    // First get a dish to add to the menu
    const dishesResponse = await apiClient.get('/dishes');
    const dishes = dishesResponse.data;
    
    if (!dishes || dishes.length === 0) {
      console.log('No dishes found to add to menu. Creating menu without dishes.');
    } else {
      console.log(`Found ${dishes.length} dishes, will use the first one in the menu.`);
    }
    
    const dishIds = dishes && dishes.length > 0 ? [dishes[0].id] : [];
    
    // Create a test menu
    const testMenu = {
      name: `Test Menu ${new Date().toISOString()}`,
      description: 'This is a test menu created via API test script',
      dishIds
    };
    
    const createResponse = await apiClient.post('/menus', testMenu);
    testMenuId = createResponse.data.id;
    
    console.log('Menu created successfully:', {
      id: createResponse.data.id,
      name: createResponse.data.name
    });
    
    return true;
  } catch (error) {
    console.error('Menu creation failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMenuRetrieval() {
  console.log('\n2. TESTING MENU RETRIEVAL');
  
  try {
    const response = await apiClient.get(`/menus/${testMenuId}`);
    
    console.log('Menu retrieved successfully:', {
      id: response.data.id,
      name: response.data.name,
      dishCount: response.data.dishes ? response.data.dishes.length : 0
    });
    
    return true;
  } catch (error) {
    console.error('Menu retrieval failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMenuUpdate() {
  console.log('\n3. TESTING MENU UPDATE');
  
  try {
    const updateData = {
      name: `Updated Test Menu ${new Date().toISOString()}`,
      description: 'This menu has been updated via the API test script'
    };
    
    const response = await apiClient.patch(`/menus/${testMenuId}`, updateData);
    
    console.log('Menu updated successfully:', {
      id: response.data.id,
      name: response.data.name
    });
    
    return true;
  } catch (error) {
    console.error('Menu update failed:', error.response?.data || error.message);
    return false;
  }
}

async function testBatchDishOperations() {
  console.log('\n4. TESTING BATCH DISH OPERATIONS');
  
  try {
    // Get all dishes
    const dishesResponse = await apiClient.get('/dishes');
    const dishes = dishesResponse.data;
    
    if (!dishes || dishes.length < 2) {
      console.log('Not enough dishes found for testing batch operations. Skipping this test.');
      return true;
    }
    
    // Add multiple dishes to the menu
    const dishesToAdd = dishes.slice(0, 2).map(dish => dish.id); // Get first 2 dishes
    console.log(`Adding ${dishesToAdd.length} dishes to menu...`);
    
    const addResponse = await apiClient.post(`/menus/${testMenuId}/dishes`, {
      dishIds: dishesToAdd
    });
    
    console.log('Dishes added successfully:', addResponse.data);
    
    // Remove a dish from the menu
    const dishesToRemove = [dishesToAdd[0]];
    console.log(`Removing 1 dish from menu...`);
    
    const removeResponse = await apiClient.delete(`/menus/${testMenuId}/dishes`, {
      data: {
        dishIds: dishesToRemove
      }
    });
    
    console.log('Dish removed successfully:', removeResponse.data);
    
    return true;
  } catch (error) {
    console.error('Batch dish operations failed:', error.response?.data || error.message);
    return false;
  }
}

async function testMenuDeletion() {
  console.log('\n5. TESTING MENU DELETION');
  
  try {
    await apiClient.delete(`/menus/${testMenuId}`);
    
    console.log('Menu deleted successfully');
    
    // Verify it's really gone
    try {
      await apiClient.get(`/menus/${testMenuId}`);
      console.error('Menu still exists after deletion!');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Confirmed: Menu is no longer accessible after deletion');
        return true;
      } else {
        console.error('Unexpected error when verifying deletion:', error.response?.data || error.message);
        return false;
      }
    }
  } catch (error) {
    console.error('Menu deletion failed:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('======= STARTING MENU CRUD API TESTS =======');
  
  // Login first
  const loggedIn = await loginAsAdmin();
  if (!loggedIn) {
    console.error('Login failed, cannot proceed with tests.');
    return false;
  }
  
  // Run all tests
  const creationSuccess = await testMenuCreation();
  if (!creationSuccess || !testMenuId) {
    console.error('Menu creation failed, cannot proceed with other tests.');
    return false;
  }
  
  const retrievalSuccess = await testMenuRetrieval();
  const updateSuccess = await testMenuUpdate();
  const batchOperationsSuccess = await testBatchDishOperations();
  const deletionSuccess = await testMenuDeletion();
  
  // Summary
  console.log('\n======= TEST RESULTS SUMMARY =======');
  console.log('Menu Creation:       ', creationSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Menu Retrieval:      ', retrievalSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Menu Update:         ', updateSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Batch Dish Operations:', batchOperationsSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Menu Deletion:       ', deletionSuccess ? '✅ PASSED' : '❌ FAILED');
  
  const allTestsPassed = creationSuccess && retrievalSuccess && updateSuccess && 
                        batchOperationsSuccess && deletionSuccess;
  
  console.log('\n======= OVERALL RESULT =======');
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED! The menu CRUD operations are working correctly.');
    return true;
  } else {
    console.log('❌ SOME TESTS FAILED! The menu CRUD operations are not working correctly.');
    return false;
  }
}

// Run the tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });

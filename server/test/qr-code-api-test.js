/**
 * QR Code API Functionality Test Suite
 * 
 * This script tests the Restaurant Management System's QR code functionality API endpoints
 * including generating QR codes for tables, error handling, and customer endpoints.
 */
const axios = require('axios');
const dotenv = require('dotenv');
const chalk = require('chalk'); // For terminal coloring
dotenv.config();

// Setup axios for API calls
const baseURL = process.env.API_URL || 'http://localhost:8000';
const apiClient = axios.create({
  baseURL,
  timeout: 10000
});

// Terminal styling
const log = {
  title: (msg) => console.log('\n' + chalk.bgBlue.white(` ${msg} `)),
  info: (msg) => console.log(chalk.blue('→ ') + msg),
  success: (msg) => console.log(chalk.green('✓ ') + msg),
  warning: (msg) => console.log(chalk.yellow('⚠ ') + msg),
  error: (msg) => console.log(chalk.red('✗ ') + msg),
  data: (msg) => console.log(chalk.gray('  ' + msg))
};

let authToken;
let testTableId;

async function loginAsAdmin() {
  console.log('Logging in as admin user...');
  
  try {
    const response = await apiClient.post('/auth/login', {
      email: 'admin@gmail.com',
      password: 'Password123'
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

async function testGetTables() {
  console.log('\n1. TESTING GET ALL TABLES');
  
  try {
    const response = await apiClient.get('/tables');
    const tables = response.data;
    
    console.log(`Found ${tables.length} tables in database`);
    
    if (tables.length > 0) {
      testTableId = tables[0].id;
      console.log('Will use table:', {
        id: tables[0].id,
        name: tables[0].name,
        capacity: tables[0].capacity,
        status: tables[0].status
      });
      return true;
    } else {
      console.log('No tables found, will create one for testing');
      return false;
    }
  } catch (error) {
    console.error('Get tables failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateTable() {
  console.log('\n2. TESTING TABLE CREATION');
  
  try {
    const testTable = {
      name: `Bàn Test ${new Date().toISOString().slice(0, 19)}`,
      capacity: 4
    };
    
    const response = await apiClient.post('/tables', testTable);
    testTableId = response.data.id;
    
    console.log('Table created successfully:', {
      id: response.data.id,
      name: response.data.name,
      capacity: response.data.capacity,
      status: response.data.status
    });
    
    return true;
  } catch (error) {
    console.error('Table creation failed:', error.response?.data || error.message);
    return false;
  }
}

async function testQrCodeGeneration() {
  console.log('\n3. TESTING QR CODE GENERATION');
  
  if (!testTableId) {
    console.error('No table ID available for QR code generation');
    return false;
  }
  
  try {
    const response = await apiClient.get(`/tables/${testTableId}/qr-code`);
    
    console.log('QR Code generated successfully:', {
      tableId: response.data.table.id,
      tableName: response.data.table.name,
      qrCodeUrl: response.data.qrCodeUrl,
      qrCodeLength: response.data.qrCode.length
    });
    
    // Verify QR code is base64 encoded image
    if (response.data.qrCode.startsWith('data:image/png;base64,')) {
      console.log('✅ QR code is properly formatted as base64 PNG image');
    } else {
      console.log('❌ QR code format is not as expected');
      return false;
    }
    
    // Verify URL contains table ID
    if (response.data.qrCodeUrl.includes(testTableId)) {
      console.log('✅ QR code URL contains correct table ID');
    } else {
      console.log('❌ QR code URL does not contain table ID');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('QR code generation failed:', error.response?.data || error.message);
    return false;
  }
}

async function testTableStatusUpdate() {
  console.log('\n4. TESTING TABLE STATUS UPDATE');
  
  if (!testTableId) {
    console.error('No table ID available for status update');
    return false;
  }
  
  try {
    // Update table status to 'occupied'
    const response = await apiClient.patch(`/tables/${testTableId}/status`, {
      status: 'occupied'
    });
    
    console.log('Table status updated successfully:', {
      id: response.data.id,
      name: response.data.name,
      status: response.data.status
    });
    
    // Test QR code generation for occupied table
    const qrResponse = await apiClient.get(`/tables/${testTableId}/qr-code`);
    console.log('QR code still works for occupied table:', {
      status: qrResponse.data.table.status
    });
    
    return true;
  } catch (error) {
    console.error('Table status update failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidTableQrCode() {
  console.log('\n5. TESTING INVALID TABLE QR CODE');
  
  try {
    // Try to generate QR code for non-existent table
    await apiClient.get('/tables/00000000-0000-0000-0000-000000000000/qr-code');
    
    console.log('❌ QR code generation should have failed for invalid table');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ Correctly returned 404 for invalid table ID');
      return true;
    } else {
      console.error('Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function runAllTests() {
  console.log('======= STARTING QR CODE API TESTS =======');
  
  // Login first
  const loggedIn = await loginAsAdmin();
  if (!loggedIn) {
    console.error('Login failed, cannot proceed with tests.');
    return false;
  }
  
  // Get existing tables or create one
  const tablesExist = await testGetTables();
  if (!tablesExist) {
    const tableCreated = await testCreateTable();
    if (!tableCreated) {
      console.error('Cannot create table for testing.');
      return false;
    }
  }
  
  // Run QR code tests
  const qrCodeSuccess = await testQrCodeGeneration();
  const statusUpdateSuccess = await testTableStatusUpdate();
  const invalidTableSuccess = await testInvalidTableQrCode();
  
  // Summary
  console.log('\n======= TEST RESULTS SUMMARY =======');
  console.log('QR Code Generation:    ', qrCodeSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Table Status Update:   ', statusUpdateSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Invalid Table Test:    ', invalidTableSuccess ? '✅ PASSED' : '❌ FAILED');
  
  const allTestsPassed = qrCodeSuccess && statusUpdateSuccess && invalidTableSuccess;
  
  console.log('\n======= OVERALL RESULT =======');
  if (allTestsPassed) {
    console.log('✅ ALL QR CODE TESTS PASSED! The QR code feature is working correctly.');
    console.log('\n🔗 Test Table Info:');
    console.log(`   Table ID: ${testTableId}`);
    console.log(`   QR Code URL: http://localhost:3000/customer/menu?tableId=${testTableId}`);
    return true;
  } else {
    console.log('❌ SOME TESTS FAILED! The QR code feature needs debugging.');
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

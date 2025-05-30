// Test script for QR code ordering flow
// Run this in browser console on the restaurant management client application

async function testQrCodeFlow() {
  console.log('Starting QR code ordering flow test...');
  
  try {
    // Step 1: Create a test table
    console.log('Creating test table...');
    const testTableName = `Test Table ${Math.floor(Math.random() * 1000)}`;
    const tableResponse = await fetch('/api/tables', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: testTableName,
        capacity: 4
      })
    });
    
    if (!tableResponse.ok) {
      throw new Error(`Failed to create test table: ${tableResponse.statusText}`);
    }
    
    const table = await tableResponse.json();
    console.log(`Created test table: ${table.name} with ID: ${table.id}`);
    
    // Step 2: Generate QR code for the table
    console.log('Generating QR code...');
    const qrResponse = await fetch(`/api/tables/${table.id}/qr-code`);
    
    if (!qrResponse.ok) {
      throw new Error(`Failed to generate QR code: ${qrResponse.statusText}`);
    }
    
    const qrData = await qrResponse.json();
    console.log('QR code generated successfully');
    console.log('Menu URL:', qrData.menuUrl);
    
    // Step 3: Simulate scanning the QR code by opening the menu URL
    console.log('Simulating QR code scan by opening menu URL...');
    window.open(qrData.menuUrl, '_blank');
    
    // Step 4: Instructions to complete the test
    console.log('\nTest instructions:');
    console.log('1. In the new tab that opened, add some items to the cart');
    console.log('2. Proceed to checkout');
    console.log('3. Verify that the table ID is automatically selected in the checkout form');
    console.log('4. Complete the order');
    console.log('5. Verify that you are redirected to the menu page with a success message');
    console.log('6. Check the orders in the admin/waiter panel to confirm the order was placed with the correct table ID');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Execute the test
testQrCodeFlow();

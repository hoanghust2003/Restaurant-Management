// Test script for Menu CRUD operations
// Copy and paste this script in your browser console when on the Menu List page

async function testMenuCRUD() {
  console.log('Starting Menu CRUD Test...');
  
  // 1. Test creating a new menu
  console.log('1. Testing menu creation...');
  try {
    const testMenu = {
      name: 'Test Menu ' + new Date().toISOString(),
      description: 'This is a test menu created via browser console',
      dishIds: [] // We'll add dishes later if any are available
    };
    
    // Get some dishes to add to the menu
    const dishes = await window.dishService.getAll();
    if (dishes && dishes.length > 0) {
      testMenu.dishIds = [dishes[0].id]; // Add the first dish to our test menu
      console.log(`Found ${dishes.length} dishes, adding dish '${dishes[0].name}' to test menu`);
    } else {
      console.log('No dishes found to add to the test menu');
    }
    
    // Create the menu
    const createdMenu = await window.menuService.create(testMenu);
    console.log('Menu created successfully:', createdMenu);
    
    if (!createdMenu || !createdMenu.id) {
      throw new Error('Failed to create menu - no ID returned');
    }
    
    const menuId = createdMenu.id;
    
    // 2. Test retrieving the menu
    console.log('2. Testing menu retrieval...');
    const retrievedMenu = await window.menuService.getById(menuId);
    console.log('Menu retrieved successfully:', retrievedMenu);
    
    if (!retrievedMenu || retrievedMenu.id !== menuId) {
      throw new Error('Failed to retrieve the created menu');
    }
    
    // 3. Test updating the menu
    console.log('3. Testing menu update...');
    const updateData = {
      name: retrievedMenu.name + ' (Updated)',
      description: retrievedMenu.description + ' - Updated description'
    };
    
    const updatedMenu = await window.menuService.update(menuId, updateData);
    console.log('Menu updated successfully:', updatedMenu);
    
    // 4. Test adding dishes to the menu
    if (dishes && dishes.length > 1) {
      console.log('4. Testing adding dishes to menu...');
      const dishesToAdd = [dishes[1].id]; // Add another dish
      
      try {
        const menuWithDishes = await window.menuService.addDishes(menuId, dishesToAdd);
        console.log('Dishes added to menu successfully:', menuWithDishes);
      } catch (error) {
        console.error('Error adding dishes to menu:', error);
      }
    }
    
    // 5. Test removing dishes from the menu
    if (dishes && dishes.length > 0 && retrievedMenu.dishes && retrievedMenu.dishes.length > 0) {
      console.log('5. Testing removing dishes from menu...');
      const dishesToRemove = [retrievedMenu.dishes[0].id];
      
      try {
        const menuWithoutDishes = await window.menuService.removeDishes(menuId, dishesToRemove);
        console.log('Dishes removed from menu successfully:', menuWithoutDishes);
      } catch (error) {
        console.error('Error removing dishes from menu:', error);
      }
    }
    
    // 6. Test deleting the menu
    console.log('6. Testing menu deletion...');
    await window.menuService.delete(menuId);
    console.log('Menu deleted successfully');
    
    console.log('MENU CRUD TEST COMPLETED SUCCESSFULLY!');
    return true;
  } catch (error) {
    console.error('MENU CRUD TEST FAILED:', error);
    return false;
  }
}

// Make services accessible from window for testing
window.menuService = menuService;
window.dishService = dishService;

// Run the test
testMenuCRUD().then(success => {
  if (success) {
    console.log('%c Menu CRUD functionality is working correctly! ', 'background: #4CAF50; color: white; padding: 5px; border-radius: 5px;');
  } else {
    console.log('%c Menu CRUD functionality has issues! ', 'background: #F44336; color: white; padding: 5px; border-radius: 5px;');
  }
});

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { DishModel } from '../models/dish.model';
import { message } from 'antd';

export interface CartItem {
  dishId: string;
  dish: DishModel;
  quantity: number;
  note?: string;
}

interface ShoppingCartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  tableId: string | null;
  addItem: (dish: DishModel, quantity?: number, note?: string) => void;
  removeItem: (dishId: string) => void;
  updateItemQuantity: (dishId: string, quantity: number) => void;
  updateItemNote: (dishId: string, note: string) => void;
  clearCart: () => void;
  isItemInCart: (dishId: string) => boolean;
  setTableId: (tableId: string | null) => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const ShoppingCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('shoppingCart');
      const savedTableId = localStorage.getItem('shoppingCartTableId');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      if (savedTableId) {
        setTableId(savedTableId);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('shoppingCart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  // Save tableId to localStorage whenever it changes
  useEffect(() => {
    try {
      if (tableId) {
        localStorage.setItem('shoppingCartTableId', tableId);
      } else {
        localStorage.removeItem('shoppingCartTableId');
      }
    } catch (error) {
      console.error('Error saving tableId to localStorage:', error);
    }
  }, [tableId]);
  
  // Calculate total number of items and total price
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
    // Add item to cart or update quantity if it already exists
  const addItem = useCallback((dish: DishModel, quantity: number = 1, note?: string) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.dishId === dish.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if the item already exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          note: note || updatedItems[existingItemIndex].note
        };
        
        message.success('Đã cập nhật số lượng trong giỏ hàng');
        return updatedItems;
      } else {
        // Add new item
        message.success('Đã thêm món ăn vào giỏ hàng');
        return [...prevItems, {
          dishId: dish.id,
          dish,
          quantity,
          note
        }];
      }
    });
  }, []);
  
  // Remove item from cart
  const removeItem = useCallback((dishId: string) => {
    setItems(prevItems => prevItems.filter(item => item.dishId !== dishId));
    message.success('Đã xóa món ăn khỏi giỏ hàng');
  }, []);
  
  // Update quantity of an item
  const updateItemQuantity = useCallback((dishId: string, quantity: number) => {
    if (quantity < 1) {
      return removeItem(dishId);
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.dishId === dishId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);
  
  // Update the note for an item
  const updateItemNote = useCallback((dishId: string, note: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.dishId === dishId ? { ...item, note } : item
      )
    );
  }, []);
  
  // Clear the entire cart
  const clearCart = useCallback(() => {
    setItems([]);
    message.success('Giỏ hàng đã được làm trống');
  }, []);
  
  // Check if an item is already in cart
  const isItemInCart = useCallback((dishId: string) => {
    return items.some(item => item.dishId === dishId);
  }, [items]);
    return (
    <ShoppingCartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        tableId,
        addItem,
        removeItem,
        updateItemQuantity,
        updateItemNote,
        clearCart,
        isItemInCart,
        setTableId
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
};

export const useShoppingCart = (): ShoppingCartContextType => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};

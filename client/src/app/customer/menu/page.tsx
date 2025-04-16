"use client";

import React from "react";
import Link from "next/link";
import { Coffee, Pizza, Cake, Wine, Plus, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Giả lập dữ liệu danh mục món ăn
const categories = [
  { id: 1, name: "Khai vị", icon: <Coffee size={20} /> },
  { id: 2, name: "Món chính", icon: <Pizza size={20} /> },
  { id: 3, name: "Tráng miệng", icon: <Cake size={20} /> },
  { id: 4, name: "Đồ uống", icon: <Wine size={20} /> },
];

// Giả lập dữ liệu món ăn
const menuItems = [
  {
    id: 1,
    name: "Súp bí đỏ",
    description: "Súp bí đỏ kem tươi với hạt bí rang",
    price: 65000,
    category: 1,
    imageUrl: "https://via.placeholder.com/300x200?text=Súp+bí+đỏ",
    isAvailable: true,
  },
  {
    id: 2,
    name: "Gỏi cuốn tôm thịt",
    description: "Gỏi cuốn tươi với tôm, thịt heo, rau thơm và bún",
    price: 85000,
    category: 1,
    imageUrl: "https://via.placeholder.com/300x200?text=Gỏi+cuốn",
    isAvailable: true,
  },
  {
    id: 3,
    name: "Bò hầm rượu vang",
    description: "Thịt bò hầm với rau củ và rượu vang đỏ, dùng kèm bánh mì",
    price: 245000,
    category: 2,
    imageUrl: "https://via.placeholder.com/300x200?text=Bò+hầm",
    isAvailable: true,
  },
  {
    id: 4,
    name: "Cá hồi nướng",
    description: "Cá hồi Na Uy nướng với sốt chanh dây, dùng kèm khoai tây nghiền và rau củ",
    price: 235000,
    category: 2,
    imageUrl: "https://via.placeholder.com/300x200?text=Cá+hồi",
    isAvailable: true,
  },
  {
    id: 5,
    name: "Bánh flan",
    description: "Bánh flan vị cà phê với caramel",
    price: 65000,
    category: 3,
    imageUrl: "https://via.placeholder.com/300x200?text=Bánh+flan",
    isAvailable: true,
  },
  {
    id: 6,
    name: "Sinh tố bơ",
    description: "Sinh tố bơ mát lạnh với đường thốt nốt",
    price: 65000,
    category: 4,
    imageUrl: "https://via.placeholder.com/300x200?text=Sinh+tố+bơ",
    isAvailable: true,
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function MenuPage() {
  // Lấy tất cả món ăn hoặc có thể lọc theo danh mục
  const [activeCategory, setActiveCategory] = React.useState<number | null>(null);
  const filteredItems = activeCategory 
    ? menuItems.filter(item => item.category === activeCategory) 
    : menuItems;

  return (
    <div className="pb-20">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h1 className="text-2xl font-bold mb-2">Thực đơn nhà hàng</h1>
        <p className="text-gray-500">Các món ngon đặc trưng của nhà hàng chúng tôi</p>
      </div>
      
      {/* Danh mục */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          <Button 
            onClick={() => setActiveCategory(null)}
            variant={activeCategory === null ? "primary" : "outline"}
            className="whitespace-nowrap"
          >
            Tất cả món
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              variant={activeCategory === category.id ? "primary" : "outline"}
              className="whitespace-nowrap"
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Danh sách món ăn */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="w-full h-48 overflow-hidden relative">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">Hết món</span>
                </div>
              )}
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{item.name}</CardTitle>
                <span className="font-bold text-green-600">{formatPrice(item.price)}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex justify-between">
                <Button
                  disabled={!item.isAvailable}
                  variant="primary"
                  className="flex items-center"
                >
                  <Plus size={18} className="mr-1" />
                  Thêm vào giỏ
                </Button>
                
                <Link href={`/customer/menu/${item.id}`}>
                  <Button variant="outline" className="flex items-center">
                    <Info size={18} className="mr-1" />
                    Chi tiết
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Cart Button */}
      <div className="fixed bottom-4 right-4">
        <Link href="/customer/cart">
          <Button 
            variant="primary" 
            size="lg" 
            className="rounded-full shadow-lg flex items-center space-x-2"
          >
            <span>Giỏ hàng</span>
            <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              0
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { Clock, CheckCircle, ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Giả lập dữ liệu đơn hàng
const pendingOrders = [
  {
    id: 1,
    orderNumber: "ORD-001",
    tableNumber: "T01",
    status: "pending",
    time: "10 phút trước",
    items: [
      { id: 1, name: "Súp bí đỏ", quantity: 2, notes: "Ít muối" },
      { id: 2, name: "Bò hầm rượu vang", quantity: 1, notes: "" },
    ],
    specialInstructions: "Phục vụ nhanh, khách đang đói",
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    tableNumber: "T05",
    status: "in_progress",
    time: "15 phút trước",
    items: [
      { id: 3, name: "Gỏi cuốn tôm thịt", quantity: 1, notes: "" },
      { id: 4, name: "Cá hồi nướng", quantity: 2, notes: "Chín vừa" },
      { id: 5, name: "Bánh flan", quantity: 2, notes: "" },
    ],
    specialInstructions: "",
  },
  {
    id: 3,
    orderNumber: "ORD-003",
    tableNumber: "T08",
    status: "pending",
    time: "5 phút trước",
    items: [
      { id: 6, name: "Mỳ Ý sốt bò bằm", quantity: 1, notes: "Nhiều phô mai" },
      { id: 7, name: "Sinh tố bơ", quantity: 1, notes: "Ít đá" },
    ],
    specialInstructions: "",
  }
];

// Component hiển thị một đơn hàng
interface Order {
  id: number;
  orderNumber: string;
  tableNumber: string;
  status: string;
  time: string;
  items: { id: number; name: string; quantity: number; notes: string }[];
  specialInstructions: string;
}

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Xác định màu sắc dựa vào trạng thái đơn hàng
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "text-orange-500 bg-orange-100";
      case "in_progress":
        return "text-blue-500 bg-blue-100";
      case "ready":
        return "text-green-500 bg-green-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  // Hiển thị trạng thái đơn hàng dưới dạng text
  const getStatusText = (status: "pending" | "in_progress" | "ready" | string): string => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "in_progress":
        return "Đang chế biến";
      case "ready":
        return "Sẵn sàng phục vụ";
      default:
        return "Không xác định";
    }
  };

  const statusClass = getStatusColor(order.status);
  const statusText = getStatusText(order.status);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <span className="font-bold mr-2">{order.orderNumber}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
                {statusText}
              </span>
            </CardTitle>
            <p className="text-sm text-gray-500">Bàn: {order.tableNumber}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{order.time}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-2">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <h4 className="font-semibold">Món ăn ({order.items.length})</h4>
            <Button variant="outline" size="sm" className="p-1">
              <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? "transform rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Chi tiết món ăn */}
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 bg-gray-200 text-gray-800 rounded-full px-2 text-xs">
                      x{item.quantity}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="italic">Ghi chú: {item.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="success" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {order.specialInstructions && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                <AlertTriangle className="text-yellow-500 w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-yellow-700">Hướng dẫn đặc biệt:</p>
                  <p className="text-sm text-yellow-600">{order.specialInstructions}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Các nút hành động */}
        <div className="mt-4 flex justify-between">
          {order.status === "pending" ? (
            <Button variant="primary" className="flex-1 mr-2">
              Bắt đầu chế biến
            </Button>
          ) : order.status === "in_progress" ? (
            <Button variant="success" className="flex-1 mr-2 bg-green-600 hover:bg-green-700">
              Hoàn thành
            </Button>
          ) : (
            <Button variant="success" className="flex-1 mr-2 bg-green-600 hover:bg-green-700" disabled>
              Đã hoàn thành
            </Button>
          )}

          <Button variant="outline" className="flex-1">
            Chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function KitchenDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bếp Dashboard</h1>
        <p className="text-gray-500">Xử lý đơn hàng và cập nhật trạng thái món ăn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-600">Chờ xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">2</div>
            <p className="text-gray-500">đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-600">Đang chế biến</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">1</div>
            <p className="text-gray-500">đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600">Đã hoàn thành hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">15</div>
            <p className="text-gray-500">đơn hàng</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Đơn hàng đang chờ</h2>
        <div>
          <Button variant="outline" size="sm" className="mr-2">
            Mới nhất
          </Button>
          <Button variant="outline" size="sm">
            Tất cả
          </Button>
        </div>
      </div>

      <div>
        {pendingOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
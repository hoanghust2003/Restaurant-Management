"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">
            Chào mừng {user?.fullName} đến với hệ thống quản lý nhà hàng
          </p>
        </div>
        <div>
          <Button variant="outline">Refresh Data</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Doanh thu hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,560,000đ</div>
            <p className="text-xs text-green-600 font-semibold mt-1">
              +15.8% so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Số đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-green-600 font-semibold mt-1">
              +8.2% so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Bàn đang phục vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 / 10</div>
            <p className="text-xs text-gray-600 font-semibold mt-1">
              80% công suất
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Đang xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-yellow-600 font-semibold mt-1">
              Thời gian chờ: ~15 phút
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Mã đơn</th>
                  <th className="py-3 px-4 text-left">Bàn</th>
                  <th className="py-3 px-4 text-left">Thời gian</th>
                  <th className="py-3 px-4 text-left">Tổng tiền</th>
                  <th className="py-3 px-4 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">#ORD-001</td>
                  <td className="py-3 px-4">T01</td>
                  <td className="py-3 px-4">10:25 AM</td>
                  <td className="py-3 px-4">485,000đ</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Hoàn thành
                    </span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">#ORD-002</td>
                  <td className="py-3 px-4">T05</td>
                  <td className="py-3 px-4">11:32 AM</td>
                  <td className="py-3 px-4">750,000đ</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Đang chuẩn bị
                    </span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">#ORD-003</td>
                  <td className="py-3 px-4">T08</td>
                  <td className="py-3 px-4">12:15 PM</td>
                  <td className="py-3 px-4">325,000đ</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      Chờ xác nhận
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
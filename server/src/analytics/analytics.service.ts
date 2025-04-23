import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { MenuItem } from '../menu-item/entities/menu-item.entity';
import { User } from '../user/entities/user.entity';
import { TransactionType } from '../inventory/entities/transaction-type.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction)
    private inventoryTransactionRepository: Repository<InventoryTransaction>
  ) {}

  // Lấy số liệu tổng quan cho dashboard
  async getDashboardSummary() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Doanh thu hôm nay
    const dailyRevenue = await this.calculateRevenue(startOfDay, endOfDay);
    
    // Doanh thu tháng này
    const monthlyRevenue = await this.calculateRevenue(startOfMonth, endOfMonth);
    
    // Số đơn hàng hôm nay
    const dailyOrderCount = await this.orderRepository.count({
      where: {
        createdAt: Between(startOfDay, endOfDay)
      }
    });
    
    // Số đơn hàng trong tháng
    const monthlyOrderCount = await this.orderRepository.count({
      where: {
        createdAt: Between(startOfMonth, endOfMonth)
      }
    });
    
    // Các mặt hàng bán chạy nhất
    const topSellingItems = await this.getTopSellingItems();
    
    // Cảnh báo tồn kho
    const inventoryAlerts = await this.getInventoryAlerts();
    
    return {
      dailyRevenue,
      monthlyRevenue,
      dailyOrderCount,
      monthlyOrderCount,
      topSellingItems,
      inventoryAlerts
    };
  }

  // Phân tích doanh thu
  async getRevenueAnalytics(startDate: Date, endDate: Date, groupBy: 'daily' | 'monthly' = 'daily') {
    if (groupBy === 'daily') {
      return this.getDailyRevenue(startDate, endDate);
    } else {
      return this.getMonthlyRevenue(startDate, endDate);
    }
  }

  private async getDailyRevenue(startDate: Date, endDate: Date) {
    // Truy vấn doanh thu từng ngày trong khoảng thời gian
    const dailyRevenueData = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();
    
    return dailyRevenueData.map(item => ({
      date: item.date,
      revenue: Number(item.revenue)
    }));
  }

  private async getMonthlyRevenue(startDate: Date, endDate: Date) {
    // Truy vấn doanh thu từng tháng trong khoảng thời gian
    const monthlyRevenueData = await this.orderRepository
      .createQueryBuilder('order')
      .select('EXTRACT(YEAR FROM order.createdAt)', 'year')
      .addSelect('EXTRACT(MONTH FROM order.createdAt)', 'month')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy('EXTRACT(YEAR FROM order.createdAt)')
      .addGroupBy('EXTRACT(MONTH FROM order.createdAt)')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany();
    
    return monthlyRevenueData.map(item => ({
      year: Number(item.year),
      month: Number(item.month),
      revenue: Number(item.revenue)
    }));
  }

  // Phân tích mặt hàng bán chạy
  async getTopSellingItems(limit: number = 5, period: 'week' | 'month' | 'year' = 'month') {
    const today = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    const topSellingItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .select('orderItem.menuItemId', 'menuItemId')
      .addSelect('menuItem.name', 'name')
      .addSelect('menuItem.price', 'price')
      .addSelect('SUM(orderItem.quantity)', 'totalQuantity')
      .addSelect('SUM(orderItem.price * orderItem.quantity)', 'totalRevenue')
      .innerJoin('orderItem.order', 'order')
      .innerJoin('orderItem.menuItem', 'menuItem')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy('orderItem.menuItemId')
      .addGroupBy('menuItem.name')
      .addGroupBy('menuItem.price')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return topSellingItems.map(item => ({
      menuItemId: Number(item.menuItemId),
      name: item.name,
      price: Number(item.price),
      totalQuantity: Number(item.totalQuantity),
      totalRevenue: Number(item.totalRevenue)
    }));
  }

  // Phân tích chi phí nguyên liệu
  async getIngredientCostAnalysis(startDate: Date, endDate: Date) {
    // Lấy dữ liệu chi phí nguyên liệu từ giao dịch nhập kho
    const purchaseTransactions = await this.inventoryTransactionRepository
      .createQueryBuilder('transaction')
      .select('item.category', 'category')
      .addSelect('SUM(transaction.quantity * transaction.unitPrice)', 'totalCost')
      .innerJoin('transaction.item', 'item')
      .where('transaction.type = :type', { type: TransactionType.PURCHASE })
      .andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('item.category')
      .orderBy('totalCost', 'DESC')
      .getRawMany();
    
    return purchaseTransactions.map(item => ({
      category: item.category,
      totalCost: Number(item.totalCost)
    }));
  }

  // Phân tích mức độ sử dụng bàn
  async getTableUsageAnalytics(startDate: Date, endDate: Date) {
    const tableUsage = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.tableId', 'tableId')
      .addSelect('table.tableNumber', 'tableNumber')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.totalAmount)', 'totalRevenue')
      .innerJoin('order.table', 'table')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('order.tableId')
      .addGroupBy('table.tableNumber')
      .orderBy('orderCount', 'DESC')
      .getRawMany();
    
    return tableUsage.map(item => ({
      tableId: Number(item.tableId),
      tableNumber: item.tableNumber,
      orderCount: Number(item.orderCount),
      totalRevenue: Number(item.totalRevenue)
    }));
  }

  // Cảnh báo tồn kho
  async getInventoryAlerts() {
    // Mặt hàng sắp hết hoặc dưới mức tối thiểu
    const lowStockItems = await this.inventoryItemRepository
      .createQueryBuilder('item')
      .select('item.id', 'id')
      .addSelect('item.name', 'name')
      .addSelect('item.quantity', 'quantity')
      .addSelect('item.minQuantity', 'minQuantity')
      .addSelect('item.unit', 'unit')
      .where('item.quantity <= item.minQuantity')
      .andWhere('item.isActive = :isActive', { isActive: true })
      .getRawMany();
    
    // Mặt hàng sắp hết hạn (trong 7 ngày tới)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    const expiringItems = await this.inventoryItemRepository
      .createQueryBuilder('item')
      .select('item.id', 'id')
      .addSelect('item.name', 'name')
      .addSelect('item.quantity', 'quantity')
      .addSelect('item.expiryDate', 'expiryDate')
      .addSelect('item.unit', 'unit')
      .where('item.expiryDate IS NOT NULL')
      .andWhere('item.expiryDate <= :expiryDate', { expiryDate })
      .andWhere('item.isActive = :isActive', { isActive: true })
      .getRawMany();
    
    return {
      lowStockItems,
      expiringItems
    };
  }

  // Tính doanh thu trong một khoảng thời gian
  private async calculateRevenue(startDate: Date, endDate: Date) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.status = :status', { status: 'completed' })
      .getRawOne();
    
    return Number(result.total) || 0;
  }
}

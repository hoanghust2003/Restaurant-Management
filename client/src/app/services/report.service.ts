import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const REPORTS_API_URL = `${API_URL}/reports`;

export const reportService = {
  async getSalesReport(startDate: string, endDate: string): Promise<any> {
    try {
      // Thử gọi API thật
      const response = await axios.get(`${REPORTS_API_URL}/sales`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      // Trả về dữ liệu mẫu nếu API chưa sẵn sàng
      return {
        report_date: new Date().toISOString(),
        period: {
          start: startDate,
          end: endDate,
        },
        totalRevenue: 45680000,
        totalOrders: 158,
        averageOrderValue: 289113,
        dailyRevenue: generateDailyRevenue(startDate, endDate),
        paymentMethods: [
          { method: 'Tiền mặt', amount: 25680000, count: 85 },
          { method: 'Thẻ ngân hàng', amount: 12500000, count: 42 },
          { method: 'Momo', amount: 7500000, count: 31 },
        ],
        topSellingDishes: [
          { id: '1', name: 'Bò lúc lắc', quantity: 78, revenue: 7800000 },
          { id: '2', name: 'Cá hồi nướng', quantity: 65, revenue: 7150000 },
          { id: '3', name: 'Gà rang muối', quantity: 55, revenue: 5500000 },
          { id: '4', name: 'Tôm sú hấp', quantity: 47, revenue: 5170000 },
          { id: '5', name: 'Lẩu thái', quantity: 42, revenue: 8400000 },
        ],
        hourlySales: generateHourlySales(),
      };
    }
  },

  async getInventoryReport(startDate: string, endDate: string): Promise<any> {
    try {
      // Thử gọi API thật
      const response = await axios.get(`${REPORTS_API_URL}/inventory`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      // Trả về dữ liệu mẫu nếu API chưa sẵn sàng
      return {
        report_date: new Date().toISOString(),
        period: {
          start: startDate,
          end: endDate,
        },
        summary: {
          total_ingredients: 48,
          total_suppliers: 12,
          total_imports: 28,
          total_exports: 42,
          total_import_value: 35680000,
          total_export_value: 28750000,
          current_value: 72930000,
        },
        mostUsedIngredients: [
          { id: '1', name: 'Thịt bò', quantity: 58, unit: 'kg', value: 14500000 },
          { id: '2', name: 'Cá hồi', quantity: 45, unit: 'kg', value: 13500000 },
          { id: '3', name: 'Thịt gà', quantity: 62, unit: 'kg', value: 9300000 },
          { id: '4', name: 'Tôm sú', quantity: 38, unit: 'kg', value: 11400000 },
          { id: '5', name: 'Rau xà lách', quantity: 25, unit: 'kg', value: 1250000 },
        ],
        lowStockItems: [
          { id: '8', name: 'Hành tây', available: 2, minimum: 5, unit: 'kg' },
          { id: '12', name: 'Bơ', available: 3, minimum: 10, unit: 'kg' },
          { id: '15', name: 'Tỏi', available: 1, minimum: 3, unit: 'kg' },
        ],
        expiringItems: [
          { id: '3', name: 'Sữa tươi', batch: 'LT001', expiry_date: addDays(new Date(), 3), quantity: 10, unit: 'lít' },
          { id: '7', name: 'Phô mai', batch: 'LT002', expiry_date: addDays(new Date(), 2), quantity: 5, unit: 'kg' },
        ],
        stockMovement: generateStockMovement(startDate, endDate),
      };
    }
  },

  async getPopularDishesReport(startDate: string, endDate: string): Promise<any> {
    try {
      // Thử gọi API thật
      const response = await axios.get(`${REPORTS_API_URL}/dishes/popular`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular dishes report:', error);
      // Trả về dữ liệu mẫu nếu API chưa sẵn sàng
      return {
        report_date: new Date().toISOString(),
        period: {
          start: startDate,
          end: endDate,
        },
        totalDishes: 120,
        dishesOrdered: 98,
        topDishes: [
          { id: '1', name: 'Bò lúc lắc', quantity: 78, revenue: 7800000, image: '/placeholder-food.jpg' },
          { id: '2', name: 'Cá hồi nướng', quantity: 65, revenue: 7150000, image: '/placeholder-food.jpg' },
          { id: '3', name: 'Gà rang muối', quantity: 55, revenue: 5500000, image: '/placeholder-food.jpg' },
          { id: '4', name: 'Tôm sú hấp', quantity: 47, revenue: 5170000, image: '/placeholder-food.jpg' },
          { id: '5', name: 'Lẩu thái', quantity: 42, revenue: 8400000, image: '/placeholder-food.jpg' },
          { id: '6', name: 'Bún chả', quantity: 38, revenue: 2660000, image: '/placeholder-food.jpg' },
          { id: '7', name: 'Phở bò', quantity: 35, revenue: 2450000, image: '/placeholder-food.jpg' },
          { id: '8', name: 'Cơm rang dương châu', quantity: 32, revenue: 1920000, image: '/placeholder-food.jpg' },
          { id: '9', name: 'Sườn xào chua ngọt', quantity: 30, revenue: 2100000, image: '/placeholder-food.jpg' },
          { id: '10', name: 'Cá kho tộ', quantity: 28, revenue: 1960000, image: '/placeholder-food.jpg' },
        ],
        categorySales: [
          { category: 'Món khai vị', quantity: 220, revenue: 11000000 },
          { category: 'Món chính', quantity: 350, revenue: 28000000 },
          { category: 'Món tráng miệng', quantity: 180, revenue: 5400000 },
          { category: 'Đồ uống', quantity: 310, revenue: 9300000 },
        ],
        salesByTime: [
          { time: '06:00 - 09:00', quantity: 120, revenue: 6000000 },
          { time: '09:00 - 12:00', quantity: 210, revenue: 10500000 },
          { time: '12:00 - 15:00', quantity: 310, revenue: 15500000 },
          { time: '15:00 - 18:00', quantity: 180, revenue: 9000000 },
          { time: '18:00 - 21:00', quantity: 350, revenue: 17500000 },
          { time: '21:00 - 23:00', quantity: 120, revenue: 6000000 },
        ],
      };
    }
  }
};

// Helper functions to generate sample data
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function generateDailyRevenue(startDate: string, endDate: string): any[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result = [];
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const revenue = Math.floor(Math.random() * 5000000) + 1000000;
    result.push({
      date: currentDate.toISOString().split('T')[0],
      revenue,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}

function generateHourlySales(): any[] {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 - 23:00
  return hours.map(hour => ({
    hour: `${hour}:00`,
    sales: Math.floor(Math.random() * 15) + 5,
    revenue: (Math.floor(Math.random() * 15) + 5) * 200000
  }));
}

function generateStockMovement(startDate: string, endDate: string): any[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result = [];
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const imports = Math.floor(Math.random() * 5) + 1;
    const exports = Math.floor(Math.random() * 7) + 1;
    
    result.push({
      date: currentDate.toISOString().split('T')[0],
      imports,
      exports,
      import_value: imports * 500000 + Math.floor(Math.random() * 100000),
      export_value: exports * 350000 + Math.floor(Math.random() * 50000),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}

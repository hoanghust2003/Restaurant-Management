export enum TransactionType {
  PURCHASE = 'purchase',        // Nhập kho (mua hàng)
  CONSUMPTION = 'consumption',  // Tiêu thụ (xuất kho để sử dụng)
  ADJUSTMENT = 'adjustment',    // Điều chỉnh (kiểm kê)
  RETURN = 'return',            // Trả lại nhà cung cấp
  WASTE = 'waste',              // Hủy bỏ (hết hạn, hỏng)
  TRANSFER = 'transfer',        // Chuyển kho
}
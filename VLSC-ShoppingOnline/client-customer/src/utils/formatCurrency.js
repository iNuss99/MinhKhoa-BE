/**
 * Tiện ích định dạng tiền tệ thống nhất toàn hệ thống VLSC Shopping Online
 */
export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₫';
  }
  const numericVal = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numericVal.toLocaleString('vi-VN') + ' ₫';
}

export function formatPriceDiscount(originalPrice, discountPercent = 15) {
  if (!originalPrice || isNaN(originalPrice)) return '0 ₫';
  const oldPrice = originalPrice * (1 + discountPercent / 100);
  return formatVND(Math.round(oldPrice));
}

export default formatVND;

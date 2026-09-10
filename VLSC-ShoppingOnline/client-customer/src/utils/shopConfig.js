/**
 * Cấu hình thông tin doanh nghiệp, liên hệ và pháp lý đồng bộ toàn hệ thống
 */
export const SHOP_CONFIG = {
  brandName: 'VLSC Shop',
  companyName: 'Công ty Cổ phần Công nghệ & Thương mại Điện tử VLSC',
  hotline: '1900 8888',
  hotlineFormatted: '1900 8888',
  phone: '(028) 3888 9999',
  email: 'support@vlsc-shop.vn',
  address: 'Tầng 5, Tòa nhà VLSC, Số 123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
  workingHours: '08:00 - 21:30 (Thứ 2 - Chủ Nhật)',
  taxCode: '0318999888',
  registrationNo: '0318999888',
  registrationDate: '15/03/2020 (Thay đổi lần 3: 10/01/2024)',
  legalRepresentative: 'Nguyễn Minh Khoa',
  licenseAuthority: 'Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh',
  socials: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    tiktok: 'https://tiktok.com'
  },
  coupons: [
    { code: 'VLSCNEW', discount: 'Giảm 100.000 ₫', desc: 'Dành riêng cho đơn hàng đầu tiên từ 1.000.000 ₫' },
    { code: 'FREESHIP', discount: 'Miễn phí vận chuyển', desc: 'Áp dụng cho mọi đơn hàng từ 500.000 ₫' }
  ]
};

export default SHOP_CONFIG;

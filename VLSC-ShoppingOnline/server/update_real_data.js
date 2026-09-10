const mongoose = require('mongoose');
require('./utils/MongooseUtil');
const Models = require('./models/Models');

// Real Multi-angle Product Catalog for Vietnam Market
const realProductsData = [
  {
    name: 'iPhone 11',
    categoryName: 'iPhone',
    brand: 'Apple',
    storage: '64GB',
    price: 8990000,
    rating: 4.8,
    ratingCount: 142,
    soldCount: 856,
    warranty: 'Bảo hành 12 tháng chính hãng tại tất cả TTBH Apple Việt Nam. 1 đổi 1 trong 30 ngày.',
    specs: {
      'Màn hình': '6.1 inch, Liquid Retina HD (828 x 1792 Pixels)',
      'Camera sau': '2 camera 12 MP (Góc rộng & Góc siêu rộng 120°)',
      'Camera trước': '12 MP, hỗ trợ quay 4K 60fps',
      'Chipset': 'Apple A13 Bionic 6 nhân mạnh mẽ',
      'RAM': '4 GB',
      'Bộ nhớ trong': '64 GB',
      'Pin & Sạc': '3110 mAh, Sạc nhanh 18W, Sạc không dây Qi',
      'Kháng nước': 'IP68 (độ sâu tối đa 2 mét trong 30 phút)'
    },
    faq: [
      { q: 'Máy có bao gồm củ sạc và tai nghe trong hộp không?', a: 'Từ các lô sản xuất mới theo tiêu chuẩn Apple, hộp máy bao gồm thân máy, cáp USB-C to Lightning và sách hướng dẫn.' },
      { q: 'Chính sách bảo hành tại VLSC Shop như thế nào?', a: 'Sản phẩm được bảo hành 12 tháng tại các Trung tâm ủy quyền Apple (AASP) trên toàn quốc và hỗ trợ 1 đổi 1 trong 30 ngày đầu nếu lỗi phần cứng.' },
      { q: 'Cửa hàng có hỗ trợ giao hàng hỏa tốc không?', a: 'VLSC hỗ trợ giao hỏa tốc 2H tại nội thành TP.HCM và Hà Nội, miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ.' }
    ],
    reviews: [
      { user: 'Trần Văn Hoàng', rating: 5, comment: 'Máy nguyên seal, bảo hành chuẩn Apple Care. Mua đợt flash sale giá cực tốt, giao hàng trong 2 tiếng.', date: '04/08/2026', verified: true },
      { user: 'Lê Thu Thảo', rating: 5, comment: 'Màu sắc rất đẹp, chụp hình góc rộng siêu nét. Nhân viên tư vấn nhiệt tình, đóng gói 3 lớp bóng khí rất kỹ.', date: '28/07/2026', verified: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'iPhone 11 Pro',
    categoryName: 'iPhone',
    brand: 'Apple',
    storage: '256GB',
    price: 10990000,
    rating: 4.9,
    ratingCount: 98,
    soldCount: 420,
    warranty: 'Bảo hành 12 tháng chính hãng. 1 đổi 1 trong 30 ngày nếu phát sinh lỗi kỹ thuật.',
    specs: {
      'Màn hình': '5.8 inch, Super Retina XDR OLED sắc nét đỉnh cao',
      'Camera sau': 'Bộ 3 camera 12 MP (Góc rộng, Siêu rộng, Tele 2x)',
      'Camera trước': '12 MP TrueDepth',
      'Chipset': 'Apple A13 Bionic 64-bit',
      'RAM': '4 GB',
      'Bộ nhớ trong': '256 GB',
      'Pin': '3046 mAh, hỗ trợ sạc nhanh 18W',
      'Chất liệu': 'Khung thép không gỉ sáng bóng, mặt lưng kính nhám sang trọng'
    },
    faq: [
      { q: 'Máy có bị trầy xước viền thép không?', a: 'Viền thép phẫu thuật cao cấp bền bỉ, được phủ lớp PVD chống trầy xước tối ưu.' },
      { q: 'Có được kiểm tra hàng trước khi nhận không?', a: 'Quý khách được đồng kiểm ngoại quan, kiểm tra seal và phụ kiện trước khi thanh toán.' }
    ],
    reviews: [
      { user: 'Nguyễn Tiến Dũng', rating: 5, comment: 'Cầm rất đầm tay, cụm 3 camera chụp đêm cực đỉnh. Giao hàng nhanh và hỗ trợ chuyển dữ liệu tận tình.', date: '01/08/2026', verified: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'iPhone 11 Pro Max',
    categoryName: 'iPhone',
    brand: 'Apple',
    storage: '256GB',
    price: 12490000,
    rating: 4.9,
    ratingCount: 215,
    soldCount: 940,
    warranty: 'Bảo hành 12 tháng chính hãng, bảo hiểm rơi vỡ 6 tháng miễn phí.',
    specs: {
      'Màn hình': '6.5 inch, Super Retina XDR OLED (1242 x 2688 Pixels)',
      'Camera sau': '3 Camera 12 MP (Ultra Wide, Wide, Telephoto)',
      'Camera trước': '12 MP, Smart HDR thế hệ mới',
      'Chipset': 'Apple A13 Bionic',
      'RAM': '4 GB',
      'Bộ nhớ trong': '256 GB',
      'Pin': '3969 mAh, thời lượng pin sử dụng trên 1.5 ngày',
      'Trọng lượng': '226 g'
    },
    faq: [
      { q: 'Pin iPhone 11 Pro Max dùng được bao lâu?', a: 'Dung lượng pin 3969 mAh cho phép xem video liên tục lên đến 20 giờ và sử dụng hỗn hợp hơn 1.5 ngày.' }
    ],
    reviews: [
      { user: 'Phạm Minh Quân', rating: 5, comment: 'Pin trâu nhất phân khúc, màn hình to xem phim cực đã. Dịch vụ chăm sóc khách hàng của VLSC rất chu đáo.', date: '05/08/2026', verified: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'iPhone X',
    categoryName: 'iPhone',
    brand: 'Apple',
    storage: '64GB',
    price: 5490000,
    rating: 4.7,
    ratingCount: 88,
    soldCount: 650,
    warranty: 'Bảo hành 6 tháng toàn diện, 1 đổi 1 trong 15 ngày.',
    specs: {
      'Màn hình': '5.8 inch, Super Retina OLED',
      'Camera sau': 'Kép 12 MP, chống rung OIS kép',
      'Camera trước': '7 MP TrueDepth với Face ID',
      'Chipset': 'Apple A11 Bionic',
      'RAM': '3 GB',
      'Bộ nhớ trong': '64 GB'
    },
    faq: [{ q: 'Máy có Face ID không?', a: 'Có, Face ID nhận diện khuôn mặt 3D bảo mật cao.' }],
    reviews: [{ user: 'Hà Linh', rating: 5, comment: 'Giá hạt dẻ mà dùng rất mượt, thiết kế tai thỏ huyền thoại vẫn đẹp.', date: '15/07/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'iPhone XR',
    categoryName: 'iPhone',
    brand: 'Apple',
    storage: '128GB',
    price: 6990000,
    rating: 4.8,
    ratingCount: 130,
    soldCount: 780,
    warranty: 'Bảo hành 12 tháng, pin bảo hành trọn đời.',
    specs: {
      'Màn hình': '6.1 inch, Liquid Retina HD',
      'Camera sau': '12 MP Single Lens với xóa phông chân dung thông minh',
      'Camera trước': '7 MP',
      'Chipset': 'Apple A12 Bionic',
      'RAM': '3 GB',
      'Bộ nhớ trong': '128 GB'
    },
    faq: [{ q: 'Có nhiều màu để chọn không?', a: 'Có đủ 6 màu cá tính: Đen, Trắng, Đỏ, Vàng, Xanh dương, San hô.' }],
    reviews: [{ user: 'Đỗ Tuấn Anh', rating: 5, comment: 'Pin trâu bò, loa ngoài to rõ ấm áp. Shop tặng kèm cường lực và ốp lưng xịn.', date: '20/07/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'iPhone XS',
    categoryName: 'iPhone',
    brand: 'Apple',
    storage: '64GB',
    price: 6490000,
    rating: 4.7,
    ratingCount: 75,
    soldCount: 510,
    warranty: 'Bảo hành 12 tháng phần cứng, phần mềm hỗ trợ trọn đời.',
    specs: {
      'Màn hình': '5.8 inch, Super Retina OLED sắc nét',
      'Camera sau': 'Kép 12 MP (Góc rộng & Tele 2x)',
      'Camera trước': '7 MP',
      'Chipset': 'Apple A12 Bionic 7nm',
      'RAM': '4 GB',
      'Bộ nhớ trong': '64 GB'
    },
    faq: [{ q: 'Máy có hỗ trợ 2 SIM không?', a: 'Máy hỗ trợ 1 Nano SIM vật lý và 1 eSIM tiện lợi.' }],
    reviews: [{ user: 'Vũ Đức', rating: 5, comment: 'Kích thước nhỏ gọn cầm vừa tay, màn hình OLED xem phim màu đen sâu thẳm.', date: '12/07/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'iPad Air',
    categoryName: 'iPad',
    brand: 'Apple',
    storage: '128GB',
    price: 14490000,
    rating: 4.9,
    ratingCount: 168,
    soldCount: 620,
    warranty: 'Bảo hành 12 tháng chính hãng Apple toàn quốc. 1 đổi 1 trong 30 ngày.',
    specs: {
      'Màn hình': '10.9 inch, Liquid Retina với True Tone, dải màu P3',
      'Chip xử lý': 'Apple M2 8 nhân CPU, 10 nhân GPU',
      'Camera sau': '12 MP Wide, quay video 4K',
      'Camera trước': '12 MP Ultra Wide ngang với Center Stage',
      'RAM': '8 GB',
      'Bộ nhớ trong': '128 GB',
      'Kết nối': 'Wi-Fi 6E, Bluetooth 5.3, Cổng USB-C tốc độ cao'
    },
    faq: [{ q: 'Có tương thích Apple Pencil Pro không?', a: 'iPad Air thế hệ mới tương thích hoàn hảo với Apple Pencil Pro và Magic Keyboard.' }],
    reviews: [{ user: 'Bùi Phương Nam', rating: 5, comment: 'Chip M2 xử lý đồ họa và render video 4K mượt như nhung. Rất đáng đồng tiền bát gạo.', date: '02/08/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'iPad Mini',
    categoryName: 'iPad',
    brand: 'Apple',
    storage: '64GB',
    price: 11990000,
    rating: 4.8,
    ratingCount: 112,
    soldCount: 450,
    warranty: 'Bảo hành chính hãng 12 tháng Apple Care.',
    specs: {
      'Màn hình': '8.3 inch, Liquid Retina nhỏ gọn bỏ vừa túi áo khoác',
      'Chip xử lý': 'Apple A15 Bionic với Neural Engine 16 lõi',
      'Camera': '12 MP trước và sau',
      'Bộ nhớ trong': '64 GB',
      'Trọng lượng': '293 g'
    },
    faq: [{ q: 'Có tiện mang đi học, đi làm không?', a: 'iPad Mini cực kỳ nhẹ nhàng (dưới 300g), phù hợp ghi chú, đọc sách và di chuyển liên tục.' }],
    reviews: [{ user: 'Mai Hồng Anh', rating: 5, comment: 'Nhỏ gọn bỏ túi siêu tiện lợi, chơi game và đọc sách bao sướng.', date: '18/07/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'iPad Pro',
    categoryName: 'iPad',
    brand: 'Apple',
    storage: '256GB',
    price: 21990000,
    rating: 5.0,
    ratingCount: 194,
    soldCount: 710,
    warranty: 'Bảo hành chính hãng 12 tháng Apple. Gói hỗ trợ kỹ thuật VIP 24/7.',
    specs: {
      'Màn hình': '11 inch, Ultra Retina XDR Tandem OLED đột phá',
      'Chip xử lý': 'Apple M4 thế hệ mới nhất',
      'RAM': '8 GB',
      'Bộ nhớ': '256 GB',
      'Âm thanh': 'Hệ thống 4 loa stereo chuẩn phòng thu'
    },
    faq: [{ q: 'Màn hình OLED có bị chói ngoài trời không?', a: 'Độ sáng đỉnh lên tới 1600 nits giúp hiển thị ngoài trời nắng chói cực kỳ sắc nét.' }],
    reviews: [{ user: 'Đặng Quốc Huy', rating: 5, comment: 'Màn hình Tandem OLED đẹp nghẹt thở, chip M4 siêu khỏe làm việc đồ họa thay laptop ngon lành.', date: '06/08/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'MacBook Air',
    categoryName: 'MacBook',
    brand: 'Apple',
    storage: '256GB',
    price: 24490000,
    rating: 4.9,
    ratingCount: 230,
    soldCount: 890,
    warranty: 'Bảo hành chính hãng Apple 12 tháng, tặng túi chống sốc cao cấp.',
    specs: {
      'Màn hình': '13.6 inch Liquid Retina, độ sáng 500 nits',
      'Chip xử lý': 'Apple M3 8 nhân CPU, 8 nhân GPU',
      'RAM': '16 GB Unified Memory',
      'Ổ cứng': '256 GB SSD siêu tốc',
      'Pin': 'Thời lượng pin lên tới 18 giờ liên tục',
      'Trọng lượng': '1.24 kg'
    },
    faq: [{ q: 'Máy có quạt tản nhiệt không?', a: 'Thiết kế Fanless không quạt hoàn toàn yên tĩnh khi làm việc, máy luôn mát mẻ với chip M3.' }],
    reviews: [{ user: 'Hoàng Yến', rating: 5, comment: 'Máy mỏng nhẹ, pin trâu làm việc cả ngày không cần mang sạc. Giao hàng nhanh!', date: '03/08/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'MacBook Pro',
    categoryName: 'MacBook',
    brand: 'Apple',
    storage: '512GB',
    price: 32990000,
    rating: 5.0,
    ratingCount: 185,
    soldCount: 640,
    warranty: 'Bảo hành chính hãng 12 tháng. Miễn phí cài đặt phần mềm bản quyền trọn đời.',
    specs: {
      'Màn hình': '14.2 inch Liquid Retina XDR, ProMotion 120Hz',
      'Chip xử lý': 'Apple M3 Pro 11-core CPU, 14-core GPU',
      'RAM': '18 GB Unified Memory',
      'Ổ cứng': '512 GB SSD NVMe',
      'Cổng kết nối': 'HDMI, khe thẻ SDXC, 3 cổng Thunderbolt 4, MagSafe 3',
      'Pin': 'Lên tới 22 giờ'
    },
    faq: [{ q: 'Có xuất được nhiều màn hình rời không?', a: 'Hỗ trợ xuất tối đa 2 màn hình 6K ngoài cùng lúc với hiệu suất không đổi.' }],
    reviews: [{ user: 'Trần Khắc Việt', rating: 5, comment: 'Màn hình 120Hz mượt mà, build nhôm nguyên khối Space Black không bám vân tay.', date: '07/08/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'MacBook 12',
    categoryName: 'MacBook',
    brand: 'Apple',
    storage: '256GB',
    price: 15990000,
    rating: 4.7,
    ratingCount: 64,
    soldCount: 380,
    warranty: 'Bảo hành 12 tháng phần cứng, đổi mới trong 30 ngày.',
    specs: {
      'Màn hình': '12 inch Retina (2304 x 1440 Pixels)',
      'Bộ vi xử lý': 'Intel Core i5 Turbo Boost 3.2GHz',
      'RAM': '8 GB LPDDR3',
      'Ổ cứng': '256 GB SSD',
      'Trọng lượng': '0.92 kg siêu mỏng nhẹ'
    },
    faq: [{ q: 'Máy nặng bao nhiêu kg?', a: 'Chỉ 0.92kg, là mẫu laptop mỏng nhẹ nhất từng được Apple chế tác.' }],
    reviews: [{ user: 'Ngô Thanh Hương', rating: 5, comment: 'Rất nhỏ nhẹ, tiện cho con gái mang đi công tác và thuyết trình.', date: '19/07/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'AirPods Pro Gen 2',
    categoryName: 'AirPods',
    brand: 'Apple',
    storage: 'MagSafe USB-C',
    price: 4990000,
    rating: 4.9,
    ratingCount: 310,
    soldCount: 1520,
    warranty: 'Bảo hành 12 tháng chính hãng 1 đổi 1 Apple Care toàn quốc.',
    specs: {
      'Chip âm thanh': 'Apple H2 chip + Chip U1 trong hộp sạc',
      'Tính năng': 'Chống ồn chủ động ANC gấp 2 lần, Xuyên âm thích ứng, Âm thanh không gian cá nhân hóa',
      'Pin': '6 giờ nghe liên tục (30 giờ kèm hộp sạc)',
      'Kháng nước & bụi': 'IP54 cho cả tai nghe và hộp sạc'
    },
    faq: [{ q: 'Hộp sạc có loa tìm kiếm Find My không?', a: 'Có, hộp sạc tích hợp loa phát âm thanh định vị chính xác khi thất lạc.' }],
    reviews: [{ user: 'Cao Minh Trí', rating: 5, comment: 'Chống ồn đỉnh chóp, đi máy bay hay quán cafe ồn ào đeo vào là tĩnh lặng liền.', date: '08/08/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'Laptop Dell XPS 13 Plus',
    categoryName: 'Laptop',
    brand: 'Dell',
    storage: '512GB',
    price: 28500000,
    rating: 4.9,
    ratingCount: 110,
    soldCount: 420,
    warranty: 'Bảo hành 24 tháng tận nơi (Dell ProSupport Onsite).',
    specs: {
      'Màn hình': '13.4 inch 3.5K OLED Touch, 100% DCI-P3',
      'CPU': 'Intel Core i7-1360P 12 nhân 16 luồng',
      'RAM': '16 GB LPDDR5 6000MHz',
      'Ổ cứng': '512 GB PCIe 4.0 NVMe M.2 SSD',
      'Trọng lượng': '1.26 kg',
      'Chất liệu': 'Nhôm CNC nguyên khối cắt kim cương'
    },
    faq: [{ q: 'Bàn di chuột tàng hình có dễ bấm không?', a: 'Touchpad kính liền mạch phản hồi xúc giác Haptic siêu nhạy và cực kỳ sang trọng.' }],
    reviews: [{ user: 'Lâm Gia Bảo', rating: 5, comment: 'Thiết kế đẹp nhất trong thế giới laptop Windows, màn hình OLED rực rỡ.', date: '01/08/2026', verified: true }],
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

async function updateRealData() {
  await new Promise(r => setTimeout(r, 2500));
  console.log('[Update Real Data] Connected to MongoDB Atlas...');

  // 1. Chuẩn hóa Categories
  const categoryNames = ['iPhone', 'MacBook', 'iPad', 'AirPods', 'Laptop'];
  const categoryMap = {};

  for (const name of categoryNames) {
    let cate = await Models.Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
    if (!cate) {
      cate = await Models.Category.create({
        _id: new mongoose.Types.ObjectId(),
        name: name
      });
      console.log(`[Category Created] ${name}`);
    } else {
      cate.name = name; // chuẩn hóa capitalization
      await cate.save();
      console.log(`[Category Normalized] ${name} (ID: ${cate._id})`);
    }
    categoryMap[name] = cate;
  }

  // 2. Cập nhật và thêm mới sản phẩm giá thật + ảnh đa góc
  for (const item of realProductsData) {
    const cate = categoryMap[item.categoryName];
    const categoryDoc = cate ? { _id: cate._id, name: cate.name } : null;

    let existingProd = await Models.Product.findOne({ name: { $regex: new RegExp('^' + item.name + '$', 'i') } });

    const updateDoc = {
      name: item.name,
      price: item.price,
      brand: item.brand,
      storage: item.storage,
      rating: item.rating,
      ratingCount: item.ratingCount,
      soldCount: item.soldCount,
      specs: item.specs,
      warranty: item.warranty,
      faq: item.faq,
      reviews: item.reviews,
      images: item.images,
      image: existingProd && existingProd.image ? existingProd.image : item.images[0],
      category: categoryDoc,
      cdate: existingProd && existingProd.cdate ? existingProd.cdate : Date.now()
    };

    if (existingProd) {
      await Models.Product.findByIdAndUpdate(existingProd._id, updateDoc);
      console.log(`[Product Updated] ${item.name} -> Giá: ${item.price.toLocaleString('vi-VN')} VNĐ`);
    } else {
      updateDoc._id = new mongoose.Types.ObjectId();
      await Models.Product.create(updateDoc);
      console.log(`[Product Created] ${item.name} -> Giá: ${item.price.toLocaleString('vi-VN')} VNĐ`);
    }
  }

  console.log('=== TOÀN BỘ DỮ LIỆU GIÁ THẬT & ẢNH ĐA GÓC ĐÃ ĐƯỢC CẬP NHẬT THÀNH CÔNG! ===');
  process.exit(0);
}

updateRealData().catch(err => {
  console.error('[Update Failed]:', err);
  process.exit(1);
});

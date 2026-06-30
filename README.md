# Cờ Tướng Việt - Trí Tuệ Việt

Web game Cờ Tướng / Cờ Úp online Người vs Người. Stack: React + Vite + TypeScript cho frontend; Node.js + Express + Socket.IO cho backend. Backend phục vụ luôn frontend build để deploy Render dạng Web Service.

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
- Chọn chế độ Cờ Tướng hoặc Cờ Úp khi tạo bàn.
- Cờ Úp có quân úp, lật quân khi di chuyển/ăn quân, sau khi lật quân đi theo chức năng thật.
- Cờ Úp có tuỳ chọn hoán đổi chức năng theo từng bên: Mã ⇄ Sĩ hoặc Pháo ⇄ Tượng; quân bị hoán đổi có hiệu ứng phát sáng.
- Danh sách bàn công khai realtime.
- Người chơi Đỏ/Đen, người quan sát.
- Sẵn sàng để bắt đầu ván.
- Luật đi quân Cờ Tướng cơ bản, chống tự làm Tướng bị chiếu, phát hiện chiếu bí/hết nước.
- Đồng hồ không tính giờ, cố định, increment. Server là nguồn thời gian.
- Xin hoàn cờ cần đối thủ đồng ý.
- Xin hòa cần đối thủ đồng ý.
- Đầu hàng, chơi tiếp khi hai bên đồng ý.
- Bảng tỷ số trong bàn: Đỏ thắng, Đen thắng, Hòa, Tổng ván. Tỷ số không xoá khi hai bên bấm chơi tiếp trong cùng bàn.
- Chat và thả biểu cảm realtime.
- Lịch sử nước đi trong từng ván.
- Lưu 50 ván Cờ Tướng gần nhất và 50 ván Cờ Úp gần nhất trong RAM server để xem lại trong app.
- Đánh dấu sao ván đấu để giữ ưu tiên ngoài giới hạn 50 ván thường.
- Tùy chỉnh màu bàn, màu quân, highlight, style quân.
- Asset PNG người dùng đặt trong `client/public/assets`, thiếu asset vẫn có fallback chữ.

## Giới hạn bản hiện tại

- Phòng, tỷ số và kho ván đã lưu đang lưu RAM; server restart sẽ mất dữ liệu tạm.
- Không có database.
- Không có AI.
- Cờ Úp và luật chiếu dai/bắt đuổi dai xử lý thực dụng, chưa thay thế trọng tài chuyên nghiệp.

## Xuất / nhập ván đã lưu

Bản này có thêm chức năng backup thủ công để tránh mất kho ván khi Render restart/redeploy:

1. Vào sảnh game > mục **Ván đã lưu**.
2. Bấm **Xuất tất cả ván ra JSON** để tải file backup về máy.
3. Nên lưu file này vào Google Drive hoặc thư mục riêng sau mỗi buổi chơi.
4. Khi Render mất RAM hoặc deploy lại bị mất ván, vào lại game > **Ván đã lưu** > bấm **Nhập gộp từ JSON** rồi chọn file đã backup.
5. **Nhập gộp**: thêm/cập nhật ván từ file, không xoá kho hiện tại.
6. **Nhập thay thế**: xoá kho hiện tại trên server rồi nạp lại từ file JSON. Chỉ dùng khi muốn khôi phục đúng theo file backup.

File backup giữ cả Cờ Tướng, Cờ Úp, dấu sao ưu tiên, tên bàn, tên người chơi, kết quả, tỷ số sau ván và toàn bộ lịch sử nước đi.

## Ghi chú deploy Render
- Không commit `package-lock.json` được tạo trong môi trường nội bộ; Render cần tự cài từ npm public.
- Node khuyến nghị: `20.18.1`.
- Build Command: `npm install --include=dev --legacy-peer-deps --no-audit --no-fund && npm run build`.
- Start Command: `npm start`.


## Bản giao diện asset mới
- Giữ nguyên logic game.
- Thay toàn bộ bàn cờ cũ bằng 5 bộ asset PNG mới do người dùng cung cấp.
- Thay quân cờ PNG bằng bộ asset mới do người dùng cung cấp.
- Căn lại tọa độ quân cờ theo trực tiếp giao điểm của bàn cờ mới.
- Ẩn toàn bộ lưới/palace/river CSS cũ để chỉ hiển thị đúng hình asset.


## Bản assets + thời gian nâng cấp
- Giữ nguyên logic game hiện có.
- Thêm 9 bàn cờ mới và 8 bộ quân mới từ file New asset(1).zip.
- Thêm đồng hồ theo thời gian mỗi nước đi.
- Thời gian tích lũy tách riêng bằng checkbox.
- Cờ Úp hiển thị nhãn Mã+Sĩ / Pháo+Tượng / Xe+Sĩ / Xe+Mã ở góc phía bên tương ứng.

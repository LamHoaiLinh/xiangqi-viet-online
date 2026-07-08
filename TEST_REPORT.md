# Kiểm tra bản sửa

- `npm install --include=dev --legacy-peer-deps --no-audit --no-fund`: thành công.
- `npm run build`: thành công cho cả Vite client và TypeScript server.
- `npm start`: server chạy tại cổng 3000.
- Kiểm tra HTTP: trang chính, asset bàn cờ và asset quân Pha lê đều trả về `200 OK`.
- Kiểm tra 137 file PNG trong thư mục asset: không có file hỏng.
- Kiểm tra đủ 14 file quân cho mỗi bộ: mặc định, vàng lớn, đá núi, ngà vân gỗ, pha lê.

Thay đổi giao diện không sửa luật chơi.

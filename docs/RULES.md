# Luật Cờ Tướng đã cài

## Bàn cờ

- Bàn 9 cột x 10 hàng.
- Đen ở trên, Đỏ ở dưới.
- Đỏ đi trước.
- Quân đặt tại giao điểm.

## Luật quân

- Tướng/Soái: đi ngang/dọc 1 điểm trong cung 3x3. Hai Tướng không được đối mặt trực tiếp trên cùng cột khi không có quân chắn.
- Sĩ: đi chéo 1 điểm trong cung.
- Tượng: đi chéo 2 điểm, bị chặn mắt Tượng, không qua sông.
- Xe: đi ngang/dọc không giới hạn nếu không bị chắn.
- Mã: đi chữ nhật, bị chặn chân Mã.
- Pháo: đi như Xe khi không ăn. Khi ăn phải có đúng 1 quân làm ngòi.
- Tốt: trước khi qua sông chỉ đi thẳng. Sau khi qua sông được đi ngang, không đi lùi.

## Chiếu, chiếu bí, hết nước

- Không cho đi nước khiến Tướng của mình bị chiếu.
- Phát hiện bên đang bị chiếu.
- Nếu bị chiếu và không còn nước hợp lệ: thua chiếu bí.
- Nếu không bị chiếu nhưng không còn nước hợp lệ: hòa hết nước.

## Lặp thế, chiếu dai, bắt đuổi dai

Bản đầu xử lý thực dụng:

- Lặp thế nhiều lần có thể xử hòa tự động.
- Chiếu dai/bắt đuổi dai có cảnh báo hoặc xử lý đơn giản trong server.
- Đây không phải bộ luật trọng tài chuyên nghiệp đầy đủ. Khi cần thi đấu nghiêm túc, nên mở rộng `server/repetitionRules.ts`.

## Đồng hồ

- Không tính giờ: không chạy countdown.
- Cố định: mỗi bên có tổng thời gian ban đầu, hết giờ thua.
- Increment: sau mỗi nước hợp lệ, bên vừa đi được cộng số giây cấu hình.
- Server là nguồn sự thật cho thời gian.

Cờ Tướng Việt - Trí Tuệ Việt Asset Pack

Cấu trúc:
- boards/: board_light.png, board_dark.png, river_overlay.png, palace_overlay.png
- pieces/: 14 quân cờ PNG 512x512 nền trong suốt
- effects/: hiệu ứng PNG nền trong suốt
- icons/: SVG icon UI
- sounds/: MP3 placeholder
- manifest.json: kích thước, tọa độ bàn cờ, đường dẫn asset

Gợi ý dùng trong game web:
- Dùng board_light.png hoặc board_dark.png làm nền bàn.
- Map quân lên 9x10 intersections theo manifest.board.grid.intersections.
- Dùng piece_selected_glow.png đặt dưới quân đang chọn.
- Dùng legal_move_marker.png ở các giao điểm hợp lệ.
- Dùng last_move_marker.png cho from/to của nước vừa đi.

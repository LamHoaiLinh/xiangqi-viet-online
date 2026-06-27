# Hướng dẫn asset

Asset chạy ở `client/public/assets`.

## Quân cờ

Đặt file PNG nền trong suốt:

- `pieces/piece_red_general.png`
- `pieces/piece_red_advisor.png`
- `pieces/piece_red_elephant.png`
- `pieces/piece_red_rook.png`
- `pieces/piece_red_horse.png`
- `pieces/piece_red_cannon.png`
- `pieces/piece_red_pawn.png`
- `pieces/piece_black_general.png`
- `pieces/piece_black_advisor.png`
- `pieces/piece_black_elephant.png`
- `pieces/piece_black_rook.png`
- `pieces/piece_black_horse.png`
- `pieces/piece_black_cannon.png`
- `pieces/piece_black_pawn.png`

Kích thước khuyến nghị: 512x512 PNG, nền trong suốt.

## Bàn cờ

- `boards/board_light.png`
- `boards/board_dark.png`
- `boards/river_overlay.png`
- `boards/palace_overlay.png`

Bản hiện tại vẽ grid bằng CSS và dùng ảnh bàn như texture nền. Nếu ảnh thiếu, bàn vẫn hiển thị bằng CSS.

## Âm thanh

- `sounds/move_sound.mp3`
- `sounds/capture_sound.mp3`
- `sounds/check_sound.mp3`
- `sounds/victory_sound.mp3`

Bản UI đã có cấu trúc, có thể bổ sung hook phát âm thanh sau mỗi socket update.

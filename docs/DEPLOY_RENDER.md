# Deploy Render

## Chuẩn bị GitHub

```bash
git init
git add .
git commit -m "init xiangqi viet online"
git branch -M main
git remote add origin <URL_REPO_CUA_BAN>
git push -u origin main
```

## Tạo Web Service trên Render

- New > Web Service.
- Chọn repository GitHub.
- Environment: Node.
- Build Command: `npm install && npm run build`.
- Start Command: `npm start`.
- Plan: Free hoặc Starter.

## Sau khi deploy

- Mở link Render.
- Bấm Tạo bàn mới.
- Copy link/mã bàn gửi bạn bè.
- Nếu Render Free đang sleep, lần mở đầu có thể chờ vài chục giây.

# Le Tuan Hung — Portfolio

Portfolio website dựng theo thiết kế Figma [Portfolio](https://www.figma.com/design/EIaHHdCyLDu9uJnd6k4pZG/Portfolio), kèm trang quản trị để tự cập nhật nội dung không cần sửa code.

**Live site:** https://rei-1407.github.io/Le-Tuan-Hung-Porfolio/

## Cấu trúc

- `src/data/site.json` — **toàn bộ nội dung** (chữ, ảnh, bố cục từng trang). Sửa file này (trực tiếp hoặc qua trang admin) là site đổi theo.
- `src/components/blocks/` — bộ render các loại khối nội dung (lưới ảnh, banner, văn bản song ngữ, video, ...). Mọi số đo dùng đơn vị design-pixel trên khung 1920px của Figma và tự co giãn theo màn hình.
- `src/admin/` — trang quản trị tại `/#/admin`.
- `scripts/manifest.mjs` — danh sách node Figma → file ảnh trong `public/assets`.
- `public/assets` — hiện đang chứa **ảnh tạm chất lượng thấp** (crop từ ảnh chụp frame). Xem mục dưới để thay bằng ảnh gốc.

## Lấy ảnh gốc chất lượng cao từ Figma

Ảnh đang dùng là bản tạm ~28% độ phân giải. Để thay toàn bộ bằng ảnh gốc xuất thẳng từ file Figma:

1. Vào [figma.com](https://www.figma.com) → avatar → **Settings** → **Security** → **Personal access tokens** → *Generate new token* (scope **File content: Read** là đủ).
2. Chạy:

   ```bash
   FIGMA_TOKEN=figd_xxx node scripts/figma-assets.mjs   # macOS/Linux
   # PowerShell:
   $env:FIGMA_TOKEN="figd_xxx"; node scripts/figma-assets.mjs
   ```

3. Commit + push — site tự deploy lại.

## Font chữ

- **Montserrat** — tải tự động từ Google Fonts.
- **Super Caramel** (chữ HOTNDOGS) — font có bản quyền, không nhúng sẵn. Đặt file vào `public/fonts/SuperCaramel.woff2` (hoặc `.otf`) là hoạt động; khi chưa có sẽ fallback về Montserrat.

## Trang quản trị (`/#/admin`)

Đăng nhập bằng GitHub Personal Access Token (fine-grained, repo này, quyền **Contents: Read & write**). Trong admin có thể:

- Sửa mọi chữ / thay mọi ảnh trên các trang.
- Thêm dự án mới, thêm khối nội dung theo **layout preset** lấy từ chính thiết kế Figma.
- Xem trước rồi bấm **Đăng thay đổi** — mỗi lần đăng là một commit, site tự build lại sau ~1–2 phút.

## Video

Khối video (trang 2D Graphic) đang hiển thị ảnh poster tĩnh đúng như thiết kế. Có link YouTube thì vào admin → khối Video → điền YouTube ID; hoặc commit file MP4 vào `public/assets/videos/` rồi điền đường dẫn.

## Dev

```bash
npm install
npm run dev       # http://localhost:5173/Le-Tuan-Hung-Porfolio/
npm run build
```

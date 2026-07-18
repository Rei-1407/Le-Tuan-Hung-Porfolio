# Le Tuan Hung — Portfolio (tài liệu bàn giao)

Website portfolio dựng **bám sát pixel** theo thiết kế Figma, kèm **trang quản trị trực quan** cho chủ web (người không chuyên) tự sửa nội dung, deploy tự động lên GitHub Pages.

| | |
|---|---|
| **Live site** | https://rei-1407.github.io/Le-Tuan-Hung-Porfolio/ |
| **Trang quản trị** | https://rei-1407.github.io/Le-Tuan-Hung-Porfolio/#/admin |
| **Thiết kế gốc** | [Figma — Portfolio (Copy)](https://www.figma.com/design/cOlXV8ARFTUoFnxj8gWwm7/Portfolio--Copy-) |
| **Stack** | Vite 8 + React 19 + TypeScript, CSS thuần (không framework UI), HashRouter |
| **Hosting** | GitHub Pages, build bằng GitHub Actions khi push lên `main` |

```bash
npm install
npm run dev       # http://localhost:5173/Le-Tuan-Hung-Porfolio/
npm run build     # ra dist/
```

---

## 1. Kiến trúc tổng quan

**Nguyên tắc cốt lõi: nội dung tách khỏi code.** Toàn bộ chữ, ảnh, bố cục của mọi trang nằm trong **một file duy nhất: [`src/data/site.json`](src/data/site.json)**. Code chỉ là "máy render" file này. Trang admin cũng chỉ làm một việc: sửa file JSON đó rồi commit lên repo qua GitHub API → Actions tự build lại site.

```
site.json ──▶ App.tsx (router) ──▶ PageView ──▶ Hero
                                            └─▶ ProjectSection ──▶ SectionHeader (dải tiêu đề 1920×135)
                                                               └─▶ BlockRenderer (từng khối nội dung)
```

### Hệ đơn vị scale `--u` (quan trọng nhất để hiểu CSS)

Thiết kế Figma là artboard **1920px**. Mọi số đo trong code là "design pixel" nhân với biến `--u`:

```css
.page { container-type: inline-size; }
.page * { --u: calc(100cqw / 1920); }
/* ví dụ: */
.hero__title { font-size: calc(128 * var(--u)); }
```

→ Ở màn 1920 thì `--u = 1px`, màn 2560 tự phóng to 1.33×, màn nhỏ tự thu — **tỷ lệ luôn đúng y thiết kế ở mọi bề rộng, không có breakpoint**. Đây là quyết định có chủ đích (chủ web chỉ quan tâm desktop/tablet; điện thoại dọc không hỗ trợ riêng). Khi sửa CSS, **luôn dùng `calc(N * var(--u))`**, đừng hardcode px cho phần tử trong `.page`.

### Schema nội dung — [`src/types/content.ts`](src/types/content.ts)

Đọc file này trước tiên, nó là hợp đồng giữa JSON ↔ renderer ↔ admin. Tóm tắt:

- `Site` → `Page[]` (mỗi page: `hero`, `projects`, `comingSoon?`)
- `Project` = dải tiêu đề (song ngữ + theme màu) + nền + `Block[]`
- **10 loại block**: `section-title`, `image-grid` (2/3/4 cột, ô trắng hoặc ảnh trần), `banner`, `bilingual-text`, `split` (hàng ô kích thước tùy ý — dùng cho cặp avatar/cover, cặp bài đăng FB, card guideline...), `mascot-row`, `video`, `free` (đặt tọa độ tuyệt đối — cho các cụm so le), `brand-info` (bảng nhận diện HOTNDOGS, layout cố định nội dung sửa được), `icon-strip`
- Mọi tọa độ/kích thước trong JSON là **design px** trên khung 1920, lấy trực tiếp từ Figma
- Chuỗi văn bản hỗ trợ markup mini: `[[r:CHỮ]]` = font brand màu đỏ, `[[b:CHỮ]]` = font brand màu hiện tại, `\n` = xuống dòng (parser: [`src/lib/richtext.tsx`](src/lib/richtext.tsx))

**Thêm 1 loại layout mới** = thêm type vào `content.ts` → thêm renderer vào [`Blocks.tsx`](src/components/blocks/Blocks.tsx) → thêm preset vào [`presets.ts`](src/admin/presets.ts) → thêm form vào [`BlockEditor.tsx`](src/admin/BlockEditor.tsx). Không phải sửa chỗ nào khác.

### Đường dẫn ảnh

JSON ghi `/assets/...`, resolve qua helper [`asset()`](src/lib/asset.ts) để tự thêm base path `/Le-Tuan-Hung-Porfolio/` (site chạy dưới sub-path GitHub Pages). **Mọi `<img>` mới phải đi qua `asset()`**. `assetOverrides` trong cùng file là map để admin preview ảnh vừa upload (chưa deploy).

---

## 2. Trang quản trị (`/#/admin`)

Không có backend. **GitHub chính là database**: admin đọc/ghi `site.json` và upload ảnh vào `public/assets/uploads/` bằng GitHub Contents API với Personal Access Token của chủ repo (lưu localStorage). Mỗi lần "Đăng thay đổi" = 1 commit → Actions build lại (~1-2 phút).

Cấu trúc ([`src/admin/`](src/admin/)):

| File | Vai trò |
|---|---|
| `Admin.tsx` | Shell: đăng nhập, state trung tâm (site draft, undo/redo stack, dirty flag), lưu + theo dõi build, canvas trái + inspector phải |
| `EditingContext.ts` | Context "chế độ sửa". Các component trang (`Hero`, `SectionHeader`, `ProjectSection`, `PageView`) consume nó: **có context → bấm được để chọn, không có (site công khai) → hành vi bình thường**. Đây là cách canvas dùng lại 100% component thật |
| `Inspector.tsx` | Panel phải: form tương ứng phần đang chọn (hero / dải tiêu đề / block / coming-soon / cài đặt trang) |
| `BlockEditor.tsx` | Form chi tiết cho từng loại block |
| `fields.tsx` | Input tái sử dụng: text, số, song ngữ, ảnh (upload + kéo-thả) |
| `presets.ts` | Danh sách layout preset (thumbnail SVG wireframe) cho nút "Thêm khối" |
| `github.ts` | Client Contents API: `getFile`/`putTextFile`/`uploadImage`/`verifyToken`/`latestRunStatus`. Owner/repo/branch hardcode ở đầu file — **đổi repo thì sửa ở đây** |

Chi tiết đáng biết:
- Khi đăng nhập, admin **tải site.json mới nhất từ repo** (không tin bản đóng gói trong bundle vì có thể cũ hơn 1 deploy).
- Undo coalesce phím gõ trong 800ms thành 1 bước; stack tối đa 80.
- Upload ảnh commit **ngay khi chọn file** (trước cả khi bấm Đăng) — đơn giản hóa luồng, chấp nhận ảnh mồ côi trong `uploads/` nếu người dùng đổi ý.
- Link tạo token trong màn đăng nhập là dạng classic prefill scope `repo` cho dễ; fine-grained token (Contents RW) cũng dùng được.

---

## 3. Pipeline ảnh từ Figma

**Trạng thái hiện tại: `public/assets` đã chứa ảnh GỐC** xuất thẳng từ file Figma (07/2026, qua Figma MCP với seat Full — 200 call/ngày). File thiết kế hiện hành là bản copy `cOlXV8ARFTUoFnxj8gWwm7` (node id giữ nguyên so với file cũ). Ảnh tạm độ phân giải thấp chỉ còn là lịch sử; `scripts/ref/` giữ lại để đối chiếu.

- [`scripts/manifest.mjs`](scripts/manifest.mjs) — **nguồn sự thật duy nhất**: map node Figma → file ảnh (kèm tọa độ trên frame). Thêm/đổi ảnh thiết kế thì sửa file này.
- [`scripts/figma-assets.mjs`](scripts/figma-assets.mjs) — tải ảnh gốc qua **Figma REST API** (không phải MCP — MCP gói Starter chỉ có 6 call/tháng, đã hết; REST API thì thoải mái):
  ```powershell
  $env:FIGMA_TOKEN="figd_xxx"; node scripts/figma-assets.mjs   # rồi commit + push
  ```
  Token tạo ở Figma → Settings → Security → Personal access tokens (scope File content: Read). Cần tài khoản xem được file thiết kế.
- [`scripts/gen-placeholders.mjs`](scripts/gen-placeholders.mjs) — sinh lại bộ ảnh tạm từ `scripts/ref/` (chỉ cần khi chưa có token mà đổi manifest).
- **⚠ Ảnh cần nền trong suốt** (icon trắng trên band đỏ, mascot, 2 logo, ảnh bao bì mờ 10%): export node qua Figma MCP bị **nén phẳng alpha thành nền trắng**. 12 file này được dựng lại từ ảnh nguồn raw (`rawImages` của `download_assets` — giữ alpha) + vector lót trắng của mascot, theo đúng hình học node (xoay/lật/crop) — xem [`scripts/rebuild-transparent.mjs`](scripts/rebuild-transparent.mjs). REST API (`figma-assets.mjs`) không dính lỗi này, nhưng nhớ: node bao bì cần opacity 10% và các ảnh này đừng ghi đè bằng bản export phẳng.

---

## 4. Deploy

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): push `main` → `npm install` → `npm run build` → upload `dist/` → Pages. Pages đã bật chế độ build "GitHub Actions".

**⚠ Gotchas đã gặp — đừng "sửa lại" thành lỗi cũ:**

1. **CI dùng `npm install`, KHÔNG dùng `npm ci`** — lockfile sinh trên Windows dính bug [npm/cli#4828](https://github.com/npm/cli/issues/4828) (thiếu optional deps wasm đa nền tảng của rolldown/oxlint/sharp) làm `npm ci` fail trên Linux runner.
2. **Admin KHÔNG tách code-split** — trước đây `lazy()` tách chunk riêng, người dùng giữ index.html cũ trong cache sau redeploy → chunk cũ 404 → trang trắng. Giờ tất cả trong 1 bundle (`App.tsx` có comment). Đừng lazy lại trừ khi xử lý cache-busting tử tế.
3. **HashRouter chứ không phải BrowserRouter** — GitHub Pages không rewrite được route con, URL dạng `/#/branding` là chủ đích.
4. `vite.config.ts` có `base: "/Le-Tuan-Hung-Porfolio/"` — đổi tên repo thì phải đổi cả đây lẫn `github.ts`.
5. `main.tsx` có lưới an toàn: mọi lỗi JS không bắt được sẽ hiện màn hình "Trang gặp lỗi khi tải" + nút reload thay vì trang đen câm.

---

## 5. Chi tiết render đáng biết trước khi sửa CSS

- `ProjectSection` body có `display: flow-root` — chặn margin-collapse để mép màu nền các section đứng **đúng tọa độ Figma** (kể cả block có `mt` âm đè lên section trên, ví dụ card guideline đầu tiên `mt: -25`).
- Block `split` chỉ pad **bên trái** (`inset`); các ô mang width cố định nên pad phải sẽ tràn 1920 và làm rớt hàng (từng là bug thật).
- `image-grid` kiểu `bare`: chiều cao hàng do **tỷ lệ ảnh** quyết định (`height: auto`) — ảnh trong manifest được xuất đúng kích thước design nên hàng rơi đúng chỗ. Kiểu `card`: ô vuông trắng `aspect-ratio: 1`, ảnh đặt theo `pos` (design px so với ô 525).
- Ảnh packaging HOTNDOGS cố tình tràn phải 22px và bị clip — y hệt Figma clip trên frame.
- Animation (reveal khi cuộn, hero drift, hover) là phần "tự chế" được phép — tôn trọng `prefers-reduced-motion`. Layout khi animation kết thúc đã được kiểm bằng cách đo tọa độ từng phần tử so với Figma (sai số ≤ ±8px trên khung 1920).
- Màu lấy trực tiếp từ Figma / sample từ ảnh gốc: xem [`src/styles/tokens.css`](src/styles/tokens.css). Đừng "làm đẹp" lại màu.

---

## 6. Việc còn dang dở (bàn giao lại)

| Việc | Trạng thái |
|---|---|
| **Ảnh gốc chất lượng cao** | ✅ Xong (07/2026) — tải từ file Figma copy qua MCP. Khối animlogo giờ dùng GIF động gốc (`animlogo.gif`). Ảnh packaging bị Figma clip tại mép frame nên CSS neo `object-position: left` |
| **Font Super Caramel** (wordmark HOTNDOGS) | Font bản quyền, chưa có file. Bỏ vào `public/fonts/SuperCaramel.woff2` (hoặc `.otf`) là tự ăn (`@font-face` khai trong `index.html`). Đang fallback Montserrat |
| **Video "Con Rồng Cháu Tiên"** | Đang hiện poster tĩnh. Có link YouTube → chủ web tự dán trong admin (khối Video nhận nguyên URL) |
| **Trang Concept / Game / My CV** | Figma chưa thiết kế xong. Đang dùng chung bìa "UX-UI & CONCEPT GAME" + placeholder "đang cập nhật". Khi có thiết kế: thêm project + block qua admin, hoặc nếu layout lạ thì thêm block type mới (quy trình ở mục 1) |
| **Token GitHub của chủ web** | Chủ web từng dán 1 token vào chat với AI — đã dặn revoke. Khi bàn giao nên xác nhận đã revoke và tạo token mới |

## 7. Chẩn đoán nhanh khi có lỗi

- **Site trắng/lỗi hiển thị** → giờ luôn có màn hình lỗi kèm message; bảo người dùng chụp lại + Ctrl+Shift+R trước tiên (90% là cache sau deploy).
- **Đăng thay đổi thất bại** → badge đỏ trong admin in message từ GitHub API: 401 = token hỏng/revoke, 409 = sha lệch (site.json bị sửa song song — reload admin để kéo bản mới), 404 = token thiếu quyền repo.
- **Build đỏ trên Actions** → `gh run view <id> --log-failed`; nhớ gotcha `npm install` mục 4.
- **Layout lệch sau khi sửa nội dung** → kiểm tra ảnh mới upload có đúng tỷ lệ khung của ô/`pos` không; grid `bare` ăn theo tỷ lệ ảnh.

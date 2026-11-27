# AGENTS.md — Nội Quy Chung Của Dự Án Web

> File này áp dụng tự động cho **mọi Agent** tham gia xây dựng, chỉnh sửa hoặc kiểm định dự án.

## 1. Tech Stack & Môi Trường
- **Framework**: Next.js (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Lucide Icons.
- **Hệ điều hành phát triển**: Windows PowerShell — **luôn dùng `npm.cmd` và `npx.cmd`** thay vì `npm`/`npx` khi chạy lệnh terminal.
- **Kiểm thử**: Vitest (`npm.cmd test`), TypeScript (`npx.cmd tsc --noEmit`), Production Build (`npm.cmd run build`).

## 2. Hệ Thống Nhận Diện Thương Hiệu (Design Tokens)
- **Nền chính (Canvas)**: `#FAF8F5` | **Bề mặt (Surface)**: `#FFFFFF` | **Nền phụ**: `#F2EFE9`
- **Chữ chính**: `#181715` | **Chữ phụ**: `#57534E` | **Chữ mờ đạt chuẩn WCAG AA**: `#6B655E` (tránh dùng màu quá nhạt `< 4.5:1`)
- **Viền mảnh**: `#E5E0D8`
- **Màu nhấn**: Xanh rừng `#1F5E3B` (thành công/chính), Đỏ son `#9E2A2B` (cảnh báo/phiên âm), Hổ phách `#B45309` (streak/tốc độ).
- **Font chữ**: Luôn nạp qua `next/font/google` (ưu tiên `Be Vietnam Pro` + `JetBrains Mono` cho tiếng Việt).

## 3. Quy Tắc Bắt Buộc & Điều Cấm (Hard Rules)
- **KHÔNG** tạo số thứ tự máy móc (`01`, `02`, `03`, `FIG. 01`) trên các mục giới thiệu trang bìa.
- **KHÔNG** đặt rule CSS toàn cục `button:hover { transform: translateY(...) }` làm nhảy lệch các nút icon định vị tuyệt đối (`-translate-y-1/2`).
- **KHÔNG** lưu hoặc hiển thị mật khẩu văn bản thô (plaintext) trên UI hay file export.
- **KHÔNG** phá vỡ tính năng đang chạy ổn định; mọi tính năng mới phải tương thích ngược với dữ liệu người dùng hiện có.
- **LUÔN** trả lời người dùng bằng tiếng Việt súc tích, rõ ràng, có link file bấm được.

## 4. Quy Trình Nghiệm Thu Trước Khi Báo Xong (Definition of Done)
Trước khi commit hoặc báo hoàn thành, **bắt buộc** chạy qua đủ 3 cửa kiểm định:
1. `npx.cmd tsc --noEmit` → **0 lỗi**
2. `npm.cmd test` → **100% test pass**
3. `npm.cmd run build` → **Build production thành công**

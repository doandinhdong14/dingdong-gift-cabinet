# NHIỆM VỤ PHÁT TRIỂN HIỆU ỨNG

TASK ID: task-dryrun-test-02
EFFECT ID: dryrun-confetti-01
MODE: new
KIND: background

## MỤC TIÊU:
Hiệu ứng mưa pháo giấy confetti rơi tuần hoàn

## THAM CHIẾU:
- Video/Ảnh mẫu: .local/dryrun-confetti-01/references/
- Xem file references/README.md để nắm vai trò và các mốc chuyển động cần khớp.

## HÌNH ẢNH:
- Dựng hình, bố cục và ánh sáng theo đúng yêu cầu đề bài.
- Giữ tỷ lệ chuẩn, pivot tại gốc tọa độ.

## TƯƠNG TÁC / CHUYỂN ĐỘNG:
- Trạng thái bắt đầu, diễn hoạt liên tục hoặc các giai đoạn mở quà.
- Đảm bảo diễn hoạt mượt mà, pause/resume không bị giật quãng đường.

## CẤU HÌNH:
- Khai báo đầy đủ controls trong `controls.ts` và presets đại diện trong `presets.ts`.

## TÁI SỬ DỤNG:
- Chỉ sử dụng SDK từ `../../effect-sdk` và shared assets từ `../../shared-assets`.

## PHẠM VI:
- Chỉ chỉnh sửa trong `src/effects/dryrun-confetti-01/**`.

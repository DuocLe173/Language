*bản gốc
-Nhận xét: phong cách và bố cục hiện tại hài hòa hợp lí, vẫn giữ đc giọng rõ và từ ngữ dễ hiểu, các bản nâng cấp mình thêm vào đc thể hiện tốt và chỉnh chu.
*Điểm cần nâng cấp:
-Các chủ đề phải chia theo ngày và quy định số từ cho mỗi ngày
      VD: Chủ đề giao tiếp hằng ngày sẽ gồm 100 từ, sẽ có 1 bảng chia ra làm 10 ngày học, mỗi ngày 10 từ, cần hoàn thành ngày 1 thì mới đc mở khóa ngày 2, và khi tiếp tục ngày 2 thì cần phải ôn lại ngày 1, test làm ok thì mới học đc ngày 2
-có thêm nhiều chủ đề nữa.
-phải học từ các từ cơ bản trước rồi sẽ khó dần theo từng ngày
      VD: Ngày 1 học các từ như Hello, các câu giao tiếp ứng với chủ đề...rồi từ từ khó dần theo ngày
-phong cách khi học phải là nhìn từ->bấm nghe từ->xem nghĩa->ghi lại 2-3 lần bằng cách thêm bớt các từ (vd: He_lo, He__o, _el__)-> dịch nghĩa câu cơ bản có từ đó (vd: Hello Jack! sau đó sẽ nhập nghĩa vào là xin chào Jack!)
-đa dạng cách ôn tập và làm bài như ghép từ, kéo thả ô chưa từ để ghép thành câu....

Những nâng cấp này phải đc sắp xếp hợp lí như nút bấm hiện ra bảng rồi chọn, chứ kh ghi tràn lan ra màn hình.

*bản promt AI
[VAI TRÒ]:
Bạn là một Kiến trúc sư Phần mềm Cấp cao (Senior Frontend Developer) kiêm Chuyên gia Thiết kế Trải nghiệm Người dùng trong Giáo dục (EdTech UI/UX Designer). Bạn có chuyên môn sâu sắc trong việc xây dựng các ứng dụng học ngôn ngữ tương tác cao, áp dụng phương pháp lặp lại ngắt quãng (Spaced Repetition) và thiết kế giao diện tối giản, hiện đại.

[BỐI CẢNH]:
Tôi đang phát triển và nâng cấp một ứng dụng web học từ vựng tiếng Anh. Phiên bản hiện tại đã có bố cục hài hòa, giọng đọc phát âm rõ ràng và từ ngữ dễ hiểu. Mục tiêu của lần nâng cấp này là tái cấu trúc lộ trình học tập theo từng ngày có điều kiện mở khóa, chuẩn hóa quy trình học từng từ theo 5 bước tương tác, đa dạng hóa bài tập ôn luyện và tối ưu hóa không gian hiển thị để giao diện luôn gọn gàng, chỉn chu.

[NHIỆM VỤ]:
Hãy nâng cấp mã nguồn và thiết kế của ứng dụng bằng cách triển khai đầy đủ 6 tính năng cốt lõi sau:

1. Mở rộng Kho Chủ đề & Phân chia Lộ trình Học theo Ngày:
   - Bổ sung thêm nhiều chủ đề từ vựng đa dạng (Giao tiếp hằng ngày, Công sở, Du lịch, Công nghệ, Ẩm thực, Mua sắm, v.v.).
   - Chia nhỏ mỗi chủ đề thành lộ trình theo ngày với số lượng từ cố định (Ví dụ: Chủ đề 100 từ được chia thành bảng 10 ngày, mỗi ngày đúng 10 từ).

2. Thiết lập Cơ chế Mở khóa Tuần tự & Kiểm tra Đầu giờ (Lock/Unlock & Gatekeeping Test):
   - Mặc định chỉ mở khóa Ngày 1; các ngày tiếp theo ở trạng thái khóa.
   - Người học phải hoàn thành 100% từ vựng của Ngày $N$ mới được mở khóa Ngày $N+1$.
   - Khi bắt đầu Ngày $N+1$ (từ Ngày 2 trở đi), bắt buộc hiển thị một bài kiểm tra ngắn ôn tập lại từ vựng của Ngày $N$. Người học phải vượt qua bài kiểm tra này (đạt điểm chuẩn) thì mới chính thức vào học từ mới của Ngày $N+1$.

3. Phân bổ Độ khó Tăng dần (Progressive Difficulty):
   - Sắp xếp dữ liệu từ vựng và mẫu câu theo mức độ tăng dần theo từng ngày.
   - Ngày 1 bắt đầu bằng các từ đơn cơ bản (như "Hello", "Thank you") và mẫu câu giao tiếp ngắn gọn; các ngày tiếp theo tăng dần độ phức tạp về từ vựng và cấu trúc câu.

4. Xây dựng Luồng Học Tập 5 Bước Cố định cho Mỗi Từ:
   - Bước 1 (Nhìn từ): Hiển thị rõ mặt chữ, từ loại và phiên âm.
   - Bước 2 (Nghe từ): Tích hợp nút bấm phát âm thanh rõ ràng, yêu cầu người học bấm nghe.
   - Bước 3 (Xem nghĩa): Hiển thị nghĩa tiếng Việt dễ hiểu sau khi đã nghe.
   - Bước 4 (Luyện gõ từ qua điền khuyết): Yêu cầu người học nhập lại từ đó 2–3 lần liên tiếp với các chữ cái bị ẩn thay đổi và tăng dần độ khó (Ví dụ với từ "Hello": Lần 1 `He_lo` -> Lần 2 `He__o` -> Lần 3 `_el__`).
   - Bước 5 (Dịch câu cơ bản): Hiển thị một câu tiếng Anh ngắn chứa từ vừa học và yêu cầu người học nhập nghĩa tiếng Việt tương ứng (Ví dụ: Hiển thị `"Hello Jack!"` -> Người học nhập `"Xin chào Jack!"`).

5. Đa dạng hóa Chế độ Ôn tập & Làm bài tập:
   - Tích hợp nhiều dạng bài tập tương tác trong phần ôn tập và kiểm tra:
     - Nối/ghép từ tiếng Anh với nghĩa tiếng Việt tương ứng (Matching).
     - Kéo thả hoặc bấm chọn các ô từ xáo trộn để sắp xếp thành câu hoàn chỉnh (Sentence Building).
     - Điền từ còn thiếu vào câu và nghe viết chính tả.

6. Tối ưu hóa Bố cục Giao diện (UI/UX Gọn gàng):
   - Tổ chức các danh sách chủ đề, bảng chọn ngày học và menu bài tập vào trong các thành phần ẩn/hiện thông minh (như nút bấm mở hộp thoại Modal, ngăn kéo Drawer hoặc bảng chọn Dropdown/Tabs).
   - Chỉ hiển thị đúng nội dung của bước đang học hoặc bài tập đang làm trên màn hình chính.

[RÀNG BUỘC]:

- Phải giữ nguyên phong cách thiết kế hài hòa, giọng đọc phát âm chuẩn xác và ngôn từ thân thiện, dễ hiểu của phiên bản hiện tại.
- Tuyệt đối KHÔNG dàn trải toàn bộ danh sách chủ đề, bảng ngày học hoặc tất cả các bước học ra cùng một màn hình gây rối mắt.
- Không cho phép người dùng bỏ qua bước kiểm tra bài cũ khi chuyển sang ngày học mới.
- Cơ chế kiểm tra dịch câu ở Bước 5 cần xử lý linh hoạt chữ hoa/chữ thường và khoảng trắng thừa để không bắt lỗi oan người học.

[QUY TRÌNH TƯ DUY]:
Trước khi viết mã nguồn, hãy thực hiện phân tích theo từng bước:

1. Thiết kế cấu trúc dữ liệu (Data Schema) cho Chủ đề -> Ngày học (kèm trạng thái khóa/mở) -> Danh sách từ vựng (tăng dần độ khó) -> Câu ví dụ.
2. Xây dựng máy trạng thái (State Machine) để quản lý luồng chuyển đổi giữa: Màn hình chọn chủ đề/ngày (Modal) -> Bài kiểm tra ôn tập ngày cũ -> Luồng học 5 bước -> Bài tập tổng hợp cuối ngày.
3. Viết thuật toán tự động tạo chuỗi khuyết chữ cái ngẫu nhiên cho Bước 4 (`He_lo`, `He__o`, `_el__`) và kiểm tra đáp án dịch câu cho Bước 5.
4. Lập trình giao diện đảm bảo tính đóng gói (Modals/Tabs) và trải nghiệm tương tác mượt mà.

[ĐỊNH DẠNG ĐẦU RA]:

- Trình bày sơ đồ tóm tắt luồng hoạt động mới (User Flow) và cấu trúc dữ liệu bằng gạch đầu dòng ngắn gọn.
- Cung cấp toàn bộ mã nguồn hoàn chỉnh, sạch sẽ, có chú thích rõ ràng ở từng khối chức năng để dễ dàng chạy trực tiếp hoặc tích hợp vào dự án hiện tại.

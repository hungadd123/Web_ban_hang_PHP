// src/utils/helpers.js

/**
 * Định dạng số thành chuỗi tiền tệ theo locale và mã tiền tệ.
 * Ví dụ: formatCurrency(12000, 'USD', 'en-US') => "$12,000.00"
 * Ví dụ: formatCurrency(250000, 'VND', 'vi-VN') => "250.000 ₫"
 * @param {number} amount - Số tiền cần định dạng.
 * @param {string} currencyCode - Mã tiền tệ (ví dụ: 'USD', 'VND').
 * @param {string} locale - Mã locale (ví dụ: 'en-US', 'vi-VN'). Mặc định là 'en-US'.
 * @returns {string} Chuỗi tiền tệ đã định dạng hoặc chuỗi rỗng nếu đầu vào không hợp lệ.
 */
export const formatCurrency = (amount, currencyCode = 'USD', locale = 'en-US') => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        console.warn(`formatCurrency received an invalid amount: ${amount}`);
        // Trả về một giá trị mặc định hoặc thể hiện lỗi tùy theo yêu cầu
        // Ví dụ: return 'N/A'; hoặc formatCurrency(0, currencyCode, locale);
        return formatCurrency(0, currencyCode, locale);
    }

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            // Bạn có thể thêm các tùy chọn khác ở đây nếu cần
            // minimumFractionDigits: 0, // Bỏ số thập phân cho VND chẳng hạn
        }).format(numericAmount);
    } catch (error) {
        console.error(`Error formatting currency: ${error}`);
        // Trả về giá trị gốc hoặc một định dạng dự phòng đơn giản nếu Intl không hoạt động
        return `${currencyCode} ${numericAmount.toFixed(2)}`;
    }
};

/**
 * Định dạng chuỗi ngày hoặc đối tượng Date thành chuỗi ngày thân thiện.
 * Ví dụ: formatDate('2025-03-26T10:00:00Z', 'en-US') => "Mar 26, 2025"
 * Ví dụ: formatDate(new Date(), 'vi-VN') => "26/03/2025"
 * @param {string | Date} dateInput - Chuỗi ngày hoặc đối tượng Date.
 * @param {string} locale - Mã locale (ví dụ: 'en-US', 'vi-VN'). Mặc định là 'en-US'.
 * @returns {string} Chuỗi ngày đã định dạng hoặc "Invalid Date".
 */
export const formatDate = (dateInput, locale = 'en-US') => {
    if (!dateInput) return '';

    try {
        const date = new Date(dateInput);
        // Kiểm tra xem date có hợp lệ không
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        // Tùy chọn định dạng ngày tháng (có thể tùy chỉnh)
        const options = {
            year: 'numeric',
            month: 'short', // 'long', 'numeric', '2-digit'
            day: 'numeric', // '2-digit'
            // Có thể thêm giờ phút nếu cần
            // hour: '2-digit',
            // minute: '2-digit',
        };

        // Nếu locale là 'vi-VN', có thể dùng định dạng khác
        if (locale === 'vi-VN') {
            const vnOptions = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            };
             return new Intl.DateTimeFormat(locale, vnOptions).format(date);
        }


        return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
        console.error(`Error formatting date: ${error}`);
        return "Invalid Date";
    }
};

/**
 * Ánh xạ trạng thái đơn hàng sang variant tương ứng của component Badge (Shadcn UI).
 * @param {string | null | undefined} status - Trạng thái đơn hàng (ví dụ: 'Processing', 'Delivered').
 * @returns {'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'} Variant của Badge.
 */
export const getStatusBadgeVariant = (status) => {
    const lowerCaseStatus = String(status || '').toLowerCase().trim();

    switch (lowerCaseStatus) {
        case 'delivered':
        case 'completed':
        case 'paid': // Thêm 'paid' vào success nếu muốn
            return 'success';
        case 'cancelled':
        case 'failed':
        case 'refunded':
            return 'destructive';
        case 'pending': // Trạng thái chờ xử lý ban đầu
        case 'on hold':
            return 'warning'; // Hoặc 'secondary' tùy ý thích
        case 'processing': // Đang xử lý
        case 'shipped': // Đã gửi hàng
        case 'out for delivery': // Đang giao hàng
            return 'default'; // Thường là màu xanh dương hoặc màu chính
        case 'order placed': // Mới đặt hàng, chưa xử lý
             return 'secondary'; // Màu xám nhạt
        default:
            return 'secondary'; // Mặc định cho các trạng thái không xác định
    }
};

// Bạn có thể thêm các helper functions khác vào đây nếu cần
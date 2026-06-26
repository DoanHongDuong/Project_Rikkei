import { useState, useEffect } from "react";

/**
 * Hook tùy chỉnh để tạo Debounce (độ trễ) cho các giá trị thay đổi nhanh như ô tìm kiếm.
 * Giúp giảm tải Server bằng cách chờ người dùng ngưng gõ mới trả về giá trị thực sự.
 * 
 * @param value Giá trị cần theo dõi (ví dụ: state 'search')
 * @param delay Thời gian chờ (mặc định 500ms)
 * @returns Giá trị sau khi đã trễ (debounced value)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cài đặt một bộ hẹn giờ để cập nhật giá trị sau thời gian 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Xóa bộ hẹn giờ cũ nếu 'value' thay đổi trước khi hết 'delay' (người dùng vẫn đang gõ)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

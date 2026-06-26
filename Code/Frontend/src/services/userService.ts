    import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users'; // URL Backend của bạn

// Hàm tự động lấy Token cấu hình vào Header để qua bộ lọc verifyToken, isAdmin ở BE
const getAuthHeader = () => {
    const token = localStorage.getItem('token'); // Hoặc lấy từ nơi bạn đang lưu khi login thành công
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const userService = {
    // READ: Lấy toàn bộ danh sách người dùng từ MySQL về
    getAllUsers: async (search: string = '') => {
        const response = await axios.get(`${API_URL}?search=${search}`, getAuthHeader());
        return response.data;
    },

    // CREATE: Dùng Admin gốc để tạo tài khoản cho PM hoặc Member
    createUser: async (userData: { full_name: string; email: string; role: string; department_id?: number | null }) => {
        const response = await axios.post(API_URL, userData, getAuthHeader());
        return response.data;
    },

    // UPDATE: Cập nhật trạng thái/thông tin người dùng
    updateUserStatus: async (id: number, updateData: { status?: string; role?: string }) => {
        const response = await axios.put(`${API_URL}/${id}`, updateData, getAuthHeader());
        return response.data;
    },

    // DELETE: Xóa mềm tài khoản
    deleteUser: async (id: number) => {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    }
};
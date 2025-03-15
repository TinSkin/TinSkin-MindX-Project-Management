// Lấy danh sách user từ localStorage, nếu không có thì tạo mảng rỗng
let list_users = JSON.parse(localStorage.getItem("users")) || [];

console.log(list_users)

// Check if user is log in
const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "admin") {
    window.location.href = "../../LogInPage/index.html";
    // Nếu chưa đăng nhập, chuyển về trang login
    // if (!user): Nếu không có user trong localStorage, có nghĩa là chưa đăng nhập.
    // Chuyển hướng (redirect) về login.html, yêu cầu user phải đăng nhập.
} else {
    renderUserManagement(); // Gọi hàm hiển thị danh sách user

    const logged_username = document.getElementById('logged-in-username')
    const logged_email = document.getElementById('logged-in-email')

    logged_username.innerHTML = user.username
    logged_email.innerHTML = user.email
}



function renderUserManagement() {
    const user_table = document.getElementById("user-table");
    user_table.innerHTML = "";

    list_users.forEach((u, index) => {
        user_table.innerHTML += `
            <tr class="border-t text-center">
                <td class="p-2">${u.username}</td>
                <td class="p-2">${u.email}</td>
                <td class="p-2">
                    <select id="role-select-${index}" class="border p-1 rounded">
                        <option value="admin" ${u.role === "admin" ? "selected" : ""}>admin</option>
                        <option value="user" ${u.role === "user" ? "selected" : ""}>user</option>
                    </select>
                </td>
                <td class="p-2">
                    <button onclick="saveRoleChange(${index})" class="bg-blue-500 text-white px-2 py-1 rounded">Save</button>
                    <button onclick="deleteUserAccount(${index})" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
            </tr>
        `;
    });
}

function saveRoleChange(index) {
    const user_change = list_users[index];
    const old_role = user_change.role;

    // Lấy giá trị mới từ select
    const select_element = document.getElementById(`role-select-${index}`);
    const new_role = select_element.value;

    // Hiển thị xác nhận
    if (!confirm(`Do you want to change ${user_change.username} from ${old_role} to ${new_role}?`)) {
        // Nếu không đồng ý, khôi phục giá trị cũ trong <select>
        select_element.value = old_role;
        return;
    }

    // Cập nhật role
    user_change.role = new_role;
    localStorage.setItem("users", JSON.stringify(list_users));

    alert(`Đã thay đổi vai trò của ${user_change.username} thành ${new_role}`);
}

function changeUserRole(index, new_role) {
    list_users[index].role = new_role;
    localStorage.setItem("users", JSON.stringify(list_users));
    alert(`Đã thay đổi vai trò của ${list_users[index].username} thành ${new_role}`);
}

function deleteUserAccount(index) {
    // Bạn có thể thêm kiểm tra để không xóa tài khoản admin chính đang đăng nhập (nếu muốn)
    const user_delete = list_users[index];
    if (confirm(`Bạn có chắc muốn xóa user: ${user_delete.username}?`)) {
        list_users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(list_users));
        renderUserManagement();
    }
}

// Log out function
function logout() {
    localStorage.removeItem("user");
    // localStorage.removeItem("projects");
    localStorage.removeItem("staffs");
    window.location.href = "../../LogInPage/index.html";
}

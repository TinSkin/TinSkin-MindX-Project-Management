// Check if user is log in
const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "admin") {
    window.location.href = "../../LogInPage/index.html";
    // Nếu chưa đăng nhập, chuyển về trang login
    // if (!user): Nếu không có user trong localStorage, có nghĩa là chưa đăng nhập.
    // Chuyển hướng (redirect) về login.html, yêu cầu user phải đăng nhập.
} else {
    const logged_username = document.getElementById('logged-in-username')
    const logged_email = document.getElementById('logged-in-email')

    logged_username.innerHTML = user.username
    logged_email.innerHTML = user.email
}

//! Load & Render List Staffs
let list_staffs = JSON.parse(localStorage.getItem("staffs")) || [];

async function loadStaffsList() {
    try {
        const response = await fetch('../staffs.json');
        const json_data = await response.json();

        let stored_staffs = JSON.parse(localStorage.getItem("staffs")) || [];

        // Using Map to get rid of duplicate data with condition is email
        let merged_staffs = [...new Map([...json_data, ...stored_staffs].map(staff => [staff.email, staff])).values()];

        // If there is no stored staffs data under localStorage, using json data to save data under localStorage
        if (stored_staffs.length === 0) {
            localStorage.setItem("staffs", JSON.stringify(merged_staffs));
        }

        list_staffs = merged_staffs;

        // renderProducts(list_staffs);

        if (user.role === "admin") {
            renderAdminStaffs(); // Update Staff Management Of Admin
        }

    } catch (error) {
        console.log('Fail to retrieve data:', error);
    }
}

function renderAdminStaffs() {
    const staff_table = document.getElementById('staff-table');
    staff_table.innerHTML = '';

    list_staffs.forEach((staff, index) => {
        staff_table.innerHTML += `
            <tr class="border-t text-center">
                <td class="p-2">${staff.first_name}</td>
                <td class="p-2">${staff.last_name}</td>
                <td class="p-2">${staff.email}</td>
                <td class="p-2">${staff.phone_number}</td>
                <td class="p-2">${staff.created_date}</td>
                <td class="p-2">${staff.created_by}</td>
                <td class="p-2">
                    <button onclick="showEditStaff(${index})" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200">
                        <i class="fa-solid fa-user-pen"></i>
                    </button>
                    <button onclick="deleteStaff(${index})" class="bg-red-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200">
                        <i class="fa-solid fa-user-minus"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// Show Modal
function showModal() {
    const modal = document.getElementById("crud-modal");

    modal.classList.remove('hidden');
}

// Close Modal
function closeModal() {
    // Lấy phần tử modal chứa feedback
    const modal = document.getElementById("crud-modal");

    // Thêm class "hidden" để ẩn modal feedback
    modal.classList.add("hidden");
}

// Close Create Staff Modal
function closeCreateModal() {
    // Lấy phần tử modal chứa feedback
    const modal = document.getElementById("create-modal");

    // Thêm class "hidden" để ẩn modal feedback
    modal.classList.add("hidden");
}

// Show Now Date
function showDate() {
    console.log(new Date().toLocaleString().split(',')[0])
    const staff_created_date = document.getElementById("created-date");
    staff_created_date.value = new Date().toLocaleString().split(',')[0];
}

//! CRUD Staff
// CREATE Staff
function createStaff() {
    const staff_id = document.getElementById("staff-id").value;
    const staff_first_name = document.getElementById("create-first-name").value;
    const staff_last_name = document.getElementById("create-last-name").value;
    const staff_email = document.getElementById("create-email").value;
    const staff_phone_number = document.getElementById("create-phone-number").value;
    const staff_created_date = document.getElementById("created-date").value;
    const staff_created_by = document.getElementById("created-by").value;
    // // Lấy giá trị của các input trong form:
    // // edit - id: ID sản phẩm(nếu chỉnh sửa, sẽ có giá trị ID).
    // // product - name: Tên sản phẩm.
    // // product - image: Link hình ảnh sản phẩm.
    // // product - price: Giá sản phẩm.

    const staff_new_id = list_staffs.length

    if (staff_first_name === "" || staff_last_name === "" || staff_email === "" || staff_phone_number === "" || staff_created_by === "") {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    // // Nếu bất kỳ trường nào bị bỏ trống, thông báo lỗi "Vui lòng nhập đầy đủ thông tin!" sẽ xuất hiện.
    // // return; giúp dừng hàm ngay lập tức, tránh lưu dữ liệu sai.

    if (staff_new_id) {
        list_staffs[staff_new_id] = { id: staff_new_id, first_name: staff_first_name, last_name: staff_last_name, email: staff_email, phone_number: staff_phone_number, created_date: staff_created_date, created_by: staff_created_by };
        // Nếu có giá trị id, nghĩa là sản phẩm đã tồn tại và cần được cập nhật.
        // Dữ liệu cập nhật ngay vào -danh sách allProducts.
    } else {
        list_staffs.push({ id: staff_new_id, first_name: staff_first_name, last_name: staff_last_name, email: staff_email, phone_number: staff_phone_number, created_date: staff_created_date, created_by: staff_created_by });
        // Nếu không có id, nghĩa là thêm sản phẩm mới vào danh sách.
        // Dùng.push() để thêm sản phẩm mới.
    }

    localStorage.setItem("staffs", JSON.stringify(list_staffs));
    // // Chuyển danh sách allProducts thành chuỗi JSON và lưu vào localStorage.
    // // Giúp lưu lại sản phẩm ngay cả khi tải lại trang.
    renderAdminStaffs();

    // renderAdminProducts(): Cập nhật bảng quản lý sản phẩm dành cho Admin.
    // renderProducts(): Cập nhật danh sách sản phẩm trên trang chính.
}

// DELETE Staff
function deleteStaff(index) {
    if (confirm("Do you want to delete this staff?")) {
        // Hiển thị hộp thoại xác nhận xóa.
        // Nếu người dùng chọn OK, tiếp tục xóa nhan vien.
        list_staffs.splice(index, 1);
        // splice(index, 1): Xóa nhan vien tại vị trí index khỏi mảng list_staffs.

        localStorage.setItem("staffs", JSON.stringify(list_staffs));
        // Lưu danh sách list_staffs mới vào localStorage để cập nhật dữ liệu.
        renderAdminStaffs();
        // renderAdminStaffs(): Cập nhật bảng quản lý nhan vien Admin.
        // renderStaffs() : Cập nhật danh sách nhan vien trên trang chính.
    }
}

// UPDATE STAFF
function showEditStaff(index) {
    showModal()

    const staff_edit_div = document.getElementById('button-edit-staff');
    staff_edit_div.innerHTML = '';

    // Gán index vào ô edit - id.
    // Giúp xác định nhan vien nào đang chỉnh sửa.
    document.getElementById("edit-first-name").value = list_staffs[index].first_name;
    document.getElementById("edit-last-name").value = list_staffs[index].last_name;
    document.getElementById("edit-email").value = list_staffs[index].email;
    document.getElementById("edit-phone-number").value = list_staffs[index].phone_number;
    document.getElementById("edit-created-date").value = list_staffs[index].created_date;
    document.getElementById("edit-created-by").value = list_staffs[index].created_by;

    // Điền dữ liệu của nhan vien tại index vào các ô nhập(input).
    // Người dùng có thể sửa lại thông tin.

    staff_edit_div.innerHTML = `
                <button onclick="editStaff(${index})"
                    class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clip-rule="evenodd"></path>
                    </svg>
                    Edit Staff
                </button>
    `
}

function editStaff(index) {
    const staff_first_name = document.getElementById("edit-first-name").value;
    const staff_last_name = document.getElementById("edit-last-name").value;
    const staff_email = document.getElementById("edit-email").value;
    const staff_phone_number = document.getElementById("edit-phone-number").value;
    const staff_created_date = document.getElementById("edit-created-date").value;
    const staff_created_by = document.getElementById("edit-created-by").value;

    if (staff_first_name === "" || staff_last_name === "" || staff_email === "" || staff_phone_number === "" || staff_created_date === "" || staff_created_by === "") {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (index) {
        list_staffs[index] = { first_name: staff_first_name, last_name: staff_last_name, email: staff_email, phone_number: staff_phone_number, created_date: staff_created_date, created_by: staff_created_by };
        // Nếu có giá trị id, nghĩa là nhan vien đã tồn tại và cần được cập nhật.
        // Dữ liệu cập nhật ngay vào -danh sách allProducts.
    } else {
        list_staffs.push({ first_name: staff_first_name, last_name: staff_last_name, email: staff_email, phone_number: staff_phone_number, created_date: staff_created_date, created_by: staff_created_by });
        // Nếu không có id, nghĩa là thêm nhan vien mới vào danh sách.
        // Dùng.push() để thêm nhan vien mới.
    }

    localStorage.setItem("staffs", JSON.stringify(list_staffs));
    // // Chuyển danh sách list_staffs thành chuỗi JSON và lưu vào localStorage.
    // // Giúp lưu lại nhan vien ngay cả khi tải lại trang.
    // renderAdminStaffs();

    // renderAdminProducts(): Cập nhật bảng quản lý nhan vien dành cho Admin.
    // renderProducts(): Cập nhật danh sách nhan vien trên trang chính.
}

// Log out function
function logout() {
    localStorage.removeItem("user");
    // localStorage.removeItem("projects");
    localStorage.removeItem("staffs");
    window.location.href = "../../LogInPage/index.html";
}

window.onload = loadStaffsList;
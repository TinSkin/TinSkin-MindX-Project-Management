//edit mail thông tin cá nhân
// ... (giữ nguyên các phần cũ như loadProducts, renderProducts, v.v.) ...

// Biến toàn cục để lưu thông tin người dùng
let currentUser = JSON.parse(localStorage.getItem("user")) || { username: "Guest", email: "guest@example.com" };

// Biến để lưu giá trị ban đầu khi mở modal
let initialUserData = {};

// Hiển thị thông tin người dùng trên trang profile
function displayUserProfile() {
    const usernameElement = document.getElementById("profile-username");
    const emailElement = document.getElementById("profile-email");
    const phoneElement = document.getElementById("profile-phone");
    const occupationElement = document.getElementById("profile-occupation");

    if (currentUser) {
        usernameElement.textContent = currentUser.username || "Guest";
        emailElement.textContent = currentUser.email || "No email provided";
        phoneElement.textContent = currentUser.phone || "No phone number";
        occupationElement.textContent = currentUser.occupation || "No occupation";

        // Ẩn số điện thoại và nghề nghiệp nếu chưa có
        if (!currentUser.phone) phoneElement.classList.add("hidden");
        else phoneElement.classList.remove("hidden");
        if (!currentUser.occupation) occupationElement.classList.add("hidden");
        else occupationElement.classList.remove("hidden");
    } else {
        window.location.href = "../../LogInPage/index.html";
    }
}

// Hàm validation cho số điện thoại (giữ nguyên phiên bản đơn giản)
function validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[\d\s-]{10,15}$/; // Kiểm tra số điện thoại cơ bản (10-15 chữ số, có thể có +)
    return phoneRegex.test(phone.trim());
}

// Mở modal chỉnh sửa thông tin
document.getElementById("edit-profile-btn").addEventListener("click", function() {
    const modal = document.getElementById("edit-profile-modal");
    const usernameInput = document.getElementById("edit-username");
    const emailInput = document.getElementById("edit-email");
    const phoneInput = document.getElementById("edit-phone");
    const occupationInput = document.getElementById("edit-occupation");

    // Lưu giá trị ban đầu để reset (không dùng nút reset trong phiên bản này)
    initialUserData = {
        username: currentUser.username || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        occupation: currentUser.occupation || ""
    };

    usernameInput.value = initialUserData.username;
    emailInput.value = initialUserData.email;
    phoneInput.value = initialUserData.phone;
    occupationInput.value = initialUserData.occupation;
    modal.classList.remove("hidden");
});

// Hủy bỏ chỉnh sửa
document.getElementById("cancel-edit-btn").addEventListener("click", function() {
    const modal = document.getElementById("edit-profile-modal");
    modal.classList.add("hidden");
});

// Lưu thay đổi thông tin
document.getElementById("edit-profile-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const newUsername = document.getElementById("edit-username").value.trim();
    const newEmail = document.getElementById("edit-email").value.trim();
    const newPhone = document.getElementById("edit-phone").value.trim();
    const newOccupation = document.getElementById("edit-occupation").value.trim();

    // Validation
    if (!newUsername) {
        alert("Please enter a username!");
        return;
    }
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        alert("Please enter a valid email address!");
        return;
    }
    if (newPhone && !validatePhoneNumber(newPhone)) {
        alert("Please enter a valid phone number (e.g., 0909090909 or +84909090909)!");
        return;
    }

    // Xác nhận trước khi lưu
    if (confirm("Bạn có chắc muốn thay đổi thông tin?")) {
        // Cập nhật thông tin người dùng
        currentUser.username = newUsername;
        currentUser.email = newEmail;
        currentUser.phone = newPhone || currentUser.phone; // Giữ nguyên nếu không thay đổi
        currentUser.occupation = newOccupation || currentUser.occupation; // Giữ nguyên nếu không thay đổi
        localStorage.setItem("user", JSON.stringify(currentUser));

        // Cập nhật giao diện
        displayUserProfile();

        // Ẩn modal
        const modal = document.getElementById("edit-profile-modal");
        modal.classList.add("hidden");
    }
});

// Gọi hàm hiển thị thông tin người dùng khi trang tải
document.addEventListener("DOMContentLoaded", function() {
    displayUserProfile();

    // ... (giữ nguyên các sự kiện toggle sidebar, v.v.) ...
});

// ... (giữ nguyên các hàm còn lại như logout, renderComments, v.v.) ...

// Load projects khi trang tải xong
window.onload = loadProducts;
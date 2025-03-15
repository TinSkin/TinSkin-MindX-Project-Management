// Kiểm tra đăng nhập & phân quyền
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    window.location.href = "../../LogInPage/index.html";
} else {
    const loggedUsername = document.getElementById('logged-in-username');
    const loggedEmail = document.getElementById('logged-in-email');
    if (loggedUsername && loggedEmail) {
        loggedUsername.innerHTML = user.username;
        loggedEmail.innerHTML = user.email;
    }
}

// Biến toàn cục
let allProducts = JSON.parse(localStorage.getItem("projects")) || [];
let replyingToCommentIndex = null;

// Load sản phẩm từ projects.json
async function loadProducts() {
    try {
        const response = await fetch('../Leader/projects.json');
        const jsonData = await response.json();
        let storedProjects = JSON.parse(localStorage.getItem("projects")) || [];

        const mappedJsonData = jsonData.map((project, index) => ({
            ...project,
            id: project.id || index.toString(),
            feedback: parseInt(project.feedback) || 0
        }));

        let mergedProjects = [...new Map([...mappedJsonData, ...storedProjects].map(item => [item.title || item.nameProduct, item])).values()];

        if (storedProjects.length === 0) {
            localStorage.setItem("projects", JSON.stringify(mergedProjects));
        }

        allProducts = mergedProjects;

        if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
            const productList = document.getElementById("product-list");
            const projectGrid = document.getElementById("project-grid");
            if (productList && projectGrid) {
                productList.classList.remove("hidden");
                renderProducts();
                if (user && user.role === "admin") {
                    document.getElementById("admin-panel")?.classList.remove("hidden");
                    document.getElementById("product-list")?.classList.add("hidden");
                }
            } else {
                console.error("Không tìm thấy product-list hoặc project-grid trên index.html!");
            }
        } else if (window.location.pathname.includes("product-detail.html")) {
            if (allProducts.length > 0) {
                loadProductDetail();
            } else {
                console.error("Dữ liệu sản phẩm chưa được tải!");
            }
        } else if (window.location.pathname.includes("user_profile.html")) {
            displayUserProfile();
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

// Hiển thị danh sách sản phẩm
function renderProducts(products = allProducts) {
    const productList = document.getElementById('project-grid');
    if (!productList) {
        console.error("Không tìm thấy phần tử project-grid!");
        return;
    }
    productList.innerHTML = '';
    products.forEach((project, index) => {
        const productCard = `
            <div class="bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg p-4 w-full mb-5 flex flex-col min-h-[300px]">
                <div class="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                    <h2 class="text-lg sm:text-xl font-bold truncate flex-1">${project.title || project.nameProduct || 'No Title'}</h2>
                    <span class="bg-green-100 text-green-700 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-0.5 rounded-full ${project.status === 'Offtrack' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">${project.status || 'Unknown'}</span>
                </div>
                <div class="flex-1 mt-3">
                    <p class="text-gray-600 text-sm sm:text-base line-clamp-4">${project.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}</p>
                </div>
                <p class="text-red-600 font-semibold mt-3 text-sm sm:text-base">Deadline: <span class="font-bold">${project.date || '05 APRIL 2023'}</span></p>
                <div class="flex flex-wrap items-center justify-end mt-4 gap-2">
                    <button onclick="showEditProject(${index})" type="button" class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 text-center">Edit</button>
                    <button onclick="deleteProduct(${index})" type="button" class="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 text-center">Delete</button>
                    <a href="product-detail.html?id=${project.id || index}" class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 text-center">View detail</a>
                </div>
            </div>
        `;
        productList.innerHTML += productCard;
    });
}

// Lưu sản phẩm mới
function saveProduct() {
    const name = document.getElementById("nameProduct").value.trim();
    const description = document.getElementById("description").value.trim();
    const date = document.getElementById("date").value.trim();
    const status = document.getElementById("status").value.trim();
    const team = document.getElementById("team").value.trim();
    const work = document.getElementById("work").value.trim();

    if (!name || !description || !date || !status || !team || !work) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const newProject = {
        nameProduct: name,
        description: description || "No description",
        date: date,
        status: status,
        team: team,
        work: work,
        id: Date.now().toString()
    };

    allProducts.push(newProject);
    localStorage.setItem("projects", JSON.stringify(allProducts));
    renderProducts();
    closeProjectModal();
}

// Xóa sản phẩm
function deleteProduct(index) {
    if (confirm("Do you want to delete this project?")) {
        allProducts.splice(index, 1);
        localStorage.setItem("projects", JSON.stringify(allProducts));
        renderProducts();
    }
}

// Hiển thị modal chỉnh sửa
function showModal() {
    const modal = document.getElementById("crud-modal");
    modal.classList.remove('hidden');
}

// Hiển thị form chỉnh sửa dự án
function showEditProject(index) {
    showModal();
    const projectEditDiv = document.getElementById('button-edit-project');
    projectEditDiv.innerHTML = '';
    const defaultFormatDate = formatBackDate(allProducts[index].date);

    document.getElementById("edit-project-title").value = allProducts[index].title || allProducts[index].nameProduct;
    document.getElementById("edit-project-desc").value = allProducts[index].description;
    document.getElementById("edit-complete-time").value = defaultFormatDate;
    document.getElementById("edit-project-status").value = allProducts[index].status;
    document.getElementById("edit-project-issues").value = allProducts[index].issues || 0;
    document.getElementById("edit-project-team").value = allProducts[index].team || '';

    projectEditDiv.innerHTML = `
        <button onclick="editProject(${index})" class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
            </svg>
            Edit Project
        </button>
    `;
}

// Cập nhật dự án
function editProject(index) {
    const projectTitle = document.getElementById("edit-project-title").value;
    const projectDesc = document.getElementById("edit-project-desc").value;
    const projectCompleteTime = document.getElementById("edit-complete-time").value;
    const projectStatus = document.getElementById("edit-project-status").value;
    const projectIssues = document.getElementById("edit-project-issues").value;
    const projectTeam = document.getElementById("edit-project-team").value;

    const arrayTeam = stringToArrayOfNumbers(projectTeam);
    const formattedDate = formatDate(projectCompleteTime);
    const formattedIssues = stringToNumber(projectIssues);

    if (!projectTitle || !projectDesc || !projectCompleteTime || !projectStatus) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    allProducts[index] = {
        ...allProducts[index],
        title: projectTitle,
        description: projectDesc,
        date: formattedDate,
        status: projectStatus,
        issues: formattedIssues,
        team: arrayTeam
    };

    localStorage.setItem("projects", JSON.stringify(allProducts));
    closeModal();
    renderProducts();
}

// Tìm kiếm sản phẩm
function searchProducts() {
    const searchText = document.getElementById('search-navbar').value.toLowerCase();
    const filteredProducts = allProducts.filter(product =>
        (product.title || product.nameProduct).toLowerCase().includes(searchText)
    );
    renderProducts(filteredProducts);
}

const searchNavbar = document.getElementById("search-navbar");
if (searchNavbar) {
    searchNavbar.addEventListener("input", searchProducts);
}

// Đăng xuất
function logout() {
    localStorage.removeItem("user");
    window.location.href = "../LogInPage/index.html";
}

// Load chi tiết sản phẩm
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    
    const product = allProducts.find(p => p.id == productId);
 
    if (!product) {
        console.error("Không tìm thấy sản phẩm!");
        document.getElementById("product-detail").innerHTML = `<p class="text-red-500">Không tìm thấy sản phẩm với ID: ${productId}</p>`;
        return;
    }

    const productDetail = document.getElementById("product-detail");
    productDetail.innerHTML = `
        <div class="w-full text-left">
            <h2 class="text-3xl font-bold mb-4">${product.title || product.nameProduct || "Không có tiêu đề"}</h2>
            <div class="flex items-center">
                <div class="ml-2 text-gray-600 text-sm">
                    Status: ${product.status || "Không có trạng thái"} <br>
                    Work: ${product.work || "Không có thông tin công việc"}
                </div>
            </div>
            <p class="mt-4 text-gray-600">${product.description || "Không có mô tả"}</p>
        </div>
    `;

    renderComments(productId);
}

// Hiển thị danh sách bình luận
function renderComments(productId) {
    const commentList = document.getElementById("comment-list");
    if (!commentList) return;

    commentList.innerHTML = "";
    const comments = JSON.parse(localStorage.getItem(`comments_${productId}`)) || [];
    const currentUser = JSON.parse(localStorage.getItem("user"));

    comments.forEach((comment, index) => {
        const replyButton = currentUser && currentUser.role === "admin" ? `
            <button onclick="showReplyForm(${index})" class="mt-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition duration-200">Trả lời</button>
        ` : '';
        commentList.innerHTML += `
            <div class="bg-white p-4 rounded-lg mb-4 shadow-sm border border-gray-200">
                <div class="flex items-start justify-between">
                    <div class="flex items-center">
                        
                        <div>
                            <p class="font-semibold text-gray-800">${comment.username}</p>
                            <p class="mt-1 text-gray-600">${comment.text}</p>
                            <p class="text-sm text-gray-500 mt-1">${new Date(comment.date || Date.now()).toLocaleString()}</p>
                        </div>
                    </div>
                    ${replyButton}
                </div>
                ${comment.replies && comment.replies.length > 0 ? `
                    <div class="mt-3 ml-4">
                        ${comment.replies.map(reply => `
                            <div class="bg-gray-50 p-3 rounded-lg mt-2 border-l-4 border-blue-200 flex items-start">
                                
                                <div>
                                    <p class="text-sm font-medium text-gray-700">Trả lời từ ${reply.by}</p>
                                    <p class="text-gray-600 mt-1">${reply.text}</p>
                                    <p class="text-sm text-gray-500 mt-1">${new Date(reply.date || Date.now()).toLocaleString()}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    });
}

// Gửi bình luận
function submitReview() {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập để gửi bình luận!");
        window.location.href = "../LogInPage/index.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    const comment = document.getElementById("comment").value.trim();
    if (!comment) {
        alert("Vui lòng nhập bình luận!");
        return;
    }

    const comments = JSON.parse(localStorage.getItem(`comments_${productId}`)) || [];
    comments.push({
        username: currentUser.username,
        text: comment,
        date: new Date().toISOString(),
        replies: []
    });

    localStorage.setItem(`comments_${productId}`, JSON.stringify(comments));

    const productIndex = allProducts.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        allProducts[productIndex].feedback = comments.length;
        localStorage.setItem("projects", JSON.stringify(allProducts));
    }

    document.getElementById("comment").value = "";
    renderComments(productId);
    loadProductDetail();
    alert("Bình luận đã được gửi thành công!");
}

// Hiển thị form trả lời
function showReplyForm(commentIndex) {
    replyingToCommentIndex = commentIndex;
    const replyForm = document.getElementById("reply-form");
    replyForm.classList.remove("hidden");
    document.getElementById("reply-text").value = "";
}

// Ẩn form trả lời
function hideReplyForm() {
    const replyForm = document.getElementById("reply-form");
    replyForm.classList.add("hidden");
    replyingToCommentIndex = null;
}

// Gửi phản hồi
function submitReply() {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser || currentUser.role !== "admin") {
        alert("Chỉ admin mới có thể gửi phản hồi!");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const replyText = document.getElementById("reply-text").value.trim();

    if (!replyText) {
        alert("Vui lòng nhập phản hồi!");
        return;
    }

    const comments = JSON.parse(localStorage.getItem(`comments_${productId}`)) || [];
    if (replyingToCommentIndex !== null && comments[replyingToCommentIndex]) {
        comments[replyingToCommentIndex].replies = comments[replyingToCommentIndex].replies || [];
        comments[replyingToCommentIndex].replies.push({
            by: currentUser.username,
            text: replyText,
            date: new Date().toISOString()
        });
    }

    localStorage.setItem(`comments_${productId}`, JSON.stringify(comments));
    hideReplyForm();
    renderComments(productId);
    alert("Phản hồi đã được gửi thành công!");
}

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

        if (!currentUser.phone) phoneElement.classList.add("hidden");
        else phoneElement.classList.remove("hidden");
        if (!currentUser.occupation) occupationElement.classList.add("hidden");
        else occupationElement.classList.remove("hidden");
    } else {
        window.location.href = "../../LogInPage/index.html";
    }
}

// Validation số điện thoại
function validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    return phoneRegex.test(phone.trim());
}

// Mở modal chỉnh sửa thông tin
document.addEventListener("DOMContentLoaded", function() {
    const editProfileBtn = document.getElementById("edit-profile-btn");
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", function() {
            const modal = document.getElementById("edit-profile-modal");
            const usernameInput = document.getElementById("edit-username");
            const emailInput = document.getElementById("edit-email");
            const phoneInput = document.getElementById("edit-phone");
            const occupationInput = document.getElementById("edit-occupation");

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
    }

    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", function() {
            const modal = document.getElementById("edit-profile-modal");
            modal.classList.add("hidden");
        });
    }

    const editProfileForm = document.getElementById("edit-profile-form");
    if (editProfileForm) {
        editProfileForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const newUsername = document.getElementById("edit-username").value.trim();
            const newEmail = document.getElementById("edit-email").value.trim();
            const newPhone = document.getElementById("edit-phone").value.trim();
            const newOccupation = document.getElementById("edit-occupation").value.trim();

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

            if (confirm("Bạn có chắc muốn thay đổi thông tin?")) {
                currentUser.username = newUsername;
                currentUser.email = newEmail;
                currentUser.phone = newPhone || currentUser.phone;
                currentUser.occupation = newOccupation || currentUser.occupation;
                localStorage.setItem("user", JSON.stringify(currentUser));
                displayUserProfile();
                const modal = document.getElementById("edit-profile-modal");
                modal.classList.add("hidden");
            }
        });
    }

    const sidebarToggle = document.querySelector('[data-drawer-toggle="logo-sidebar"]');
    const sidebar = document.getElementById('logo-sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
});

let currentUser = JSON.parse(localStorage.getItem("user")) || { username: "Guest", email: "guest@example.com" };
let initialUserData = {};

// Mở modal tạo dự án
function openProjectModal() {
    document.getElementById("project-modal").classList.remove("hidden");
}

// Đóng modal tạo dự án
function closeProjectModal() {
    document.getElementById("project-modal").classList.add("hidden");
}

// Đóng modal chỉnh sửa
function closeModal() {
    const modal = document.getElementById("crud-modal");
    modal.classList.add("hidden");
}

// Chuyển chuỗi thành mảng số
function stringToArrayOfNumbers(str) {
    if (!str) return [];
    const stringArray = str.split(',').map(item => parseInt(item.trim())).filter(item => !isNaN(item));
    return stringArray;
}

// Chuyển chuỗi thành số
function stringToNumber(str) {
    if (typeof str !== 'string' || str.trim() === '') return NaN;
    const num = Number(str.trim());
    return isNaN(num) ? NaN : num;
}

// Định dạng ngày
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatBackDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

window.onload = loadProducts;
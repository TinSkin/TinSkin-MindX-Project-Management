// Get user key from local storage & Check if user is log in
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

//! Load & Render List Projects
let list_projects = JSON.parse(localStorage.getItem("projects")) || [];

const projectsPerPage = 6;
let currentPage = 1;

// Render project cards based on page
async function loadProjectsList() {
    try {
        const response = await fetch('../projects.json');
        const json_data = await response.json();

        let stored_projects = JSON.parse(localStorage.getItem("projects")) || []

        let merged_projects = [...new Map([...json_data, ...stored_projects].map(project => [project.title, project])).values()];

        if (stored_projects.length === 0) {
            localStorage.setItem("projects", JSON.stringify(merged_projects));
        }

        list_projects = merged_projects;
        if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
            console.log("TEST A")
            if (user && user.role === "admin") {
                console.log("TEST B")
                renderAdminProjects() // Update Project Management Of Admin
            }
            if (window.location.pathname.includes("project-detail.html")) {
                console.log("TEST C")
                if (list_projects.length > 0) {
                    console.log("TEST D")
                    loadProjectDetail();
                } else {
                    console.error("Dữ liệu sản phẩm chưa được tải!");
                }
            }
        }
    } catch (error) {
        console.log('Fail to retrieve data:', error)
    }
}

// Render Admin Projects
function renderAdminProjects() {

    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';

    const start = (currentPage - 1) * projectsPerPage;
    const end = start + projectsPerPage;
    const paginatedProjects = list_projects.slice(start, end);

    // console.log("START: ", start, " END: ", end, " PAG: ", paginatedProjects)

    paginatedProjects.forEach((project, index) => {
        // console.log(project)
        projectsGrid.innerHTML += `
            <div class="project-card">
                <div class="card-header">
                    <div>
                        <button onclick="showEditProject(${project.id - 1})" type="button" class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2 ml-1 edit-button">Edit</button>
                        <button onclick="deleteProject(${project.id - 1})" type="button" class="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2 edit-button">Delete</button>
                    </div>
                    
                    <a href="./project-detail.html?id=${project.id - 1}" class="font-semibold">${project.title} 
                    </a>
                    
                    ${project.status == "Offtrack" ? `<span class="red-badge">${project.status}</span>` : `<span class="green-badge">${project.status}</span>`}
                </div>
                <p class="project-description">
                    ${project.description}
                </p>
                <div class="card-footer">
                    <div class="footer-left">
                        <span class="date-icon">⏳</span> ${project.date}
                        <div class="avatars">
                        ${project.team.map(num => `<img src="https://i.pravatar.cc/30?img=${num}" alt="avatar">`).join('')}
                        </div>
                    </div>
                    <div class="footer-right">
                        <span class="issues-icon">🗂️</span> ${project.feedback} issues
                    </div>
                </div>
            </div>
        `
    });

    renderPagination();
}

// Load chi tiết project
function loadProjectDetail() {
    console.log("TEST")
    const url_params = new URLSearchParams(window.location.search);
    const project_id = url_params.get("id");

    // const project = list_projects[project_id];
    const project = list_projects.find(p => p.id === (project_id + 1));;
    // productId được dùng để lấy thông tin project từ mảng list_projects (dữ liệu sản phẩm đã được tải từ trước). 
    // Mảng list_projects được lưu trữ theo chỉ mục là id của project.
    if (!project) {
        console.error("Không tìm thấy sản phẩm!");
        return;
    }

    const project_detail = document.getElementById("project-detail");
    project_detail.innerHTML = `
        <div class="flex">
            <h1>${project.title}</h1>
        </div>
    `;
}

// Render pagination buttons
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const pageCount = Math.ceil(list_projects.length / projectsPerPage);

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.addEventListener('click', () => {
            currentPage = i;
            renderAdminProjects();
            renderPagination();
        });
        pagination.appendChild(button);
    }
}

// Format Date
function formatDate(input_date) {
    const date = new Date(input_date);
    const day = String(date.getDate()).padStart(2, '0');
    const month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = month_names[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

function formatBackDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

//! CRUD Project
// CREATE Project
function createProject(e) {
    const project_id = document.getElementById("create-project-id").value;
    const project_name = document.getElementById("create-project-name").value;
    const project_title = document.getElementById("create-project-title").value;
    const project_desc = document.getElementById("create-project-desc").value;
    const project_complete_time = document.getElementById("create-complete-time").value;
    const project_status = "Offtrack"
    const project_feedback = "0"
    const project_team = []

    const formatted_date = formatDate(project_complete_time);

    const new_project_id = list_projects.length + 1

    // // Lấy giá trị của các input trong form:
    // // edit - id: ID sản phẩm(nếu chỉnh sửa, sẽ có giá trị ID).
    // // product - name: Tên sản phẩm.
    // // product - image: Link hình ảnh sản phẩm.
    // // product - price: Giá sản phẩm.

    if (project_name === "" || project_title === "" || project_desc === "" || project_complete_time === "") {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    // // Nếu bất kỳ trường nào bị bỏ trống, thông báo lỗi "Vui lòng nhập đầy đủ thông tin!" sẽ xuất hiện.
    // // return; giúp dừng hàm ngay lập tức, tránh lưu dữ liệu sai.

    if (project_id) {
        list_projects[project_id] = { id: project_id, nameProduct: project_name, feedback: project_feedback, title: project_title, description: project_desc, date: formatted_date, status: project_status, team: project_team };
        // Nếu có giá trị id, nghĩa là project đã tồn tại và cần được cập nhật.
        // Dữ liệu cập nhật ngay vào -danh sách list_projects.
    } else {
        list_projects.push({ id: new_project_id, nameProduct: project_name, feedback: project_feedback, title: project_title, id: new_project_id, description: project_desc, date: formatted_date, status: project_status, team: project_team });
        // Nếu không có id, nghĩa là thêm sản phẩm mới vào danh sách.
        // Dùng.push() để thêm project mới.
    }

    localStorage.setItem("projects", JSON.stringify(list_projects));
    // // Chuyển danh sách list_projects thành chuỗi JSON và lưu vào localStorage.
    // // Giúp lưu lại project ngay cả khi tải lại trang.
    renderAdminProjects();

    // renderAdminProjects(): Cập nhật bảng quản lý project dành cho Admin.
    // renderProjects(): Cập nhật danh sách projects trên trang chính.
    e = e || window.event;
    e.preventDefault();
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

// DELETE Project
function deleteProject(index) {
    if (confirm("Do you want to delete this project?")) {
        // Hiển thị hộp thoại xác nhận xóa.
        // Nếu người dùng chọn OK, tiếp tục xóa project.
        list_projects.splice(index, 1);
        // splice(index, 1): Xóa project tại vị trí index khỏi mảng list_projects.

        localStorage.setItem("projects", JSON.stringify(list_projects));
        // Lưu danh sách list_projects mới vào localStorage để cập nhật dữ liệu.
        renderAdminProjects();
        // renderAdminProjects(): Cập nhật bảng quản lý project Admin.
        // renderProject() : Cập nhật danh sách project trên trang chính.
    }
}

// UPDATE Project
function showEditProject(index) {
    showModal()

    // console.log("SHOW EDIT PROJECT ", index)

    const project_edit_div = document.getElementById('button-edit-project');
    project_edit_div.innerHTML = '';

    const default_format_date = formatBackDate(list_projects[index].date);

    // Gán index vào ô edit - id.
    // Giúp xác định project nào đang chỉnh sửa.
    document.getElementById("edit-project-name").value = list_projects[index].nameProduct;
    document.getElementById("edit-project-title").value = list_projects[index].title;
    document.getElementById("edit-project-desc").value = list_projects[index].description;
    document.getElementById("edit-complete-time").value = default_format_date;
    document.getElementById("edit-project-status").value = list_projects[index].status;
    document.getElementById("edit-project-feedback").value = list_projects[index].feedback;
    document.getElementById("edit-project-team").value = list_projects[index].team;


    // Điền dữ liệu của project tại index vào các ô nhập(input).
    // Người dùng có thể sửa lại thông tin.

    project_edit_div.innerHTML = `
        <button onclick="editProject(${index}, event)"
            class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clip-rule="evenodd"></path>
            </svg>
            Edit Project
        </button>
    `
}

function stringToArrayOfNumbers(str) {
    if (!str) {
        return; // Return an empty array for empty or null input
    }

    const stringArray = str.split(','); // Split the string into an array of strings
    const numberArray = stringArray.map(item => {
        const num = parseInt(item.trim()); // Parse each string as an integer, trim whitespace
        return isNaN(num) ? null : num; // Return null if not a number, otherwise return number
    }).filter(item => item !== null); // Remove null values

    return numberArray;
}

function stringToNumber(str) {
    if (typeof str !== 'string') {
        return NaN; // Return NaN if input is not a string
    }

    const trimmedStr = str.trim(); // Remove leading/trailing whitespace
    if (trimmedStr === '') {
        return NaN; // Return NaN for empty strings after trimming
    }

    const num = Number(trimmedStr); // Try to convert the string to a number

    if (isNaN(num)) {
        return NaN; // Return NaN if the conversion fails
    }

    return num; // Return the converted number
}

function editProject(index, e) {
    e.preventDefault()
    console.log("EDIT PROJECT: ", index)
    const project_name = document.getElementById("edit-project-name").value;
    const project_title = document.getElementById("edit-project-title").value;
    const project_desc = document.getElementById("edit-project-desc").value;
    const project_complete_time = document.getElementById("edit-complete-time").value;
    const project_status = document.getElementById("edit-project-status").value;
    const project_feedback = document.getElementById("edit-project-feedback").value;
    const project_team = document.getElementById("edit-project-team").value;


    console.log(document.getElementById("edit-project-name").value)
    console.log(document.getElementById("edit-project-title").value)
    console.log(document.getElementById("edit-project-desc").value)
    console.log(document.getElementById("edit-project-status").value)
    console.log(document.getElementById("edit-project-feedback").value)
    console.log(document.getElementById("edit-project-team").value)

    const new_team = project_team.split(",");
    console.log(new_team)

    // Format Value
    const formatted_date = formatDate(project_complete_time);

    if (project_name === "" || project_title === "" || project_desc === "" || project_complete_time === "" || project_status === "") {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const project_id = index + 1

    if (project_id) {
        list_projects[index] = { id: project_id, nameProduct: project_name, feedback: project_feedback, title: project_title, description: project_desc, date: formatted_date, status: project_status, team: new_team };
    } else {
        list_projects.push({ id: project_id, nameProduct: project_name, feedback: project_feedback, title: project_title, description: project_desc, date: formatted_date, status: project_status, team: new_team });
    }


    console.log(list_projects[index])
    console.log(list_projects)
    // if (new_id) {
    //     list_projects[index] = { nameProduct: project_name, feedback: project_issuses, title: project_title, description: project_desc, date: formatted_date, status: project_status, team: array_team };
    //     // Nếu có giá trị id, nghĩa là project đã tồn tại và cần được cập nhật.
    //     // Dữ liệu cập nhật ngay vào -danh sách list_projects.
    // } else {
    //     list_projects.push({ id: new_id, nameProduct: project_name, feedback: project_issuses, title: project_title, description: project_desc, date: formatted_date, status: project_status, team: array_team });
    //     // Nếu không có id, nghĩa là thêm project mới vào danh sách.
    //     // Dùng.push() để thêm project mới.
    // }

    // localStorage.setItem("projects", JSON.stringify(list_projects));
    // // Chuyển danh sách list_projects thành chuỗi JSON và lưu vào localStorage.
    // // Giúp lưu lại project ngay cả khi tải lại trang.
    renderAdminProjects();
    // renderAdminProjects(): Cập nhật bảng quản lý project dành cho Admin.

    e = e || window.event;
    e.preventDefault();
}

// Log out function
function logout() {
    localStorage.removeItem("user");
    // localStorage.removeItem("projects");
    localStorage.removeItem("staffs");
    window.location.href = "../../LogInPage/index.html";
}

// Initialize page
window.onload = loadProjectsList;


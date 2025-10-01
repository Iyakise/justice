// import saveStaff from './api.js';
//import all functions from api.js
import * as api from './api';
import validateInput from './validateInput.js';
import { loadGet } from './load';
// import updateStaffRecord from './updateStaffRecord.js';
// import delDept from './selector.js';
// import delDept from './selector.js';

// Project URL Resolver

export function getProjectUrl() {
    let { protocol, host } = window.location;

    if (host.includes("localhost")) {
        return protocol + "//" + host + "/moj/";
    } else {
        return protocol + "//" + host + "/";
    }
}

// Root constant
export const __ROOT__ = getProjectUrl();


// Loader function
export async function __LOADER__(returndata, type, pge, token, callback) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds
        // console.log(pge)
        pge  == 'dashboard' ? 'index' : pge;
        if(pge === 'dashboard')pge = 'index';

        const request = await fetch(`${__ROOT__}asset/__LOADER__/${pge}${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        
        // const dataFetch = await request.text();

        if(request.status !== 200 && request.status !== 201){
           
            let errorObject = await request.json();

            if('type' in errorObject && errorObject.type === 'authentication'){
                // Handle authentication error
                showToast(errorObject.message || "Authentication error. Please log in again.", "error");
                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = `${__ROOT__}staff-ms/login.html`;
                }, 3000);

                return;
            }

            //check if permision is denied then load dashboard
            if('type' in errorObject && errorObject.type === 'permission'){
                // Handle permission error
                showToast(errorObject.message || "Permission denied. Redirecting to dashboard.", "error");
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = `${__ROOT__}staff-ms/`;
                }, 3000);
            }

            return;
        }

        if (!request.ok) {
            throw new Error(`Server Error while loading ${pge}: ${request.status}`);
        }
        // console.log(await request.status)
        const response = await request.text();
        returndata.innerHTML = response;

        initialiazeFunctions(pge);

        if (callback) callback();

    } catch (e) {
        showToast(e.message || e, "error", 3000);
        // console.log(e);
    }
}

// Loader function
// export async function __LOADER__COMMI(returndata, type, pge, token, callback) {
//     try {
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds
//         // console.log(pge)
//         pge  == 'dashboard' ? 'index' : pge;
//         if(pge === 'dashboard')pge = 'index';

//         const request = await fetch(`${__ROOT__}asset/__LOADER__/COMMI/${pge}${type}`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Bearer ' + token
//             },
//             signal: controller.signal
//         });

//         clearTimeout(timeoutId);

//         if (!request.ok) {
//             throw new Error(`Server Error while loading ${pge}: ${request.status}`);
//         }

//         const response = await request.text();
//         returndata.innerHTML = response;

//         initialiazeFunctionsComm(pge);

//         if (callback) callback();

//     } catch (e) {
//         showToast(e.err.message || e, "error", 3000);
//     }
// }



// Toast function
// export function showToast(message, type = "info", duration = 3000) {
//     let toast = document.createElement("div");
//     toast.className = `toast ${type}`;
//     toast.innerText = message;

//     document.body.appendChild(toast);

//     setTimeout(() => {
//         toast.classList.add("show");
//     }, 100);

//     setTimeout(() => {
//         toast.classList.remove("show");
//         setTimeout(() => toast.remove(), 400);
//     }, duration);
// }

// export function showToast(message, type = "info", duration = 3000) {
//     let toast = document.createElement("div");
//     toast.className = `toast ${type}`;
//     toast.innerText = message;

//     document.body.appendChild(toast);

//     // Delay for CSS transition
//     setTimeout(() => {
//         toast.classList.add("show");
//     }, 100);

//     let hideTimeout = setTimeout(hideToast, duration);

//     // Pause when hovering
//     toast.addEventListener("mouseenter", () => {
//         clearTimeout(hideTimeout);
//     });

//     // Resume when mouse leaves
//     toast.addEventListener("mouseleave", () => {
//         hideTimeout = setTimeout(hideToast, duration);
//     });

//     function hideToast() {
//         toast.classList.remove("show");
//         setTimeout(() => toast.remove(), 400); // wait for fade out transition
//     }
// }

export function showToast(message, type = "info", duration = 3000) {
    // Create toast container if it doesn't exist
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    // Create toast element
    let toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    // Delay for CSS transition
    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    let hideTimeout = setTimeout(hideToast, duration);

    // Pause on hover
    toast.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
    });

    // Resume on mouse leave
    toast.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(hideToast, duration);
    });

    function hideToast() {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }
}



export function selector(d){
    /*
    * Select a single element
    * @param {string} d - The selector string
    * @returns {Element|null} - The matching element or null
    */
    return document.querySelector(d);
}

export function selectorAll(d){
    /*
    @param {string} d - The selector string
    @returns {NodeList} - The list of elements matching the selector
    */
    return document.querySelectorAll(d);
}

export function newElement(t){
    /*
    @param {string} t - The type of element to create (e.g., 'div', 'span')
    @returns {Element} - The newly created element
    */
    return document.createElement(t);
}


export function initialiazeFunctions(p){
    // console.log('Initializing functions for page:', p);
    p = p.toLowerCase();
    switch(p){
      case 'index':
        ( async () =>{
        try{
            const rcstf = selector('#rs3ffasff1');
            const rcase = selector('#rc232232ffs');
            const rcDep = selector('#rd34aaff3');
            const rcLog = selector('#ralfa334ff34f');

            const all5 = await api.get5all();
            // console.log(all5);

            //recent start
            if(!'recent_users' in all5 && all5.recent_users.length ===0){
                rcstf.innerHTML = `<li>No recent staff found</li>`;
                
            }else{
                rcstf.innerHTML = ''; //clearout previous data
                all5.recent_users.forEach((user, i) => {
                    let li = newElement('li');
                        li.innerHTML = `
                            ${user.full_name}
                        `;
                    rcstf.appendChild(li); //return to parent element
                })
            }

            //recent cases
            if(!'recent_cases' in all5 && all5.recent_cases.length ===0){
                rcase.innerHTML = `<li>No recent case found</li>`;
                
            }else{
                rcase.innerHTML = ''; //clearout previous data
                all5.recent_cases.forEach((cs, i) => {
                    let li = newElement('li');
                        li.innerHTML = `
                            ${cs.case_number}
                        `;
                    rcase.appendChild(li); //return to parent element
                })
            }

            //recent departments
            if(!'recent_departments' in all5 && all5.recent_departments.length ===0){
                rcDep.innerHTML = `<li>No recent case found</li>`;
                
            }else{
                rcDep.innerHTML = ''; //clearout previous data
                all5.recent_departments.forEach((dp, i) => {
                    let li = newElement('li');
                        li.innerHTML = `
                            ${dp.title}
                        `;
                    rcDep.appendChild(li); //return to parent element
                })
            }


            //recent logs activity
            if(!'recent_activity_logs' in all5 && all5.recent_activity_logs.length ===0){
                rcLog.innerHTML = `<li>No recent case found</li>`;
                
            }else{
                rcLog.innerHTML = ''; //clearout previous data
                all5.recent_activity_logs.forEach((log, i) => {
                    let li = newElement('li');
                        li.innerHTML = `
                            ${log.action}
                        `;
                    rcLog.appendChild(li); //return to parent element
                })
            }


    let QuickLink = selectorAll('#quickLink');
        QuickLink.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // if(link.getAttribute('data-action') === )
                const action = link.getAttribute("data-action");

   // Remove highlight from all sidebar links
//    console.log(document.querySelectorAll(".sdbar"))
    selectorAll(".sdbar").forEach(link => {
        link.classList.remove("moj-active-tab");

        if(link.getAttribute('data-page') === action)link.classList.add('moj-active-tab');
    });

            window.location.hash = `${link.getAttribute('data-action')}/moj/${link.getAttribute('data-action')}`;


                __LOADER__(selector('.__MOJ_MAIN__'),
                '.html', 
                link.getAttribute('data-action'),
                '',
                function(){
                    // alert('Loaded')
                    showToast('Quick link successfully load ' + link.getAttribute('data-action'))
                })

        // selectorAll('.sdbar').for




            })
        })


        }catch(e){
            showToast(e || 'Dashboard statistics fail to load, Logout and try again', 'info');
        }


            const dbstats = await api.dashboardStats();

            // document.addEventListener('DOMContentLoaded', function () {
  // ===== Activity Overview (Doughnut) =====
        const actCtx = document.getElementById('activityChart').getContext('2d');
        new Chart(actCtx, {
            type: 'doughnut',
            data: {
            labels: ['Staff Added', 'Cases Registered', 'Departments Created', 'Case Updates', 'Logins'],
            datasets: [{
                data: [dbstats.total_users, dbstats.cases_registered, dbstats.total_departments, dbstats.cases_updated, dbstats.total_logins], // <- replace with your real counts
                backgroundColor: ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
                borderWidth: 0
            }]
            },
            options: {
            responsive: true,
            cutout: '55%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { mode: 'index', intersect: false }
            }
            }
        });

  // ===== Cases Per Month (Line) =====
   const cStats = await api.caseStatistics();
//    console.log(cStats.1)
  const casesCtx = document.getElementById('casesChart').getContext('2d');
  // Smooth gradient fill under the line
  const gradient = casesCtx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.00)');

        new Chart(casesCtx, {
            type: 'line',
            data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            datasets: [{
                label: 'Cases',
                data: [cStats.Jan, cStats.Feb, cStats.Mar, cStats.Apr, cStats.May, cStats.Jun, cStats.Jul, cStats.Aug, cStats.Sep, cStats.Oct, cStats.Nov, cStats.Dec], // <- replace with your monthly counts
                borderColor: '#2563eb',
                backgroundColor: gradient,
                fill: true,
                tension: 0.55,
                pointRadius: 3,
                pointHoverRadius: 1
            }]
            },
            options: {
            responsive: true,
            maintainAspectRatio: false, // canvas height from your CSS will be respected
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 5 } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            }
            }
        });
})();

      break;

     case 'logout':
    
        // Handle logout functionality
        const logoutBtn = selector('.confirm');
        const cancel = selector('.cancel');
        // console.log(logoutBtn);
                logoutBtn.addEventListener('click', () => {
                    // Perform logout actions
                    window.location.href = __ROOT__ + 'asset/apis/auth/sadmin-logout.php';
                });


        //return where to update ui

        //Handle cancel request then load dashboard
        cancel.addEventListener('click', () => {
            window.location.hash = '#dashboard/moj/dashboard';

            __LOADER__(selector('.__MOJ_MAIN__'),
             '.html', 
             'dashboard',
            '',
            showToast('Logout cancelled', 'info')
        );

        //highlight current tap now after loading dashboard
        //all li a
        const allLinks = document.querySelectorAll('li a');

        allLinks.forEach(link => {
            link.classList.remove('moj-active-tab');
            if (link.getAttribute('data-page').toLowerCase() === 'dashboard') {

                link.classList.add('moj-active-tab');
            }
        });

        });

     break;

     case 'addstaff':
        // Handle add staff functionality
        // console.log('Add Staff Page Loaded' + p);
        const addStaffBtn = selector('.add-staff-form');
        const clearFormBtn = selector('#clear-form-btn');
        const name        = selector('#fullname');
        const email      = selector('#email');
        const phone      = selector('#phone');
        const role       = selector('#role');
        const departments = selector('#department');
        const status     = selector('#status');
        const btn        = selector('#add-staff-btn');

        addStaffBtn.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            // Perform add staff actions
            btn.innerHTML = 'Saving... <i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;
            // console.log(name.value, email.value, phone.value, role.value, departments.value, status.value);
            if(!name.value || !email.value || !phone.value || !role.value || !departments.value || !status.value){
                showToast("Please fill in all fields.", "error");
                btn.innerHTML = 'Save Staff';
                btn.disabled = false;
                return;
            }

            // If all fields are valid, proceed with the API call
          let saveStaffRequest = await api.saveStaff(name.value, email.value, phone.value, role.value, departments.value, status.value); //call function from api.js

           if(saveStaffRequest){
            // Clear form fields
            //get form and reset
                selector('.add-staff-form').reset();
                btn.innerHTML = 'Save Staff';
                btn.disabled = false;

                // Refresh recent staff list
                let recentStaff = await api.getStaff();
                let recentStaffTableBody = selector('.recent-staff-table tbody');
                recentStaffTableBody.innerHTML = ''; // Clear existing rows

                if(!recentStaff || recentStaff.length === 0){
                    recentStaffTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No recent staff found.</td></tr>';
                    return;
                }

                recentStaff.forEach((staff, index) => {
                    let row = newElement('tr');
                    let statusClass = staff.status === 'active' ? 'active' : 'inactive';
                    row.innerHTML = `
                        <td>${staff.full_name}</td>
                        <td>${staff.email}</td>
                        <td>${staff.role}</td>
                        <td>${staff.department}</td>
                        <td><span class="status ${statusClass}">${staff.status}</span></td>
                    `;
                    recentStaffTableBody.appendChild(row);
                });
           }

              btn.innerHTML = 'Save Staff';
              btn.disabled = false;
        });

        //reset form on clear button click
        clearFormBtn.addEventListener('click', () => {
            selector('.add-staff-form').reset();
        });

        //display recent staff
        //self-invoking function async
        (async () => {
            try{
            let recentStaff = await api.getStaff();
            let recentStaffTableBody = selector('.recent-staff-table tbody');
            // console.log(recentStaff);
            if(!recentStaff || recentStaff.length === 0){
                recentStaffTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No recent staff found.</td></tr>';
                return;
            }

            recentStaff.forEach((staff, index) => {
                let row = newElement('tr');
                let statusClass = staff.status === 'active' ? 'active' : 'inactive';
                row.innerHTML = `
                    <td>${staff.full_name}</td>
                    <td>${staff.email}</td>
                    <!--td>${staff.phone}</td-->
                    <td>${staff.department}</td>
                    <td>${staff.role}</td>
                    <td><span class="status ${statusClass}">${staff.status}</span></td>
                `;
                recentStaffTableBody.appendChild(row);
            })

            //load all department
            const allDepartment     = await api.allDepartments();
            const departmentSelect  = selector('#department');
                if(allDepartment.length === 0){
                    departmentSelect.innerHTML  =  `
                        <option value='' disabled>---- No Department found ----</option>
                    `;
                    return;
                }else{
                    //clearout previous options
                    departmentSelect.innerHTML = '';
                    let dpt = newElement('option');
                        dpt.value = '';
                        dpt.innerHTML = '--Select Department--';
                        departmentSelect.appendChild(dpt);

                    allDepartment.forEach((dept, i) => {
                        // console.log(dept)
                        let option = newElement('option');
                            option.value = `${dept.title}`;
                            option.innerHTML = `${dept.title}`;

                        departmentSelect.appendChild(option);
                    })
                }
            
        }catch(e){
            showToast(e || 'Unexpected Error, Please log out and logged in again.', 'error');
        }   

        })();


    break;

    case 'editstaff':
        // Handle manage staff functionality
        // console.log('Manage Staff Page Loaded');
        (async () => {
            let staffData = await api.staff();
            // console.log(staffData.data.department);

            const staffTableBody = selector('.recent-staff-table tbody');
            staffTableBody.innerHTML = ''; // Clear existing rows

            if (!staffData || staffData.data.length === 0) {
                staffTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No staff found.</td></tr>';
                return;
            }

            staffData.data.forEach((staff) => {
                let row = newElement('tr');
                row.innerHTML = `
                    <td>${staff.full_name}</td>
                    <td>${staff.email}</td>
                    <!--<td>${staff.phone}</td>-->
                    <td>${staff.department}</td>
                    <td>${staff.role}</td>
                    <td><span class="status ${staff.status}">${staff.status}</span></td>
                    <td><button class="btn btn-sm btn-primary edit-btn" data-id="${staff.id}">Edit</button></td>
                `;
                staffTableBody.appendChild(row);
            });


            // Add event listeners to edit buttons
            const editButtons = document.querySelectorAll('.edit-btn');
            editButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const staffId = button.getAttribute('data-id');
                    // Handle edit action here
                    showToast(`Edit functionality for staff ID ${staffId} is not implemented yet.`, 'info');
                    // You can implement a popup form to edit staff details
                    api.showPopup(selector('body'), 'beforeend', async() => {
                        const popup = selector('.popup-overlay');
                        // popup.querySelector('h2').innerText = 'Edit Staff - ID ' + staffId;
                        // popup.querySelector('p').innerText = 'Edit functionality is under development.';
                        // You can populate the popup with a form to edit staff details
                        let singleStaffData = await api.singleStaff(staffId);
                        let allDept         = await api.allDepartments();
                       

                        //check and match selected option in role and department
                        let roleOptions = '';
                        let departmentOptions = '';
                        if(singleStaffData.data.role === 'lawyer'){
                            roleOptions = `
                                <option value="lawyer" selected>Lawyer</option>
                                <option value="Ad. staff">Administrative staff</option>
                                <option value="Psecretary">Permanent secretary </option>
                                <option value="Commissioner">Commissioner</option>
                            `;
                        } else if(singleStaffData.data.role === 'Ad. staff'){
                            roleOptions = `
                                <option value="lawyer">Lawyer</option>
                                <option value="Ad. staff" selected>Administrative staff</option>
                                <option value="Psecretary">Permanent secretary </option>
                                <option value="Commissioner">Commissioner</option>
                            `;
                        } else if(singleStaffData.data.role === 'Psecretary'){
                            roleOptions = `
                                <option value="lawyer">Lawyer</option>
                                <option value="Ad. staff">Administrative staff</option>
                                <option value="Psecretary" selected>Permanent secretary </option>
                                <option value="Commissioner">Commissioner</option>
                            `;
                        } else if(singleStaffData.data.role === 'Commissioner'){
                            roleOptions = `
                                <option value="lawyer">Lawyer</option>
                                <option value="Ad. staff">Administrative staff</option>
                                <option value="Psecretary">Permanent secretary </option>
                                <option value="Commissioner" selected>Commissioner</option>
                            `;
                        }

                        //check and match selected option in department
                        //check and match selected option in department



                        popup.innerHTML = `
                            <div class="card">
                                <div class="card-header">
                                    <h2>Edit Staff</h2>
                                    <p>Update the details of the selected staff member below.</p>
                                </div>
                            </div>

                            <div class="card-body">
                                <form class="edit-staff-form">
                                    <div class="form-grid">
                                    <div class="form-group">
                                        <label for="edit-fullname">Full Name</label>
                                        <input type="text" id="edit-fullname" name="fullname" value="${singleStaffData.data.full_name}" >
                                    </div>

                                    <div class="form-group">
                                        <label for="edit-email">Email Address</label>
                                        <input type="email" id="edit-email" name="email" value="${singleStaffData.data.email}" required>
                                    </div>

                                    <div class="form-group">
                                        <label for="edit-phone">Phone Number</label>
                                        <input type="tel" id="edit-phone" name="phone" value="${singleStaffData.data.phone}" required>
                                    </div>

                                    <div class="form-group">
                                        <label for="edit-department">Department</label>
                                        <select id="edit-department" name="department" required>
                                            <option value="">-- Select Department --</option>
                                            
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label for="edit-role">Role</label>
                                        <select id="edit-role" name="role" required>
                                        <option value="">-- Select Role --</option>
                                        ${roleOptions}
                                        <!--
                                        <option value="lawyer">Lawyer</option>
                                        <option value="Ad. staff">Administrative staff</option>
                                        <option value="Psecretary">Permanent secretary </option>
                                        <option value="Commissioner">Commissioner</option>
                                        -->
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label for="edit-status">Status</label>
                                        <select id="edit-status" name="status" required>
                                        <option value="active" selected>Active</option>
                                        <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    </div>

                                    <div class="form-actions">
                                    <button type="button" class="btn-primary __update_user__ btn">Update Staff</button>
                                    <button type="button" class="btn-secondary __cancel__">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        `;
                        popup.dispatchEvent(new Event('popupAdded'));
                        let select          = selector('#edit-department');
                        // let selectOption    = select.options
                        let currentUserDept = singleStaffData.data.department;
                        // console.log(currentUserDept)
                            allDept.forEach(opt => {
                                let option = newElement('option');
                                    option.value = opt.title;
                                    option.innerHTML = opt.title;
                                    if(opt.title === currentUserDept){
                                        option.setAttribute('selected', 'selected');
                                    }
                                select.appendChild(option);
                            })
                    });

                    //
                    /*
                    <option value="Department of legal">Department of Legal Drafting</option>
                    <option value="Department of prosecution">Department of Prosecution</option>
                    <option value="Department of appeals">Department of Appeals</option>
                    <option value="Apex Reel sports">Apex Reel sports</option>
                    <option value="Department of Litigation">Department of Civil Litigation</option>
                    <option value="Department of Administration">Department of Administration</option>
                    <option value="Department of Estate Administration">Department of Estate  Administration</option>
                    <option value="Department of Gender-Based Violence">Department of Sexual and Gender-Based Violence</option>
                    <option value="Department of Account and Finance">Department of Account and Finance</option>
                    <option value="Department of Planning, Research and Statistics">Department of Planning, Research and Statistics</option>
                    
                    
                    */
                    updateStaffRecord(staffId);
                    // updateStaffRecord(staffId, singleStaffData.data.full_name, singleStaffData.data.email, singleStaffData.data.phone, singleStaffData.data.department, singleStaffData.data.role, singleStaffData.data.status);
                });
            });
        })();

    break;

    case 'department':
        // alert('Department Page Loaded');
        // Handle department functionality
        // console.log('Department Page Loaded');
        const deptForm = selector('.add-department-form');
        const deptName = selector('#deptName');
        const deptDesc = selector('#deptDesc');
        const deptBtn  = selector('.btn-submit');

        deptForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            deptBtn.innerHTML = 'Saving... <i class="fas fa-spinner fa-spin"></i>';
            deptBtn.disabled = true;
            if(!deptName.value || !deptDesc.value){
                showToast("Please fill in all fields.", "error");
                deptBtn.innerHTML = 'Add Department';
                deptBtn.disabled = false;
                return;
            }

            // Call the API to add the department
            const success = await api.addDepartment(deptName.value, deptDesc.value);
            if (success) {
                deptName.value = '';
                deptDesc.value = '';
                showToast("Department added successfully!", "success");
                // Optionally, refresh the department list here
                deptForm.reset();
            }
            deptBtn.innerHTML = 'Add Department';
            deptBtn.disabled = false;
        });

        (async () => {
       
            let recentDepartments = await api.last5Department();
            let recentDeptUl = selector('.dept-list');
            recentDeptUl.innerHTML = ''; // Clear existing rows
            // console.log(recentDepartments);
            if(!recentDepartments || recentDepartments.length === 0){
                recentDeptUl.innerHTML = '<li>No recent departments found.</li>';
                return;
            }
            recentDepartments.forEach((dept) => {
                let li = newElement('li');
                li.innerHTML = `
                    <span class="dept-name">${dept.title}</span>
                    <span class="dept-time">Created: ${new Date(dept.created_at).toLocaleString()} </span>
                `;
                recentDeptUl.appendChild(li);
            });
        })();

    break;

    case 'editdepartment':
        // Handle edit department functionality

      
        //display all departments
        //self-invoking function async
        (async () => {
            let departmentsData = await api.allDepartments();
            console.log(departmentsData);    
            const recentDeptUl = selector('.recent-departments ul');
            recentDeptUl.innerHTML = ''; // Clear existing rows

            if(!departmentsData || departmentsData.length === 0){
                recentDeptUl.innerHTML = '<li>No departments found.</li>';
                return;
            }
            departmentsData.forEach((dept) => {
                let li = newElement('li');
                li.innerHTML = `
                    <strong>${dept.title}</strong> - ${new Date(dept.created_at).toLocaleString()} <button class="btn btn-sm btn-primary edit-dept-btn" data-name="${dept.title}" data-id="${dept.id}">Edit</button></li>
                `;
                recentDeptUl.appendChild(li);
            })


            // Add event listeners to edit buttons
            const editDeptButtons = selectorAll('.edit-dept-btn');
            editDeptButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const deptId    = button.getAttribute('data-id');
                    const updateBtn = selector('.btn-update');
                    // Handle edit action here
                    showToast(`You are currently editing '${button.getAttribute('data-name')}'`, 'info');
                    // You can implement a popup form to edit department details

                    let signleDept = await api.singleDepartment(deptId);
                    //populate the form with the department data
                    // console.log(signleDept);
                    let deptTitle       = selector('#deptName');
                    let deptCode        = selector('#deptCode');
                    let deptHead        = selector('#deptHead');
                    let deptDescription = selector('#deptDescription');

                    // console.log(signleDept);
                    // alert(signleDept.department_code)
                    deptTitle.value = signleDept.title;
                    deptCode.value = signleDept.department_code;
                    deptHead.value = signleDept.department_head;
                    deptDescription.value = signleDept.description;

                    updateBtn.setAttribute('data-id', deptId);

                    // Scroll to top to see the form
                    window.scrollTo({ top: 0, behavior: 'smooth' });


                });
            });



            //update single department here
            const updateBtn = selector('.btn-update');
                  updateBtn.addEventListener('click', async (event) =>{
                        event.preventDefault();

                        //check for the missing data id
                        if(!updateBtn.hasAttribute('data-id')){
                            showToast('Please select any departments you want to edit', 'warning');
                            return;
                        }

                        let deptname = selector('#deptName'); //dept name here
                        let deptcode = selector('#deptCode'); //dept code here
                        let depthead = selector('#deptHead'); //dept head here
                        let deptDesc = selector('#deptDescription'); //dept deptDescription here

                        if(deptname.value === ''){showToast('Department name is required', 'error'); return}
                        if(deptDesc.value === ''){showToast('Department description is required', 'error'); return}

                        if(!validateInput(deptname.value, 'text')){
                            showToast('Invalid department name. Only letters, numbers, underscores, and spaces are allowed.', 'error');
                            return;
                        }

                        if(deptcode.value !== '' && !validateInput(deptcode.value, 'text')){
                            showToast('Invalid department code. Only letters, numbers, underscores, and spaces are allowed.', 'error');
                            return;
                        }

                        if(depthead.value !== '' && !validateInput(depthead.value, 'text')){
                            showToast('Invalid department head. Only letters, numbers, underscores, and spaces are allowed.', 'error');
                            return;
                        }

                        if(deptDesc.value !== '' && !validateInput(deptDesc.value, 'text')){
                            showToast('Invalid department description. Only letters, numbers, underscores, and spaces are allowed.', 'error');
                            return;
                        }

                        updateBtn.innerHTML = 'Updating... <i class="fas fa-spinner fa-spin"></i>';
                        updateBtn.disabled = true;

                        let updateDeptRequest = await api.updateDepartment(
                            updateBtn.getAttribute('data-id'),
                            deptname.value,
                            deptDesc.value,
                            depthead.value,
                            deptcode.value
                        );

                        // console.log(updateDeptRequest);
                        if(updateDeptRequest){
                            // Clear form fields
                            //get form and reset
                                selector('#editDepartmentForm').reset();
                                updateBtn.removeAttribute('data-id');
                                updateBtn.innerHTML = 'Update Department';
                                updateBtn.disabled = false;
                                // Refresh recent department list
                                let recentDepartments = await api.allDepartments();
                                let recentDeptUl = selector('.recent-departments ul');
                                recentDeptUl.innerHTML = ''; // Clear existing rows
                                if(!recentDepartments || recentDepartments.length === 0){
                                    recentDeptUl.innerHTML = '<li>No departments found.</li>';
                                    return;
                                }
                                recentDepartments.forEach((dept) => {
                                    let li = newElement('li');
                                    li.innerHTML = `
                                        <strong>${dept.title}</strong> - ${new Date(dept.created_at).toLocaleString()} <button class="btn btn-sm btn-primary edit-dept-btn" data-name="${dept.title}" data-id="${dept.id}">Edit</button></li>
                                    `;
                                    recentDeptUl.appendChild(li);
                                });
                        }

                        updateBtn.innerHTML = 'Update Department';
                        updateBtn.disabled = false;

                  })
            


        })();
    break;

    case 'deletedepartment':

        ( async() =>{
            const allDepartm = await api.allDepartments();
             const recentDepartment = selector('.department-list');
                   recentDepartment.innerHTML = ''; //clearout previous data
             allDepartm.forEach((dept, i) => {
                const wraper = newElement('div');
                      wraper.className = 'department-item';
                      wraper.innerHTML = `
                        <span class="dept-name">${dept.title}</span>
                        <span class="dept-date">Created: ${dept.created_at}</span>
                        <button class="delete-btn" data-id="${dept.id}">Delete</button>
                      `;
                recentDepartment.appendChild(wraper);
                
             })

             delDept(); // Call the delete department function
            //onclick="delDept(event, this)"
        })()

//deparmtn search start here
const deptartSearch = selector('.search-input');
      deptartSearch.addEventListener('input', async() => {

        try{
            const search = await fetch(`${__ROOT__}asset/apis/dept-search.php?Q=${deptartSearch.value}`);

                if(!search.ok){
                    const errorText = await response.json();
                    // showToast(`Server Error: ${errorText}`, "error");
                    // return false;
                    throw new Error(`Unexpected Server Error: ${errorText}`);
                }

            const result = await search.json();
            
            const recentDepartment = selector('.department-list');
            //check if search is found
            if(! 'data' in result && result.status !== true){
                recentDepartment.innerHTML = `
                    <div class="dept-item">
                        <span class="dept-name">No match data found!</span>
                    </div>
                `;

                return;
            }

                let allDepartm = result.data;
                
                if(allDepartm.length === 0){
                    recentDepartment.innerHTML = `
                        <div class="dept-item">
                            <span class="dept-name">No match data found!</span>
                        </div>
                    `;
                    return;
                }


                recentDepartment.innerHTML = ''; //clearout previous data
                allDepartm.forEach((dept, i) => {
                const wraper = newElement('div');
                      wraper.className = 'department-item';
                      wraper.innerHTML = `
                        <span class="dept-name">${dept.title}</span>
                        <span class="dept-date">Created: ${dept.created_at}</span>
                        <button class="delete-btn" data-id="${dept.id}">Delete</button>
                      `;
                    recentDepartment.appendChild(wraper);
                    

                    //onclick="delDept(event, this)"
                    delDept(); // Call the delete department function
             })

        }catch(e){
            showToast(e || 'Department search fail', 'error')
        }
        
      })


    break;


    //ACTIVITY LOGS
    case 'activitylog':
        
      //alert('hello this activity log')
      ( async () => {
        try{
            const request = await fetch(`${__ROOT__}asset/apis/activit-log.php`);

            if(!request.ok){
                throw new Error('Unexpected error prevent activity logs retrieval');
            }

            const result = await request.json();

            // console.log(result);

            //check if it ok
            if(!result.status){
                throw new Error('Fail to get Activity logs');
            }

            const activityLog = selector('.activity-log');
                  if(result.data.length === 0){
                    activityLog.innerHTML = `
                        <li class="activity-item">
                            <div class="activity-left">
                                <div class="activity-icon icon-add">X</div>
                                <div class="activity-text">
                                    <span>NO recent Logs found</span>
                                </div>
                            </div>
                        </li>
                    `;
                    return;
                  }else {

                        activityLog.innerHTML = ''; //clearout previous logs 
                        result.data.forEach((logs, i) =>{
                            let a,b,c,d,e;
                            if(logs.action === "ADD DEPARTMENT" || logs.action === "ADD STAFF" || logs.action === "CASE ADD"){
                                a = 'icon-add';
                                b = '+';
                            }else if(logs.action === "DEPARTMENT UPDATED" || logs.action === "CASE UPDATED"){
                                a = 'icon-edit';
                                b = '✎';
                            }else if(logs.action === "STAFF REMOVED" || logs.action === "DELETE DEPARTMENT" || logs.action === 'STAFF ADD FAIL' || logs.action === 'CASE FAIL'){
                                a = 'icon-delete';
                                b = '✕';
                            }else if(logs.action === "LOGIN_SUCCESS"){
                                a = 'icon-login';
                                b = '⮕';
                            }else if(logs.action === "LOGOUT"){
                                a = 'icon-login';
                                b = '⮟';
                            }else{
                                a = 'icon-delete';
                                b = '✕';
                            }

                            let li = newElement('li');
                                li.className = 'activity-item';
                                li.innerHTML = `
                                    <div class="activity-left">
                                    <div class="activity-icon ${a}">${b}</div>
                                    <div class="activity-text">
                                        <span>${logs.action}</span>
                                        <small>${logs.description}</small>
                                    </div>
                                    </div>
                                    <div class="activity-time">${timeAgo(logs.created_at)}</div>
                                `;
                            activityLog.appendChild(li);
                        })
                  }

            //search activity start here /⬅
            const searchQ = selector('#Searchq');
                  
                  searchQ.addEventListener('input', async () => {

                        try{
                            let qry = searchQ.value;
                                if(!validateInput(qry, 'text'))throw new Error('Invalid data entered: "' + qry + '"');

                            let req = await fetch(`${__ROOT__}asset/apis/search/activity-log.sq.php?query=${qry}`);

                            if(!req.ok){
                                throw new Error('Request to server fail');
                            }
                            let result = await req.json();
                            // console.log(result);
                            if(result.logs.length === 0){
                                activityLog.innerHTML = `
                                    <li class="activity-item">
                                        <div class="activity-left">
                                            <div class="activity-icon icon-delete">X</div>
                                            <div class="activity-text">
                                                <span>No data match!</span>
                                            </div>
                                        </div>
                                    </li>
                                `;
                                return;
                            }

                            activityLog.innerHTML = ''; //clearout previous logs 
                            result.logs.forEach((logs, i) =>{
                            let a,b,c,d,e;
                            // console.log(logs);
                            if(logs.action === "ADD DEPARTMENT" || logs.action === "ADD STAFF" || logs.action === "CASE ADD"){
                                a = 'icon-add';
                                b = '+';
                            }else if(logs.action === "DEPARTMENT UPDATED" || logs.action === "CASE UPDATED"){
                                a = 'icon-edit';
                                b = '✎';
                            }else if(logs.action === "STAFF REMOVED" || logs.action === "DELETE DEPARTMENT"){
                                a = 'icon-delete';
                                b = '✕';
                            }else if(logs.action === "LOGIN_SUCCESS"){
                                a = 'icon-login';
                                b = '⮕';
                            }else if(logs.action === "LOGOUT"){
                                a = 'icon-login';
                                b = '⮟';
                            }

                            let li = newElement('li');
                                li.className = 'activity-item';
                                li.innerHTML = `
                                    <div class="activity-left">
                                    <div class="activity-icon ${a}">${b}</div>
                                    <div class="activity-text">
                                        <span>${logs.action}</span>
                                        <small>${logs.description}</small>
                                    </div>
                                    </div>
                                    <div class="activity-time">${timeAgo(logs.created_at)}</div>
                                `;
                            activityLog.appendChild(li);
                        })


                        }catch(e){
                            showToast(e || 'Unexpected Error, try again later',  'error');
                        }
                  })

        }catch(error){
            showToast(error || 'Unexpected error contact system Administrator', 'error');
        }

      })()

    break;
    
    case 'newcase':
      ( async () => {

        const createCase = selector('.btn');
                createCase.addEventListener('click', (event) => {
                    event.preventDefault();

                    try {
                        let caseTitle = selector('#case-title');
                        let case_number = selector('#case-number');
                        let case_file_by = selector('#filed-by');
                        let case_type = selector('#case-type');
                        let caseAssignTo = selector('#assigned-lawyer');
                        let casecourtDate = selector('#case-courtDte');
                        let caseStatus = selector('#cstatus');
                        let formitSelf = selector('.case-form form');

                        let description  = selector('#case-description');


                        //check and validate name
                        if(!validateInput(caseTitle.value, 'text')) throw new Error("Invalid case title, it contains some unwanted character: " + caseTitle.value);

                        if(!validateInput(case_number.value, 'text')) throw new Error("Invalid case Number, Check and correct it please");
                        if(!validateInput(case_type.value, 'text')) throw new Error("Invalid case Type, Check and correct it please");

                        if(!validateInput(case_file_by.value, 'text')) throw new Error("Invalid file by name, check and try again");
                        if(!validateInput(caseAssignTo.value, 'text')) throw new Error("Invalid assigned lawyer name, check and try again");
                        
                        //if empty
                        if(caseTitle.value === '') throw new Error("Enter case title " + caseTitle.value);
                        if(case_number.value === '') throw new Error("Enter case Number");
                        if(case_file_by.value === '') throw new Error("Enter case filer");
                        if(caseAssignTo.value === '') throw new Error("Enter or select select lawyer assigned to this case");
                        if(description.value === '') throw new Error("Enter case Description");
                        if(caseStatus.value === '') throw new Error("Please Select case status");
                        

                        if(!case_file_by.hasAttribute('case_file_by')) throw new Error("Please choose who file the case");
                        if(!caseAssignTo.hasAttribute('case_assigned_to')) throw new Error("Please Assigned this case to a Lawyer");
                        

                        let saveCase = api.addNewCase(caseTitle.value, case_number.value, case_file_by.getAttribute('case_file_by'), caseAssignTo.getAttribute('case_assigned_to'), description.value, case_type.value, casecourtDate.value);


                            if(saveCase){
                                showToast('You have successfully added new cases to the system', 'success');
                                formitSelf.reset();
                            }

                    } catch (error) {
                        showToast(error || "Unexpected error occur", 'error');
                    }

                })


        //make pop so that admin can select the file by user name
        //from the the system can collect the user id id="filed-by"
        const filby = selector('#filed-by');
              filby.addEventListener('keyup', (event) => {
                event.preventDefault();

                api.showPopup(selector('body'), 'beforeend', async () => {

                    const popup = selector('.popup-overlay');
                        popup.querySelector('h2').innerText = 'File-by user selection';
                        popup.querySelector('p').innerText = 'Select the user name that file the case!';
                            // You can populate the popup with a form to edit staff details

                    //get staff
                    const allStaff = await api.staff();
                    popup.innerHTML =  `
                        <h2>File-by user selection</h2>
                        <p>Select the user name that file the case!</p>
                        <div class="spacer"></div>
                        <div class="modal-actions">
                            <!--[[[
                                DUMP ALL USERS HERE
                            ]]]--->
                            <span class="__LOADER__">
                                <i class="fas fa-spin fa-spinner fa-3x"></i>
                            </span>
                        </div>
                        
                    `;

                    let fileup = selector('.modal-actions');
                        let fileby = selector('#assigned-lawyer').getAttribute('case_assigned_to');
                        let disabled;
                        allStaff.data.forEach((stff, i) => {
                            if(fileby === stff.id) {disabled = 'disabled';}else{disabled = ''}
                            let h3 = newElement('h3');
                                h3.className = '__ppopusers__';
                                h3.innerHTML = `
                                    ${stff.full_name}(${stff.role}) &ndash; <button ${disabled} data-id="${stff.id}" data-name="${stff.full_name}" class="btn selectuser">Select</button></h3>
                                `;
                            fileup.appendChild(h3);
                        })
                        selector('.__LOADER__').remove();


                    //click to setup
                    const btnSetup = selectorAll('.selectuser');
                          btnSetup.forEach((btn, i) => {
                            btn.addEventListener('click', function(){
                                let fileByInput = selector('#filed-by');

                                    fileByInput.value = this.getAttribute('data-name');
                                    fileByInput.setAttribute('case_file_by', this.getAttribute('data-id'));

                                    selector('.popup-container').remove();
                                    document.body.classList.remove('blurred');

                            })
                          })
                })
              })


        //make autofile for lawyere

            const assigned = selector('#assigned-lawyer');
                  assigned.addEventListener('keyup', (event) => {
                event.preventDefault();

                api.showPopup(selector('body'), 'beforeend', async () => {

                    const popup = selector('.popup-overlay');
                        popup.querySelector('h2').innerText = 'Assign case to Lawyer';
                        popup.querySelector('p').innerText = 'Select a lawyer and assigned case';
                            // You can populate the popup with a form to edit staff details

                    //get staff
                    const allStaff = await api.staff();
                          console.log(allStaff);
                    popup.innerHTML =  `
                        <h2>File-by user selection</h2>
                        <p>Select the user name that file the case!</p>
                        <div class="spacer"></div>
                        <div class="modal-actions">
                            <!--[[[
                                DUMP ALL USERS HERE
                            ]]]--->
                            <span class="__LOADER__">
                                <i class="fas fa-spin fa-spinner fa-3x"></i>
                            </span>
                        </div>
                        
                    `;

                    let fileup = selector('.modal-actions');
                    let fileby = selector('#filed-by').getAttribute('case_file_by');
                    let disabled;
                    // alert(filby)
                        allStaff.data.forEach((stff, i) => {
                            if(fileby === stff.id) {disabled = 'disabled';}else{disabled = ''}


                            let h3 = newElement('h3');
                                h3.className = '__ppopusers__';
                                h3.innerHTML = `
                                    ${stff.full_name}(${stff.role}) &ndash; <button ${disabled} data-id="${stff.id}" data-name="${stff.full_name}" class="btn selectuser">Select</button></h3>
                                `;
                            fileup.appendChild(h3);
                        })
                    selector('.__LOADER__').remove();


                    //click to setup
                    const btnSetup = selectorAll('.selectuser');
                          btnSetup.forEach((btn, i) => {
                            btn.addEventListener('click', function(){
                                let assignedLawyer = selector('#assigned-lawyer');

                                    assignedLawyer.value = this.getAttribute('data-name');
                                    assignedLawyer.setAttribute('case_assigned_to', this.getAttribute('data-id'));
                                    
                                    selector('.popup-container').remove();
                                    document.body.classList.remove('blurred');
                                
                            })
                          })
                })
              })



    //new cases fetch out
        let wheretoReturn   = selector('.recent-cases ul');
        let allcase         = await api.fcase();
        
            if(allcase.length === 0){
                wheretoReturn.innerHTML = '<li><strong>No case found create one now!</strong></li>';
                return;
            }
            // console.log(allcase)
            //clearout all previous cases
            wheretoReturn.innerHTML = '';
            allcase.forEach(c => {
                let li = newElement('li');
                    li.innerHTML = `
                        <strong>Case ${c.case_number}: </strong>${c.title}
                    `;
                wheretoReturn.appendChild(li);
            })
            

      })();

    break;

    case 'updatecase':
      ( async () => {
        try {
            let rcnt = await api.rcase();
        let tbl = selector('.updt_tbl tbody');
            if(rcnt.length === 0){
                tbl.innerHTML = '<tr><td colspan="4">NO recent case found</td></tr>';
                return;
            }
            
            tbl.innerHTML = '';
            rcnt.forEach((el) => {
                // console.log(el);
                let tr = newElement('tr');
                    tr.innerHTML = `
                        <td>${el.title}</td>
                        <td>${el.case_type}</td>
                        <td>${el.assigned_name}</td>
                        <td>${toDateInputFormat(el.created_at)} <button class="btn btn-sm this.button${el.id}" data-id="${el.id}">Edit</button></td>
                    `;
                tbl.appendChild(tr);
                updatecase();
            })

            //search for case data
            selector('#search').addEventListener('input', async function(){
                let value = this.value;

                if(!validateInput(value, 'text')) return showToast('Search query is not valid', 'error');

                let caseFound = await api.cSearch(value);
                    // console.log(caseFound)

                if(caseFound.length === 0){
                tbl.innerHTML = '<tr><td colspan="4">NO recent case found</td></tr>';
                return;
            }
            
                tbl.innerHTML = '';
                caseFound.forEach((el) => {
                    // console.log(el);
                    let tr = newElement('tr');
                        tr.innerHTML = `
                            <td>${el.title}</td>
                            <td>${el.case_type}</td>
                            <td>${el.assigned_name}</td>
                            <td>${el.created_at} <button  class="btn btn-sm this.button${el.id}" data-id="${el.id}">Edit</button></td>
                        `;
                    tbl.appendChild(tr);

                    updatecase();
                })
                    
            })


//update case information

        let btnUpdate = selector('.btn-update');
            btnUpdate.addEventListener('click', async (event) => {
                event.preventDefault();
                btnUpdate.innerHTML = 'Loading... <i class="fas fa-spin fa-spinner"></i>';
                const caseAssignTo  = btnUpdate.getAttribute('case_assigned_to');
                const casefileBy    = btnUpdate.getAttribute('case_file_by');
                const caseId        = btnUpdate.getAttribute('case_data_d');
                const caseform      = selector('.update-case-form form');

                const caseNewTitle  = selector('#caseTitle');
                const caseType      = selector('#caseType');
                const fileby        = selector('#fileby');
                const assignedTo    = selector('#assignedTo');
                const cstatus       = selector('#cstatus');
                let nextAppear      = selector('#nextAppear')?.value ?? null;
                let resolution      = selector('#resolution')?.value ?? null;
                const caseDescription  = selector('#caseDescription');
                let clickableBtn = btnUpdate;

                console.log(nextAppear.value)

                    if(!caseAssignTo){clickableBtn.disabled =false;clickableBtn.innerText='Update Case'; return showToast("Error: Cannot verify who this case is assigned to", 'error');}
                    if(!casefileBy){ clickableBtn.disabled =false;clickableBtn.innerText='Update Case';  return showToast("Error: Cannot verify who filed this case", 'error');}
                    if(!caseId){ clickableBtn.disabled =false;clickableBtn.innerText='Update Case';  return showToast("Error: Cannot verify the case you are trying to update", 'error');}
                    if(!validateInput(caseNewTitle.value, 'text')){clickableBtn.disabled =false;clickableBtn.innerText='Update Case';  return showToast('Error: Invalid case title, checked and try again!', 'error');}
                    if(!validateInput(fileby.value, 'text')){clickableBtn.disabled =false;clickableBtn.innerText='Update Case';  return showToast('Error: select valid user name that file this case', 'error');}
                    if(!validateInput(assignedTo.value, 'text')){clickableBtn.disabled =false;clickableBtn.innerText='Update Case';  return showToast('Error: select and assigned this case to a lawyer', 'error');}
                    if(!validateInput(caseType.value, 'text')){clickableBtn.disabled =false;clickableBtn.innerText='Update Case';  return showToast('Error: Enter a valid case type. e.g Family, Civil case etc.', 'error');}
                    if(!validateInput(caseDescription.value, 'text')){clickableBtn.disabled =false;clickableBtn.innerText='Update Case';  return showToast('Error: A valid case description is required before you can update.', 'error');}
                    if(cstatus.value === ''){clickableBtn.disabled =false;clickableBtn.innerText='Update Case';  return showToast('Error: select a matching status for this case', 'error');}

                    btnUpdate.disabled = true;
                    if(nextAppear.value === '')nextAppear = null;
                    if(resolution.value === '')resolution = null;

                    // let formdata = new FormData();
                    //     formdata.append('casetitle', caseNewTitle.value);
                    //     formdata.append('caseType', caseType.value);
                    //     formdata.append('fileby', caseNewTitle.value);
                    //     formdata.append('assignedTo', assignedTo.value);
                    //     formdata.append('cstatus', cstatus.value);
                    //     formdata.append('caseDescription', caseDescription.value);

                    //     formdata.append('nextDateInCourt', nextAppear.value === '' ?? null);
                    //     formdata.append('courtresolution', resolution.value === '' ?? null);
                
                    let filed_by    = fileby.getAttribute('case_file_by');
                    let assigned_to = assignedTo.getAttribute('case_assigned_to');

                    console.log(caseId, 
                        caseNewTitle.value, 
                        caseDescription.value, 
                        caseType.value, 
                        cstatus.value, 
                        filed_by, 
                        assigned_to, 
                        nextAppear, 
                        resolution);
                    // if(nextAppear.value === '') {nextAppear = null};
                    // if(resolution.value === '') resolution = null;
                    // console.log(caseId,caseAssignTo,casefileBy)
                    // return;
                    
                    let updateRequest = await api.updateCase(caseId, caseNewTitle.value, caseDescription.value, caseType.value, cstatus.value, '', filed_by, assigned_to, nextAppear, resolution);

                        console.log(updateRequest);

                    if(updateRequest){
                        btnUpdate.disabled = false;
                        btnUpdate.innerHTML = 'Update case';
                        showToast(`"${caseNewTitle.value}" updated successfully the Lawyer, The (Plaintiff, defendant's ) has been notify via mail..`, 'info');
                        caseform.reset();
                        return;
                    }

                    showToast(`"${caseNewTitle.value}" update fail because of unexpected error`, 'error');
                    btnUpdate.disabled = false;
                    btnUpdate.innerHTML = 'Update case';


            })









        } catch (error) {
            showToast(error || 'Unexpected error', 'error');
        }
    

      })();
    break;

    case 'trackcase':
      (async () => {
        
            const AllCase   = await api.trackCases();
            const caseList  = selector('#casesList');
            let status;
            console.log(AllCase)
            if(!AllCase.status)return showToast(AllCase.message || 'Unable to load all cases, try logging out and logged in again!', 'error');
            // console.log(AllCase)

            if(!'cases' in AllCase) return showToast('Unexpected error: required data missing', 'error');

            caseList.innerHTML = ''; //list data
            AllCase.cases.forEach((cs, i) => {
                if(cs.status.toLowerCase() === 'in progress'){
                    status = 'progress';
                }else if(cs.status.toLowerCase() === 'closed'){
                    status = 'closed';
                }else{status = 'open'}

                let tr = newElement('tr');
                    tr.innerHTML = `
                        <td>#0${cs.id}</td>
                        <td>${cs.title}</td>
                        <td>${cs.assigned_lawyer}</td>
                        <td><span class="status ${status}">${cs.status}</span></td>
                        <td>${toDateInputFormat(cs.created_at)}</td>
                        <td>${toDateInputFormat(cs.updated_at)}</td>
                    `;
                caseList.appendChild(tr);
            })



            //search fcor  case
            let searchCase = selector('#searchCase');
                searchCase.addEventListener('input', async() =>{
                    
                    //validate and check the what the user is typing
                    if(!validateInput(searchCase.value, 'text'))return showToast('Enter a valid search value', 'error');

                    let userSearch = await api.searchCase(searchCase.value); //search case

                        if(userSearch.status === 'success' && userSearch.cases.length !== 0){
                            caseList.innerHTML = ''; //list data
                            userSearch.cases.forEach((cs, i) => {
                                if(cs.status.toLowerCase() === 'in progress'){
                                    status = 'progress';
                                }else if(cs.status.toLowerCase() === 'closed'){
                                    status = 'closed';
                                }else{status = 'open'}

                                let tr = newElement('tr');
                                    tr.innerHTML = `
                                        <td>#0${cs.id}</td>
                                        <td>${cs.title}</td>
                                        <td>${cs.assigned_person}</td>
                                        <td><span class="status ${status}">${cs.status}</span></td>
                                        <td>${toDateInputFormat(cs.created_at)}</td>
                                        <td>${toDateInputFormat(cs.updated_at)}</td>
                                    `;
                                caseList.appendChild(tr);
                            })
                        }
                    // )

                })


            //filter course using select
            let filterSelect = selector('#filterStatus');
                filterSelect.addEventListener('change', async function(){
                    

                    const load = await loadGet('asset/apis/adm-filter-case.php', '', {'status': filterSelect.value});

                        console.log(load)
                        if(load.status === 'success' && load.cases.length !== 0){
                            caseList.innerHTML = ''; //list data
                            load.cases.forEach((cs, i) => {
                                if(cs.status.toLowerCase() === 'in progress'){
                                    status = 'progress';
                                }else if(cs.status.toLowerCase() === 'closed'){
                                    status = 'closed';
                                }else{status = 'open'}

                                let tr = newElement('tr');
                                    tr.innerHTML = `
                                        <td>#0${cs.id}</td>
                                        <td>${cs.title}</td>
                                        <td>${cs.assigned_person}</td>
                                        <td><span class="status ${status}">${cs.status}</span></td>
                                        <td>${toDateInputFormat(cs.created_at)}</td>
                                        <td>${toDateInputFormat(cs.updated_at)}</td>
                                    `;
                                caseList.appendChild(tr);
                            })

                            return
                        }

                        caseList.innerHTML =`
                            <tr>
                                <td colspan="6">No data found!</td>
                            </tr>
                        `

                })
      })()
    break;
    
}

}

function updateStaffRecord(staffId) {
let popupEl = selector('.popup-overlay')
    popupEl.addEventListener('popupAdded', (e) =>{
        // console.log(e)
        //remove popup
        selector('.__cancel__').addEventListener('click', ()=> {
            selector('.popup-container').remove();
        })

        
// console.log(staffId)
        //update staff record
        selector('.__update_user__').addEventListener('click', async function() {
            let fullName    = selector('#edit-fullname');
            let email       = selector('#edit-email');
            let phone       = selector('#edit-phone');
            let dept        = selector('#edit-department');
            let role        = selector('#edit-role');
            let status      = selector('#edit-status');
            // console.log(validateInput)
            this.disabled = true;
            let currBtn = this;
            this.innerHTML = 'Loading... <i class="fas fa-spin fa-spinner"></i>';

            if(!validateInput(fullName.value, 'text')) {
                showToast('Error: Invalid username, please fixed and try again!', 'error')
                currBtn.disabled = false;
                currBtn.innerHTML = '<i class="fas fa-sync-alt"></i>Update Staff'
                return;
            };

            if(!validateInput(email.value, 'email')){
                currBtn.disabled = false;
                currBtn.innerHTML = '<i class="fas fa-sync-alt"></i>Update Staff'
                return showToast('Error: Invalid Email address try again', 'error');   
            }
            if(!validateInput(phone.value, 'phone')){ 
                currBtn.disabled = false;
                currBtn.innerHTML = '<i class="fas fa-sync-alt"></i>Update Staff'
                return showToast('Error: Invalid phone number, try again', 'error');}
            if(dept.value === '') {
                currBtn.disabled = false;
                currBtn.innerHTML = '<i class="fas fa-sync-alt"></i>Update Staff'
                return showToast('Error: Invalid Department, Select department', 'error');}
            if(role.value === '') {
                currBtn.disabled = false
                currBtn.innerHTML = '<i class="fas fa-sync-alt"></i>Update Staff'
                return showToast('Error: Invalid user role, add a valid role for ' + fullName.value, 'error');}
            if(status.value === '') {
                currBtn.disabled = false;
                currBtn.innerHTML = '<i class="fas fa-sync-alt"></i>Update Staff'
                return showToast('Error: Status is not valid, please add a valid status', 'error');}

           
                //update record request heree
            const updateStaffRequest = await api.updateStaffRecord(staffId, fullName.value, email.value, dept.value, phone.value, role.value, status.value);

                if(updateStaffRequest){
                    showToast('Staff Record update successfully', 'success');
                    selector('.pop-active').remove();
                }

                currBtn.disabled = false;
                currBtn.innerHTML = 'Update Staff';

        })
    })

// setTimeout(() => {
//         const form      = selector('.edit-staff-form');
//     const cancelBtn = selector('.__cancel__');

//     console.log('Update staff record function called' + form);
//     console.log('Update staff record function called' + cancelBtn);
//     cancelBtn.addEventListener('click', function(){
//         alert('yes this is cancel btn')
//     })
// }, 1000)


    // const id = form.querySelector('#edit-id').value;
    // const fullname = form.querySelector('#edit-fullname').value;
    // const email = form.querySelector('#edit-email').value;
    // const phone = form.querySelector('#edit-phone').value;
    // const department = form.querySelector('#edit-department').value;
    // const role = form.querySelector('#edit-role').value;
    // const status = form.querySelector('#edit-status').value;

    // // Perform the update operation here (e.g., send data to server)
    // console.log('Updating staff record:', { id, fullname, email, phone, department, role, status });
    // // For demonstration, we'll just show a toast
    // showToast('Staff record updated successfully!', 'success');

    // //udpate here
    //     let updateBtn = selector('.__update_user__');

    //         updateBtn.addEventListener('click', (event) => {
    //             event.preventDefault();

    //             alert('hello')
    //         });
}

///function delete deparmtnt
 function delDept(){

    const deleteButtons = selectorAll('.delete-btn');
          deleteButtons.forEach(button => {
            button.addEventListener('click', async () => {
              const deptId = button.getAttribute('data-id');
              // Call the delete department function
              console.log('Deleting department with ID:', deptId);
            //   await delDept(event, button);

            /// show popup before deleting
            api.showPopup(selector('body'), 'beforeend', () => {
                const popup = selector('.popup-overlay');
                popup.querySelector('h2').innerText = 'Confirm Deletion';
                popup.querySelector('p').innerText = 'Are you sure you want to delete this department? This action cannot be undone.';
                // You can populate the popup with a form to edit staff details


                popup.innerHTML =  `
                    <h2>Confirm Deletion</h2>
                    <p>Are you sure you want to delete this department? This action cannot be undone.</p>
                    <div class="spacer"></div>
                    <div class="modal-actions">
                        <button class="cancel-btn">Cancel</button>
                        <button class="confirm-btn">Yes, Delete</button>
                    </div>
                `;
                const confirmBtn = popup.querySelector('.confirm-btn');
                const cancelBtn = popup.querySelector('.cancel-btn');
                // Handle confirm button click
                confirmBtn.onclick = async () => {
                    // Call the delete department API
                    let deleteDeptRequest = await api.deleteDepartment(deptId);
                    if(deleteDeptRequest){
                        //remove the department from the list
                        button.parentElement.remove();
                    }
                };
                // Handle cancel button click
                cancelBtn.onclick = () => {
                    selector('.popup-container').remove();
                }; 

            
            });
          });
          });
 }



 //function to check how many minute pass
 export default function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString.replace(" ", "T")); // Convert to ISO-like format
    const seconds = Math.floor((now - date) / 1000);

    if (isNaN(seconds)) return "Invalid date";

    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
}


//update case invoker
function updatecase(){
    let caseEditBtn = selectorAll('.btn-sm');

        caseEditBtn.forEach((btn, i) => {
            btn.addEventListener('click', async () => {
                let caseId = btn.getAttribute('data-id');

                let caseobjec   = await api.cfilter(caseId);
                let casetitle   = selector('#caseTitle');
                let casetype    = selector('#caseType');
                let casefileby  = selector('#fileby');
                let caseAssign  = selector('#assignedTo');
                let casedesc    = selector('#caseDescription');
                let cstatus     = selector('#cstatus');
                let nextAppear  = selector('#nextAppear');
                let resolutionDate  = selector('#resolution');
                let btnInvoker  = selector('.btn-update');




                    casetitle.value = caseobjec.title;
                    casetype.value = caseobjec.case_type;
                    casefileby.value = caseobjec.filed_by_name;
                    caseAssign.value = caseobjec.assigned_name;
                    casedesc.value = caseobjec.description;
                    btnInvoker.setAttribute('case_assigned_to', caseobjec.assigned_to);
                    btnInvoker.setAttribute('case_file_by', caseobjec.filed_by);
                    btnInvoker.setAttribute('case_data_d', caseobjec.id);

                    caseAssign.setAttribute('case_assigned_to', caseobjec.assigned_to);
                    casefileby.setAttribute('case_file_by', caseobjec.assigned_to);

                    // cstatus.value = caseobjec.status; //case status
                    Array.from(cstatus.options).forEach((option) => {
                        if(option.value === caseobjec.status){
                            option.selected = true;
                        }
                    })


                    resolutionDate.value    = toDateInputFormat(caseobjec.resolution_date); //case resolution 
                    nextAppear.value        = toDateInputFormat(caseobjec.resolution_date); //case resolution 

                    // casetype.value = caseobjec.case_type;

                    // console.log(caseobjec);
            })
        })

            //make pop so that admin can select the file by user name
        //from the the system can collect the user id id="filed-by"
        const filby = selector('#fileby');
              filby.addEventListener('keyup', (event) => {
                event.preventDefault();
                filby.blur();
                api.showPopup(selector('body'), 'beforeend', async () => {

                    const popup = selector('.popup-overlay');
                        popup.querySelector('h2').innerText = 'File-by user selection';
                        popup.querySelector('p').innerText = 'Select the user name that file the case!';
                            // You can populate the popup with a form to edit staff details

                    //get staff
                    const allStaff = await api.staff();
                    popup.innerHTML =  `
                        <h2>File-by user selection</h2>
                        <p>Select the user name that file the case!</p>
                        <div class="spacer"></div>
                        <div class="modal-actions">
                            <!--[[[
                                DUMP ALL USERS HERE
                            ]]]--->
                            <span class="__LOADER__">
                                <i class="fas fa-spin fa-spinner fa-3x"></i>
                            </span>
                        </div>
                        
                    `;

                    let fileup = selector('.modal-actions');
                        let fileby = selector('#assignedTo').getAttribute('case_assigned_to');
                        let disabled;
                        allStaff.data.forEach((stff, i) => {
                            if(fileby === stff.id) {disabled = 'disabled';}else{disabled = ''}
                            let h3 = newElement('h3');
                                h3.className = '__ppopusers__';
                                h3.innerHTML = `
                                    ${stff.full_name}(${stff.role}) &ndash; <button ${disabled} data-id="${stff.id}" data-name="${stff.full_name}" class="btn selectuser">Select</button></h3>
                                `;
                            fileup.appendChild(h3);
                        })
                    selector('.__LOADER__').remove();


                    //click to setup
                    const btnSetup = selectorAll('.selectuser');
                          btnSetup.forEach((btn, i) => {
                            btn.addEventListener('click', function(){
                                let fileByInput = selector('#fileby');

                                    fileByInput.value = this.getAttribute('data-name');
                                    fileByInput.setAttribute('case_file_by', this.getAttribute('data-id'));

                                    selector('.popup-container').remove();
                                    document.body.classList.remove('blurred');
                                
                            })
                          })
                })
              })


        //make autofile for lawyere
            const assigned = selector('#assignedTo');
                  assigned.addEventListener('keyup', (event) => {
                event.preventDefault();
                    assigned.blur(true);

                api.showPopup(selector('body'), 'beforeend', async () => {

                    const popup = selector('.popup-overlay');
                        popup.querySelector('h2').innerText = 'Assign case to Lawyer';
                        popup.querySelector('p').innerText = 'Select a lawyer and assigned case';
                            // You can populate the popup with a form to edit staff details

                    //get staff
                    const allStaff = await api.staff();
                          console.log(allStaff);
                    popup.innerHTML =  `
                        <h2>File-by user selection</h2>
                        <p>Select the user name that file the case!</p>
                        <div class="spacer"></div>
                        <div class="modal-actions">
                            <!--[[[
                                DUMP ALL USERS HERE
                            ]]]--->
                            <span class="__LOADER__">
                                <i class="fas fa-spin fa-spinner fa-3x"></i>
                            </span>
                        </div>
                        
                    `;

                    let fileup = selector('.modal-actions');
                    let fileby = selector('#fileby').getAttribute('case_file_by');
                    let disabled;
                    // alert(filby)
                        allStaff.data.forEach((stff, i) => {
                            if(fileby === stff.id) {disabled = 'disabled';}else{disabled = ''}


                            let h3 = newElement('h3');
                                h3.className = '__ppopusers__';
                                h3.innerHTML = `
                                    ${stff.full_name}(${stff.role}) &ndash; <button ${disabled} data-id="${stff.id}" data-name="${stff.full_name}" class="btn selectuser">Select</button></h3>
                                `;
                            fileup.appendChild(h3);
                        })
                    selector('.__LOADER__').remove();


                    //click to setup
                    const btnSetup = selectorAll('.selectuser');
                          btnSetup.forEach((btn, i) => {
                            btn.addEventListener('click', function(){
                                let assignedLawyer = selector('#assignedTo');

                                    assignedLawyer.value = this.getAttribute('data-name');
                                    assignedLawyer.setAttribute('case_assigned_to', this.getAttribute('data-id'));
                                    
                                    selector('.popup-container').remove();
                                    document.body.classList.remove('blurred');
                                
                            })
                          })
                })
              })
}


export function toDateInputFormat(dateTimeStr) {
  // Example input: "2025-10-02 00:00:00"
  if (!dateTimeStr) return "";

  // Split off the date part only
  const datePart = dateTimeStr.split(" ")[0];

  // Validate it's YYYY-MM-DD
  const parts = datePart.split("-");
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }
  return "";
}

//function get from storage
export function getFromStorage(key) {
    if(!key) return null;
    
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}


export function upsertToStorage(key, newObj) {
    let data = getFromStorage(key);

    // Ensure it's always an array
    if (!Array.isArray(data)) {
        data = [];
    }

    const newKey = Object.keys(newObj)[0]; // e.g. "case" or "lawyer"

    // Find existing object with same key
    const index = data.findIndex(item => Object.keys(item)[0] === newKey);

    if (index !== -1) {
        // Update existing
        data[index] = newObj;
    } else {
        // Add new
        data.push(newObj);
    }

    localStorage.setItem(key, JSON.stringify(data));
}


export function urlSplitter(){
    const url = window.location.hash;
    const parts = url.split("/");
    const lastNumber = parts[parts.length - 1]; // "8"
    //check if last part is a number
    if(isNaN(lastNumber)) return null;

    return lastNumber;

}
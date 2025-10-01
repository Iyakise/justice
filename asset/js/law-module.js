// import  Chart from "https://cdn.jsdelivr.net/npm/chart.js";
// importScripts
// Project URL Resolver

import { __ROOT__, showToast, selector, selectorAll, toDateInputFormat,getFromStorage, upsertToStorage, urlSplitter } from "./flo3fwf";
import * as api from "./api";
import * as loader from "./load";
import timeAgo from "./flo3fwf";
// import getFromStorage from "./flo3fwf";

// Loader function
export async function __LOADER__COMMI(returndata, type, pge, token, callback) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds
        // console.log(pge)
        pge  == 'dashboard' ? 'index' : pge;
        if(pge === 'dashboard')pge = 'index';

        const request = await fetch(`${__ROOT__}asset/__LOADER__/LAWYER/${pge}${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!request.ok) {
            throw new Error(`Server Error while loading ${pge}: ${request.status}`);
        }

        const response = await request.text();
        returndata.innerHTML = response;

        initialiazeFunctions(pge);

        if (callback) callback();

    } catch (e) {
        showToast(e.message || e, "error", 3000);
    }
}


// Initialize page-specific functions
export function initialiazeFunctions(p){
    p = p.toLowerCase().replace(/^\/+|\/+$/g, '').split('/').pop();
    // console.log('Initializing functions for:', p);
    switch(p){
      case 'index':
        (async () => {
            const userData = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);

            if (!userData && userData.logged_in === false) {
                showToast('User not authenticated', 'error', 3000);
                setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
                return;
            }
            const lawyerstats = await api.lawyerDashboardStats(userData.user.id);
            console.log(lawyerstats);
            //account stats
                    selector('.assigned').innerHTML = lawyerstats.assigned_cases;
                    selector('.all').innerHTML = lawyerstats.all_cases;
                    selector('.ongoing').innerHTML = lawyerstats.ongoing_cases;
                    selector('.closed').innerHTML = lawyerstats.closed_cases;
            // console.log(lawyerstats);
            // document.addEventListener('DOMContentLoaded', function () {
  // ===== Activity Overview (Doughnut) =====
        // Chart.js setup
        const ctx = document.getElementById('lawyerCaseChart').getContext('2d');
            new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Assigned', 'Ongoing', 'Closed'],
                datasets: [{
                label: 'Cases',
                data: [lawyerstats.assigned_cases, lawyerstats.ongoing_cases, lawyerstats.closed_cases],
                backgroundColor: ['#3498db', '#f1c40f', '#2ecc71']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                legend: { position: 'bottom' }
                }
            }
        })



    // lawyer recent account activities
    const recentData = await api.lawyerActivity(userData.user.id);
    const recentList = selector('.activity-list');

        if(!recentData || recentData.length === 0){
            recentList.innerHTML = '<li>No recent activities found.</li>';
            return;
        }

        recentList.innerHTML = '';
        let a,b,c,d,e,f;
        recentData.forEach(activity => {
            if(activity.action === 'CASE ADD'){
                a = '📂';
            }else if(activity.action === 'LOGIN_SUCCESS'){
                a = '⮕'
            }else if(activity.action === 'LOGOUT'){
                a = '⮕'
            }else if(activity.action === 'CASE HEARING'){
                a = '✅';
            }else if(activity.action === 'CASE_UPDATE'){
                a = '';
            }else {
                a = 'X'
            }

            const listItem = document.createElement('li');
            listItem.innerHTML = `${activity.description} &nbsp;<span class="timestamp">${timeAgo(activity.created_at)}</span>`;
            recentList.appendChild(listItem);
        });


// });
    })();
      break;


    case 'logout':
            // Handle logout functionality
            // alert('Logging out...');
          (async () =>{
            const logoutBtn = selector('.logout');
            if(!logoutBtn)return showToast('Logout button not found', 'error', 3000);

            
            logoutBtn.addEventListener('click', async (e) => {

                e.preventDefault();
                logoutBtn.disabled = true;
                logoutBtn.innerHTML = 'Logging out... <i class="fas fa-spinner fa-spin"></i>';

                const logout = await api.userLogout();
                if (logout.success) {
                    showToast('Logged out successfully', 'success', 2000);
                    setTimeout(() => {
                        window.location.href = __ROOT__ + 'login.html';
                    }, 2000);
                } else {
                    showToast(logout.message || 'Logout failed', 'error', 3000);
                }
            });



          })();
    break;
    
    case 'acases':
        //   alert('assigned cases loaded');
        // Fetch and display assigned cases for the logged-in lawyer
        (async () => {
            const userData = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);

            if (!userData && userData.logged_in === false) {
                showToast('User not authenticated', 'error', 3000);
                setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
                return;
            }

            const assignedCases = await api.lawyerAssignedCases(userData.user.id);
            console.log(assignedCases);
            const caseListBody = selector('.case-list');

            if(!assignedCases || assignedCases.data.length === 0){
                caseListBody.innerHTML = '<tr><td colspan="6">No assigned cases found.</td></tr>';
                return;
            }
            caseListBody.innerHTML = ''; //clear existing rows
        /*
        status in-progress, closed, pending, open closed
        */
            assignedCases.data.forEach(caseItem => {
                let statusClass = '';
                if(caseItem.status.toLowerCase() === 'in progress'){
                    statusClass = 'in-progress';
                }else if(caseItem.status.toLowerCase() === 'closed'){
                    statusClass = 'closed';
                }else if(caseItem.status.toLowerCase() === 'pending'){
                    statusClass = 'pending';
                }else if(caseItem.status.toLowerCase() === 'open'){
                    statusClass = 'open';
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${caseItem.case_number}</td>
                    <td>${caseItem.title}</td>
                    <td>${caseItem.client_name}</td>
                    <td><span class="status ${statusClass}"> ${caseItem.status}</span></td>
                    <td>${toDateInputFormat(caseItem.date_assigned)}</td>
                    <td>${toDateInputFormat(caseItem.deadline)}</td>
                    <td><button class="view-btn" data-id="${caseItem.id}">View</button></td>
                `;
                caseListBody.appendChild(row);
            });

// console.log(getFromStorage('__cms_cData__'))

            //select all view buttons
            const viewButtons = selectorAll('.view-btn');
            viewButtons.forEach(btn => {
                btn.addEventListener('click', function(){
                    const caseId = this.getAttribute('data-id');
                    const keydata = getFromStorage('__cms_cData__');
                    console.log(keydata);
                    if(!caseId)return showToast('Case ID not found', 'error', 3000);

                    // alert('View details for case ID: ' + caseId);
                    // You can implement a modal or redirect to a detailed case page here
                    // find if caseId already exists
                    // let data = getFromStorage(key);

                    upsertToStorage('__cms_cData__', {caseId: caseId});
                    __LOADER__COMMI(selector(".__MOJ_MAIN__"), '.html', 'vcase', '', function(){
                        showToast('Case data loaded', 'success', 2000);
                    });

                    
                    // Also update the URL hash
                    // history.pushState(null, '', `#vcase/lawyer/vcase/${caseId}`);
                    // Redirect to case detail page with hash
                    location.hash = `vcase/lawyer/vcase/${caseId}`;

                    

                });
            });


        })();


    break;

    case 'vcase':
        // View case details based on case ID from URL hash
        (async () => {
            const userData = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);
            if (!userData && userData.logged_in === false) {
                showToast('User not authenticated', 'error', 3000);
                setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
                return;
            }   
            // Extract case ID from URL hash
            const caseId = urlSplitter(); // Assuming format:
            if(!caseId || isNaN(caseId))return showToast('Case data ID not found, try to select a case from the list', 'error', 3000);
            // Fetch case details
            const caseDetails = await api.singleCaseDetails(caseId);

                console.log(caseDetails);
            if(!caseDetails || !caseDetails.case){
                return showToast('Case details not found', 'error', 3000);
            }


            if(caseDetails.case.assigned_to !== userData.user.id){
                return showToast('You are not authorized to view this case', 'error', 3000);
            }

            // Populate case details in the UI
            selector('.caseID').innerText = `#${caseDetails.case.case_number}`;
            selector('.caseTitle').innerText = caseDetails.case.title;
            selector('.clientName').innerText = caseDetails.case.client_name;
            selector('.assignedLawyer').innerText = caseDetails.case.lawyer_name +' (You)' || 'You';
            selector('.status').innerText = caseDetails.case.status;
            selector('.status').className = `status ${caseDetails.case.status.toLowerCase().replace(/\s+/g, '-')}`;
            selector('.createdOn').innerText = toDateInputFormat(caseDetails.case.created_at);
            selector('.lastUpdated').innerText = toDateInputFormat(caseDetails.case.updated_at);

            selector('.caseDesc').innerText = caseDetails.case.description || 'No description provided.';

            // Populate case progress
            const caseProgress = caseDetails.timeline || [];
            const progressList = selector('.case-timeline ul');
            progressList.innerHTML = ''; // Clear existing progress
            if( caseProgress.length === 0){
                progressList.innerHTML = '<li>No progress updates available.</li>';
            }else{
                caseProgress.forEach(progress => {
                    const li = document.createElement('li');
                    li.innerText = `${toDateInputFormat(progress.date)}: ${progress.remarks}`;
                    progressList.appendChild(li);
                });
            }

            // Handle action buttons if case is close then disabled all buttons
            const actionButtons = selectorAll('.case-actions .btn');
            if (caseDetails.case.status === 'Closed') {
                actionButtons.forEach(btn => btn.disabled = true);
            } else {
                actionButtons.forEach(btn => {
                    btn.disabled = false;
                    btn.setAttribute('data-action-id', caseDetails.case.id);
                });
                
            }



            // Add event listeners for action buttons
            selector('.primary').addEventListener('click', function(){
                const caseId = this.getAttribute('data-action-id');
                if(!caseId)return showToast('Case ID not found for action', 'error', 3000);
                // alert('Add Hearing for case ID: ' + caseId);
                try {
                    api.showPopup(selector('body'), 'beforeend', function() {
                        const popup = selector('.popup-overlay');
                        popup.innerHTML = `
                            <div class="popup-overlay excellent">
                                <div class="popup-content">
                                    <h2>Update Case progress</h2>
                                    <div>
                                        <label for="case-status">New Status:</label>
                                        <select id="case-status">
                                            <option value="">Select Status</option>
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Closed">Closed</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Appealed">Appealed</option>
                                            <option value="On Hold">On Hold</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label for="case-remarks">Remarks:</label>
                                        <textarea id="case-remarks" rows="4" placeholder="Enter remarks..."></textarea>
                                    </div>

                                    <div>
                                        <button data-id="${caseId}" class="btn-confirm btn">Confirm</button>
                                        <button data-id="${caseId}" class="btn-cancel btn">Cancel</button>
                                    </div>
                                </div>
                            </div>
<style>
/* Popup box */
.popup-content {
  background: #fff;
  padding: 25px 30px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0px 8px 25px rgba(0,0,0,0.2);
  animation: popupFade 0.3s ease-in-out;
}

.excellent{
    padding: 30px;
    margin:0 auto !important;
}

/* Title */
.popup-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
  text-align: center;
}

/* Form groups */
.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
  color: #444;
}

select, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  transition: border 0.3s;
}

select:focus, textarea:focus {
  border-color: #007bff;
}

/* Buttons */
.btn-group {
  text-align: right;
  margin-top: 20px;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 8px;
  transition: background 0.3s;
}

.btn-confirm {
  background: #007bff;
  color: #fff;
}

.btn-confirm:hover {
  background: #0056b3;
}

.btn-cancel {
  background: #f1f1f1;
  color: #333;
}

.btn-cancel:hover {
  background: #ddd;
}

/* Smooth fade-in animation */
@keyframes popupFade {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (max-width: 764px) {
  .popup-content {
    width: 100%;
    padding: 15px;
  }

  .popup-content h2 {
    font-size: 18px;
  }

  select, textarea {
    font-size: 12px;
  }

  .btn {
    font-size: 12px;
    padding: 8px 12px;
  }
}
</style>
                        `;

            //confirmed button
                        selector('.btn-confirm').addEventListener('click', async function(){
                            const caseId = this.getAttribute('data-id');
                            const lawyerId = userData.user.id;
                            if(!caseId)return showToast('Case ID not found for update', 'error', 3000);
                            //get values
                            //check lawyer id
                            if(lawyerId <= 0)return showToast('Lawyer ID not found for update', 'error', 3000);
                            //get values
                            const newStatus = selector('#case-status')?.value ?? '';
                            const remarks = selector('#case-remarks')?.value.trim() ?? '';


                            if(!newStatus)return showToast('Please select a new status', 'error', 3000);

                            if(!remarks)return showToast('Please enter remarks for the status update', 'error', 3000);

                            //disable button
                            this.disabled = true;
                            this.innerHTML = 'Updating... <i class="fas fa-spinner fa-spin"></i>';

                            const update = await api.updateLawyerCaseProgress(caseId, lawyerId, newStatus, remarks);
                            console.log(update);
                            if(update.success){
                                showToast('Case updated successfully', 'success', 3000);
                                setTimeout(() => {
                                    location.reload();
                                }, 3000);
                            }else{
                                showToast(update.message || 'Failed to update case', 'error', 3000);
                                this.disabled = false;
                                this.innerHTML = 'Confirm';
                            }

                            this.disabled = false;
                            this.innerHTML = 'Confirm';

                        });
                    });

                } catch (error) {
                    showToast('Error showing popup: ' + error.message, 'error', 3000);
                }
                


            });




        })();
    break;

    
    
    }


}

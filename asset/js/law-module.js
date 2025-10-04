// import  Chart from "https://cdn.jsdelivr.net/npm/chart.js";
// importScripts
// Project URL Resolver

import { __ROOT__, showToast, selector, selectorAll, toDateInputFormat,getFromStorage, upsertToStorage, urlSplitter } from "./flo3fwf";
import * as api from "./api";
import load, * as loader from "./load";
import timeAgo from "./flo3fwf";
import validateInput from "./validateInput";
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
            // console.log(lawyerstats);
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
            // console.log(assignedCases);
            const caseListBody = selector('.case-list');

            if(!assignedCases || assignedCases.data.length === 0){
                caseListBody.innerHTML = '<tr><td colspan="6">No assigned cases found.</td></tr>';
            }else{
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
            }

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



    //search cases api
    selector('#SearchCase').addEventListener('input', async function(){
        if(!validateInput(this.value, 'text')) return showToast("Error: invalid search query");

        const val = this.value;
        const result = await api.lawyerSearchCase(userData.user.id, val);

        if(!result || result.data.length === 0){
        caseListBody.innerHTML = '<tr><td colspan="6">No assigned cases found.</td></tr>';
    }else{
    caseListBody.innerHTML = ''; //clear existing rows
/*
status in-progress, closed, pending, open closed
*/
        result.data.forEach(caseItem => {
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

        
//select all view buttons after search
const viewButtons = selectorAll('.view-btn');
viewButtons.forEach(btn => {
    btn.addEventListener('click', function(){
        const caseId = this.getAttribute('data-id');
        const keydata = getFromStorage('__cms_cData__');
        // console.log(keydata);
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
            
        }

    })


//filter case lawyer
selector('#Filtercase').addEventListener('change', async function(){
    let val = this.value;

    if(val === '')return showToast('Please select the right status', 'info');

    await loader.loadGet('asset/apis/lawyer.case.filter.php', function(event){
        // console.log( event, 'dad =>' + this)
        let result = event;
        caseListBody.innerHTML = ''; //clear existing rows
/*
status in-progress, closed, pending, open closed
*/
        //check if there is any record return
        if(result.cases.length === 0){
            caseListBody.innerHTML = '<tr><td colspan="6">No assigned cases found with this status.</td></tr>';
        }else{

            result.cases.forEach(caseItem => {
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
        }



    }, {'lawyer_id': userData.user.id, 'status': val});

 

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
            // console.log(caseProgress)
            const progressList = selector('.case-timeline ul');
            progressList.innerHTML = ''; // Clear existing progress
            if( caseProgress.length === 0){
                progressList.innerHTML = '<li>No progress updates available.</li>';
            }else{
                caseProgress.forEach(progress => {
                    const li = document.createElement('li');
                    li.innerHTML = `${toDateInputFormat(progress.created_at)}: status <strong>(${progress.status})</strong> ${progress.remarks} ${timeAgo(progress.created_at)} by <em>${progress.updated_by_name}</em>`;
                    progressList.appendChild(li);
                });
            }

            // Populate case documents
            let caseDocumentUl = selector('ul.caseDocuments');
            caseDocumentUl.innerHTML = '';
            const caseDocuments = caseDetails.documents || [];

            if (caseDocuments.length === 0) {
                caseDocumentUl.innerHTML = '<li>No documents available.</li>';
            } else {
                caseDocuments.forEach(doc => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${doc.uploaded_at}</span> 
                        <strong>${doc.file_name}</strong> 
            
                        <button data-id="${doc.id}" data-path="${doc.file_path}" data-name="${doc.file_name}" data-uploaded-by="${doc.uploaded_by_name}" class="btn __viewDocument__">View</button>`;
                    caseDocumentUl.appendChild(li);
                });


                // Add event listeners to view buttons
                const viewDocButtons = selectorAll('.__viewDocument__');
                viewDocButtons.forEach(btn => {
                    btn.addEventListener('click', function(){
                        const filePath = this.getAttribute('data-path');
                        const fileName = this.getAttribute('data-name');
                        const uploadedBy = this.getAttribute('data-uploaded-by');
                        if(!filePath || !fileName)return showToast('Document path or name not found', 'error', 3000);
                        // Open document in new tab
                        const fullPath = __ROOT__+ 'asset/' + filePath;
                        let viewurl = '';
                        //
                       
                        if(!fullPath)return showToast('Document full path not found', 'error', 3000);
                        //check if it microsoft office file then use office viewer
                        if(fileName.endsWith('.doc') || fileName.endsWith('.docx')  || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')){
                            // const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullPath)}`;
                             viewurl = `https://docs.google.com/gview?url=${encodeURIComponent(fullPath)}&embedded=true`;
                        }else{
                            viewurl = fullPath;
                        }
                        // Determine file typ
                        // For PDF, DOCX, TXT we can open in iframe or new tab
                        // For simplicity, we'll open in a new tab for now
                        // Uncomment the line below to open in a new tab
                        // window.open(fullPath, '_blank');
                        api.showPopup(selector('body'), 'beforeend', function() {
                            const popup = selector('.popup-overlay');
                            popup.innerHTML = `
                                <div class="popup-overlay">
                                    <div class="popup-content">
                                        <h2>View Document: uploaded by ${uploadedBy}</h2>
                                        <iframe src="${viewurl}" frameborder="0"></iframe>
                                        <button class="btn close-popup" onclick="closePopup()">Close</button>
                                    </div>
                                </div>
                            `;
                            // Add styles for iframe
                            const style = document.createElement('style');
                            style.innerHTML = `
                                .popup-content iframe {
                                    width: 100%;
                                    height: 80vh;
                                    border: 1px solid #ccc;
                                    border-radius: 8px;
                                }
                            `;
                            document.head.appendChild(style);
                        });

                    });
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


    // <input type="file" id="case-document" accept=".pdf,.doc,.docx,.txt" />
// 
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
                                        <button data-id="${caseId}" class="btn-cancel btn" onclick="closePopup()">Cancel</button>
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

            //update case document button
            selector('.secondary').addEventListener('click', function(){
                const caseId = this.getAttribute('data-action-id');
                if(!caseId)return showToast('Case ID not found for action', 'error', 3000);

                api.showPopup(selector('body'), 'beforeend', function() {
                    const popup = selector('.popup-overlay');
                    const lawyerId = userData.user.id;
                    if(lawyerId <= 0)return showToast('Lawyer ID not found for upload', 'error', 3000);
                    popup.innerHTML = `
                        <div class="popup-overlay excellent">
                            <div class="popup-content">
                                <h2>Upload Case Document</h2>
                                    <form id="documentUploadForm" enctype="multipart/form-data" method="POST">
                                        <!-- Hidden case ID -->
                                        <input type="hidden" name="case_id" value="${caseId}"> <!-- dynamically set -->
                                        <input type="hidden" name="uploaded_by" value="${lawyerId}"> <!-- logged-in lawyer/admin id -->

                                        <!-- File Upload -->
                                        <div class="form-group">
                                            <label for="document">Select Document:</label>
                                            <input type="file" id="document" name="document" required accept=".pdf,.doc,.docx,.txt" />
                                        </div>

                                        <!-- Document Type -->
                                        <div class="form-group">
                                            <label for="doc_type">Document Type:</label>
                                            <select id="doc_type" name="doc_type" required>
                                            <option value="">-- Select Type --</option>
                                            <option value="Pleading">Pleading</option>
                                            <option value="Affidavit">Affidavit</option>
                                            <option value="Evidence">Evidence</option>
                                            <option value="Order">Court Order</option>
                                            <option value="Misc">Miscellaneous</option>
                                            </select>
                                        </div>

                                        <!-- Remarks -->
                                        <div class="form-group">
                                            <label for="remarks">Remarks:</label>
                                            <textarea id="remarks" name="remarks" rows="3" placeholder="Add remarks about this document..."></textarea>
                                        </div>

                                        <!-- Notify Client -->
                                        <div class="form-group checkbox">
                                            <label>
                                            <input type="checkbox" name="notify_client" value="1">
                                            Notify client about this upload
                                            </label>
                                        </div>

                                        <!-- Action Buttons -->
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-confirm">Upload</button>
                                            <button type="button" class="btn btn-cancel btn-close" onclick="closePopup()">Cancel</button>
                                        </div>
                                    </form>

                                </div>
                            </div>
<style>
.upload-popup-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.upload-popup-content {
  background: #fff;
  padding: 20px 25px;
  border-radius: 10px;
  width: 420px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  animation: fadeIn 0.3s ease-in-out;
}

.upload-popup-content h2 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
}

.form-group input[type="file"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.form-group.checkbox label {
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-confirm {
  background: #007bff;
  color: #fff;
}

.btn-cancel {
  background: #ccc;
  color: #333;
}

</style>
                    `;

                    // Handle form submission
                    const form = selector('#documentUploadForm');
                    form.addEventListener('submit', async function (e) {
                        e.preventDefault();
                        const formData = new FormData(form);
                        // Submit the form data via AJAX or fetch API
                        // alert('Form submitted. Implement AJAX upload logic here.');
                        // Example AJAX upload logic:
                        /*
                            fetch(`${__ROOT__}asset/apis/lawyer.upload.document.php`, {
                        */
                    //    console.log(formData)

                        try {
                            const res = await fetch(`${__ROOT__}asset/apis/lawyer.add.case.document.php`, {
                            method: "POST",
                            body: formData
                            });

                        if (!res.ok) {
                        throw new Error("Server returned status " + res.status);
                        }

                        const data = await res.json();
                        console.log(data);

                        if (data.success) {
                            showToast('Document uploaded successfully', 'success', 3000);
                            setTimeout(() => {
                                location.reload();
                            }, 3000);

                        } else {
                            showToast('Error: ' + data.message, 'error', 5000);
                        }
                    } catch (err) {
                        console.error('Upload error:', err);
                        showToast('❌ Upload failed: ' +  err.error, 'error', 5000);
                    }



                    });

                });

            });                // alert('Add Hearing for case ID: ' + caseId);


    //close case button
            selector('.danger').addEventListener('click', function(){
                const caseId = this.getAttribute('data-action-id');

                if(!caseId)return showToast('Case ID not found for action', 'error', 3000);
                // alert('Close case ID: ' + caseId);
                try {
                    api.showPopup(selector('body'), 'beforeend', function() {
                        const popup = selector('.popup-overlay');
                        popup.innerHTML = `
                            <div class="popup-overlay excellent">
                                <div class="popup-content">
                                    <h2>Close Case</h2>
                                    <div>
                                        <label for="close-remark" style="font-weight: bold;display:block;">Are you sure you want to close this case? This action cannot be undone.</label>
                                        <textarea id="close-remark" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;" rows="4" placeholder="Enter remarks for closing the case..."></textarea>
                                        <div class="form-actionss" style="margin-top:20px; width:50%; text-align:left;">
                                            <button type="button" data-action-id="${caseId}" class="danger btn btn-confirm">Close Case</button>
                                            <button type="button"  class="btn btn-cancel" onclick="closePopup()">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

<style>
.btn-cancel,
.btn-confirm{
justify-self: flex-start !important;
}
</style>
                        `;


            //confirmed button
                        selector('.btn-confirm').addEventListener('click', async function(){
                            const caseId = this.getAttribute('data-action-id');
                            const lawyerId = userData.user.id;
                            const closeRemark = selector('#close-remark')?.value ?? null;
                            if(!caseId)return showToast('Case ID not found for closing', 'error', 3000);
                            if(!closeRemark) return showToast('Unable to get remarks for closing the case', 'error', 3000);
                            if(!validateInput(closeRemark, 'text')) return showToast('Please enter valid remarks for closing the case (5-500 characters)', 'error', 5000);
                            //get values
                            //check lawyer id
                            if(lawyerId <= 0)return showToast('Lawyer ID not found for closing', 'error', 3000);
                            //get values
                            // const remark = selector('#close-remark')?.value.trim() ?? '';
                            const remark = 'Closed by lawyer';
                            if(!remark)return showToast('Please enter remarks for closing the case', 'error', 3000);
                            //disable button
                            this.disabled = true;
                            this.innerHTML = 'Closing... <i class="fas fa-spinner fa-spin"></i>';
                            //get current user role
                            const role = userData.user.role;
                            // console.log(role)
                            const closeCase = await api.lawyerCloseCase(caseId, lawyerId, closeRemark, role);
                            // console.log(closeCase);
                            if(closeCase.success){
                                showToast('Case closed successfully', 'success', 3000);
                                setTimeout(() => {
                                    location.reload();
                                }, 3000);
                            }else{
                                showToast('Failed to close case: ' + closeCase.error, 'error', 5000);
                            }

                        });
                    });
                } catch (error) {
                    console.error('Error showing popup:', error);
                }
            });

        })();

    break;

    case 'mprofile':
        // alert('profile loaded');
        (async () => {
            const IsAuth = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);
            if (!IsAuth && IsAuth.logged_in === false) {
                showToast('User not authenticated', 'error', 3000);
                setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
                return;
            }
            const userData = await api.singleUserRecord(IsAuth.user.id);
            // Populate profile data
            // console.log(userData);
            selector('#fullname').value = userData.user.full_name || '';
            selector('#email').value = userData.user.email || '';
            selector('#phone').value = userData.user.phone || '';
            selector('#status').value = userData.user.status || '';
            selector('#role').value = userData.user.role || '';
            selector('#specialization').value = userData.user.department || '';
            let preview = selector('.__PROV__');

            if(userData.user.profile_image !== null){
                preview.srcset = __ROOT__ + 'asset/'+ userData.user.profile_image;
                preview.src = __ROOT__ + 'asset/'+ userData.user.profile_image;
                // alert('Profile image loaded');
            }

            //profile_pic 
            selector('#profile_pic').addEventListener('change', function(){
                const img = this.files[0];
                preview = selector('.__PROV__');
                if(!img)return showToast('No image selected', 'error', 3000);

                let blobdata = URL.createObjectURL(img);
                preview.src = blobdata;
                preview.srcset = blobdata;
                window.imageToUpload = img;
                // console.log(img);
                // console.log(img);

                // Reset the file input
// asset/img/male-mdium.png
            })
            //cancel btn click
            selector('.btn-cancel').addEventListener('click', ()=>{
                preview = selector('.__PROV__');
                if(!window.imageToUpload)return showToast('No image to reset', 'error', 3000);
                    preview.src = __ROOT__ + 'asset/img/male-mdium.png';
                    preview.srcset = __ROOT__ + 'asset/img/male-mdium.png';
                    window.imageToUpload = null;
                    selector('#profile_pic').value = '';
                    showToast('Changes reverted successfully', 'info', 3000);
            })

            //update profile image
            selector('.__proceed__').addEventListener('click', async (e)=> {
                e.preventDefault();
                if(!window.imageToUpload)return showToast('No image to upload', 'error', 3000);

                //upload image
                const formData = new FormData();
                formData.append('profile_image', window.imageToUpload);
                formData.append('user_id', IsAuth.user.id);

                const uploadRequest = await load('/asset/apis/lawyer.upload.profile.php','', formData);

                console.log(uploadRequest);

                if(uploadRequest.success){
                    showToast('Profile image updated successfully', 'success', 3000);
                    setTimeout(() => {
                        location.reload();
                    }, 3000);
                }else{
                    showToast('Failed to update profile image: ' + uploadRequest.error, 'error', 5000);
                }

            })

        })();
    break;
    
    }


}



// Handle form submission
                    // const form = document.getElementById('uploadForm');
                    // form.addEventListener('submit', function (e) {
                    //     e.preventDefault();
                    //     const formData = new FormData(form);
                    //     // Submit the form data via AJAX or fetch API
                    //     alert('Form submitted. Implement AJAX upload logic here.');
                    // });
                    // Close popup function
    window.closePopup = function() {
        const popup = selector('.popup-container');
        if (popup) popup.remove();
    };
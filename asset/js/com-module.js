// import  Chart from "https://cdn.jsdelivr.net/npm/chart.js";
// importScripts
// Project URL Resolver

import { __ROOT__, showToast, selector, selectorAll, newElement, toDateInputFormat, getFromStorage, upsertToStorage, urlSplitter } from "./flo3fwf";
import * as api from "./api";
import load, * as loader from "./load";
import timeAgo from "./flo3fwf";
import validateInput from "./validateInput";
// import getFromStorage from "./flo3fwf";

// Loader function

// Loader function
export async function __LOADER__COMMI(returndata, type, pge, token, callback) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds
        // console.log(pge)
        pge  == 'dashboard' ? 'index' : pge;
        if(pge === 'dashboard')pge = 'index';

        const request = await fetch(`${__ROOT__}asset/__LOADER__/COMMI/${pge}${type}`, {
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



export function initialiazeFunctions(p){
    p = p.toLowerCase();
    switch(p){
    case 'index':
        (async () => {
            try{
            // document.addEventListener('DOMContentLoaded', function () {
  // ===== Activity Overview (Doughnut) =====
        // Chart.js setup
        const userData      = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);
        console.log(userData);
        let activity        = await api.commissionerActivity();
        let dashboardStats  = await api.commissionerDashboardStats(userData.user.id);
        // console.log(dashboardStats);
        console.log(activity);
        let totatalCase = activity.success ? activity.data.total_cases : 0;
        // let activeCase = activity.success ? activity.data.active_cases : 0;
        let resolvedCase = activity.success ? activity.data.resolved_cases : 0;
        let pendingCase = activity.success ? activity.data.pending_cases : 0;
        let activityLog = activity.success ? activity.data.activity_logs : 0;
        let totalUsers = activity.success ? activity.data.total_users : 0;

        //update dashboard numbers
        selector('#totalCases').textContent = totatalCase;
        selector('#resolvedCases').textContent = resolvedCase;
        selector('#pendingCases').textContent = pendingCase;
        selector('#activityLogs').textContent = activityLog;
        selector('#totalUsers').textContent = totalUsers;





        const ctx = document.getElementById('casesChart').getContext('2d');
        const casesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Total Cases', 'Resolved Cases', 'Pending Cases', 'Activity logs', 'Total Users'],
            datasets: [{
            label: 'Cases',
            data: [totatalCase, resolvedCase, pendingCase, activityLog, totalUsers],
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#ff9f40'],
            borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
            legend: {
                position: 'bottom'
            }
            }
        }
        });

                    //action buttons loops
            const actionBtn = selectorAll('.action-btn');
            actionBtn.forEach(btn => {
                btn.addEventListener('click', function(e){
                    e.preventDefault();
                    let page = this.getAttribute('data-action');
                    // console.log(page);
                    if(!page)return showToast('Page not found', 'error', 3000);

                    // Remove highlight from all sidebar links
                    //    console.log(document.querySelectorAll(".sdbar"))
                        selectorAll(".sdbar").forEach(link => {
                            link.classList.remove("moj-active-tab");
                           
                            if(link.getAttribute('data-page') === page)link.classList.add('moj-active-tab');
                        });

            window.location.hash = `${this.getAttribute('data-action')}/moj/${this.getAttribute('data-action')}`;

                __LOADER__COMMI(
                        selector('.__MOJ_MAIN__'),
                        '.html', 
                        page,
                        '',
                        function(){
                            // alert('Loaded')
                            showToast('Quick link successfully load ' + page)
                        });

                })
            })

        // commissionerActivity
        // Recent Activity Logs
        const activityContainer = selector('#activityList');
        activityContainer.innerHTML = ''; // Clear existing content
        if(!dashboardStats.success || dashboardStats.logs.length === 0){
            activityContainer.innerHTML = '<p>No recent activity found.</p>';
            return;
        }else{
        // console.log(dashboardStats.logs);
        dashboardStats.logs.forEach((log, index) => {
            // Limit to 5 recent activities
            if(index >= 5) return;
            // const logDate = new Date(log.timestamp);
            // const created_at = logDate.toLocaleString(); // Format the date as needed
            const activityCard = newElement('div');
            activityCard.className = 'activity-card';
            activityCard.innerHTML = `
                <p><strong>${log.description}</strong></p>
                <span class="time">${timeAgo(toDateInputFormat(log.created_at))}</span>
            `;
            activityContainer.appendChild(activityCard);
        })}

        //activtiy log search here
        //commisionerlogs
        selector('#searchActivity').addEventListener('input', async function(e){
            e.preventDefault();

            if(!validateInput(this.value, 'text')) return showToast('Invalid search input', 'error', 3000);
            let searchTerm = this.value.trim();
            // if(searchTerm.length < 3)return showToast('Please enter at least 3 characters to search', 'error', 3000);
            let searchResults = await api.commisionerlogs(searchTerm, 5);
            // console.log(searchResults);
            activityContainer.innerHTML = ''; // Clear existing content

            if(!searchResults.success || searchResults.logs.length === 0){
                activityContainer.innerHTML = '<p>No activity found.</p>';
                return;
            }else{

            //check and limit to 5 results
            searchResults.logs.forEach((log, index) => {
                if(index >= 5) return;
                const activityCard = newElement('div');
                activityCard.className = 'activity-card';
                activityCard.innerHTML = `
                    <p><strong>${log.description}</strong></p>
                    <span class="time">${timeAgo(toDateInputFormat(log.created_at))}</span>
                `;
                activityContainer.appendChild(activityCard);
            });}

       
       
        });


    }catch(e){
        showToast(e || "Parameter error, contact developer", 'info');
        console.error(e);
    }

    })();

      break;

    case 'logout':
                  // Handle logout functionality
                //   alert('Logging out...');
                (async () =>{
                  const logoutBtn = selector('.btn-logout');
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

    case 'allcase':
        (async () => {
            //check if user is logged in
                const isAuth      = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);
        
                    if(!isAuth || !isAuth.logged_in){
                        showToast('User is not Authenticated', 'error',  2000);
                        setTimeout(()=> window.location.href = __ROOT__ + 'login.html', 2000);
                        return;
                    }
            //searchCase()
            let caseRtn = selector('#case-table');
            selector('.search-input').addEventListener('input', async function(){
                const searchParam = this.value;

                //check for error
                if(!validateInput(searchParam,'text')) return showToast('Error: invalid search parameter', 'error');

                const searchResult = await api.searchCase(searchParam);
                console.log(searchResult);

                //search data not foun
                if(!searchResult || searchResult.cases.length === 0){
                    caseRtn.innerHTML = `
                        <div class="case-row">
                            <p>No data found!</p>
                        </div>
                    `;
                }else{
                    caseRtn.innerHTML = '';
                    searchResult.cases.forEach((cs, i) => {
                    let wraper = newElement('div');
                        wraper.className = 'case-row';
                        wraper.innerHTML = `
                            <span>#00${cs.id}</span>
                            <span>${cs.title}</span>
                            <span class="status ${cs.status.toLowerCase()}">${cs.status}</span>
                            <span>${toDateInputFormat(cs.created_at)}</span>
                            <button onclick="viewCase(event, ${cs.id})" class="view-btn" data-id="${cs.id}">View</button>
                        `;
                            caseRtn.appendChild(wraper);
                        })
                }

            })

            //return data fcase
            const cases = await api.fcase();

                if(!cases && cases.length === 0){
                    caseRtn.innerHTML = `
                    
                        <div class="case-row">
                            <p>No data found!</p>
                        </div>
                    
                    `;
                    return;
                }

            caseRtn.innerHTML = '';
            cases.forEach((cs, i) => {
                let wraper = newElement('div');
                    wraper.className = 'case-row';
                    wraper.innerHTML = `
                        <span>#00${cs.id}</span>
                        <span>${cs.title}</span>
                        <span class="status ${cs.status.toLowerCase()}">${cs.status}</span>
                        <span>${toDateInputFormat(cs.created_at)}</span>
                        <button onclick="viewCase(event, ${cs.id})" class="view-btn" data-id="${cs.id}">View</button>
                    `;
                caseRtn.appendChild(wraper);
            })



        })();



    break;


    }
}





function viewCase(e, caseId){
    // alert("yess am here")
    // console.log(e);
    api.showPopup(selector('body'), 'beforeend', async function() {
            const popup = selector('.popup-overlay');
            const caseDetails = await api.singleCaseDetails(caseId);
        
            if(!caseDetails || caseDetails.case.length === 0)showToast('Cannot retrieved information about this case, please try again', 'info');
            popup.innerHTML = `
                <div class="popup-overlay">
                    <div class="popup-content">
                        <h2>View case information</h2>
                        
                        <div class="__iyakise raphale">
                            <!---- product of iyakise Rapahel ----->
                              <div class="case-details-card">
                                <div class="case-info">
                                <p><strong>Case ID:</strong> <span class="caseID">${caseDetails.case.case_number}</span></p>
                                <p><strong>Case Title:</strong> <span class="caseTitle">${caseDetails.case.title}</span></p>
                                <p><strong>Client Name:</strong> <span class="clientName">${caseDetails.case.client_name}</span></p>
                                <p><strong>Assigned Lawyer:</strong> <span class="assignedLawyer">${caseDetails.case.lawyer_name}</span></p>
                                <p><strong>Status:</strong> <span class="status ongoing">${caseDetails.case.status}</span></p>
                                <p><strong>Created On:</strong> <span class="createdOn">${toDateInputFormat(caseDetails.case.created_at)}</span>   :<strong>${timeAgo(toDateInputFormat(caseDetails.case.created_at))}</strong></p>
                                <p><strong>Last Updated:</strong> <span class="lastUpdated">${toDateInputFormat(caseDetails.case.updated_at)}</span>   :<strong>${timeAgo(toDateInputFormat(caseDetails.case.updated_at))}</strong></p>
                                </div>
                            </div>

                            <div class="case-description">
                                <h3>Case Description</h3>
                                <p class="caseDesc">
                                    ${caseDetails.case.description}
                                </p>
                            </div>

                            <div class="case-description">
                                <h3>Case Documents</h3>
                                <ul class="caseDocuments">
                                <li><strong>Property Deed.pdf:</strong>  <button class="btn">View</button></li>
                                <li><strong>Survey Report.pdf:</strong>  <button class="btn">View</button></li>
                                <li><strong>Correspondence.docx:</strong>  <button class="btn">View</button></li>
                                </ul>
                            </div>

                            <div class="case-actions">
                                <button disabled aria-disabled="true" class="btn primary">Update Progress</button>
                                <button disabled aria-disabled="true" class="btn secondary">Upload Document</button>
                                <button disabled aria-disabled="true" class="btn danger">Close Case</button>
                            </div>

                            <div class="case-timeline">
                                <h3>Case Timeline</h3>
                                <ul>
                                <li><span>Jan 12, 2025:</span> Case created by Commissioner</li>
                                <li><span>Jan 15, 2025:</span> Case assigned to Lawyer</li>
                                <li><span>Feb 02, 2025:</span> First hearing scheduled</li>
                                <li><span>Feb 20, 2025:</span> Progress updated by Lawyer</li>
                                </ul>
                            </div>

                            <!------------- 5 october 2025 dont foget this date, this module you are seeing here -------------------->
                        </div>
                    </div>
                </div>
            `;
let timeline = caseDetails.timeline;
let timelineEl = selector('.case-timeline ul');
    timelineEl.innerHTML = '';
    if(timeline.length === 0){
        timelineEl.innerHTML = `
            <li>No timeline for this case.</li>
        `;
    }else{
        timeline.forEach((time, i)=>{
            let li = newElement('li');
                li.innerHTML =  `
                    <span>${toDateInputFormat(time.created_at)}:</span> ${time.remarks} Update by:<strong>${time.updated_by_name}</strong>
                `;
            timelineEl.appendChild(li);
        })
    }

//case document show preview
let caseDocumentUl  = selector('.caseDocuments');
let caseDocuments   = caseDetails.documents;
caseDocumentUl.innerHTML = ''; //clearout previous data
if(caseDocuments.length === 0){
    caseDocumentUl.innerHTML = `
        <li>No single case document found!</li>
    `;
}else{
    caseDocuments.forEach((docs) => {
        let li = newElement('li');
            li.innerHTML =  `
                ${docs.file_name} <button class="btn __xtc__" data-id="${docs.id}" data-path="${docs.file_path}" data-name="${docs.file_name}" data-uploader="${docs.uploaded_by_name}">View</button>
            `;
        caseDocumentUl.appendChild(li);
    })

const viewBtn = selectorAll('.__xtc__');
     viewBtn.forEach(btn =>{
        btn.addEventListener('click', function(){
            const filePath = this.getAttribute('data-path');


                const fileName = this.getAttribute('data-name');
                const uploadedBy = this.getAttribute('data-uploader');
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



        })
     })
}

const style = newElement('style');
style.innerHTML = `
                    .case-details-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.case-info p {
  margin: 8px 0;
  font-size: 15px;
  color: #333;
}

.status {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 13px;
}
.status.open{
  background: #e0ffe0;
  color: #28a745;
}


.status.ongoing,
.status.in-progress {
  background: #e0f3ff;
  color: #007bff;
}

.status.closed {
  background: #ffe0e0;
  color: #dc3545;
}

.case-description {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.case-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: 0.3s;
}

.btn.primary {
  background: #007bff;
  color: #fff;
}

.btn.secondary {
  background: #6c757d;
  color: #fff;
}

.btn.danger {
  background: #dc3545;
  color: #fff;
}

.btn:hover {
  opacity: 0.9;
}

.case-timeline,
.caseDocuments {
  margin-top: 20px;
}

.case-timeline ul
.caseDocuments ul {
  list-style: none;
  padding: 0;
}

.case-timeline li,
.caseDocuments li {
  margin: 10px 0;
  padding-left: 15px;
  border-left: 3px solid #007bff;
  font-size: 14px;
  color: #555;
}

.case-timeline span,
.caseDocuments strong {
  font-weight: 600;
  color: #000;
  margin-right: 8px;
}


.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.__iyakise{
    height:80vh !important;
    overflow-y:auto !important;
}

@media (max-width: 768px) {
  .case-actions {
    flex-direction: column;
  }
  .btn {
    width: 100%;
    text-align: center;
  }
}
`;
document.head.appendChild(style);


    })
}


// make it global
window.viewCase = viewCase; 
window.closePopup = function() {
    const popup = selector('.popup-container');
    if (popup) popup.remove();
};
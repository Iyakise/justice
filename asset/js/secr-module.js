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

        const request = await fetch(`${__ROOT__}asset/__LOADER__/PSEC/${pge}${type}`, {
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
    switch(p){
        case 'index':
        (async () => {
        try{
            const userData = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);
            // const dbStats = await loader.loadGet('asset/apis/psec.db.data.php', '', false);
            const db = await loader.loadGet('asset/apis/psec.db.data.php', '', false);
            if (!userData && userData.logged_in === false) {
                showToast('User not authenticated', 'error', 3000);
                setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
                return;
            }
            
            // document.addEventListener('DOMContentLoaded', function () {
    // ===== Activity Overview (Doughnut) =====
        // Chart.js setup
        const ctx = document.getElementById('caseChart').getContext('2d');
            new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ongoing', 'Closed', 'Pending'],
                datasets: [{
                label: 'Cases',
                data: [db.data.ongoing_cases, db.data.closed_cases, db.data.pending_reviews],
                backgroundColor: ['#FF7F00','#008000','#FFD580']
                }]
            },
                options: {
                    responsive: true,
                    plugins: {
                    legend: { display: false }
                    }
                }
            });

            //db status
            // console.log(selector('#ttlcase'));
            let  ttlcase = selector('#ttlcase');
            let  ongoingcase = selector('.ongoingcase');
            let  closedCase = selector('.closedCase');
            let  pendingCase = selector('.pendingCase');

                ttlcase.innerHTML = db.data.total_cases;
                ongoingcase.innerHTML = db.data.ongoing_cases;
                closedCase.innerHTML = db.data.closed_cases;
                pendingCase.innerHTML = db.data.pending_reviews;



            //db logs
            let logCont = selector('.ps-activity ul');

            await loader.loadGet('asset/apis/activit-log.php', function(data){
                // console.log(data);

                if(data.data.length === 0){
                    logCont.innerHTML = `
                    <li>
                        <span class="time">00:00</span>
                        No activity logs found
                    </li>`;
                    return;
                }
                logCont.innerHTML = '';
                data.data.forEach((log, i) => {
                    if(i >= 5)return;
                    let li = newElement('li');
                    li.className = 'iyakise-favourite iyakise-whatsapp-+2349069053009 this is my work 5-10-2025';
                    li.innerHTML = `
                        <span class="time">${timeAgo(log.created_at)}</span>
                        ${log.description}
                    `;
                    logCont.appendChild(li);
                })
            }, false);












        }catch(e){
            showToast(e || "Unexpected error in dashboard");
        }

        })();


        break;

        case 'tcases':
        (async () => {
                const userData = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);
            // const dbStats = await loader.loadGet('asset/apis/psec.db.data.php', '', false);
            if (!userData && userData.logged_in === false) {
                showToast('User not authenticated', 'error', 3000);
                setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
                return;
            }

            //cases update here
            let caseCnt = selector('.caseTbody');
            await loader.loadGet('asset/apis/psec.cases.php', function(data){
                const cases = data.data;
                    
                    if( ! data.status && cases.length === 0){
                        caseCnt.innerHTML = `
                            <tr>
                                <td colspan="7">No data found here...</td>
                            </tr>
                        `;
                        return;
                    }else{
                        caseCnt.innerHTML = '';
                        cases.forEach((cs, i) => {
                            let tr = newElement('tr');
                            tr.innerHTML = `
                                <td>#${cs.case_number}</td>
                                <td>${cs.title}</td>
                                <td>${cs.lawyer}</td>
                                <td><span class="status ${cs.status.toLowerCase()}">${cs.status}</span></td>
                                <!--td>
                                    <div class="progress-bar">
                                    <div class="progress" style="width: 25%;"></div>
                                    </div>
                                </td-->
                                <td>${timeAgo(cs.date_assigned)}</td>
                                <td><button onclick="showPreview(${cs.id})" id="${cs.id}" data-action="${cs.id}" class="btn-view">Track</button></td>
                            `;
                            caseCnt.appendChild(tr);
                        })
            

                        //update data from and let preview
                        
                    }


                    //secretary iyakise raphael search for case
                    selector('#Sffx-kkkeud').addEventListener('input', async function(){
                        let searchVal = this.value;

                            if(!validateInput(searchVal, 'text'))return showToast('Invalid input data', 'error');
                           let req =  await loader.default('/asset/apis/psec.case.search.php', '', {search: searchVal});

                           if(!req.success){
                             showToast(req.message || 'Unexpected result');
                             return;
                           }

                        //    console.log(req);

                        if( ! req.status && req.data.length === 0){
                        caseCnt.innerHTML = `
                            <tr>
                                <td colspan="7">No data found here...</td>
                            </tr>
                        `;
                        // return;
                    }else{
                        caseCnt.innerHTML = '';
                        req.data.forEach((cs, i) => {
                            let tr = newElement('tr');
                            tr.innerHTML = `
                                <td>#${cs.case_number}</td>
                                <td>${cs.title}</td>
                                <td>${cs.lawyer_name}</td>
                                <td><span class="status ${cs.status.toLowerCase()}">${cs.status}</span></td>
                                <!--td>
                                    <div class="progress-bar">
                                    <div class="progress" style="width: 25%;"></div>
                                    </div>
                                </td-->
                                <td>${timeAgo(cs.created_at)}</td>
                                <td><button onclick="showPreview(${cs.id})" id="${cs.id}" data-action="${cs.id}" class="btn-view">Track</button></td>
                            `;
                            caseCnt.appendChild(tr);
                        })
            

                        //update data from and let preview
                        
                    }


                    })


                    //filter case data
                    selector('#CaseFilter').addEventListener('change', async function(){
                        let filterData = this.value;
                        if(filterData === '')return showToast('Please select filter status', 'info');

                        let req = await loader.default('/asset/apis/psec.filter.case.status.php', false, {status: filterData});

                        if(!req.status)return showToast(req.message || 'Error: fail to get data from status', 'error');

                        if(req.data.length === 0)return showToast('No result found for this status', 'info');

                        caseCnt.innerHTML = '';
                        req.data.forEach((cs, i) => {
                            let tr = newElement('tr');
                            tr.innerHTML = `
                                <td>#${cs.case_number}</td>
                                <td>${cs.title}</td>
                                <td>${cs.lawyer_name}</td>
                                <td><span class="status ${cs.status.toLowerCase()}">${cs.status}</span></td>
                                <!--td>
                                    <div class="progress-bar">
                                    <div class="progress" style="width: 25%;"></div>
                                    </div>
                                </td-->
                                <td>${timeAgo(cs.created_at)}</td>
                                <td><button onclick="showPreview(${cs.id})" id="${cs.id}" data-action="${cs.id}" class="btn-view">Track</button></td>
                            `;
                            caseCnt.appendChild(tr);
                        })

                    })

                
            }, false);

            

        })();
        break;

        case 'logout':
            (async() => {
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

        case 'mprofile':
            (async ()=> {
                    const userData = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);
                // const dbStats = await loader.loadGet('asset/apis/psec.db.data.php', '', false);
                if (!userData && userData.logged_in === false) {
                    showToast('User not authenticated', 'error', 3000);
                    setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
                    return;
                }

                loader.loadGet('asset/apis/signle.user.record.php', (result) => {
                    
                    let preview = selector('.preview img');
                    let nm = selector('#fullName');
                    let em = selector('#email');
                    let ph = selector('#phone');
                    let pw1= selector('#password');
                    let pw2= selector('#confirmPassword');
                    let btn = selector('.save');
                    let imgsrc = '';;
    
                    nm.value = result.user.full_name;
                    em.value = result.user.email;
                    ph.value = result.user.phone;
    
                    nm.disabled = true;
                    ph.disabled = true;
                    em.disabled = true;
                    btn.disabled = true;
                    pw1.disabled = true;
                    pw2.disabled = true;

                    if(result.user.profile_image == null)
                        {
                            imgsrc = __ROOT__ + 'asset/img/female-mdium.png';
                        }else{
                            imgsrc = __ROOT__ + 'asset/' + result.user.profile_image;

                        }
                
                    preview.src = imgsrc;
                    preview.srcset = imgsrc;
                    preview.title = result.user.full_name + ' Profile Image';
                
                }, {uid: userData.user.id});


                //profile update start here
                selector('#Uploader').addEventListener('change', function(){
                    // let selectedImage = this.value;
                        let newBtn = newElement('button');
                            newBtn.className = 'btn uploader proceed';
                            newBtn.innerHTML = '<i class="fas fa-upload fas fa-shake"></i> Upload Now';
                            newBtn.style.setProperty('display', 'block');


                        const img = this.files[0];
                        let preview = selector('.preview img');
                        let preWr = selector('.preview');
                        if(!img)return showToast('No image selected', 'error', 3000);

                        let blobdata = URL.createObjectURL(img);
                        preview.src = blobdata;
                        preview.srcset = blobdata;

                        if(!preWr.querySelector('.uploader')){
                            preWr.appendChild(newBtn);
                        }
                        

                        window.imageToUpload = img;

                        newBtn.addEventListener('click', async(event)=> {
                            event.preventDefault();
                            let img = window.imageToUpload;

                            if(!img) return showToast('No image selected, please try again', 'error');

                            // userData
                            //upload image
                            const formData = new FormData();
                            formData.append('profile_image', img);
                            formData.append('user_id', userData.user.id);
                         
                            const req = await loader.default('/asset/apis/lawyer.upload.profile.php', '', formData);
                             
                            console.log(req);
                            if(!req.success)return showToast(req.message || 'Image fail to upload', 'error');

                            showToast(req.message || 'Upload success', 'success');
                            setTimeout(() => window.location.reload(), 3000);
                        })
                });
            })();
        break;

        case 'logs':
            (async ()=> {
                const userData = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);
                // const dbStats = await loader.loadGet('asset/apis/psec.db.data.php', '', false);
                if (!userData && userData.logged_in === false) {
                    showToast('User not authenticated', 'error', 3000);
                    setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
                    return;
                }
                let logcontainer = selector('.log-container');
                await loader.loadGet('/asset/apis/activit-log.php', (logs)=> {
            

                    if(logs.data.length === 0){
                        showToast('No recents Logs found in the system!')
                        logcontainer.innerHTML = `
                            <div class="log-entry">
                                <p><strong >No data:</strong> No recent data found in the system.</p>
                            </div>
                        `;
                    }else{
                        logcontainer.innerHTML = '';
                        logs.data.forEach((log, i) => {
                            let wrp = newElement('div');
                                wrp.className = 'log-entry';
                                wrp.innerHTML = `
                                    <span class="time">${log.created_at} &ndash; ${timeAgo(log.created_at)}</span>
                                    <p><strong>${log.action.replace(/[_-]/, ' ')}</strong> ${log.description}</p>
                                `;
                            logcontainer.appendChild(wrp);
                        })

                    }
                }, false);


                //filter cases data
                selector('#m_sld_fxtc').addEventListener('input', async() => {
                    let val = selector('#m_sld_fxtc').value;
                    // let type    = selector('#filter-type');

                    if(!validateInput(val, 'text')) return showToast('Please input correct data', 'info');

                    
                    let req = await loader.default('/asset/apis/logs.filter.search.php', '', {search: val, limit: 25})

                    if(!req.success){
                        logcontainer.innerHTML = `
                            <div class="log-entry">
                                <span class="time">No data:</span>
                                <p>We could find any data that match your search "${val}".</p>
                            </div>
                        `;
                        return; 
                    }

                    if(req.logs.length === 0){
                        logcontainer.innerHTML = `
                            <div class="log-entry">
                                <span class="time">No data:</span>
                                <p>We could find any data that match your search "${val}".</p>
                            </div>
                        `;
                        return; 
                    }

                    logcontainer.innerHTML = '';
                    req.logs.forEach((log, i) => {
                        let wrp = newElement('div');
                            wrp.className = 'log-entry';
                            wrp.innerHTML = `
                                <span class="time">${log.created_at} &ndash; ${timeAgo(log.created_at)}</span>
                                <p><strong>${log.action.replace(/[_-]/, ' ')}</strong> ${log.description}</p>
                            `;
                        logcontainer.appendChild(wrp);
                    })

                })
            })();   
        break;
    
        // case 'mprofile':
        //     (async ()=> {
        //         const userData = await loader.loadGet('asset/apis/auth/IsAuth.php', '', false);
        //         // const dbStats = await loader.loadGet('asset/apis/psec.db.data.php', '', false);
        //         if (!userData && userData.logged_in === false) {
        //             showToast('User not authenticated', 'error', 3000);
        //             setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
        //             return;
        //         }





        //     })();
        // break;
    
    
    }
}



function showPreview(caseId){
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


window.showPreview = showPreview;
window.closePopup = function() {
        const popup = selector('.popup-container');
        if (popup) popup.remove();
    selector('body').classList.remove('blurred');

    };
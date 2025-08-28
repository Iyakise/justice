// Import functions from utils.js
import { __ROOT__, __LOADER__COMMI, showToast, selector, selectorAll } from "./law-module.js";

document.addEventListener("DOMContentLoaded", function () {
    // showToast('hellow world', 'info', 4000)
    const basePath = "/moj/staff-ms/"; // ✅ base project path
    const navLinks = document.querySelectorAll(".sidebar a");
    const mainContent = selector(".__MOJ_MAIN__");
   

    // Handle menu clicks
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            //highlight active tab
            let tab = selector('.moj-active-tab');
              if(tab)tab.classList.remove('moj-active-tab');

              //color current tab
              this.classList.add('moj-active-tab');

            let tool =  this.getAttribute("data-page").replace(/^\/+/, '');
            let newUrl = window.location.hash = `${tool}/lawyer/${tool}`;
                window.location.hash =  `${tool}/lawyer/${tool}`


            // Push state to browser history
          // history.pushState({ tool }, "", newUrl);

            // Load page content
           __LOADER__COMMI(
              mainContent, 
              '.html', 
              this.getAttribute('data-page'),
              ''); //load content





        });
    });

    // Handle back/forward navigation
     // ✅ Handle Back/Forward navigation
    window.addEventListener("popstate", function (event) {
      //console.log(event);
        if (event.state && event.state.tool) {
            let tool = event.state.tool;

            // reload content when user navigates history
            __LOADER__COMMI(mainContent, '.html', tool, '');

            // also re-apply active tab highlight
            let tab = selector('.moj-active-tab');
            if (tab) tab.classList.remove('moj-active-tab');

            let activeLink = document.querySelector(`.sidebar a[data-page="${tool}"]`);
            if (activeLink) activeLink.classList.add('moj-active-tab');
        }
    });

    // Initial page load (when refreshing directly)
    let currentPath = window.location.hash;
        // currentPath.replace('#', '');
    let path = currentPath.replace('#', '').split('/');

        __LOADER__COMMI(
              mainContent, 
              '.html', 
              path[0],
              ''); //load content

      navLinks.forEach(link => {
        if(link.getAttribute('data-page') === path[0]){
            let tab = selector('.moj-active-tab');
                if(tab)tab.classList.remove('moj-active-tab');

            link.classList.add('moj-active-tab');
        }
      

      })

});


// Simulated storage for staff
const recentStaff = [];

// document.getElementById("addStaffForm").addEventListener("submit", function(e) {
//   e.preventDefault();

//   // Collect values
//   const name = document.getElementById("staffName").value;
//   const email = document.getElementById("staffEmail").value;
//   const phone = document.getElementById("staffPhone").value;
//   const dept = document.getElementById("staffDept").value;
//   const dateAdded = new Date().toLocaleDateString();

//   // Add to array (unshift for most recent first)
//   recentStaff.unshift({ name, email, phone, dept, dateAdded });

//   // Keep only 10
//   if (recentStaff.length > 10) {
//     recentStaff.pop();
//   }

//   // Update table
//   updateStaffTable();

//   // Reset form
//   this.reset();
// });

function updateStaffTable() {
  const tbody = document.querySelector("#recentStaffTable tbody");
  tbody.innerHTML = "";

  recentStaff.forEach(staff => {
    const row = `<tr>
      <td>${staff.name}</td>
      <td>${staff.email}</td>
      <td>${staff.phone}</td>
      <td>${staff.dept}</td>
      <td>${staff.dateAdded}</td>
    </tr>`;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}


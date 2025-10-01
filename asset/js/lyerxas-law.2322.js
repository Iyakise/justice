// Import functions from utils.js
import { __ROOT__, showToast, selector, selectorAll } from "./flo3fwf";
import { __LOADER__COMMI } from "./law-module";
import * as loader from "./load";

document.addEventListener("DOMContentLoaded", async function () {
    // showToast('hellow world', 'info', 4000)
    try{
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
              function(){alert('Page loaded yes thirdio');}); //load content





        });
    });

    // Handle back/forward navigation
     // ✅ Handle Back/Forward navigation
    window.addEventListener("popstate", function (event) {
      //console.log(event);
        if (event.state && event.state.tool) {
            let tool = event.state.tool;

            // reload content when user navigates history
            __LOADER__COMMI(mainContent, '.html', tool, function(){alert('Page loaded second')});

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
       path = path == '' ? ['dashboard'] : path;
 
        __LOADER__COMMI(
              mainContent, 
              '.html', 
              path[0],
              false); //load content

      navLinks.forEach(link => {
        if(link.getAttribute('data-page') === path[0]){
            let tab = selector('.moj-active-tab');
                if(tab)tab.classList.remove('moj-active-tab');

            link.classList.add('moj-active-tab');
        }
      

      })


      // selector('.mylwer').innerHTML += await();
      
          const userData = await loader.loadGet('asset/apis/auth/IsAuth.php', '', '');
          if (userData && userData.logged_in !== false) {
              // showToast('User not authenticated', 'error', 3000);
              selector('.mylwer').innerHTML += ` ${userData.user.fullname}`;
              // setTimeout(() => { window.location.href = __ROOT__ + 'login.html'; }, 3000);
              // return;
          }
;

}catch(e){
  console.error(e);
}

});
// 1234567890AAAAaaaa@@@@
// whatsapp: +2349069053009
//load post

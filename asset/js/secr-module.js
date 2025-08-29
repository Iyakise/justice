// import  Chart from "https://cdn.jsdelivr.net/npm/chart.js";

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



// Toast function
export function showToast(message, type = "info", duration = 3000) {
    let toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, duration);
}


export function selector(d){
    return document.querySelector(d);
}

export function selectorAll(d){
    return document.querySelector(d);
}



export function initialiazeFunctions(p){
    switch(p){
      case 'index':
        
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
                data: [20, 25, 5],
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


      break;
    }
}

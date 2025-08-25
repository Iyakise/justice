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

        initialiazeFunctionsComm(pge);

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
        const ctx = document.getElementById('casesChart').getContext('2d');
        const casesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Active Cases', 'Resolved Cases', 'Pending Cases'],
            datasets: [{
            label: 'Cases',
            data: [47, 89, 16],
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
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


      break;
    }
}

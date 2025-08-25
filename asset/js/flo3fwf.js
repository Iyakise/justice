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
            const actCtx = document.getElementById('activityChart').getContext('2d');
            new Chart(actCtx, {
                type: 'doughnut',
                data: {
                labels: ['Staff Added', 'Cases Registered', 'Departments Created', 'Case Updates', 'Logins'],
                datasets: [{
                    data: [5, 8, 3, 4, 10], // <- replace with your real counts
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
        data: [12, 19, 8, 15, 20, 14, 10, 18, 22, 17, 25, 19], // <- replace with your monthly counts
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
// });

      break;
    }
}

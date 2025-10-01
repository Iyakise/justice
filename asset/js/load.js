import { __ROOT__, showToast } from "./flo3fwf";

export default async function load(route, callback, data = {}) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const request = await fetch(`${__ROOT__}${route}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ' + token
            },
            signal: controller.signal,
            body: JSON.stringify(data)
        });

        clearTimeout(timeoutId);

        if (!request.ok) {
            throw new Error("Error: Server responded with " + (await request.text()));
        }

        const result = await request.json();

        if (callback) callback();

        return result;

    } catch (e) {
        console.error(e);
        showToast(e.message || 'Error loading request', 'error');
        return {status: false, message: e.message};
    }
}

// 1234567890AAAAaaaa@@@@
// whatsapp: +2349069053009
//load get
export async function loadGet(route, callback, data = {}) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        // Build query string from object
        const queryString = new URLSearchParams(data).toString();
        const url = `${__ROOT__}${route}${queryString ? '?' + queryString : ''}`;
// console.log(url)
        const request = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ' + token
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!request.ok) {
            throw new Error("Error:  Server responded with -> " + (await request.text()));
        }

        const result = await request.json();

        if (callback) callback(result);

        return result;

    } catch (e) {
        console.error(e);
        showToast(e.message || 'Error loading request', 'error');
        return {status: false, message: e.message};
    }
}


// file path
export async function path(p) {
    const routes = {
        lawyer: '/staff-ms/lawyer/',
        commissioner: '/staff-ms/commissioner/',
        psecretary: '/staff-ms/psecretary/'
    };

    const url = routes[p];

    if (!url) {
        throw new Error(`Unknown user path type: ${p}`);
    }

    return url;
}

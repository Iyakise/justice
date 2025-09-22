import { __ROOT__, showToast } from "./flo3fwf";
export default async function load(d,callback,data) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds
        // console.log(pge)
        // pge  == 'dashboard' ? 'index' : pge;
        // if(pge === 'dashboard')pge = 'index';

        const request = await fetch(`${__ROOT__}${d}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ' + token
            },
            signal: controller.signal,
            body:JSON.stringify(data)
        });

        if(!request.ok){throw new Error("Error: while trying to load " + d);}

        const result = await request.json();

        if(callback)callback()
            
        clearTimeout(timeoutId);
        return result;

    }catch(e){
        console.error(e);
        showToast(e || 'Error loading request', 'error');
    }
}
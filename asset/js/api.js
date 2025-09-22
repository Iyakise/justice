/**
 * API functions for user management
 * start api to add staff
 */
import { __ROOT__, newElement, showToast } from "./flo3fwf";

export async function saveStaff(fullName, email, phone, role, departments, status) {
    try {
        const response = await fetch(`${__ROOT__}asset/apis/add-st-ff.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName,
                email,
                phone,
                role,
                departments,  // array or string depending on backend
                status
            })
        });

        // Check for HTTP-level errors
        if (!response.ok) {
            const errorText = await response.text();
            showToast(`Server Error: ${errorText}`, "error");
            return false;
        }

        // Parse JSON safely
        const result = await response.json();

        if (result.status) {
            showToast(result.message || "Staff saved successfully!", "success");
            return true;
        } else {
            showToast(result.message || "Failed to save staff.", "error");
            return false;
        }

    } catch (error) {
        console.error("Fetch error:", error);
        showToast("Network error while saving staff.", "error");
        return false;
    }
}


//get staff list
export async function getStaff() {
    try {
        const response = await fetch(`${__ROOT__}asset/apis/recent-staff.php`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            showToast(`Server Error: ${errorText}`, "error");
            return [];
        }

        // Parse JSON safely
        const result = await response.json();

        if (result.status) {
            return result.data || [];
        } else {
            showToast(result.message || "Failed to fetch staff list.", "error");
            return [];
        }

    } catch (error) {
        console.error("Fetch error:", error);
        showToast("Network error while fetching staff list.", "error");
        return [];
    }
}

export async function staff(){
    try {
        const request = await fetch(`${__ROOT__}asset/apis/get-staff.php`);
        
        if (!request.ok) {
            console.error("HTTP error:", request.status);
            return [];
        }

        const data = await request.json();
        // console.log(data);
        return data;

    } catch (error) {
        console.error("Fetch error:", error);
        return []
    }

}

export async function singleStaff(id){
    try {
        const request = await fetch(`${__ROOT__}asset/apis/single-staff.php?id=${id}`);

        if (!request.ok) {
            console.error("HTTP error:", request.status);
            return [];
        }

        const data = await request.json();
        // console.log(data);
        return data;

    } catch (error) {
        console.error("Fetch error:", error);
        return []
    }

}

export async function addDepartment(deptName, description) {
    try {
        const response = await fetch(`${__ROOT__}asset/apis/add-department.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: deptName,
                description: description
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            showToast(`Server Error: ${errorText}`, "error");
            return false;
        }

        const result = await response.json();

        if (result.status) {
            showToast(result.message || "Department added successfully!", "success");
            return true;
        } else {
            showToast(result.message || "Failed to add department.", "error");
            return false;
        }

    } catch (error) {
        console.error("Fetch error:", error);
        showToast("Network error while adding department.", "error");
        return false;
    }
}   

// export async function staff(){
//     try {
//         const request = await fetch(`${__ROOT__}asset/apis/get-staff.php`);

//         if (!request.ok) {
//             console.error("HTTP error:", request.status);
//             return [];
//         }

//         const data = await request.json();
//         // console.log(data);
//         return data;

//     } catch (error) {
//         console.error("Fetch error:", error);
//         return []
//     }

// }


/**
 * popup and blur background
*/

export function showPopup(popupAppear, position,callback) {
    const popCnt = newElement('div');
    popCnt.className = 'popup-container pop-active to-flex column';
    popCnt.innerHTML = `
        <div class="popupoverWrap">
            <div class="popup to-left">
                <button class="btn-close"><i title="Close" class="fas fa-xmark fa-shake"></i></button>
            </div>
            <div class="popup-overlay content-data-box">
                <h2>Popup Title</h2>
                <p>This is a sample popup content.</p>
            </div>
        </div>
    `;
    popupAppear.insertAdjacentElement(position, popCnt);

    if(callback) callback();
    // Blur background
    document.body.classList.add('blurred');

    // Close popup event
    popCnt.querySelector('.btn-close').addEventListener('click', () => {
        document.body.classList.remove('blurred');
        popCnt.remove();
    }); 
}

//get departments last 5
export async function last5Department() {
    try {
        const response = await fetch(`${__ROOT__}asset/apis/last-5-department.php`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            showToast(`Server Error: ${errorText}`, "error");
            return [];
        }

        const result = await response.json();

        if (result.status) {
            return result.data || [];
        } else {
            showToast(result.message || "Failed to fetch departments.", "error");
            return [];
        }

    } catch (error) {
        console.error("Fetch error:", error);
        showToast("Network error while fetching departments.", "error");
        return [];
    }
}


//get all departments
export async function allDepartments(){
    try {
        const request = await fetch(`${__ROOT__}asset/apis/get-departments.php`);
        if (!request.ok) {
            console.error("HTTP error:", request.status);
            throw new Error("Failed to fetch departments");
            // return [];
        }
        const data = await request.json();
        return data.data;
    } catch (error) {
        console.error("Fetch error:", error);
        showToast(error || "Network error while fetching departments.", "error");
        return []
    }
}


//get single department
export async function singleDepartment(id){
    try {
        const request = await fetch(`${__ROOT__}asset/apis/single-department.php?id=${id}`);
        if (!request.ok) {
            console.error("HTTP error:", request.status);
            throw new Error("Failed to fetch department");
            // return [];
        }
        const data = await request.json();
        return data.data;
    } catch (error) {
        console.error("Fetch error:", error);
        showToast(error || "Network error while fetching department.", "error");
        return null;
    }
}


//update department
export async function updateDepartment(deptId, deptName, description, depthead, deptcode) {
    try {   
        const response = await fetch(`${__ROOT__}asset/apis/edit-department.php`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({deptId, deptName, description, depthead, deptcode})
        });
        if (!response.ok) {
            const errorText = await response.json();
            showToast(`Server Error: ${errorText}`, "error");
            return false;
        }
        const result = await response.text();

        console.log(result);
        if (result.status) {
            showToast(result.message || "Department updated successfully!", "success");
            return true;
        } else {
            showToast(result.message || "Failed to update department.", "error");
            return false;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        showToast("Network error while updating department.", "error");
        return false;
    }
}


//delete department
export async function deleteDepartment(deptId){
    try {
        const response = await fetch(`${__ROOT__}asset/apis/delete-department.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 'department_id': deptId })
        });

        if (!response.ok) {
            const errorText = await response.text();
            showToast(`Server Error: ${errorText}`, "error");
            return false;
        }   
        const result = await response.json();
        if (result.status) {
            showToast(result.message || "Department deleted successfully!", "success");
            return true;
        } else {
            showToast(result.message || "Failed to delete department.", "error");
            return false;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        showToast("Network error while deleting department.", "error");
        return false;
    }
}

//get activity logs
export async function activityLog(){
    const request = await fetch(`${__ROOT__}asset/apis/activitylog.php`);
    
}

//record case
export async function addNewCase(title, case_number, filed_by, assigned_to, description, case_type, courtDte, caseStatus){
    try {
    const request = await fetch(`${__ROOT__}asset/apis/new.case.iyakise.php`,{
        mode: 'same-origin',
        method: 'POST',
        headers: {
            'Contents-type' : 'application/json'
        },
        body: JSON.stringify({title, case_number, description, filed_by, assigned_to, case_type, courtDte})
    });
        
        if(!request.ok){
            console.log(request.text());
            throw new Error('fail to record case because of unexpected error');
        }

    const result = await request.json();

    if(!result.status) throw new Error("Unexpected error: " + result.message);
    
    return result.status;
    
    } catch (error) {
        showToast(error, 'error');
    }

}


//get all departments
export async function fcase(){
    try {
        const request = await fetch(`${__ROOT__}asset/apis/get-case.php`);
        if (!request.ok) {
            console.error("HTTP error:", request.status);
            throw new Error("Failed to fetch cases");
            // return [];
        }
        const data = await request.json();
        return data.data;
    } catch (error) {
        console.error("Fetch error:", error);
        showToast(error || "Network error while fetching case.", "error");
        return []
    }
}

//get all recent cases
export async function rcase(){
    try {
        const request = await fetch(`${__ROOT__}asset/apis/recent-case.php`);
        if (!request.ok) {
            console.error("HTTP error:", request.status);
            throw new Error("Failed to fetch cases");
            // return [];
        }
        const data = await request.json();
        return data.data;
    } catch (error) {
        console.error("Fetch error:", error);
        showToast(error || "Network error while fetching case.", "error");
        return []
    }
}


//cases search
export async function cSearch(d){
    try {
        const request = await fetch(`${__ROOT__}asset/apis/search/searchQ.php?query=${d}`);
        if (!request.ok) {
            console.error("HTTP error:", request.status);
            throw new Error("Failed to fetch cases");
            // return [];
        }
        const data = await request.json();
        return data.data;
    } catch (error) {
        console.error("Fetch error:", error);
        showToast(error || "Network error while fetching case.", "error");
        return []
    }
}


//cases filter
export async function cfilter(d){
    try {
        const request = await fetch(`${__ROOT__}asset/apis/search/filter-case.php?case_id=${d}`);
        if (!request.ok) {
            console.error("HTTP error:", request.status);
            throw new Error("Failed to fetch cases");
            // return [];
        }
        const data = await request.json();
        return data.data;
    } catch (error) {
        console.error("Fetch error:", error);
        showToast(error || "Network error while fetching case.", "error");
        return []
    }
}


//update cases
export async function updateCase(id, title, description, case_type, status, priority, filed_by, assigned_to, court_date, resolution_date) {
/**
 * @param id case id
 * @param title = "case title"
 * @param description = "case description"
 * @param returns booleans
 */
    try{
    const req = await fetch(`${__ROOT__}asset/apis/update-case.php`, {
        method: 'post',
        cache: 'default',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({id, title, description, case_type, status, priority, filed_by, assigned_to, court_date, resolution_date})
    })

    if(!req.ok){
        let rst = await req.text();
        console.log(rst);
        throw new Error("Case update fail, server responded with: " +rst);
    }
    console.log(req.json());
    return true;

    }catch(error){
        showToast(error || 'Unexpected error occure', 'error');

        return false
    }

}
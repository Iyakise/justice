/**
 * leave some about the project
 * This project is a login system for administrators.
 * It includes features such as user authentication, password recovery, and role-based access control.
 * The system is built using modern web technologies and follows best practices for security and performance.
 *
 * The frontend is developed using HTML, CSS, and JavaScript, while the backend is powered by PHP and MySQL.
 * The project is designed to be modular and scalable, allowing for easy maintenance and future enhancements.
 * 
 */

import validateInput from './validateInput.js';
import {selector, selectorAll, showToast, __ROOT__} from './flo3fwf.js';

// Function to initialize page-specific functions
    const form  = selector('#login-container form');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
                const email      = selector('#username').value;
                const password   = selector('#password').value;

            if (!validateInput(email, 'email')) {
                showToast('Invalid email format', 'error');
                return;
            }

            if (!validateInput(password, 'password')) {
                showToast('Invalid password format', 'error');
                return;
            }


            //proceed with the fetch request

            try {
                //check if request take longer than 20 seconds then abort the fetch request
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

                const request = await fetch(`${__ROOT__}asset/apis/auth/sadmin/`, {

                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                const data = await request.json(); // instead of request.text()
                // console.log(data);
                if (data.status === true) {
                    showToast('Login successful, redirecting...', 'success', 4000);
                    // do redirect or save token here

                    setTimeout(() => {
                        window.location.href = __ROOT__ + data.redirect;
                    }, 4000);

                } else {
                    throw new Error(data.message || 'Login failed');
                }


            } catch (error) {
                showToast(error.message || 'An error occurred', 'error', 3000);
            }
            


        })
            
        




// localhost/moj\asset\apis\auth\sadmin-logout.php
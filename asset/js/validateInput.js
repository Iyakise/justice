// validateInput.js
export default function validateInput(input, type) {
    /*
        @param input validation input
        @param validation type
        @param return bool
    
    */
   
    const validators = {
        username: /^[a-zA-Z0-9_]+$/,                  // letters, numbers, underscore
        text: /^[a-zA-Z0-9_, ]+$/,                  // letters, numbers, underscore and space
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,          // basic email check
        phone: /^\+?[0-9]{11,15}$/,                    // digits (optionally starts with +), 11-15 length
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,  //strong password mapping
        // At least 8 chars, one uppercase, one lowercase, one number, one special char
    };

    const regex = validators[type];
    if (!regex) {
        throw new Error(`Unknown validation type: ${type}`);
    }

    // Handle arrays
    if (Array.isArray(input)) {
        return input.every(item => typeof item === "string" && regex.test(item));
    }

    // Handle single string
    return typeof input === "string" && regex.test(input);
}



document.addEventListener("DOMContentLoaded", function() {
    
    const form = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");
    const formResults = document.getElementById("formResults");
    const resultOutput = document.getElementById("resultOutput");
    const averageOutput = document.getElementById("averageOutput");

    // Select all inputs that need validation
    const inputs = form.querySelectorAll("input");
    const phoneInput = document.getElementById("phone");

    // 1. Disable Submit Button Initially
    submitBtn.disabled = true;

    // 2. Real-time Validation Function
    function validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = "";

        // Remove existing error message
        // FIX: Use querySelector on the parent to find the error, 
        // ignoring any browser extension elements that might be next to the input.
        const parent = input.parentNode;
        const existingError = parent.querySelector(".error-text");
        if (existingError) {
            existingError.remove();
        }

        // Validation Rules
        if (value === "") {
            isValid = false;
            errorMessage = "This field cannot be empty.";
        } else {
            switch(input.id) {
                case "name":
                case "surname":
                    if (!/^[a-zA-Z]+$/.test(value)) {
                        isValid = false;
                        errorMessage = "Only letters are allowed.";
                    }
                    break;
                case "email":
                    if (!/\S+@\S+\.\S+/.test(value)) {
                        isValid = false;
                        errorMessage = "Please enter a valid email address.";
                    }
                    break;
                case "address":
                    if (value.length < 5) {
                        isValid = false;
                        errorMessage = "Address is too short.";
                    }
                    break;
                case "rating1":
                case "rating2":
                case "rating3":
                     if (value < 1 || value > 10) {
                        isValid = false;
                        errorMessage = "Value must be between 1 and 10.";
                     }
                     break;
            }
        }

        // Visual Feedback (Red Border & Error Text)
        if (!isValid) {
            input.style.borderColor = "red";
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-text";
            errorDiv.style.color = "red";
            errorDiv.style.fontSize = "12px";
            errorDiv.textContent = errorMessage;
            input.parentNode.appendChild(errorDiv);
        } else {
            input.style.borderColor = "green";
        }

        return isValid;
    }

    // 3. Check Whole Form Validity to Enable Button
    function checkFormValidity() {
        let allValid = true;
        inputs.forEach(input => {
            if (input.style.borderColor !== "green" && input.type !== "submit") {
                 // We check if it *has been validated* as valid (green)
                 // If a field hasn't been touched yet (empty border), it's not valid.
                 // Exception: Phone number is handled separately by masking logic.
                 if(input.id === "phone") {
                    // Check if phone has the correct length (14 chars for +370 6xx xxxxx)
                    if (input.value.length < 14) allValid = false;
                 }
                 else if (input.id !== "phone" && !input.value) allValid = false;
                 // FIX: Check parent for error text class
                 else if (input.parentNode.querySelector(".error-text")) allValid = false;
            }
        });
        submitBtn.disabled = !allValid;
    }

    // Add Event Listeners to Inputs for Validation
    inputs.forEach(input => {
        if(input.id !== "phone") { // Phone has its own handler
            input.addEventListener("input", function() {
                validateInput(this);
                checkFormValidity();
            });
        }
    });

    // 4. Phone Number Masking (+370 6xx xxxxx)
    // Improved logic to handle 86... and 6... inputs correctly
    phoneInput.addEventListener("input", function(e) {
        // 1. Clean: remove anything that isn't a number
        let rawNumbers = e.target.value.replace(/\D/g, '');

        // 2. Handle common Lithuanian prefixes (auto-correct)
        // If user starts typing "86..." (common local format), change '8' to '370'
        if (rawNumbers.startsWith('86')) {
            rawNumbers = '370' + rawNumbers.substring(1);
        }
        // If user starts typing "6..." (missing prefix), add '370'
        else if (rawNumbers.startsWith('6')) {
            rawNumbers = '370' + rawNumbers;
        }
        // If user types random numbers, ensure 370 prefix is there
        else if (rawNumbers.length > 0 && !rawNumbers.startsWith('370')) {
             rawNumbers = '370' + rawNumbers;
        }

        // 3. Limit length to 11 digits (370 + 8 digits for mobile)
        rawNumbers = rawNumbers.substring(0, 11);

        // 4. Format the visual output: +370 6xx xxxxx
        let formatted = "";
        if (rawNumbers.length > 0) {
            formatted += "+" + rawNumbers.substring(0, 3);
        }
        if (rawNumbers.length > 3) {
            formatted += " " + rawNumbers.substring(3, 6);
        }
        if (rawNumbers.length > 6) {
            formatted += " " + rawNumbers.substring(6, 11);
        }
        
        e.target.value = formatted;

        // 5. Validation check
        // Standard LT mobile is 11 digits total (370 + 8 digits)
        if(rawNumbers.length === 11) { 
             phoneInput.style.borderColor = "green";
        } else {
             phoneInput.style.borderColor = "red";
        }
        checkFormValidity();
    });


    // 5. Form Submission (Same as before)
    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById("name").value,
            surname: document.getElementById("surname").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            address: document.getElementById("address").value,
            rating1: parseInt(document.getElementById("rating1").value),
            rating2: parseInt(document.getElementById("rating2").value),
            rating3: parseInt(document.getElementById("rating3").value)
        };

        console.log("Form Data:", formData);

        const displayString = `Name: ${formData.name}
Surname: ${formData.surname}
Email: ${formData.email}
Phone number: ${formData.phone}
Address: ${formData.address}`;
            
        resultOutput.textContent = displayString;

        const average = (formData.rating1 + formData.rating2 + formData.rating3) / 3;
        const averageFormatted = average.toFixed(1);

        averageOutput.textContent = `${formData.name} ${formData.surname}: ${averageFormatted}`;

        if (average < 4) {
            averageOutput.style.color = "red";
        } else if (average < 7) {
            averageOutput.style.color = "orange";
        } else {
            averageOutput.style.color = "green";
        }

        formResults.style.display = "block";
        alert("Form submitted successfully!");
    });
});
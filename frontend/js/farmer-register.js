const form = document.getElementById("farmer-register-form");
const message = document.getElementById("form-message");
const registrationEndpoint = "/api/farmers/register";


// -----------------------------------------
// Mobile number: numbers only
// -----------------------------------------

const mobileInput = document.getElementById("mobile");

mobileInput.addEventListener("input", function () {

    // Remove anything that is not a number
    this.value = this.value.replace(/\D/g, "");

    // Limit to 10 digits
    this.value = this.value.slice(0, 10);
});


// -----------------------------------------
// Form submission
// -----------------------------------------

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    const { confirmPassword, ...registrationData } = formValues;
    const { fullName, mobile, password } = registrationData;


    // Validate mobile number

    if (!/^[0-9]{10}$/.test(mobile)) {

        message.textContent =
            "Please enter a valid 10-digit mobile number.";

        return;
    }


    // Validate password

    if (password.length < 6) {

        message.textContent =
            "Password must contain at least 6 characters.";

        return;
    }


    // Check passwords

    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        return;
    }
 

    try {
        const response = await fetch(registrationEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registrationData)
        });

        if (!response.ok) {
            throw new Error("Registration request failed.");
        }

        // Successful registration
        message.textContent =
            `Registration successful. Welcome, ${fullName}!`;

        form.reset();
    } catch (error) {
        message.textContent =
            "Unable to complete registration. Please try again.";
        console.error("Farmer registration failed:", error);
    }
});
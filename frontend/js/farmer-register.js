const form = document.getElementById("farmer-register-form");
const message = document.getElementById("form-message");


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

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;


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


    // Successful registration

    message.textContent =
        `Registration successful. Welcome, ${fullName}!`;

    form.reset();
});
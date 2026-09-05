const form = document.getElementById("farmer-register-form");
const message = document.getElementById("form-message");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate mobile number
    if (!/^[0-9]{10}$/.test(mobile)) {
        message.textContent = "Please enter a valid 10-digit mobile number.";
        return;
    }

    // Validate password
    if (password.length < 6) {
        message.textContent = "Password must contain at least 6 characters.";
        return;
    }

    // Check passwords
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }

    message.textContent = `Registration successful. Welcome, ${fullName}!`;

    form.reset();
});
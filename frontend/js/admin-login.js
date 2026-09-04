const adminLoginForm = document.querySelector('#admin-login-form');
const adminMessage = document.querySelector('#admin-form-message');
const passwordInput = document.querySelector('#admin-password');
const togglePassword = document.querySelector('#toggle-password');

togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
});

adminLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.querySelector('#admin-username').value.trim();
    const password = passwordInput.value;
    if (username !== 'admin' || password !== 'admin123') {
        adminMessage.classList.remove('success');
        adminMessage.textContent = 'Use the demo login shown below the form.';
        return;
    }
    window.location.href = 'admin-dashboard.html';
});

const loginForm = document.querySelector('#farmer-login-form');
const identifierInput = document.querySelector('#login-identifier');
const passwordInput = document.querySelector('#login-password');
const formMessage = document.querySelector('#form-message');
const loginEndpoint = 'http://127.0.0.1:8000/api/auth/login';

document.querySelector('.toggle-password').addEventListener('click', function () {
    const isPasswordHidden = passwordInput.type === 'password';
    passwordInput.type = isPasswordHidden ? 'text' : 'password';
    this.setAttribute('aria-pressed', String(isPasswordHidden));
    this.setAttribute('aria-label', `${isPasswordHidden ? 'Hide' : 'Show'} password`);
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch(loginEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed.');
        }

        localStorage.setItem('kisansetu-access-token', data.access_token);
        window.location.href = 'farmer-dashboard.html';
    } catch (error) {
        formMessage.classList.remove('success');
        formMessage.textContent = error.message === 'Failed to fetch'
            ? 'Cannot connect to the backend. Please start the FastAPI server.'
            : error.message;
    }
});

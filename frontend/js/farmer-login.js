const loginForm = document.querySelector('#farmer-login-form');
const mobileInput = document.querySelector('#mobile-number');
const formMessage = document.querySelector('#form-message');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const mobileNumber = mobileInput.value.replace(/\D/g, '');
    mobileInput.value = mobileNumber;

    if (!/^\d{10}$/.test(mobileNumber)) {
        formMessage.classList.remove('success');
        formMessage.textContent = 'Please enter a valid 10-digit mobile number.';
        mobileInput.focus();
        return;
    }

    window.location.href = `verify-otp.html?mobile=${encodeURIComponent(mobileNumber)}`;
});

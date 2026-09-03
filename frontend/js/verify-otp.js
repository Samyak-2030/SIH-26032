const otpForm = document.querySelector('#otp-form');
const otpInput = document.querySelector('#otp-input');
const otpMessage = document.querySelector('#otp-message');
const resendButton = document.querySelector('#resend-otp');
const mobileDisplay = document.querySelector('#mobile-display');
const mobileNumber = new URLSearchParams(window.location.search).get('mobile');

if (mobileNumber) {
    mobileDisplay.textContent = `+91 ${mobileNumber}`;
}

otpInput.addEventListener('input', () => {
    otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
});

otpForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otpInput.value)) {
        otpMessage.classList.remove('success');
        otpMessage.textContent = 'Please enter the 6-digit OTP.';
        otpInput.focus();
        return;
    }

    otpMessage.classList.add('success');
    otpMessage.textContent = 'OTP verified successfully.';
});

resendButton.addEventListener('click', () => {
    otpMessage.classList.add('success');
    otpMessage.textContent = 'A new OTP has been sent.';
    otpInput.value = '';
    otpInput.focus();
});

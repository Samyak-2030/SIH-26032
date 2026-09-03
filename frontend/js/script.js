const loginButton = document.querySelector('.login-button');
const loginOptions = document.querySelector('.login-options');

function setLoginMenu(open) {
    loginButton.setAttribute('aria-expanded', String(open));
    loginOptions.classList.toggle('is-open', open);
}

loginButton.addEventListener('click', () => {
    const isOpen = loginButton.getAttribute('aria-expanded') === 'true';
    setLoginMenu(!isOpen);
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.login-menu')) {
        setLoginMenu(false);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setLoginMenu(false);
        loginButton.focus();
    }
});

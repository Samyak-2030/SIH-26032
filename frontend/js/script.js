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

const statValues = document.querySelectorAll('[data-target]');

function animateStats() {
    statValues.forEach((statValue) => {
        const target = Number(statValue.dataset.target);
        const duration = 1400;
        const startTime = performance.now();

        function updateValue(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            statValue.textContent = Math.floor(easedProgress * target).toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }

        requestAnimationFrame(updateValue);
    });
}

const statsSection = document.querySelector('.hero-stats');
const statsObserver = new IntersectionObserver((entries, observer) => {
    if (entries.some((entry) => entry.isIntersecting)) {
        animateStats();
        observer.disconnect();
    }
}, { threshold: 0.35 });

statsObserver.observe(statsSection);

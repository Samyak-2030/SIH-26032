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

const centreSearch = document.querySelector('#centre-search');
const stateFilter = document.querySelector('#state-filter');
const centreRows = [...document.querySelectorAll('#centre-table-body tr')];
const noResults = document.querySelector('.no-results');
const selectedCentre = document.querySelector('#selected-centre');
const sampleMap = document.querySelector('#sample-map');
const mapButton = document.querySelector('#view-map');
const mapPins = [...document.querySelectorAll('.map-pin')];

function focusCentre(row) {
    centreRows.forEach((centreRow) => centreRow.classList.toggle('selected', centreRow === row));
    mapPins.forEach((pin) => pin.classList.toggle('is-active', pin.dataset.mapCentre === row.dataset.centre));
    selectedCentre.textContent = `${row.dataset.centre} - ${row.dataset.district} (${row.dataset.waiting} wait)`;
}

function filterCentres() {
    const query = centreSearch.value.trim().toLowerCase();
    const selectedState = stateFilter.value;
    let visibleRows = 0;

    centreRows.forEach((row) => {
        const searchableText = `${row.dataset.centre} ${row.dataset.district}`.toLowerCase();
        const matchesSearch = !query || searchableText.includes(query);
        const matchesState = selectedState === 'all' || row.dataset.state === selectedState;
        const isVisible = matchesSearch && matchesState;
        row.hidden = !isVisible;
        visibleRows += isVisible ? 1 : 0;
    });

    noResults.hidden = visibleRows !== 0;
    if (visibleRows > 0) {
        focusCentre(centreRows.find((row) => !row.hidden));
    }
}

centreRows.forEach((row) => {
    row.addEventListener('click', () => {
        focusCentre(row);
        sampleMap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

centreSearch.addEventListener('input', filterCentres);
stateFilter.addEventListener('change', filterCentres);

mapPins.forEach((pin) => {
    pin.addEventListener('click', () => {
        const matchingRow = centreRows.find((row) => row.dataset.centre === pin.dataset.mapCentre);
        if (matchingRow) {
            focusCentre(matchingRow);
            matchingRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});

mapButton.addEventListener('click', () => {
    sampleMap.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

focusCentre(centreRows[0]);

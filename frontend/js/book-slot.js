const centreSearch = document.querySelector('#centre-search');
const centreContainer = document.querySelector('#recommended-centres');
const centreCount = document.querySelector('#centre-count');
const noCentres = document.querySelector('#no-centres');
const bookingForm = document.querySelector('#booking-form');
const bookingMessage = document.querySelector('#booking-message');
const bookingConfirmation = document.querySelector('#booking-confirmation');
const bookingHeading = document.querySelector('.booking-heading');
const bookingDetails = document.querySelector('#confirmation-datetime');
const confirmationCentre = document.querySelector('#confirmation-centre');
const bookingId = document.querySelector('#booking-id');
const confirmationToken = document.querySelector('#confirmation-token');
const confirmationPosition = document.querySelector('#confirmation-position');
const confirmationWait = document.querySelector('#confirmation-wait');
const viewBookingDetails = document.querySelector('#view-booking-details');
let centreRows = [];
let selectedCentre = null;

function createCentreRow(centre) {
    const row = document.createElement('article');
    row.className = 'recommended-centre';
    row.dataset.centre = centre.name;
    row.dataset.district = centre.district;
    row.dataset.centreId = centre.id;
    row.innerHTML = `<div class="centre-details"><strong>${centre.name}</strong><div><span>${centre.location}</span><span>Capacity: ${centre.capacity}</span><span>${centre.status}</span></div></div><button class="choose-centre" type="button">Select centre</button>`;
    row.querySelector('.choose-centre').addEventListener('click', () => selectCentre(row));
    return row;
}

function selectCentre(row) {
    centreRows.forEach((centreRow) => centreRow.classList.toggle('selected', centreRow === row));
    selectedCentre = row;
    bookingMessage.textContent = `${row.dataset.centre} selected.`;
}

function renderCentres() {
    centreContainer.innerHTML = '';
    window.KisanSetuDemo.CENTRES.forEach((centre) => centreContainer.appendChild(createCentreRow(centre)));
    centreRows = [...centreContainer.querySelectorAll('.recommended-centre')];
    centreCount.textContent = `${centreRows.length} centres`;
    noCentres.hidden = true;
    selectCentre(centreRows[0]);
}

centreSearch.addEventListener('input', () => {
    const query = centreSearch.value.trim().toLowerCase();
    let visibleCount = 0;
    centreRows.forEach((row) => {
        const matches = `${row.dataset.centre} ${row.dataset.district}`.toLowerCase().includes(query);
        row.hidden = !matches;
        if (matches) visibleCount += 1;
    });
    centreCount.textContent = `${visibleCount} centre${visibleCount === 1 ? '' : 's'}`;
    noCentres.hidden = visibleCount !== 0;
});

bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!selectedCentre) {
        bookingMessage.textContent = 'Please select a procurement centre first.';
        return;
    }
    const ticket = window.KisanSetuDemo.book({
        centreId: selectedCentre.dataset.centreId,
        crop: document.querySelector('#crop-select').value,
        date: document.querySelector('#date-select').value,
        time: document.querySelector('#time-select').value,
    });
    bookingDetails.textContent = `${ticket.bookingDate}, ${ticket.timeSlot}`;
    confirmationCentre.textContent = `${ticket.centreName}, ${selectedCentre.dataset.district}`;
    bookingId.textContent = `BK-DEMO-${ticket.tokenNumber}`;
    confirmationToken.textContent = ticket.tokenNumber;
    confirmationPosition.textContent = ticket.queuePosition;
    confirmationWait.textContent = `${ticket.estimatedWaitMinutes} minutes`;
    bookingHeading.hidden = true;
    bookingForm.hidden = true;
    bookingConfirmation.hidden = false;
    bookingConfirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

viewBookingDetails.addEventListener('click', () => {
    bookingConfirmation.hidden = true;
    bookingHeading.hidden = false;
    bookingForm.hidden = false;
    bookingMessage.textContent = 'You can update your details and confirm again.';
    bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

renderCentres();

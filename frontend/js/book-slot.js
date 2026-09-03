const centreSearch = document.querySelector('#centre-search');
const centreRows = [...document.querySelectorAll('.recommended-centre')];
const centreCount = document.querySelector('#centre-count');
const noCentres = document.querySelector('#no-centres');
const bookingForm = document.querySelector('#booking-form');
const bookingMessage = document.querySelector('#booking-message');
const bookingConfirmation = document.querySelector('#booking-confirmation');
const bookingHeading = document.querySelector('.booking-heading');
const bookingDetails = document.querySelector('#confirmation-datetime');
const confirmationCentre = document.querySelector('#confirmation-centre');
const bookingId = document.querySelector('#booking-id');
const viewBookingDetails = document.querySelector('#view-booking-details');
let selectedCentre = document.querySelector('.recommended-centre.selected');

function selectCentre(row) {
    centreRows.forEach((centreRow) => centreRow.classList.toggle('selected', centreRow === row));
    selectedCentre = row;
}

centreRows.forEach((row) => {
    row.querySelector('.choose-centre').addEventListener('click', () => selectCentre(row));
});

centreSearch.addEventListener('input', () => {
    const query = centreSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    centreRows.forEach((row) => {
        const matches = row.dataset.centre.toLowerCase().includes(query) || row.dataset.district.toLowerCase().includes(query);
        row.hidden = !matches;
        visibleCount += matches ? 1 : 0;
    });

    centreCount.textContent = `${visibleCount} centre${visibleCount === 1 ? '' : 's'}`;
    noCentres.hidden = visibleCount !== 0;
});

bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const date = document.querySelector('#date-select').value;
    const time = document.querySelector('#time-select').value;
    bookingDetails.textContent = `${date}, ${time}`;
    confirmationCentre.textContent = `${selectedCentre.dataset.centre}, ${selectedCentre.dataset.district}`;
    bookingId.textContent = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
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

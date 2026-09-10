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

const API_BASE_URL = 'http://127.0.0.1:8000';

let centreRows = [];
let selectedCentre = null;


// Create a centre card
function createCentreRow(centre) {
    const row = document.createElement('article');

    row.className = 'recommended-centre';

    row.dataset.centre = centre.name;
    row.dataset.district = centre.district;
    row.dataset.centreId = centre.id;

    row.innerHTML = `
        <div class="centre-details">
            <strong>${centre.name}</strong>
            <div>
                <span>${centre.location}</span>
                <span>Capacity: ${centre.capacity}</span>
                <span>${centre.status}</span>
            </div>
        </div>

        <button class="choose-centre" type="button">
            Book slot
        </button>
    `;

    row.querySelector('.choose-centre').addEventListener('click', () => {
        selectCentre(row);
    });

    return row;
}


// Select a centre
function selectCentre(row) {
    centreRows.forEach((centreRow) => {
        centreRow.classList.toggle(
            'selected',
            centreRow === row
        );
    });

    selectedCentre = row;

    bookingMessage.textContent =
        `${row.dataset.centre} selected.`;
}


// Load centres from backend
async function loadCentres() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/centres`
        );

        if (!response.ok) {
            throw new Error('Unable to load procurement centres.');
        }

        const data = await response.json();

        centreContainer.innerHTML = '';

        data.centres.forEach((centre) => {
            const row = createCentreRow(centre);
            centreContainer.appendChild(row);
        });

        centreRows = [
            ...document.querySelectorAll('.recommended-centre')
        ];

        centreCount.textContent =
            `${centreRows.length} centre${centreRows.length === 1 ? '' : 's'}`;

        noCentres.hidden = centreRows.length !== 0;

        // Automatically select the first centre
        if (centreRows.length > 0) {
            selectCentre(centreRows[0]);
        }

    } catch (error) {
        console.error(error);

        centreContainer.innerHTML = '';
        centreCount.textContent = '0 centres';

        noCentres.hidden = false;
        noCentres.textContent =
            'Unable to load procurement centres.';
    }
}


// Search/filter centres
centreSearch.addEventListener('input', () => {
    const query = centreSearch.value
        .trim()
        .toLowerCase();

    let visibleCount = 0;

    centreRows.forEach((row) => {
        const matches =
            row.dataset.centre
                .toLowerCase()
                .includes(query) ||
            row.dataset.district
                .toLowerCase()
                .includes(query);

        row.hidden = !matches;

        if (matches) {
            visibleCount++;
        }
    });

    centreCount.textContent =
        `${visibleCount} centre${visibleCount === 1 ? '' : 's'}`;

    noCentres.hidden = visibleCount !== 0;
});


// Create booking
bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Make sure a centre has been selected
    if (!selectedCentre) {
        bookingMessage.textContent =
            'Please select a procurement centre first.';
        return;
    }

    // Get logged-in farmer's token
    const token = localStorage.getItem(
        'kisansetu-access-token'
    );

    if (!token) {
        window.location.href = 'farmer-login.html';
        return;
    }

    const crop = document.querySelector('#crop-select').value;
    const date = document.querySelector('#date-select').value;
    const time = document.querySelector('#time-select').value;

    const centreId = selectedCentre.dataset.centreId;

    try {
        bookingMessage.textContent =
            'Creating your booking...';

        const response = await fetch(
            `${API_BASE_URL}/api/bookings`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                body: JSON.stringify({
                    centre_id: Number(centreId),
                    crop: crop,
                    booking_date: date,
                    time_slot: time
                })
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.detail || 'Unable to create booking.'
            );
        }

        const booking = data.booking;

        // Show real booking information returned by backend
        bookingDetails.textContent =
            `${booking.bookingDate}, ${booking.timeSlot}`;

        confirmationCentre.textContent =
            `${selectedCentre.dataset.centre}, ${selectedCentre.dataset.district}`;

        bookingId.textContent =
            booking.bookingId;
        confirmationToken.textContent = booking.queueToken;
        confirmationPosition.textContent = booking.queuePosition;
        confirmationWait.textContent =
            `${booking.estimatedWaitMinutes} minutes`;

        bookingHeading.hidden = true;
        bookingForm.hidden = true;
        bookingConfirmation.hidden = false;

        bookingConfirmation.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

    } catch (error) {
        console.error(error);

        bookingMessage.textContent =
            error.message;
    }
});


// View booking details again
viewBookingDetails.addEventListener('click', () => {
    bookingConfirmation.hidden = true;

    bookingHeading.hidden = false;
    bookingForm.hidden = false;

    bookingMessage.textContent =
        'You can update your details and confirm again.';

    bookingForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});


// Start loading centres
loadCentres();
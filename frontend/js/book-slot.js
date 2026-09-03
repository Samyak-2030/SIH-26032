const centreSearch = document.querySelector('#centre-search');
const centreRows = [...document.querySelectorAll('.recommended-centre')];
const centreCount = document.querySelector('#centre-count');
const noCentres = document.querySelector('#no-centres');
const bookingForm = document.querySelector('#booking-form');
const bookingMessage = document.querySelector('#booking-message');
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
    bookingMessage.textContent = `Slot reserved at ${selectedCentre.dataset.centre} for ${date}, ${time}.`;
});

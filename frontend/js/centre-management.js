const centreForm = document.querySelector('#add-centre-form');
const centreTableBody = document.querySelector('#managed-centres');
const centreMessage = document.querySelector('#centre-form-message');

function renderManagedCentres(centres) {
    centreTableBody.innerHTML = centres.map((centre) => `
        <tr>
            <td><strong>${centre.name}</strong><small>${centre.location}</small></td>
            <td>${centre.district}</td>
            <td>${centre.capacity}</td>
            <td>-</td>
            <td class="admin-status ${centre.status.toLowerCase() === 'active' ? 'active' : 'inactive'}">${centre.status}</td>
            <td>Map marker</td>
        </tr>
    `).join('');
}

async function refreshCentres() {
    const centres = await window.KisanSetuMaps.loadCentres();
    renderManagedCentres(centres);
}

centreForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    centreMessage.textContent = 'Saving centre...';
    const formData = new FormData(centreForm);
    const payload = Object.fromEntries(formData.entries());
    payload.capacity = Number(payload.capacity);
    payload.latitude = Number(payload.latitude);
    payload.longitude = Number(payload.longitude);

    try {
        const response = await fetch('https://sih-26032-gm8c.onrender.com/api/centres', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to save centre.');
        centreForm.reset();
        centreMessage.textContent = `${data.centre.name} added to the map.`;
        await refreshCentres();
    } catch (error) {
        centreMessage.textContent = error.message;
    }
});

refreshCentres().catch((error) => {
    centreMessage.textContent = error.message;
});

const centreForm = document.querySelector('#add-centre-form');
const centreTableBody = document.querySelector('#managed-centres');
const centreMessage = document.querySelector('#centre-form-message');

function renderManagedCentres() {
    centreTableBody.innerHTML = window.KisanSetuDemo.getCentres().map((centre) => `<tr><td><strong>${centre.name}</strong><small>${centre.location}</small></td><td>${centre.district}</td><td>${centre.capacity}</td><td>0</td><td class="admin-status active">${centre.status}</td><td>Static demo</td></tr>`).join('');
}

centreForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(centreForm).entries());
    const centre = window.KisanSetuDemo.addCentre(payload);
    centreForm.reset();
    centreMessage.textContent = `${centre.name} added to the static demo list.`;
    renderManagedCentres();
});

renderManagedCentres();
window.KisanSetuMaps.loadCentres().catch(() => {});
window.addEventListener('kisansetu-demo-updated', renderManagedCentres);

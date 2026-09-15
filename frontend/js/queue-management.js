const panel = document.querySelector('.admin-full-panel');
const message = document.querySelector('#queue-message');
const callNextButton = document.querySelector('#call-next');
const centreSelect = document.createElement('select');
centreSelect.className = 'admin-action';
centreSelect.setAttribute('aria-label', 'Select procurement centre');
const queueTable = document.createElement('div');
queueTable.className = 'admin-live-queue';
panel.prepend(centreSelect, queueTable);
let activeCentreId = 1;

window.KisanSetuDemo.CENTRES.forEach((centre) => {
    const option = document.createElement('option');
    option.value = centre.id;
    option.textContent = centre.name;
    centreSelect.appendChild(option);
});

function renderTickets() {
    const tickets = window.KisanSetuDemo.getTickets().filter((ticket) => ticket.centreId === Number(activeCentreId));
    const stats = document.querySelectorAll('.admin-form-row .admin-stat strong');
    const current = tickets.find((ticket) => ['Called', 'Serving'].includes(ticket.status));
    const waiting = tickets.filter((ticket) => ticket.status === 'Waiting');
    if (stats.length >= 3) {
        stats[0].textContent = current ? `Token #${current.tokenNumber}` : 'None';
        stats[1].textContent = waiting.length;
        stats[2].textContent = waiting[0] ? `#${waiting[0].tokenNumber}` : 'None';
    }
    queueTable.innerHTML = '<h2>Predefined and farmer tickets</h2>';
    if (!tickets.length) {
        queueTable.insertAdjacentHTML('beforeend', '<p>No tickets for this centre yet.</p>');
        return;
    }
    tickets.forEach((ticket) => {
        const row = document.createElement('article');
        row.className = 'admin-ticket-row';
        row.innerHTML = `<div><strong>Token #${ticket.tokenNumber}</strong><span>${ticket.farmerName} · ${ticket.crop}</span><small>${ticket.status} · ${ticket.mobile}</small></div><div class="admin-ticket-checks"></div>`;
        const checks = row.querySelector('.admin-ticket-checks');
        ['quality', 'weighing', 'procurement', 'payment'].forEach((check) => {
            const select = document.createElement('select');
            select.className = 'admin-action admin-check-select';
            ['Pending', 'In Progress', 'Passed', 'Failed'].forEach((status) => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = `${check}: ${status}`;
                option.selected = ticket.checks[check] === status;
                select.appendChild(option);
            });
            select.addEventListener('change', () => {
                window.KisanSetuDemo.updateCheck(ticket.id, check, select.value);
                message.textContent = `${check} updated for token #${ticket.tokenNumber}.`;
                renderTickets();
            });
            checks.appendChild(select);
        });
        queueTable.appendChild(row);
    });
}

centreSelect.addEventListener('change', () => { activeCentreId = centreSelect.value; renderTickets(); });
callNextButton.addEventListener('click', () => {
    try {
        const ticket = window.KisanSetuDemo.callNext(activeCentreId);
        message.textContent = `Token #${ticket.tokenNumber} has been called.`;
        renderTickets();
    } catch (error) { message.textContent = error.message; }
});

document.querySelector('#pause-queue').addEventListener('click', (event) => {
    event.currentTarget.textContent = event.currentTarget.textContent.includes('Resume') ? 'Pause Queue' : 'Resume Queue';
    message.textContent = event.currentTarget.textContent.includes('Resume') ? 'Queue paused locally.' : 'Queue resumed locally.';
});

renderTickets();
window.addEventListener('kisansetu-demo-updated', renderTickets);

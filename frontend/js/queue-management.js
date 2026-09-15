const ADMIN_QUEUE_API = 'https://sih-26032-gm8c.onrender.com';
const panel = document.querySelector('.admin-full-panel');
const message = document.querySelector('#queue-message');
const callNextButton = document.querySelector('#call-next');
const centreSelect = document.createElement('select');
centreSelect.className = 'admin-action';
centreSelect.setAttribute('aria-label', 'Select procurement centre');
const queueTable = document.createElement('div');
queueTable.className = 'admin-live-queue';
panel.prepend(centreSelect, queueTable);
let activeCentreId = null;

async function request(path, options = {}) {
    const response = await fetch(`${ADMIN_QUEUE_API}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || 'Queue request failed.');
    return data;
}

function renderTickets(tickets) {
    const stats = document.querySelectorAll('.admin-form-row .admin-stat strong');
    const current = tickets.find((ticket) => ['Called', 'Serving'].includes(ticket.status));
    const waiting = tickets.filter((ticket) => ticket.status === 'Waiting');
    if (stats.length >= 3) {
        stats[0].textContent = current ? `Token #${current.tokenNumber}` : 'None';
        stats[1].textContent = waiting.length;
        stats[2].textContent = waiting[0] ? `#${waiting[0].tokenNumber}` : 'None';
    }
    queueTable.innerHTML = '<h2>Live tickets</h2>';
    if (!tickets.length) {
        queueTable.insertAdjacentHTML('beforeend', '<p>No tickets yet. New farmer bookings will appear here.</p>');
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
            select.setAttribute('aria-label', `${check} check for token ${ticket.tokenNumber}`);
            ['Pending', 'In Progress', 'Passed', 'Failed'].forEach((status) => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = `${check}: ${status}`;
                option.selected = ticket.checks[check] === status;
                select.appendChild(option);
            });
            select.addEventListener('change', async () => {
                try {
                    await request(`/api/queue/tickets/${ticket.id}/checks`, {
                        method: 'PATCH', body: JSON.stringify({ check, status: select.value })
                    });
                    message.textContent = `${check} check updated for token #${ticket.tokenNumber}.`;
                    await loadQueue();
                } catch (error) { message.textContent = error.message; }
            });
            checks.appendChild(select);
        });
        queueTable.appendChild(row);
    });
}

async function loadCentres() {
    const data = await request('/api/centres');
    centreSelect.innerHTML = (data.centres || []).map((centre) => `<option value="${centre.id}">${centre.name}</option>`).join('');
    activeCentreId = centreSelect.value;
    await loadQueue();
}

async function loadQueue() {
    if (!activeCentreId) return;
    const data = await request(`/api/queue/centres/${activeCentreId}`);
    renderTickets(data.tickets || []);
}

centreSelect.addEventListener('change', () => { activeCentreId = centreSelect.value; loadQueue().catch((error) => { message.textContent = error.message; }); });
callNextButton.addEventListener('click', async () => {
    try {
        const data = await request(`/api/queue/centres/${activeCentreId}/call-next`, { method: 'POST' });
        message.textContent = `Token #${data.ticket.tokenNumber} has been called.`;
        await loadQueue();
    } catch (error) { message.textContent = error.message; }
});

document.querySelector('#pause-queue').addEventListener('click', (event) => {
    event.currentTarget.textContent = event.currentTarget.textContent.includes('Resume') ? 'Pause Queue' : 'Resume Queue';
    message.textContent = event.currentTarget.textContent.includes('Resume') ? 'Queue paused locally.' : 'Queue resumed.';
});

loadCentres().catch((error) => { message.textContent = error.message; });
setInterval(() => loadQueue().catch(() => {}), 5000);

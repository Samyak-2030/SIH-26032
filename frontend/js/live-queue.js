const QUEUE_API_BASE_URL = 'https://sih-26032-gm8c.onrender.com';
const token = localStorage.getItem('kisansetu-access-token');
const notifyToggle = document.querySelector('#notify-toggle');
const queueMessage = document.querySelector('#queue-message');
const countdown = document.querySelector('#refresh-countdown');
const lastUpdated = document.querySelector('#last-updated');
const servingToken = document.querySelector('.serving-block strong');
const yourToken = document.querySelector('.your-token-block strong');
const centreName = document.querySelector('.centre-name');
const farmersAhead = document.querySelector('.queue-metrics div:first-child strong');
const estimatedWait = document.querySelector('.queue-metrics div:nth-child(2) strong');
let secondsLeft = 30;
let selectedTicketId = localStorage.getItem('kisansetu-selected-ticket');
let tickets = [];
const ticketSelector = document.createElement('select');
ticketSelector.className = 'queue-ticket-selector';
ticketSelector.setAttribute('aria-label', 'Select your booking ticket');
document.querySelector('.queue-heading')?.appendChild(ticketSelector);

async function loadTickets() {
    if (!token) {
        window.location.href = 'farmer-login.html';
        return;
    }
    const response = await fetch(`${QUEUE_API_BASE_URL}/api/queue/mine`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Unable to load queue tickets.');
    tickets = data.tickets || [];
    ticketSelector.innerHTML = tickets.map((entry) => `<option value="${entry.id}">Ticket #${entry.tokenNumber} · ${entry.centreName} · ${entry.status}</option>`).join('');
    const ticket = tickets.find((entry) => String(entry.id) === String(selectedTicketId)) || tickets[0];
    if (!ticket) {
        queueMessage.textContent = 'Book a procurement slot to receive a live queue ticket.';
        return;
    }
    selectedTicketId = String(ticket.id);
    localStorage.setItem('kisansetu-selected-ticket', selectedTicketId);
    ticketSelector.value = selectedTicketId;
    const ahead = Math.max(0, ticket.queuePosition - 1);
    servingToken.textContent = ticket.status === 'Called' || ticket.status === 'Serving'
        ? `Token #${ticket.tokenNumber}` : 'Waiting for call';
    yourToken.textContent = `#${ticket.tokenNumber}`;
    centreName.textContent = ticket.centreName;
    farmersAhead.textContent = ahead;
    estimatedWait.textContent = `${ticket.estimatedWaitMinutes} minutes`;
    queueMessage.textContent = `Status: ${ticket.status}. Checks: ${Object.values(ticket.checks).join(' / ')}.`;
    lastUpdated.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

notifyToggle.addEventListener('change', () => {
    queueMessage.textContent = notifyToggle.checked
        ? 'You will be notified when your turn is near.'
        : 'Turn notifications are turned off.';
});

ticketSelector.addEventListener('change', () => {
    selectedTicketId = ticketSelector.value;
    localStorage.setItem('kisansetu-selected-ticket', selectedTicketId);
    loadTickets().catch((error) => { queueMessage.textContent = error.message; });
});

loadTickets().catch((error) => { queueMessage.textContent = error.message; });
setInterval(() => {
    secondsLeft -= 1;
    countdown.textContent = secondsLeft;
    if (secondsLeft === 0) {
        secondsLeft = 30;
        loadTickets().catch((error) => { queueMessage.textContent = error.message; });
    }
}, 1000);

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
const ticketSelector = document.createElement('select');
ticketSelector.className = 'queue-ticket-selector';
ticketSelector.setAttribute('aria-label', 'Select your booking ticket');
document.querySelector('.queue-heading')?.appendChild(ticketSelector);

function loadTickets() {
    const tickets = window.KisanSetuDemo.getTicketsForFarmer();
    ticketSelector.innerHTML = tickets.map((entry) => `<option value="${entry.id}">Ticket #${entry.tokenNumber} · ${entry.centreName} · ${entry.status}</option>`).join('');
    const ticket = tickets.find((entry) => String(entry.id) === String(selectedTicketId)) || tickets[0];
    if (!ticket) {
        queueMessage.textContent = 'Book a procurement slot to receive a static ticket.';
        return;
    }
    selectedTicketId = String(ticket.id);
    localStorage.setItem('kisansetu-selected-ticket', selectedTicketId);
    ticketSelector.value = selectedTicketId;
    servingToken.textContent = ['Called', 'Serving'].includes(ticket.status) ? `Token #${ticket.tokenNumber}` : 'Waiting for call';
    yourToken.textContent = `#${ticket.tokenNumber}`;
    centreName.textContent = ticket.centreName;
    farmersAhead.textContent = Math.max(0, ticket.queuePosition - 1);
    estimatedWait.textContent = `${ticket.estimatedWaitMinutes} minutes`;
    queueMessage.textContent = `Status: ${ticket.status}. Checks: ${Object.values(ticket.checks).join(' / ')}.`;
    lastUpdated.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

notifyToggle.addEventListener('change', () => { queueMessage.textContent = notifyToggle.checked ? 'You will be notified when your turn is near.' : 'Turn notifications are turned off.'; });
ticketSelector.addEventListener('change', () => { selectedTicketId = ticketSelector.value; localStorage.setItem('kisansetu-selected-ticket', selectedTicketId); loadTickets(); });
loadTickets();
window.addEventListener('kisansetu-demo-updated', loadTickets);
setInterval(() => { secondsLeft -= 1; countdown.textContent = secondsLeft; if (secondsLeft === 0) { secondsLeft = 30; loadTickets(); } }, 1000);

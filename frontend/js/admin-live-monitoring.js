const LIVE_MONITOR_API = 'https://sih-26032-gm8c.onrender.com';
const monitorPanel = document.querySelector('.admin-full-panel');
const monitorStats = document.querySelector('.admin-stats');
const monitorCentreId = new URLSearchParams(window.location.search).get('centre') || '1';

async function loadMonitorQueue() {
    const response = await fetch(`${LIVE_MONITOR_API}/api/queue/centres/${monitorCentreId}`);
    const data = await response.json();
    const tickets = data.tickets || [];
    const waiting = tickets.filter((ticket) => ticket.status === 'Waiting').length;
    const completed = tickets.filter((ticket) => ticket.status === 'Completed').length;
    const serving = tickets.find((ticket) => ['Called', 'Serving'].includes(ticket.status));
    const stats = monitorStats?.querySelectorAll('.admin-stat strong');
    if (stats?.length >= 4) {
        stats[1].textContent = tickets.length;
        stats[2].textContent = completed;
        stats[3].textContent = waiting;
    }
    const title = monitorPanel?.querySelector('h2');
    if (title) title.textContent = serving ? `Current Queue · Token #${serving.tokenNumber}` : 'Current Queue · No active token';
    if (monitorPanel) {
        let list = monitorPanel.querySelector('.admin-live-monitor-list');
        if (!list) { list = document.createElement('div'); list.className = 'admin-live-monitor-list'; monitorPanel.appendChild(list); }
        list.innerHTML = tickets.length ? tickets.map((ticket) => `<p><strong>#${ticket.tokenNumber} · ${ticket.farmerName}</strong><span>${ticket.status} · Quality ${ticket.checks.quality} · Weighing ${ticket.checks.weighing} · Procurement ${ticket.checks.procurement} · Payment ${ticket.checks.payment}</span></p>`).join('') : '<p>No farmer tickets yet. New bookings will appear here.</p>';
    }
}

loadMonitorQueue().catch((error) => console.error(error));
setInterval(() => loadMonitorQueue().catch(() => {}), 5000);

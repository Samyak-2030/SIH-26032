function renderAdminDemo() {
    const tickets = window.KisanSetuDemo.getTickets();
    const active = tickets.filter((ticket) => ['Waiting', 'Called', 'Serving'].includes(ticket.status));
    const completed = tickets.filter((ticket) => ticket.status === 'Completed');
    const farmers = new Set(tickets.map((ticket) => ticket.farmerName));
    const stats = document.querySelectorAll('.admin-stats .admin-stat strong');
    if (stats.length >= 4) {
        stats[0].textContent = farmers.size;
        stats[1].textContent = active.length;
        stats[2].textContent = completed.length;
        stats[3].textContent = tickets.filter((ticket) => ticket.checks.payment !== 'Passed').length;
    }
    const alertsPanel = document.querySelectorAll('.admin-panel')[1];
    const subtitle = alertsPanel?.querySelector('.admin-panel-subtitle');
    alertsPanel?.querySelectorAll('.admin-alert').forEach((alert) => alert.remove());
    const messages = active.length ? [`${active.length} predefined tickets are active.`, `${tickets.filter((ticket) => ticket.status === 'Called').length} tickets currently called.`, `${tickets.filter((ticket) => ticket.checks.payment !== 'Passed').length} payments pending.`] : ['No active tickets.'];
    messages.forEach((text) => { const alert = document.createElement('div'); alert.className = 'admin-alert'; alert.innerHTML = '<b>•</b><span></span>'; alert.querySelector('span').textContent = text; subtitle?.after(alert); });
}

renderAdminDemo();
window.addEventListener('kisansetu-demo-updated', renderAdminDemo);
setInterval(renderAdminDemo, 2000);

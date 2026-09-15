const ADMIN_DASHBOARD_API = 'https://sih-26032-gm8c.onrender.com';
const adminStats = document.querySelectorAll('.admin-stats .admin-stat strong');

async function loadAdminOverview() {
    const centresResponse = await fetch(`${ADMIN_DASHBOARD_API}/api/centres`);
    const centresData = await centresResponse.json();
    const queues = await Promise.all((centresData.centres || []).map(async (centre) => {
        const response = await fetch(`${ADMIN_DASHBOARD_API}/api/queue/centres/${centre.id}`);
        const data = await response.json();
        return data.tickets || [];
    }));
    const tickets = queues.flat();
    const active = tickets.filter((ticket) => ['Waiting', 'Called', 'Serving'].includes(ticket.status));
    const completed = tickets.filter((ticket) => ticket.status === 'Completed');
    const farmers = new Set(tickets.map((ticket) => ticket.farmerId));
    if (adminStats.length >= 4) {
        adminStats[0].textContent = farmers.size;
        adminStats[1].textContent = active.length;
        adminStats[2].textContent = completed.length;
        adminStats[3].textContent = tickets.filter((ticket) => ticket.checks.payment !== 'Passed').length;
    }
    const alertMessages = active.length
        ? [`${active.length} active queue tickets across the network.`, `${tickets.filter((ticket) => ticket.status === 'Called').length} tickets currently called.`, `${tickets.filter((ticket) => ticket.checks.payment !== 'Passed').length} payments pending completion.`]
        : ['No live alerts yet.'];
    const alertsPanel = document.querySelectorAll('.admin-panel')[1];
    const alerts = alertsPanel?.querySelectorAll('.admin-alert');
    if (alertsPanel && alerts) {
        alerts.forEach((alert) => alert.remove());
        const subtitle = alertsPanel.querySelector('.admin-panel-subtitle');
        alertMessages.forEach((text) => {
            const alert = document.createElement('div');
            alert.className = 'admin-alert';
            alert.innerHTML = '<b>•</b><span></span>';
            alert.querySelector('span').textContent = text;
            subtitle?.after(alert);
        });
    }
}

loadAdminOverview().catch((error) => console.error(error));
setInterval(() => loadAdminOverview().catch(() => {}), 5000);

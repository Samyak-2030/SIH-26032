const DEMO_FARMER_NAME = 'Demo Farmer';
const languageButton = document.querySelector('.dashboard-language');
let currentLanguage = localStorage.getItem('kisansetu-language') || 'en';

const dashboardTranslations = {
    en: { language: 'हिन्दी', eyebrow: 'Farmer dashboard', greeting: 'Hello,', description: 'Here’s what’s happening with your procurement.', nav: ['Dashboard', 'Book Slot', 'Live Queue', 'Procurement', 'Payments', 'My Bookings', 'Profile', 'Notifications', 'Help & Support', 'Logout'], nextSlot: 'Next slot', queue: 'Your queue', procurement: 'Procurement', payment: 'Payment', recent: 'Recent notifications', viewAll: 'View all' },
    hi: { language: 'English', eyebrow: 'किसान डैशबोर्ड', greeting: 'नमस्ते,', description: 'आपकी फसल खरीद से जुड़ी जानकारी यहां है।', nav: ['डैशबोर्ड', 'स्लॉट बुक करें', 'लाइव कतार', 'खरीद', 'भुगतान', 'मेरी बुकिंग', 'प्रोफ़ाइल', 'सूचनाएं', 'सहायता', 'लॉगआउट'], nextSlot: 'अगला स्लॉट', queue: 'आपकी कतार', procurement: 'खरीद', payment: 'भुगतान', recent: 'हाल की सूचनाएं', viewAll: 'सभी देखें' },
};

function renderDemoState() {
    const ticket = window.KisanSetuDemo.getTicketsForFarmer()[0];
    const cards = document.querySelectorAll('.overview-card');
    const history = document.querySelector('#booking-history');
    if (!ticket) {
        history.innerHTML = '<p class="dashboard-empty-state">No bookings yet. Book a slot to generate your static ticket.</p>';
        return;
    }
    localStorage.setItem('kisansetu-selected-ticket', String(ticket.id));
    cards[0].children[1].textContent = ticket.bookingDate || 'Today';
    cards[0].children[2].textContent = ticket.timeSlot || 'Selected slot';
    cards[0].children[3].textContent = ticket.centreName;
    cards[1].children[1].textContent = `#${ticket.tokenNumber}`;
    cards[1].children[2].textContent = `${ticket.status} · ${ticket.estimatedWaitMinutes} min`;
    cards[2].children[1].textContent = ticket.status;
    cards[2].children[2].textContent = `Quality ${ticket.checks.quality} · Weighing ${ticket.checks.weighing}`;
    cards[3].children[1].textContent = ticket.checks.payment;
    cards[3].children[2].textContent = `Procurement ${ticket.checks.procurement}`;
    document.querySelectorAll('.notification-item p')[0].innerHTML = `<strong>${Math.max(0, ticket.queuePosition - 1)} farmers</strong> ahead of you.`;
    document.querySelectorAll('.notification-item p')[1].textContent = `Your token #${ticket.tokenNumber} is ${ticket.status.toLowerCase()}.`;
    document.querySelectorAll('.notification-item p')[2].textContent = `Estimated wait: ${ticket.estimatedWaitMinutes} minutes.`;
    history.innerHTML = `<article class="booking-history-row"><div><strong>BK-DEMO-${ticket.tokenNumber}</strong><span>${ticket.centreName} · ${ticket.bookingDate || 'Today'} · ${ticket.timeSlot || 'Selected slot'}</span><small>${ticket.crop} · Quality ${ticket.checks.quality} · Weighing ${ticket.checks.weighing} · Procurement ${ticket.checks.procurement} · Payment ${ticket.checks.payment}</small></div><button class="dashboard-booking-ticket" type="button">Ticket #${ticket.tokenNumber} · ${ticket.status}</button></article>`;
    history.querySelector('button').addEventListener('click', () => { localStorage.setItem('kisansetu-selected-ticket', String(ticket.id)); window.location.href = 'live-queue.html'; });
}

function applyDashboardLanguage(language) {
    currentLanguage = language;
    const copy = dashboardTranslations[language];
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    languageButton.firstChild.textContent = `${copy.language} `;
    document.querySelector('.dashboard-eyebrow').textContent = copy.eyebrow;
    document.querySelector('.dashboard-header h1').firstChild.textContent = `${copy.greeting} `;
    document.querySelector('.dashboard-header > div > p:last-child').textContent = copy.description;
    document.querySelectorAll('.dashboard-nav-link').forEach((link, index) => { if (copy.nav[index]) link.lastChild.textContent = copy.nav[index]; });
    const cards = document.querySelectorAll('.overview-card');
    cards[0].querySelector('.card-label').textContent = copy.nextSlot;
    cards[1].querySelector('.card-label').textContent = copy.queue;
    cards[2].querySelector('.card-label').textContent = copy.procurement;
    cards[3].querySelector('.card-label').textContent = copy.payment;
    document.querySelector('.notifications-section h2').textContent = copy.recent;
    document.querySelector('.notifications-section .section-title-row a').textContent = copy.viewAll;
}

languageButton.addEventListener('click', () => {
    const nextLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    localStorage.setItem('kisansetu-language', nextLanguage);
    applyDashboardLanguage(nextLanguage);
});

applyDashboardLanguage(currentLanguage);
renderDemoState();
window.KisanSetuMaps.loadCentres().catch(() => {});
window.addEventListener('kisansetu-demo-updated', renderDemoState);
setInterval(renderDemoState, 2000);


const FARMER_API_BASE_URL = "https://sih-26032-gm8c.onrender.com";
const token = localStorage.getItem("kisansetu-access-token");
if (!token) {
    window.location.href = "farmer-login.html";
}
async function loadFarmerProfile() {
    try {
        const response = await fetch(
            `${FARMER_API_BASE_URL}/api/farmers/me`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load farmer profile.");
        }

        const farmer = await response.json();

        console.log(farmer);

        document.querySelector("#farmer-name").textContent = farmer.fullName;

        const avatar = document.querySelector("#user-avatar");
        avatar.textContent = farmer.fullName.charAt(0).toUpperCase();
        avatar.setAttribute("aria-label", `${farmer.fullName} profile`);

    } catch (error) {
        console.error(error);
    }
}

async function loadFarmerQueue() {
    const response = await fetch(
        `${FARMER_API_BASE_URL}/api/queue/mine`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Unable to load farmer queue.");
    const ticket = data.tickets?.[0];
    if (!ticket) return;
    localStorage.setItem("kisansetu-selected-ticket", String(ticket.id));
    const cards = document.querySelectorAll(".overview-card");
    const nextSlot = cards[0];
    nextSlot.children[1].textContent = ticket.bookingDate;
    nextSlot.children[2].textContent = ticket.timeSlot;
    nextSlot.children[3].textContent = ticket.centreName;
    cards[1].children[1].textContent = `#${ticket.tokenNumber}`;
    cards[1].children[2].textContent = `${ticket.status} · ${ticket.estimatedWaitMinutes} min`;
    cards[2].children[1].textContent = ticket.status;
    cards[2].children[2].textContent = `Quality ${ticket.checks.quality} · Weighing ${ticket.checks.weighing}`;
    cards[3].children[1].textContent = ticket.checks.payment;
    cards[3].children[2].textContent = `Procurement ${ticket.checks.procurement}`;
    const notifications = document.querySelectorAll('.notification-item p');
    notifications[0].innerHTML = `<strong>${Math.max(0, ticket.queuePosition - 1)} farmers</strong> ahead of you.`;
    notifications[1].textContent = `Your token #${ticket.tokenNumber} is ${ticket.status.toLowerCase()}.`;
    notifications[2].textContent = `Estimated wait: ${ticket.estimatedWaitMinutes} minutes.`;
}

async function loadFarmerBookings() {
    const response = await fetch(
        `${FARMER_API_BASE_URL}/api/farmers/me/bookings`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Unable to load bookings.");
    const history = document.querySelector("#booking-history");
    if (!data.bookings?.length) {
        history.innerHTML = '<p class="dashboard-empty-state">No bookings yet. Book a slot to see it here.</p>';
        return;
    }
    history.innerHTML = data.bookings.map((booking) => {
        const ticket = booking.ticket;
        const checks = ticket
            ? `Quality ${ticket.checks.quality} · Weighing ${ticket.checks.weighing} · Procurement ${ticket.checks.procurement} · Payment ${ticket.checks.payment}`
            : "Ticket not created";
        return `<article class="booking-history-row"><div><strong>${booking.bookingId}</strong><span>${booking.centre.name} · ${booking.bookingDate} · ${booking.timeSlot}</span><small>${booking.crop} · ${checks}</small></div><button class="dashboard-booking-ticket" data-ticket-id="${ticket?.id || ''}" type="button">${ticket ? `Token #${ticket.tokenNumber} · ${ticket.status}` : "View details"}</button></article>`;
    }).join('');
    history.querySelectorAll('.dashboard-booking-ticket').forEach((button) => {
        button.addEventListener('click', () => {
            if (button.dataset.ticketId) localStorage.setItem('kisansetu-selected-ticket', button.dataset.ticketId);
            window.location.href = 'live-queue.html';
        });
    });
}
const languageButton = document.querySelector('.dashboard-language');
let currentLanguage = localStorage.getItem('kisansetu-language') || 'en';

const dashboardTranslations = {
    en: {
        language: 'हिन्दी', eyebrow: 'Farmer dashboard', greeting: 'Hello,',
        description: 'Here’s what’s happening with your procurement.', nav: ['Dashboard', 'Book Slot', 'Live Queue', 'Procurement', 'Payments', 'My Bookings', 'Profile', 'Notifications', 'Help & Support', 'Logout'],
        nextSlot: 'Next slot', queue: 'Your queue', wait: 'Est. wait 42 min', procurement: 'Procurement', progress: 'In progress', weighing: 'Weighing done', payment: 'Payment', processing: 'Processing',
        quickActions: 'Quick actions', liveQueue: 'Live Queue', trackProcurement: 'Track Procurement', myBookings: 'My Bookings', paymentDetails: 'Payment Details',
        recent: 'Recent notifications', viewAll: 'View all', notifications: ['22 farmers ahead of you.', '12 farmers ahead.', 'Your turn is approaching. 20 min away.']
    },
    hi: {
        language: 'English', eyebrow: 'किसान डैशबोर्ड', greeting: 'नमस्ते,',
        description: 'आपकी फसल खरीद से जुड़ी जानकारी यहां है।', nav: ['डैशबोर्ड', 'स्लॉट बुक करें', 'लाइव कतार', 'खरीद', 'भुगतान', 'मेरी बुकिंग', 'प्रोफ़ाइल', 'सूचनाएं', 'सहायता', 'लॉगआउट'],
        nextSlot: 'अगला स्लॉट', queue: 'आपकी कतार', wait: 'अनुमानित प्रतीक्षा 42 मिनट', procurement: 'खरीद', progress: 'जारी है', weighing: 'तौल पूरी हुई', payment: 'भुगतान', processing: 'प्रक्रिया में',
        quickActions: 'त्वरित कार्य', liveQueue: 'लाइव कतार', trackProcurement: 'खरीद ट्रैक करें', myBookings: 'मेरी बुकिंग', paymentDetails: 'भुगतान विवरण',
        recent: 'हाल की सूचनाएं', viewAll: 'सभी देखें', notifications: ['आपसे आगे 22 किसान हैं।', 'आपसे आगे 12 किसान हैं।', 'आपकी बारी आ रही है। 20 मिनट बाकी।']
    }
};

function setText(element, text) {
    element.textContent = text;
}

function applyDashboardLanguage(language) {
    currentLanguage = language;
    const copy = dashboardTranslations[language];
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    languageButton.firstChild.textContent = `${copy.language} `;

    setText(document.querySelector('.dashboard-eyebrow'), copy.eyebrow);
    document.querySelector('.dashboard-header h1').firstChild.textContent = `${copy.greeting} `;
    setText(document.querySelector('.dashboard-header > div > p:last-child'), copy.description);

    document.querySelectorAll('.dashboard-nav-link').forEach((link, index) => {
        link.lastChild.textContent = copy.nav[index];
    });

    const overviewCards = document.querySelectorAll('.overview-card');
    setText(overviewCards[0].querySelector('.card-label'), copy.nextSlot);
    setText(overviewCards[0].lastElementChild, language === 'hi' ? 'केंद्र अ, हिसार' : 'Centre A, Hisar');
    setText(overviewCards[1].querySelector('.card-label'), copy.queue);
    setText(overviewCards[1].querySelector('span:last-child'), copy.wait);
    setText(overviewCards[2].querySelector('.card-label'), copy.procurement);
    setText(overviewCards[2].querySelector('.success-text'), copy.progress);
    setText(overviewCards[2].querySelector('span:last-child'), copy.weighing);
    setText(overviewCards[3].querySelector('.card-label'), copy.payment);
    setText(overviewCards[3].querySelector('span:last-child'), copy.processing);

    setText(document.querySelector('.quick-actions-section h2'), copy.quickActions);
    document.querySelectorAll('.quick-action strong').forEach((action, index) => {
        setText(action, [copy.liveQueue, copy.trackProcurement, copy.myBookings, copy.paymentDetails][index]);
    });
    setText(document.querySelector('.notifications-section h2'), copy.recent);
    setText(document.querySelector('.notifications-section .section-title-row a'), copy.viewAll);
    document.querySelectorAll('.notification-item p').forEach((item, index) => {
        setText(item, copy.notifications[index]);
    });
}

languageButton.addEventListener('click', () => {
    const nextLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    localStorage.setItem('kisansetu-language', nextLanguage);
    applyDashboardLanguage(nextLanguage);
});

applyDashboardLanguage(currentLanguage);
loadFarmerProfile();
loadFarmerQueue().catch((error) => console.error(error));
loadFarmerBookings().catch((error) => console.error(error));
setInterval(() => loadFarmerQueue().catch(() => {}), 5000);
setInterval(() => loadFarmerBookings().catch(() => {}), 5000);
window.KisanSetuMaps.loadCentres().catch((error) => console.error(error));
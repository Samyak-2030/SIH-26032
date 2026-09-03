const languageButton = document.querySelector('.dashboard-language');
let currentLanguage = localStorage.getItem('kisansetu-language') || 'en';

const dashboardTranslations = {
    en: {
        language: 'हिन्दी', eyebrow: 'Farmer dashboard', greeting: 'Hello, Rajesh',
        description: 'Here’s what’s happening with your procurement.', nav: ['Dashboard', 'Book Slot', 'Live Queue', 'Procurement', 'Payments', 'My Bookings', 'Profile', 'Notifications', 'Help & Support', 'Logout'],
        nextSlot: 'Next slot', queue: 'Your queue', wait: 'Est. wait 42 min', procurement: 'Procurement', progress: 'In progress', weighing: 'Weighing done', payment: 'Payment', processing: 'Processing',
        quickActions: 'Quick actions', liveQueue: 'Live Queue', trackProcurement: 'Track Procurement', myBookings: 'My Bookings', paymentDetails: 'Payment Details',
        recent: 'Recent notifications', viewAll: 'View all', notifications: ['22 farmers ahead of you.', '12 farmers ahead.', 'Your turn is approaching. 20 min away.']
    },
    hi: {
        language: 'English', eyebrow: 'किसान डैशबोर्ड', greeting: 'नमस्ते, राजेश',
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

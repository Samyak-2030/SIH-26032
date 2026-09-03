const loginButton = document.querySelector('.login-button');
const loginOptions = document.querySelector('.login-options');

function setLoginMenu(open) {
    loginButton.setAttribute('aria-expanded', String(open));
    loginOptions.classList.toggle('is-open', open);
}

loginButton.addEventListener('click', () => {
    const isOpen = loginButton.getAttribute('aria-expanded') === 'true';
    setLoginMenu(!isOpen);
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.login-menu')) {
        setLoginMenu(false);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setLoginMenu(false);
        loginButton.focus();
    }
});

const statValues = document.querySelectorAll('[data-target]');

function animateStats() {
    statValues.forEach((statValue) => {
        const target = Number(statValue.dataset.target);
        const duration = 1400;
        const startTime = performance.now();

        function updateValue(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            statValue.textContent = Math.floor(easedProgress * target).toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }

        requestAnimationFrame(updateValue);
    });
}

const statsSection = document.querySelector('.hero-stats');
const statsObserver = new IntersectionObserver((entries, observer) => {
    if (entries.some((entry) => entry.isIntersecting)) {
        animateStats();
        observer.disconnect();
    }
}, { threshold: 0.35 });

statsObserver.observe(statsSection);

const centreSearch = document.querySelector('#centre-search');
const stateFilter = document.querySelector('#state-filter');
const centreRows = [...document.querySelectorAll('#centre-table-body tr')];
const noResults = document.querySelector('.no-results');
const selectedCentre = document.querySelector('#selected-centre');
const sampleMap = document.querySelector('#sample-map');
const mapButton = document.querySelector('#view-map');
const mapPins = [...document.querySelectorAll('.map-pin')];
let selectedRow = null;
let currentLanguage = localStorage.getItem('kisansetu-language') || 'en';

const translations = {
    en: {
        navHome: 'Home', navCentres: 'Centres', navHow: 'How it works', navAbout: 'About us', navHelp: 'Help',
        login: 'Login', farmerLogin: 'Farmer login', farmerLoginHelp: 'Access your farmer account',
        adminLogin: 'Admin / govt login', adminLoginHelp: 'For administrators and officials',
        registerFarmer: 'Register as farmer', registerFarmerHelp: 'Join Kisanसेतु today',
        heroEyebrow: 'Kisanसेतु procurement platform', heroTitleFirst: 'Sell your crop,', heroTitleSecond: 'without the wait',
        heroDescription: 'Book your slot, track queue in real time, and get updates on procurements and payments.',
        bookSlot: 'Book procurement slot', checkStatus: 'Check centre status', statCentres: 'Procurement centres',
        statFarmers: 'Farmers today', statCompleted: 'Completed today', statPayment: 'Payment on time',
        reasonsEyebrow: 'Simple, reliable, transparent', reasonsHeading: 'Why farmers choose Kisanसेतु',
        saveTime: 'Save time', saveTimeHelp: 'Live queuing and slot booking', liveUpdates: 'Real-time updates',
        liveUpdatesHelp: 'Get notified at every step', transparent: 'Transparent process',
        transparentHelp: 'Track procurement and payment', nearbyCentre: 'Nearby centre', nearbyCentreHelp: 'Find the best centre near you',
        centreEyebrow: 'Find your nearest centre', centreHeading: 'Centre status',
        centreDescription: 'Live status of procurement centres across India', searchPlaceholder: 'Search by centre / district',
        allStates: 'All states', tableCentre: 'Centre name', tableDistrict: 'District', tableWaiting: 'Farmers waiting',
        tableTime: 'Waiting time', tableStatus: 'Status', normal: 'Normal', moderate: 'Moderate', busy: 'Busy',
        noResults: 'No centres match your search.', viewMap: 'View on map', selectCentre: 'Select a centre to view its location',
        mapLabel: 'India procurement network', howEyebrow: 'Simple steps to sell your crop', howHeading: 'How Kisanसेतु works',
        stepRegister: 'Register', stepRegisterHelp: 'Create your profile and verify your details', stepBook: 'Book slot',
        stepBookHelp: 'Choose a centre, date, and time slot', stepQueue: 'Live queue', stepQueueHelp: 'Track your queue in real time',
        stepProcurement: 'Procurement', stepProcurementHelp: 'Weighing, quality check, and procurement', stepPayment: 'Payment',
        stepPaymentHelp: 'Receive payment updates and confirmation', calloutFirst: 'Save time. Avoid long queues.',
        calloutSecond: 'Get a better experience with Kisanसेतु.', aboutEyebrow: 'Built for Indian farmers',
        aboutHeading: 'A simpler path from farm to payment', aboutDescription: 'Kisanसेतु connects farmers with nearby procurement centres so every visit is planned, transparent, and easier to track.',
        aboutPointOne: 'Fair and transparent procurement', aboutPointTwo: 'Trusted updates at every step', aboutPointThree: 'Support when you need it',
        helpEyebrow: 'We are here to help', helpHeading: 'Need help? Talk to us.',
        helpDescription: 'Our support team can help with bookings, centre status, and payment updates.', helpPhone: 'Call us',
        helpEmail: 'Email support', helpHours: 'Support hours', helpHoursValue: 'Mon - Sat, 9 AM - 6 PM',
        footerTagline: 'Making crop procurement simpler for every farmer.', footerAbout: 'About us', footerHelp: 'Help centre',
        footerCentres: 'Find a centre', copyright: '© 2026 Kisanसेतु. All rights reserved.', footerMade: 'Serving farmers across India'
    },
    hi: {
        navHome: 'होम', navCentres: 'केंद्र', navHow: 'यह कैसे काम करता है', navAbout: 'हमारे बारे में', navHelp: 'सहायता',
        login: 'लॉगिन', farmerLogin: 'किसान लॉगिन', farmerLoginHelp: 'अपने किसान खाते तक पहुँचें',
        adminLogin: 'व्यवस्थापक / सरकारी लॉगिन', adminLoginHelp: 'व्यवस्थापकों और अधिकारियों के लिए',
        registerFarmer: 'किसान के रूप में पंजीकरण करें', registerFarmerHelp: 'आज ही Kisanसेतु से जुड़ें',
        heroEyebrow: 'Kisanसेतु खरीद मंच', heroTitleFirst: 'अपनी फसल बेचें,', heroTitleSecond: 'बिना इंतज़ार के',
        heroDescription: 'अपना स्लॉट बुक करें, कतार को लाइव देखें और खरीद व भुगतान की जानकारी पाएं।',
        bookSlot: 'खरीद स्लॉट बुक करें', checkStatus: 'केंद्र की स्थिति देखें', statCentres: 'खरीद केंद्र',
        statFarmers: 'आज के किसान', statCompleted: 'आज पूरे हुए', statPayment: 'समय पर भुगतान',
        reasonsEyebrow: 'सरल, विश्वसनीय, पारदर्शी', reasonsHeading: 'किसान Kisanसेतु क्यों चुनते हैं',
        saveTime: 'समय बचाएं', saveTimeHelp: 'लाइव कतार और स्लॉट बुकिंग', liveUpdates: 'रियल-टाइम अपडेट',
        liveUpdatesHelp: 'हर चरण पर सूचना पाएं', transparent: 'पारदर्शी प्रक्रिया',
        transparentHelp: 'खरीद और भुगतान को ट्रैक करें', nearbyCentre: 'नजदीकी केंद्र', nearbyCentreHelp: 'अपने पास सबसे अच्छा केंद्र खोजें',
        centreEyebrow: 'अपना नजदीकी केंद्र खोजें', centreHeading: 'केंद्र की स्थिति',
        centreDescription: 'पूरे भारत में खरीद केंद्रों की लाइव स्थिति', searchPlaceholder: 'केंद्र / जिले से खोजें',
        allStates: 'सभी राज्य', tableCentre: 'केंद्र का नाम', tableDistrict: 'जिला', tableWaiting: 'प्रतीक्षारत किसान',
        tableTime: 'प्रतीक्षा समय', tableStatus: 'स्थिति', normal: 'सामान्य', moderate: 'मध्यम', busy: 'व्यस्त',
        noResults: 'आपकी खोज से कोई केंद्र नहीं मिला।', viewMap: 'मानचित्र पर देखें', selectCentre: 'स्थान देखने के लिए केंद्र चुनें',
        mapLabel: 'भारत खरीद नेटवर्क', howEyebrow: 'अपनी फसल बेचने के सरल चरण', howHeading: 'Kisanसेतु कैसे काम करता है',
        stepRegister: 'पंजीकरण करें', stepRegisterHelp: 'अपनी प्रोफ़ाइल बनाएं और विवरण सत्यापित करें', stepBook: 'स्लॉट बुक करें',
        stepBookHelp: 'केंद्र, तारीख और समय स्लॉट चुनें', stepQueue: 'लाइव कतार', stepQueueHelp: 'अपनी कतार को रियल टाइम में ट्रैक करें',
        stepProcurement: 'खरीद', stepProcurementHelp: 'तौल, गुणवत्ता जांच और खरीद', stepPayment: 'भुगतान',
        stepPaymentHelp: 'भुगतान अपडेट और पुष्टि पाएं', calloutFirst: 'समय बचाएं। लंबी कतारों से बचें।',
        calloutSecond: 'Kisanसेतु के साथ बेहतर अनुभव पाएं।', aboutEyebrow: 'भारतीय किसानों के लिए बनाया गया',
        aboutHeading: 'खेत से भुगतान तक आसान सफर', aboutDescription: 'Kisanसेतु किसानों को नजदीकी खरीद केंद्रों से जोड़ता है, ताकि हर यात्रा योजनाबद्ध, पारदर्शी और आसानी से ट्रैक की जा सके।',
        aboutPointOne: 'निष्पक्ष और पारदर्शी खरीद', aboutPointTwo: 'हर चरण पर विश्वसनीय अपडेट', aboutPointThree: 'जरूरत पड़ने पर सहायता',
        helpEyebrow: 'हम आपकी सहायता के लिए यहां हैं', helpHeading: 'मदद चाहिए? हमसे बात करें।',
        helpDescription: 'हमारी सहायता टीम बुकिंग, केंद्र की स्थिति और भुगतान अपडेट में मदद कर सकती है।', helpPhone: 'हमें कॉल करें',
        helpEmail: 'ईमेल सहायता', helpHours: 'सहायता का समय', helpHoursValue: 'सोम - शनि, सुबह 9 - शाम 6 बजे',
        footerTagline: 'हर किसान के लिए फसल खरीद को आसान बनाना।', footerAbout: 'हमारे बारे में', footerHelp: 'सहायता केंद्र',
        footerCentres: 'केंद्र खोजें', copyright: '© 2026 Kisanसेतु. सर्वाधिकार सुरक्षित।', footerMade: 'पूरे भारत के किसानों की सेवा में'
    }
};

function focusCentre(row) {
    selectedRow = row;
    centreRows.forEach((centreRow) => centreRow.classList.toggle('selected', centreRow === row));
    mapPins.forEach((pin) => pin.classList.toggle('is-active', pin.dataset.mapCentre === row.dataset.centre));
    const waitLabel = currentLanguage === 'hi' ? 'प्रतीक्षा' : 'wait';
    selectedCentre.textContent = `${row.dataset.centre} - ${row.dataset.district} (${row.dataset.waiting} ${waitLabel})`;
}

function filterCentres() {
    const query = centreSearch.value.trim().toLowerCase();
    const selectedState = stateFilter.value;
    let visibleRows = 0;

    centreRows.forEach((row) => {
        const searchableText = `${row.dataset.centre} ${row.dataset.district}`.toLowerCase();
        const matchesSearch = !query || searchableText.includes(query);
        const matchesState = selectedState === 'all' || row.dataset.state === selectedState;
        const isVisible = matchesSearch && matchesState;
        row.hidden = !isVisible;
        visibleRows += isVisible ? 1 : 0;
    });

    noResults.hidden = visibleRows !== 0;
    if (visibleRows > 0) {
        focusCentre(centreRows.find((row) => !row.hidden));
    }
}

centreRows.forEach((row) => {
    row.addEventListener('click', () => {
        focusCentre(row);
        sampleMap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

centreSearch.addEventListener('input', filterCentres);
stateFilter.addEventListener('change', filterCentres);

mapPins.forEach((pin) => {
    pin.addEventListener('click', () => {
        const matchingRow = centreRows.find((row) => row.dataset.centre === pin.dataset.mapCentre);
        if (matchingRow) {
            focusCentre(matchingRow);
            matchingRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});

mapButton.addEventListener('click', () => {
    sampleMap.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

focusCentre(centreRows[0]);

const languageToggle = document.querySelector('.language-toggle');
const languageOptions = languageToggle.querySelectorAll('.language-option');

function applyLanguage(language) {
    currentLanguage = language;
    const dictionary = translations[language];
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    document.title = language === 'hi' ? 'Kisanसेतु' : 'Kisanसेतु';

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        element.textContent = dictionary[element.dataset.i18n];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        element.placeholder = dictionary[element.dataset.i18nPlaceholder];
    });

    languageOptions[0].classList.toggle('language-option-active', language === 'en');
    languageOptions[1].classList.toggle('language-option-active', language === 'hi');
    languageToggle.setAttribute('aria-pressed', String(language === 'hi'));
    languageToggle.setAttribute('aria-label', language === 'en' ? 'Switch to Hindi' : 'Switch to English');
    if (selectedRow) {
        focusCentre(selectedRow);
    }
}

languageToggle.addEventListener('click', () => {
    const nextLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    localStorage.setItem('kisansetu-language', nextLanguage);
    applyLanguage(nextLanguage);
});

applyLanguage(currentLanguage);

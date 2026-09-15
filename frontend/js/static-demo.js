(() => {
    const STORAGE_KEY = 'kisansetu-static-demo-state';
    const TICKET_KEY = 'kisansetu-selected-ticket';
    const CENTRES = [
        { id: 1, name: 'Centre A', district: 'Hisar', location: 'Hisar City', capacity: 500, status: 'Active', latitude: 29.1492, longitude: 75.7217 },
        { id: 2, name: 'Centre B', district: 'Bhiwani', location: 'Bhiwani City', capacity: 400, status: 'Active', latitude: 28.793, longitude: 76.1398 },
        { id: 3, name: 'Centre C', district: 'Sirsa', location: 'Sirsa City', capacity: 300, status: 'Active', latitude: 29.5349, longitude: 75.0289 },
        { id: 4, name: 'Centre D', district: 'Karnal', location: 'Karnal City', capacity: 450, status: 'Active', latitude: 29.6857, longitude: 76.9905 },
    ];

    const initialTickets = [
        { id: 101, tokenNumber: 101, farmerName: 'Ramesh Kumar', mobile: '98XXXXXX12', centreId: 1, crop: 'Wheat', status: 'Waiting', checks: { quality: 'Pending', weighing: 'Pending', procurement: 'Pending', payment: 'Pending' } },
        { id: 102, tokenNumber: 102, farmerName: 'Sita Devi', mobile: '97XXXXXX45', centreId: 1, crop: 'Rice', status: 'Waiting', checks: { quality: 'Pending', weighing: 'Pending', procurement: 'Pending', payment: 'Pending' } },
        { id: 103, tokenNumber: 103, farmerName: 'Mohan Singh', mobile: '96XXXXXX78', centreId: 2, crop: 'Mustard', status: 'Called', checks: { quality: 'Passed', weighing: 'In Progress', procurement: 'Pending', payment: 'Pending' } },
    ];

    function defaultState() {
        return { nextToken: 104, tickets: initialTickets, centres: CENTRES };
    }

    function getState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (!saved?.tickets) return defaultState();
            const savedCentres = saved.centres || [];
            const centres = CENTRES.map((baseCentre) => ({
                ...baseCentre,
                ...(savedCentres.find((centre) => centre.id === baseCentre.id) || {}),
            }));
            savedCentres.filter((centre) => !centres.some((entry) => entry.id === centre.id)).forEach((centre) => centres.push(centre));
            return { ...saved, centres };
        } catch {
            return defaultState();
        }
    }

    function saveState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        window.dispatchEvent(new CustomEvent('kisansetu-demo-updated'));
    }

    function getCentres() {
        return getState().centres || CENTRES;
    }

    function centreById(id) {
        return getCentres().find((centre) => centre.id === Number(id)) || getCentres()[0];
    }

    function enrich(ticket, state) {
        const centre = centreById(ticket.centreId);
        const sameCentre = state.tickets.filter((entry) => entry.centreId === ticket.centreId && ['Waiting', 'Called', 'Serving'].includes(entry.status));
        const position = sameCentre.findIndex((entry) => entry.id === ticket.id) + 1;
        return { ...ticket, centreName: centre.name, queuePosition: Math.max(position, 1), estimatedWaitMinutes: Math.max(position - 1, 0) * 10 };
    }

    function getTickets() {
        const state = getState();
        return state.tickets.map((ticket) => enrich(ticket, state));
    }

    function book({ crop, date, time, centreId, farmerName = 'Demo Farmer' }) {
        const state = getState();
        const tokenNumber = state.nextToken;
        const ticket = {
            id: tokenNumber,
            tokenNumber,
            farmerName,
            mobile: 'Demo account',
            centreId: Number(centreId),
            crop,
            bookingDate: date,
            timeSlot: time,
            status: 'Waiting',
            isMine: true,
            checks: { quality: 'Pending', weighing: 'Pending', procurement: 'Pending', payment: 'Pending' },
        };
        state.nextToken += 1;
        state.tickets.push(ticket);
        saveState(state);
        localStorage.setItem(TICKET_KEY, String(ticket.id));
        return enrich(ticket, state);
    }

    function callNext(centreId) {
        const state = getState();
        const next = state.tickets.find((ticket) => ticket.centreId === Number(centreId) && ticket.status === 'Waiting');
        if (!next) throw new Error('No waiting tickets for this centre.');
        next.status = 'Called';
        saveState(state);
        return enrich(next, state);
    }

    function updateCheck(ticketId, check, status) {
        const state = getState();
        const ticket = state.tickets.find((entry) => entry.id === Number(ticketId));
        if (!ticket) throw new Error('Ticket not found.');
        ticket.checks[check] = status;
        ticket.status = Object.values(ticket.checks).every((value) => value === 'Passed') ? 'Completed' : status === 'Failed' ? 'Serving' : ticket.status === 'Waiting' ? 'Serving' : ticket.status;
        saveState(state);
        return enrich(ticket, state);
    }

    function addCentre(centre) {
        const state = getState();
        const nextId = Math.max(...state.centres.map((entry) => entry.id), 0) + 1;
        state.centres.push({ ...centre, id: nextId, capacity: Number(centre.capacity), status: centre.status || 'Active' });
        saveState(state);
        return state.centres.at(-1);
    }

    window.KisanSetuDemo = { CENTRES, getState, getCentres, getTickets, getTicketsForFarmer: () => getTickets().filter((ticket) => ticket.isMine), book, callNext, updateCheck, addCentre, centreById };
})();

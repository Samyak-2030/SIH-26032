const API_BASE_URL = 'https://sih-26032-gm8c.onrender.com';

window.KisanSetuMaps = (() => {
    const haryanaBounds = [[27.65, 74.45], [31.0, 77.65]];
    const fallbackCentres = [
        { name: 'Government Procurement Centre - Ambala', state: 'Haryana', district: 'Ambala', location: 'Ambala City', capacity: 500, latitude: 30.3782, longitude: 76.7767 },
        { name: 'Government Procurement Centre - Bhiwani', state: 'Haryana', district: 'Bhiwani', location: 'Bhiwani City', capacity: 400, latitude: 28.793, longitude: 76.1398 },
        { name: 'Government Procurement Centre - Hisar', state: 'Haryana', district: 'Hisar', location: 'Hisar City', capacity: 500, latitude: 29.1492, longitude: 75.7217 },
        { name: 'Government Procurement Centre - Karnal', state: 'Haryana', district: 'Karnal', location: 'Karnal City', capacity: 450, latitude: 29.6857, longitude: 76.9905 },
        { name: 'Government Procurement Centre - Kurukshetra', state: 'Haryana', district: 'Kurukshetra', location: 'Thanesar', capacity: 350, latitude: 29.9695, longitude: 76.8783 },
        { name: 'Government Procurement Centre - Rohtak', state: 'Haryana', district: 'Rohtak', location: 'Rohtak City', capacity: 400, latitude: 28.8955, longitude: 76.6066 },
        { name: 'Government Procurement Centre - Sirsa', state: 'Haryana', district: 'Sirsa', location: 'Sirsa City', capacity: 300, latitude: 29.5349, longitude: 75.0289 },
        { name: 'Government Procurement Centre - Sonipat', state: 'Haryana', district: 'Sonipat', location: 'Sonipat City', capacity: 450, latitude: 28.9931, longitude: 77.0151 },
        { name: 'Government Procurement Centre - Yamunanagar', state: 'Haryana', district: 'Yamunanagar', location: 'Yamunanagar City', capacity: 350, latitude: 30.129, longitude: 77.2674 }
    ];
    let maps = [];

    function hasCoordinates(centre) {
        return Number.isFinite(Number(centre.latitude)) && Number.isFinite(Number(centre.longitude));
    }

    function markerPopup(centre) {
        const destination = `${centre.name}, ${centre.latitude}, ${centre.longitude}`;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
        const demoTickets = window.KisanSetuDemo?.getTickets?.() || [];
        const queueCount = demoTickets.filter((ticket) => ticket.centreId === Number(centre.id) && ['Waiting', 'Called', 'Serving'].includes(ticket.status)).length;
        return `<div class="map-centre-summary"><strong>${centre.name}</strong><span>${centre.location}, ${centre.district}, ${centre.state}</span><span>Capacity: ${centre.capacity}/day</span><span>Status: ${centre.status || 'Active'} · Queue: ${queueCount}</span><a class="map-google-link" href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">View on Google Maps ↗</a></div>`;
    }

    function drawMarkers(centres) {
        maps.forEach(({ map, markerLayer }) => {
            markerLayer.clearLayers();
            centres
                .filter(hasCoordinates)
                .forEach((centre) => {
                    L.marker([centre.latitude, centre.longitude])
                        .bindPopup(markerPopup(centre))
                        .addTo(markerLayer);
                });
        });
    }

    function initialise() {
        if (!window.L) return;
        document.querySelectorAll('.kisan-leaflet-map').forEach((element) => {
            if (element.dataset.mapReady) return;
            const map = L.map(element, { scrollWheelZoom: false }).fitBounds(haryanaBounds);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            maps.push({ map, markerLayer: L.layerGroup().addTo(map) });
            element.dataset.mapReady = 'true';
            window.setTimeout(() => map.invalidateSize(), 0);
        });
    }

    async function loadCentres() {
        initialise();
        if (!window.L) return [];
        if (window.KisanSetuDemo?.getCentres) {
            const centres = window.KisanSetuDemo.getCentres();
            drawMarkers(centres);
            return centres;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/centres`);
            if (!response.ok) throw new Error('Unable to load procurement centres.');
            const data = await response.json();
            drawMarkers(data.centres);
            return data.centres;
        } catch (error) {
            drawMarkers(fallbackCentres);
            console.warn('Using local centre map data:', error.message);
            return fallbackCentres;
        }
    }

    window.addEventListener('kisansetu-demo-updated', () => {
        if (window.KisanSetuDemo?.getCentres) drawMarkers(window.KisanSetuDemo.getCentres());
    });

    return { initialise, loadCentres, drawMarkers };
})();

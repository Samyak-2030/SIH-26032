const API_BASE_URL = 'http://127.0.0.1:8000';

window.KisanSetuMaps = (() => {
    const haryanaBounds = [[27.65, 74.45], [31.0, 77.65]];
    let maps = [];

    function markerPopup(centre) {
        return `<strong>${centre.name}</strong><br>${centre.district}, ${centre.state}<br>${centre.location}<br>Capacity: ${centre.capacity}/day`;
    }

    function drawMarkers(centres) {
        maps.forEach(({ map, markerLayer }) => {
            markerLayer.clearLayers();
            centres
                .filter((centre) => Number.isFinite(Number(centre.latitude)) && Number.isFinite(Number(centre.longitude)))
                .forEach((centre) => {
                    L.marker([centre.latitude, centre.longitude])
                        .bindPopup(markerPopup(centre))
                        .addTo(markerLayer);
                });
        });
    }

    function initialise() {
        document.querySelectorAll('.kisan-leaflet-map').forEach((element) => {
            if (element.dataset.mapReady) return;
            const map = L.map(element, { scrollWheelZoom: false }).fitBounds(haryanaBounds);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            maps.push({ map, markerLayer: L.layerGroup().addTo(map) });
            element.dataset.mapReady = 'true';
        });
    }

    async function loadCentres() {
        const response = await fetch(`${API_BASE_URL}/api/centres`);
        if (!response.ok) throw new Error('Unable to load procurement centres.');
        const data = await response.json();
        initialise();
        drawMarkers(data.centres);
        return data.centres;
    }

    return { initialise, loadCentres, drawMarkers };
})();

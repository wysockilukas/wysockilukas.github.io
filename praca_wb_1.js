    document.addEventListener("DOMContentLoaded", function() {
        const map = L.map('map').setView([52.2337172, 21.071432235636493], 12);
        const modalContent = document.getElementById('modalContent');
        const educationFilter = document.getElementById('educationFilter');
        let markers = L.layerGroup().addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Custom marker for your location
        const customIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });
        L.marker([52.2225747, 20.9401911], {icon: customIcon}).addTo(map);

        const naboryIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });

        const zusIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });

        const kulturaIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });

        function displayMarkers(data, filter = false) {
            markers.clearLayers();
            Object.values(data).forEach(item => {
                if (item.wspolrzedne && (!filter || (item.wyksztalcenie && item.wyksztalcenie.toLowerCase().includes('średnie')))) {
                    const [lat, lng] = item.wspolrzedne;
                    const markerIcon = item.source === 'nabory' ? naboryIcon : (item.source === 'zus' ? zusIcon : kulturaIcon);
                    const marker = L.marker([lat, lng], {icon: markerIcon}).addTo(markers);
                    marker.on('click', function() {
                        modalContent.innerHTML = `
                            <strong>Stanowisko:</strong> ${item.stanowisko}<br>
                            <strong>Urząd:</strong> ${item.urzad}<br>
                            <strong>Dział:</strong> ${item.dzial}<br>
                            <strong>Miejsce pracy:</strong> ${item.miejsce_pracy}<br>
                            <strong>Wykształcenie:</strong> ${item.wyksztalcenie}<br>
                            <a href="${item.adres}" target="_blank">Link do oferty</a>
                            <hr>
                        `;
                        $('#infoModal').modal('show');
                    });
                }
            });
        }

        Promise.all([
            fetch('https://pracawbudzetowce-default-rtdb.europe-west1.firebasedatabase.app/nabory.json').then(res => res.json()),
            fetch('https://pracawbudzetowce-default-rtdb.europe-west1.firebasedatabase.app/zus.json').then(res => res.json()),
            fetch('https://pracawbudzetowce-default-rtdb.europe-west1.firebasedatabase.app/kultura.json').then(res => res.json())
        ]).then(([naboryData, zusData, kulturaData]) => {
            const combinedData = {...naboryData, ...zusData, ...kulturaData};
            Object.keys(naboryData).forEach(key => combinedData[key].source = 'nabory');
            Object.keys(zusData).forEach(key => combinedData[key].source = 'zus');
            Object.keys(kulturaData).forEach(key => combinedData[key].source = 'kultura');

            displayMarkers(combinedData, true);

            educationFilter.addEventListener('change', function() {
                displayMarkers(combinedData, this.checked);
            });
        });
    });

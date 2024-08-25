const iconMapping = {
    dom: 'licon fa-map-marker-alt icon_color_red ',
    nabory: 'licon fa-map-marker-alt icon_color_blue ',
    kultura: 'licon fa-map-marker-alt icon_color_yellow '
};

function initializeMap() {
    const map = L.map('map').setView([52.2337172, 21.071432235636493], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    return map;
}

function createLegend() {
    const legendContainer = document.querySelector('.legend');
    legendContainer.innerHTML = ''; // Wyczyść istniejącą zawartość
    
    for (let category in iconMapping) {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
    
        const icon = document.createElement('i');
        icon.className = 'icona_legendy fas ' + iconMapping[category]; 
    
        const label = document.createElement('span');
        label.textContent = category.charAt(0).toUpperCase() + category.slice(1); 
    
        legendItem.appendChild(icon);
        legendItem.appendChild(label);

        legendItem.addEventListener('click', function() {
            const markers = document.querySelectorAll(`.icon-${category}`);
            if (icon.classList.contains('faded')) {
                icon.classList.remove('faded');
                markers.forEach(marker => marker.style.display = '');
            } else {
                icon.classList.add('faded');
                markers.forEach(marker => marker.style.display = 'none');
            }
        });        
    
        legendContainer.appendChild(legendItem);
    }
}

function createIcon(type, nowy) {
    let nowy_klasa
    if (nowy) {
        nowy_klasa = 'icon_new'
    }
    return L.divIcon({
        className: `custom-icon icon-${type} ${nowy_klasa}`,
        html: `<i class="fas ${iconMapping[type]}"></i>`,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
}

let glb_marker_modals= {};

function displayMarkers(filteredData, map, markers) {
    markers.clearLayers();

    filteredData.forEach(item => {
        if (item.wspolrzedne) {
            const [lat, lng] = item.wspolrzedne;
            const id_marker = `m_${lat}_${lng}`;
            const marker = L.marker([lat, lng], { icon: createIcon(item.source, item.nowy) }).addTo(markers);

            let modal_html = `
            <strong>Stanowisko:</strong> ${item.stanowisko}<br>
            <strong>Urząd:</strong> ${item.urzad}<br>
            <strong>Dział:</strong> ${item.dzial}<br>
            <strong>Miejsce pracy:</strong> ${item.miejsce_pracy}<br>
            <strong>Wykształcenie:</strong> ${item.wyksztalcenie}<br>
            <a href="${item.adres}" target="_blank">Link do oferty</a>
            <hr>
             `;

            if (Object(glb_marker_modals).hasOwnProperty(id_marker)) {
                modal_html = glb_marker_modals[id_marker] + modal_html;
            }

            glb_marker_modals[id_marker] = modal_html;
    
            marker.on('click', function() {
                modalContent.innerHTML = modal_html;
                $('#infoModal').modal('show');
            });
        }

    });
}

function filterData(data, filterEducation = false) {
    return Object.values(data).filter(item => {
        if (filterEducation && (!item.wyksztalcenie || !item.wyksztalcenie.toLowerCase().includes('średnie'))) return false;
        return true;
    });
}

function prepareTableData(data) {
    const sortedData = data.sort((a, b) => new Date(a.waznedo) - new Date(b.waznedo));

    return sortedData.map(item => {
        return {
            urzad: item.urzad,
            dzial: item.dzial,
            stanowisko: `<a href="${item.adres}" target="_blank">${item.stanowisko}</a>`,
            waznedo: item.waznedo,
            wspolrzedne: item.wspolrzedne,
            nowy: item.nowy
        };
    });
}

function populateTable(data, map) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';  
    data.forEach(item => {
        const row = document.createElement('div');
        row.classList.add('table-row');

        const urzadCell = document.createElement('div');
        urzadCell.classList.add('table-cell');
        urzadCell.textContent = item.urzad;
        row.appendChild(urzadCell);

        const dzialCell = document.createElement('div');
        dzialCell.classList.add('table-cell');
        dzialCell.textContent = item.dzial;
        row.appendChild(dzialCell);

        const stanowiskoCell = document.createElement('div');
        stanowiskoCell.classList.add('table-cell');
        if (item.nowy) {
            stanowiskoCell.classList.add('a_nowy');
        }

        stanowiskoCell.innerHTML = item.stanowisko;
        row.appendChild(stanowiskoCell);

        const waznedoCell = document.createElement('div');
        waznedoCell.classList.add('table-cell');
        waznedoCell.textContent = item.waznedo;
        row.appendChild(waznedoCell);

        const actionCell = document.createElement('div');
        actionCell.className = 'table-cell';
        if (item.wspolrzedne) {
            const showOnMapIcon = document.createElement('i');
            showOnMapIcon.className = 'fas fa-search-location';
            showOnMapIcon.title = 'Pokaż na mapie';
            
            const showOnMapBtn = document.createElement('button');
            showOnMapBtn.className = 'icon-button';
            showOnMapBtn.appendChild(showOnMapIcon);
            showOnMapBtn.addEventListener('click', () => {
                map.setView(item.wspolrzedne, 15);
            });
            
            actionCell.appendChild(showOnMapBtn);
        }
        row.appendChild(actionCell);        

        tableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const map = initializeMap();
    
    const modalContent = document.getElementById('modalContent');
    const educationFilter = document.getElementById('educationFilter');
    let markers = L.layerGroup().addTo(map);

    L.marker([52.2225747, 20.9401911], { icon: createIcon('dom') }).addTo(map);

    Promise.all([
        fetch('https://pracawbudzetowce-default-rtdb.europe-west1.firebasedatabase.app/nabory.json').then(res => res.json()),
        fetch('https://pracawbudzetowce-default-rtdb.europe-west1.firebasedatabase.app/kultura.json').then(res => res.json())
    ]).then(([naboryData, kulturaData]) => {
        const combinedData = { ...naboryData, ...kulturaData };
        Object.keys(naboryData).forEach(key => combinedData[key].source = 'nabory');
        Object.keys(kulturaData).forEach(key => combinedData[key].source = 'kultura');

        const filteredData = filterData(combinedData, educationFilter.checked);

        displayMarkers(filteredData, map, markers);
        createLegend();
        populateTable(prepareTableData(filteredData), map);

        educationFilter.addEventListener('change', function() {
            const filteredData = filterData(combinedData, this.checked);
            displayMarkers(filteredData, map, markers);
            populateTable(prepareTableData(filteredData), map);
        });
    });
});

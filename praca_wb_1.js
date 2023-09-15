


const iconMapping = {
    dom: 'licon fa-map-marker-alt icon_color_red ',
    zus: 'licon fa-map-marker-alt icon_color_green  ',
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
        // Utwórz elementy dla pozycji w legendzie
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
    
        const icon = document.createElement('i');
        icon.className = 'icona_legendy fas ' + iconMapping[category]; // Dodajemy klasę 'fas' tutaj
    
        const label = document.createElement('span');
        label.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize the category name
    
        // Dodaj ikonę i etykietę do pozycji w legendzie
        legendItem.appendChild(icon);
        legendItem.appendChild(label);

        // Dodaj procedurę obsługi zdarzeń do ikony
        legendItem.addEventListener('click', function() {
            const markers = document.querySelectorAll(`.icon-${category}`);
            if (icon.classList.contains('faded')) {
                // Jeśli ikona jest wyblakła, przywróć jej oryginalny wygląd i pokaż markery
                icon.classList.remove('faded');
                markers.forEach(marker => marker.style.display = '');
            } else {
                // W przeciwnym razie zrób ikonę wyblakłą i ukryj markery
                icon.classList.add('faded');
                markers.forEach(marker => marker.style.display = 'none');
            }
        });        
    
        // Dodaj pozycję do głównego kontenera legendy
        legendContainer.appendChild(legendItem);
    }
    
}



function createIcon(type, i_id) {
    return L.divIcon({
        className: `custom-icon icon-${type} icon_id_${i_id}`,
        html: `<i class="fas ${iconMapping[type]}"></i>`,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
}






// Zmienna globalna do przechowywania markerów
// let glb_markers = {};

function displayMarkers(filteredData, map, markers) {
    // console.log('displayMarkers', filteredData.length);  
    markers.clearLayers();

    // Czyszczenie globalnej tablicy markerów
    // glb_markers = {};

    filteredData.forEach(item => {
        if (item.wspolrzedne) {
            const [lat, lng] = item.wspolrzedne;
            const marker = L.marker([lat, lng], { icon: createIcon(item.source) }).addTo(markers);
    
    
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


function filterData(data, filterEducation = false) {
    return Object.values(data).filter(item => {
        // if (!item.wspolrzedne) return false;
        if (filterEducation && (!item.wyksztalcenie || !item.wyksztalcenie.toLowerCase().includes('średnie'))) return false;
        return true;
    });
}


function prepareTableData(data) {
    // Sortowanie danych według daty "ważne do"
    const sortedData = data.sort((a, b) => new Date(a.waznedo) - new Date(b.waznedo));

    // Przygotowanie danych do wyświetlenia w tabeli
    return sortedData.map(item => {
        return {
            urzad: item.urzad,
            dzial: item.dzial,
            stanowisko: `<a href="${item.adres}" target="_blank">${item.stanowisko}</a>`,
            waznedo: item.waznedo,
            wspolrzedne: item.wspolrzedne
        };
    });
}




function populateTable(data, map) {
    // console.log('populateTable', data.length);  
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';  // Czyszczenie istniejących wierszy

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
        stanowiskoCell.innerHTML = `<a href="${item.adres}" target="_blank">${item.stanowisko}</a>`;
        row.appendChild(stanowiskoCell);

        const waznedoCell = document.createElement('div');
        waznedoCell.classList.add('table-cell');
        waznedoCell.textContent = item.waznedo;
        row.appendChild(waznedoCell);

        // Kolumna z przyciskiem "pokaż na mapie"
        const actionCell = document.createElement('div');
        actionCell.className = 'table-cell';
        if (item.wspolrzedne) {
            const showOnMapIcon = document.createElement('i');
            showOnMapIcon.className = 'fas fa-search-location';
            showOnMapIcon.title = 'Pokaż na mapie'; // Dodanie podpowiedzi po najechaniu myszką
            
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

    // L.marker([52.2225747, 20.9401911], { icon: icons.customIcon }).addTo(map);
    L.marker([52.2225747, 20.9401911], { icon: createIcon('dom') }).addTo(map);


    Promise.all([
        fetch('https://pracawbudzetowce-default-rtdb.europe-west1.firebasedatabase.app/nabory.json').then(res => res.json()),
        fetch('https://pracawbudzetowce-default-rtdb.europe-west1.firebasedatabase.app/zus.json').then(res => res.json()),
        fetch('https://pracawbudzetowce-default-rtdb.europe-west1.firebasedatabase.app/kultura.json').then(res => res.json())
    ]).then(([naboryData, zusData, kulturaData]) => {
        const combinedData = { ...naboryData, ...zusData, ...kulturaData };
        Object.keys(naboryData).forEach(key => combinedData[key].source = 'nabory');
        Object.keys(zusData).forEach(key => combinedData[key].source = 'zus');
        Object.keys(kulturaData).forEach(key => combinedData[key].source = 'kultura');

        // Filtrowanie danych na podstawie stanu checkboxa
        const filteredData = filterData(combinedData, educationFilter.checked);
    
               
        displayMarkers(filteredData, map, markers);
        createLegend()
        populateTable(prepareTableData(filteredData), map);

        educationFilter.addEventListener('change', function() {
            // console.log("Checkbox changed!");  // Dodaj tę linię
            const filteredData = filterData(combinedData, this.checked);
            // displayMarkers(filteredData, map, markers);
            displayMarkers(filteredData, map, markers);
            populateTable(prepareTableData(filteredData), map);
            
        });
        
    });
});

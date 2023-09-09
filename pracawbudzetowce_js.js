document.addEventListener("DOMContentLoaded", function() {
    const positionsSelect = document.getElementById('positions');
    const dataList = document.getElementById('dataList');
    const selectAllBtn = document.getElementById('selectAll');
    const deselectAllBtn = document.getElementById('deselectAll');

    fetch('https://pracawbudzetowce-default-rtdb.europe-west1.firebasedatabase.app/nabory.json')
        .then(response => response.json())
        .then(data => {
            const uniquePositions = [...new Set(Object.values(data).map(item => item.stanowisko))];
            uniquePositions.forEach(position => {
                const option = document.createElement('option');
                option.value = position;
                option.selected = true;
                option.textContent = position;
                positionsSelect.appendChild(option);
            });

            Object.values(data).forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.urzad}</td>
                    <td>${item.dzial}</td>
                    <td>${item.lokalizacja}</td>
                    <td>${item.stanowisko}</td>
                    <td>${item.waznedo}</td>
                `;
                dataList.appendChild(row);
            });
        });

    selectAllBtn.addEventListener('click', () => {
        for(let i = 0; i < positionsSelect.options.length; i++) {
            positionsSelect.options[i].selected = true;
        }
    });

    deselectAllBtn.addEventListener('click', () => {
        for(let i = 0; i < positionsSelect.options.length; i++) {
            positionsSelect.options[i].selected = false;
        }
    });
});

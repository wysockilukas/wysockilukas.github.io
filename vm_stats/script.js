// Assuming data is in the variable named 'dane'
const data = dane;

// Function to calculate the average of an array
function average(arr) {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

function renderMachineData(machineName) {
    // Filter data for the specific machine
    const machineData = data.filter(d => d.machine_name === machineName);

    // Extract latest data for tiles
    const latestData = machineData[machineData.length - 1];
    document.getElementById(machineName + '_cpuValue').textContent = latestData.cpu_percent.toFixed(1);
    document.getElementById(machineName + '_ramValue').textContent = (latestData.used_ram).toFixed(1) + '/' + latestData.total_ram;

    // Calculate average CPU usage for the last 60 data points
    const last60Cpu = machineData.slice(-60).map(d => d.cpu_percent);
    const avgCpu = average(last60Cpu);
    document.getElementById(machineName + '_avgCpuValue').textContent = avgCpu.toFixed(1);


    // Prepare data for the CPU and RAM usage graphs
    const labels = machineData.map(d => new Date(d.ts * 1000).toLocaleTimeString());
    const cpuData = machineData.map(d => d.cpu_percent);
    const ramData = machineData.map(d => d.used_ram);

    const avgCpuData = machineData.map((_, idx, arr) => {
        const slice = arr.slice(Math.max(idx - 60, 0), idx + 1);
        return average(slice.map(d => d.cpu_percent));
    });

    // Create the CPU usage graph
    const cpuCanvas = document.getElementById(machineName + 'cpuCanvas').getContext('2d');
    const cpuChart = new Chart(cpuCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average CPU Usage (%)',
                data: avgCpuData,
                borderColor: 'red',
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Create the RAM usage graph with an additional line for total_ram
    const ramCanvas = document.getElementById(machineName + 'ramCanvas').getContext('2d');
    const ramChart = new Chart(ramCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'RAM Usage (GB)',
                    data: ramData,
                    borderColor: '#e74c3c',
                    fill: false
                },
                {
                    label: 'Total RAM (GB)',
                    data: Array(labels.length).fill(latestData.total_ram),
                    borderColor: '#2ecc71',
                    borderDash: [5, 5], // Make this a dashed line
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Display Docker stats for the latest data
    const dockerList = document.getElementById(machineName + 'DockerList');
    for (const container of latestData.docker_stats) {
        const li = document.createElement('li');
        li.textContent = `${container.container} - CPU: ${container.cpu_percent.toFixed(1)}% - RAM: ${container.used_ram.toFixed(1)}/${container.total_ram} GB`;
        dockerList.appendChild(li);
    }
}

// Render data for each machine
renderMachineData('MISVM');
renderMachineData('dr7appexa');
renderMachineData('p7appexa');

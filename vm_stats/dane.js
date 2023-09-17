function generateData(startTime, endTime) {
    const machines = ["MISVM", "dr7appexa", "p7appexa"];
    const totalRam = 15.5; 
    const maxContainers = 20;
    const containerLifetime = 5 * 60 * 60;  // 5 hours in seconds

    let activeContainers = {};

    function randomContainer(machine) {
        const containerNames = ["web_app", "database", "cache", "api_server", "message_queue"];
        const containerSuffixes = ["(a1b2c3d4)", "(e5f6g7h8)", "(i9j0k1l2)", "(m3n4o5p6)"];
        return {
            container: `${containerNames[Math.floor(Math.random() * containerNames.length)]} ${containerSuffixes[Math.floor(Math.random() * containerSuffixes.length)]}`,
            used_ram: parseFloat((Math.random() * 5).toFixed(1)),  // Random number up to 5GB
            total_ram: totalRam,
            cpu_percent: parseFloat((Math.random() * 100).toFixed(1))
        };
    }

    function getContainersForMachine(machine, ts) {
        if (machine === "MISVM") {
            return [
                {
                    container: "redis_kontener (ca85c9db4c9f)",
                    used_ram: parseFloat((Math.random() * 5).toFixed(1)),
                    total_ram: totalRam,
                    cpu_percent: parseFloat((Math.random() * 100).toFixed(1))
                },
                {
                    container: "mongo_kontener (3b3cf7d8f7f6)",
                    used_ram: parseFloat((Math.random() * 5).toFixed(1)),
                    total_ram: totalRam,
                    cpu_percent: parseFloat((Math.random() * 100).toFixed(1))
                }
            ];
        } else {
            if (!activeContainers[machine]) {
                activeContainers[machine] = [];
            }

            // Remove expired containers
            activeContainers[machine] = activeContainers[machine].filter(c => ts - c.startTimestamp < containerLifetime);

            // Add new containers with a certain probability
            while (activeContainers[machine].length < maxContainers && Math.random() < 0.5) {
                activeContainers[machine].push({
                    ...randomContainer(machine),
                    startTimestamp: ts
                });
            }

            return activeContainers[machine];
        }
    }

    let data = [];
    
    let startTimestamp = new Date(startTime).getTime() / 1000;
    let endTimestamp = new Date(endTime).getTime() / 1000;

    for (let ts = startTimestamp; ts <= endTimestamp; ts += 60) {
        for (let machine of machines) {
            let cpuPercent = parseFloat((Math.random() * 100).toFixed(1));
            let usedRam = parseFloat((Math.random() * totalRam).toFixed(1));
            let availableMemory = totalRam - usedRam;
            
            let entry = {
                ts: ts,
                machine_name: machine,
                cpu_percent: cpuPercent,
                total_ram: totalRam,
                used_ram: usedRam,
                available_memory: availableMemory,
                // Mocked processes. You can expand them based on your needs.
                top_cpu_processes: [{pid: "1234", name: "proc1", cpu_percent: 10.5, details: "details1"}],
                top_ram_processes: [{pid: "5678", name: "proc2", ram_percent: 5.5, details: "details2"}],
                docker_stats: getContainersForMachine(machine, ts)
            };
            
            data.push(entry);
        }
    }
    
    return data;
}

let dane = generateData("2023-09-10T00:00:00Z", "2023-09-11T00:00:00Z");
// console.log(dane);

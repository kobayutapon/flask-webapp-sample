$(document).ready(function() {
    const deviceId = getParameterByName('device_id');

    function loadDeviceInfo(deviceId) {
        var token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        $.ajax({
            url: `/api/device/${deviceId}`,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(device) {
                console.log("Device details received:", device);

                // Display temperature, humidity, and wind speed
                $("#temperature").text(`Temperature: ${device.temperature}°C`);
                $("#humidity").text(`Humidity: ${device.humidity}%`);
                $("#windSpeed").text(`Wind Speed: ${device.wind_speed} m/s`);

                // Display wind direction using SVG
                const windDirection = device.wind_direction;
                const svg = d3.select("#windDirection");
                svg.selectAll("*").remove();
                svg.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 90).attr("stroke", "black").attr("fill", "none");
                svg.append("line").attr("x1", 100).attr("y1", 100).attr("x2", 100).attr("y2", 20)
                    .attr("stroke", "black").attr("stroke-width", 2)
                    .attr("transform", `rotate(${windDirection}, 100, 100)`);

                // Display map using Leaflet
                const map = L.map('map').setView([device.latitude, device.longitude], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);
                L.marker([device.latitude, device.longitude]).addTo(map)
                    .bindPopup(`${device.name}`).openPopup();

                // Fetch and display 24-hour data using Plotly
                $.ajax({
                    url: `/api/device/${deviceId}/24hour_data`,
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    },
                    success: function(data) {
                        const times = data.map(d => d.time);
                        const temperatures = data.map(d => d.temperature);
                        const humidities = data.map(d => d.humidity);
                        const windSpeeds = data.map(d => d.wind_speed);

                        const tempTrace = {
                            x: times,
                            y: temperatures,
                            type: 'scatter',
                            name: 'Temperature'
                        };

                        const humidityTrace = {
                            x: times,
                            y: humidities,
                            type: 'scatter',
                            name: 'Humidity'
                        };

                        const windSpeedTrace = {
                            x: times,
                            y: windSpeeds,
                            type: 'scatter',
                            name: 'Wind Speed'
                        };

                        const layout = {
                            title: '24-hour Data',
                            xaxis: { title: 'Time' },
                            yaxis: { title: 'Values' }
                        };

                        Plotly.newPlot('graph', [tempTrace, humidityTrace, windSpeedTrace], layout);
                    },
                    error: handleApiError
                });
            },
            error: handleApiError
        });
    }

    loadDeviceInfo(deviceId);
});

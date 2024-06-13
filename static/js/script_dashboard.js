$(document).ready(function() {
    function handleApiError(jqXHR) {
        if (jqXHR.status === 401 || jqXHR.status === 403) {
            window.location.href = '/login';
        } else {
            alert('An error occurred: ' + jqXHR.status);
            console.error(jqXHR.responseText);
        }
    }

    function loadDeviceInfo() {
        var token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        $.ajax({
            url: "/api/devices",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(devices) {
                console.log("Devices received:", devices);
                $("#deviceInfo").empty();
                devices.forEach(device => {
                    const deviceCard = `
                        <div class="card mt-2">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                ${device.name} (${device.id})
                                <div class="dropdown">
                                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton${device.id}" data-bs-toggle="dropdown" aria-expanded="false">
                                        &#9776;
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton${device.id}">
                                        <li><a class="dropdown-item" href="/device_details?device_id=${device.id}">詳細</a></li>
                                        <li><a class="dropdown-item" href="/device_settings?device_id=${device.id}">設定</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="card-body">
                                <p>Type: ${device.type}</p>
                                <p>Location: ${device.location}</p>
                            </div>
                        </div>
                    `;
                    $("#deviceInfo").append(deviceCard);
                });
            },
            error: handleApiError
        });
    }

    loadDeviceInfo();
});

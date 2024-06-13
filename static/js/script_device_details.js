$(document).ready(function() {
    const deviceId = getParameterByName('device_id');

    function loadDeviceDetails(deviceId) {
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

                // Display device details
                $("#deviceDetails").html(`
                    <div class="card">
                        <div class="card-header">
                            ${device.name} (${device.id})
                            <div class="dropdown float-end">
                                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                    &#9776;
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                                    <li><a class="dropdown-item" href="/device_details?device_id=${device.id}">詳細</a></li>
                                    <li><a class="dropdown-item" href="/device_settings?device_id=${device.id}">設定</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="card-body">
                            <p><strong>Type:</strong> ${device.type}</p>
                            <p><strong>Location:</strong> ${device.location}</p>
                            <button class="btn btn-danger" onclick="confirmRemoveDevice('${device.id}')">Remove Device</button>
                        </div>
                    </div>
                `);
            },
            error: handleApiError
        });
    }

    loadDeviceDetails(deviceId);
});

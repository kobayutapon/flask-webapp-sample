$(document).ready(function() {
    function loadDeviceInfoForSettings() {
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
                console.log("Devices received for settings:", devices);
                $("#deviceSelect").empty();
                devices.forEach(device => {
                    const deviceOption = `<option value="${device.id}">${device.name}</option>`;
                    $("#deviceSelect").append(deviceOption);
                });

                const deviceId = getParameterByName('device_id');
                if (deviceId) {
                    $("#deviceSelect").val(deviceId);
                    loadDeviceDetails(deviceId);
                } else if (devices.length > 0) {
                    loadDeviceDetails(devices[0].id);
                }
            },
            error: handleApiError
        });
    }

    $("#deviceSelect").change(function() {
        const selectedDeviceId = $(this).val();
        loadDeviceDetails(selectedDeviceId);
    });

    loadDeviceInfoForSettings();
});

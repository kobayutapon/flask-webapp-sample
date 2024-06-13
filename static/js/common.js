function handleApiError(jqXHR) {
    if (jqXHR.status === 401 || jqXHR.status === 403) {
        window.location.href = '/login';
    } else {
        alert('An error occurred: ' + jqXHR.status);
        console.error(jqXHR.responseText);
    }
}

function getParameterByName(name) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    return params.get(name);
}

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
            $("#deviceCardHeader").text(`${device.name} (${device.id})`);
            $("#deviceType").text(`Type: ${device.type}`);
            $("#deviceLocation").text(`Location: ${device.location}`);
            $("#removeDeviceButton").attr("onclick", `confirmRemoveDevice('${device.id}')`);
            $("#deviceCard").show();
        },
        error: handleApiError
    });
}

window.confirmRemoveDevice = function(deviceId) {
    if (confirm("Are you sure you want to remove this device?")) {
        removeDevice(deviceId);
    }
};

window.removeDevice = function(deviceId) {
    var token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    $.ajax({
        url: `/api/device/${deviceId}`,
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function() {
            alert("Device removed successfully");
            loadDeviceInfo();
            $("#deviceCard").hide();
        },
        error: handleApiError
    });
};

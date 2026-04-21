const ws = new WebSocket("ws://localhost:8080/ws");

window.lastTelemetryData = null;

ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    window.lastTelemetryData = data;

    renderTable(data);
    drawOrientation(data.roll, data.pitch, data.yaw);
    updateMap(data.latitude, data.longitude);
    updateTempChart(data);
};

function timeLocaleForUi() {
    return currentLang === "ru" ? "ru-RU" : "en-GB";
}

function updateTempChart(telemetry) {
    const timeLabel = new Date().toLocaleTimeString(timeLocaleForUi(), {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    tempChart.data.labels.push(timeLabel);
    tempChart.data.datasets[0].data.push(telemetry.temp_avg);
    tempChart.data.datasets[1].data.push(telemetry.temp_sun);
    tempChart.data.datasets[2].data.push(telemetry.temp_shadow);

    const maxPoints = 50;
    if (tempChart.data.labels.length > maxPoints) {
        tempChart.data.labels.shift();
        tempChart.data.datasets.forEach((ds) => ds.data.shift());
    }

    tempChart.update();
}

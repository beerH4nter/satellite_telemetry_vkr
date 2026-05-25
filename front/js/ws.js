const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${wsProtocol}//${location.host}/ws`);

window.lastTelemetryEnvelope = null;
window.lastTelemetryData = null;

ws.onmessage = (e) => {
    const envelope = JSON.parse(e.data);
    window.lastTelemetryEnvelope = envelope;
    const { simple, full } = normalizeTelemetryFrame(envelope);
    window.lastTelemetryData = simple || full;

    if (getActiveTab().startsWith("live")) {
        applyLiveTelemetry(envelope);
    }
};

function timeLocaleForUi() {
    return currentLang === "ru" ? "ru-RU" : "en-GB";
}

function pushChartPoint(chart, telemetry) {
    if (!chart) return;
    const timeLabel = new Date().toLocaleTimeString(timeLocaleForUi(), {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    chart.data.labels.push(timeLabel);
    chart.data.datasets[0].data.push(telemetry.temp_avg);
    chart.data.datasets[1].data.push(telemetry.temp_sun);
    chart.data.datasets[2].data.push(telemetry.temp_shadow);

    const maxPoints = 50;
    if (chart.data.labels.length > maxPoints) {
        chart.data.labels.shift();
        chart.data.datasets.forEach((ds) => ds.data.shift());
    }
    chart.update();
}

function updateTempChart(telemetry) {
    pushChartPoint(window.tempChart, telemetry);
}

window.updateTempChart = updateTempChart;

/** REST-резерв для инженерного режима (доп. API). */
let fullPollTimer = null;

async function pollFullTelemetry() {
    try {
        const res = await fetch("/api/telemetry/full/latest");
        if (!res.ok) return;
        const full = await res.json();
        if (getActiveTab() !== "live-advanced") return;
        renderAdvancedTable(document.getElementById("advanced-telemetry"), full);
        drawOrientationAdvanced(full.roll, full.pitch, full.yaw);
        updateMapAdvanced(full.latitude, full.longitude);
        updatePowerChart(full);
    } catch (_) {
        /* сервер недоступен */
    }
}

window.pollFullTelemetry = pollFullTelemetry;

document.addEventListener("DOMContentLoaded", () => {
    fullPollTimer = setInterval(() => {
        if (getActiveTab() === "live-advanced") pollFullTelemetry();
    }, 5000);
});

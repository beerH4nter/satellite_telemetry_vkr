const ADVANCED_GROUPS = [
    {
        id: "service",
        titleKey: "groupService",
        keys: ["onboard_time", "packet_counter", "frame_type", "mode", "crc_ok", "uptime", "command_count", "status_flags"],
    },
    {
        id: "orbit",
        titleKey: "groupOrbit",
        keys: ["velocity", "latitude", "longitude", "altitude", "roll", "pitch", "yaw"],
    },
    {
        id: "thermal",
        titleKey: "groupThermal",
        keys: ["temp_avg", "temp_sun", "temp_shadow", "cpu_temp"],
    },
    {
        id: "power",
        titleKey: "groupPower",
        keys: ["battery_voltage", "battery_current", "battery_soc", "solar_current", "solar_voltage"],
    },
    {
        id: "adcs",
        titleKey: "groupAdcs",
        keys: ["gyro_x", "gyro_y", "gyro_z", "mag_x", "mag_y", "mag_z", "accel_x", "accel_y", "accel_z"],
    },
    {
        id: "comm",
        titleKey: "groupComm",
        keys: ["radio_rssi", "radio_tx_power"],
    },
];

function renderAdvancedTable(container, data) {
    if (!container || !data) return;
    const L = LANG[currentLang];
    data = typeof coerceTelemetryNumbers === "function" ? coerceTelemetryNumbers(data) : data;
    const labels = L.advancedLabels || {};
    let html = "";

    for (const group of ADVANCED_GROUPS) {
        const rows = group.keys.filter((k) => k in data);
        if (rows.length === 0) continue;
        const title = L[group.titleKey] || group.titleKey;
        html += `<div class="param-group"><h4 class="param-group-title">${title}</h4><table class="param-group-table">`;
        html += `<tr><th>${L.tableParam}</th><th>${L.tableValue}</th></tr>`;
        for (const key of rows) {
            const label = labels[key] || key;
            const val = formatTelemetryValue(data[key]);
            html += `<tr><td>${label}</td><td>${val}</td></tr>`;
        }
        html += "</table></div>";
    }
    container.innerHTML = html || `<p class="muted">${L.noData}</p>`;
}

window.renderAdvancedTable = renderAdvancedTable;

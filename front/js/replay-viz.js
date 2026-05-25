(function () {
    const table = document.getElementById("telemetry-replay");
    window.renderTableReplay = function (data) {
        if (!table || !data) return;
        const L = LANG[currentLang];
        const rowData = coerceTelemetryNumbers(data);
        table.innerHTML = `<tr><th>${L.tableParam}</th><th>${L.tableValue}</th></tr>`;
        for (const key in L.labels) {
            if (!(key in rowData)) continue;
            const row = document.createElement("tr");
            row.innerHTML = `<td>${L.labels[key]}</td><td>${formatTelemetryValue(rowData[key])}</td>`;
            table.appendChild(row);
        }
    };

    const canvas = document.getElementById("canvas-replay");
    const ctx = canvas?.getContext("2d");
    const rollEl = document.getElementById("roll-replay");
    const pitchEl = document.getElementById("pitch-replay");
    const yawEl = document.getElementById("yaw-replay");

    window.drawOrientationReplay = function (roll, pitch, yaw) {
        if (!ctx) return;
        const r = Number(roll) || 0;
        const p = Number(pitch) || 0;
        const y = Number(yaw) || 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((r * Math.PI) / 180);
        ctx.fillStyle = "#5d8a7a";
        ctx.fillRect(-50, -20, 100, 40);
        ctx.restore();
        [rollEl, pitchEl, yawEl].forEach((el, i) => {
            const v = [r, p, y][i];
            if (el) el.textContent = `${v.toFixed(1)}°`;
        });
    };

    const mapEl = document.getElementById("map-replay");
    let mapR = null;
    let marker = null;
    let path = [];
    const srcId = "orbit-replay";
    const layerId = "line-replay";

    if (mapEl) {
        const styles = {
            light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
            dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        };

        mapR = new maplibregl.Map({
            container: "map-replay",
            style: document.documentElement.dataset.theme === "dark" ? styles.dark : styles.light,
            center: [0, 0],
            zoom: 2,
        });
        marker = new maplibregl.Marker().setLngLat([0, 0]).addTo(mapR);

        function ensureMapSource() {
            if (!mapR.getSource(srcId)) {
                mapR.addSource(srcId, {
                    type: "geojson",
                    data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } },
                });
            }
            if (!mapR.getLayer(layerId)) {
                mapR.addLayer({
                    id: layerId,
                    type: "line",
                    source: srcId,
                    paint: { "line-color": "#5d8a7a", "line-width": 3 },
                });
            }
        }

        mapR.on("load", ensureMapSource);
        mapR.on("style.load", () => {
            ensureMapSource();
            setReplayMapPath(path);
        });

        document.getElementById("center-btn-replay")?.addEventListener("click", () => {
            if (path.length) mapR.easeTo({ center: path[path.length - 1], duration: 600 });
        });

        function setReplayMapPath(coords) {
            path = coords;
            if (!mapR.loaded()) return;
            ensureMapSource();
            const src = mapR.getSource(srcId);
            if (src) {
                src.setData({
                    type: "Feature",
                    geometry: { type: "LineString", coordinates: path },
                });
            }
            if (path.length) marker.setLngLat(path[path.length - 1]);
        }

        window.setReplayMapPath = setReplayMapPath;

        window.clearReplayMap = function () {
            setReplayMapPath([]);
        };
    }

    const tempCanvas = document.getElementById("tempChart-replay");
    const powerCanvas = document.getElementById("powerChart-replay");
    let tempChartR = null;
    let powerChartR = null;

    function replayChartLabels() {
        const L = LANG[currentLang];
        return {
            temp: [L.chartSeries.avg, L.chartSeries.sun, L.chartSeries.shadow],
            power: [L.powerChartSeries.voltage, L.powerChartSeries.soc],
        };
    }

    function applyReplayChartLabels() {
        const lbl = replayChartLabels();
        if (tempChartR) {
            tempChartR.data.datasets[0].label = lbl.temp[0];
            tempChartR.data.datasets[1].label = lbl.temp[1];
            tempChartR.data.datasets[2].label = lbl.temp[2];
            tempChartR.update("none");
        }
        if (powerChartR) {
            powerChartR.data.datasets[0].label = lbl.power[0];
            powerChartR.data.datasets[1].label = lbl.power[1];
            powerChartR.update("none");
        }
    }

    if (tempCanvas) {
        const t0 = replayChartLabels().temp;
        tempChartR = new Chart(tempCanvas.getContext("2d"), {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    { label: t0[0], data: [], borderColor: "#5d8a7a", pointRadius: 0, borderWidth: 2 },
                    { label: t0[1], data: [], borderColor: "#c17f6a", pointRadius: 0, borderWidth: 2 },
                    { label: t0[2], data: [], borderColor: "#6b8cae", pointRadius: 0, borderWidth: 2 },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { display: true } },
            },
        });
    }

    if (powerCanvas) {
        const p0 = replayChartLabels().power;
        powerChartR = new Chart(powerCanvas.getContext("2d"), {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    { label: p0[0], data: [], borderColor: "#8a7a5d", pointRadius: 0, borderWidth: 2, yAxisID: "y" },
                    { label: p0[1], data: [], borderColor: "#5d8a7a", pointRadius: 0, borderWidth: 2, yAxisID: "y1" },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: { y1: { position: "right", min: 0, max: 100 } },
            },
        });
    }

    function setChartSeries(chart, labels, seriesArrays) {
        if (!chart) return;
        chart.data.labels = labels;
        seriesArrays.forEach((arr, i) => {
            if (chart.data.datasets[i]) chart.data.datasets[i].data = arr;
        });
        chart.update("none");
    }

    window.syncReplayChartsToIndex = function (frames, upToIndex, viewMode) {
        const labels = [];
        const tAvg = [];
        const tSun = [];
        const tShadow = [];
        const battV = [];
        const battSoc = [];

        for (let i = 0; i <= upToIndex && i < frames.length; i++) {
            const d = getFrameData(frames[i], viewMode);
            if (!d) continue;
            labels.push(String(i + 1));
            tAvg.push(Number(d.temp_avg));
            tSun.push(Number(d.temp_sun));
            tShadow.push(Number(d.temp_shadow));
            if (d.battery_voltage != null) {
                battV.push(Number(d.battery_voltage));
                battSoc.push(Number(d.battery_soc));
            }
        }

        setChartSeries(tempChartR, labels, [tAvg, tSun, tShadow]);
        if (viewMode === "advanced" && battV.length) {
            setChartSeries(powerChartR, labels, [battV, battSoc]);
        } else if (viewMode !== "advanced") {
            setChartSeries(powerChartR, [], [[], []]);
        }
    };

    window.resetReplayCharts = function () {
        setChartSeries(tempChartR, [], [[], [], []]);
        setChartSeries(powerChartR, [], [[], []]);
    };

    window.updateReplayChartsLocale = applyReplayChartLabels;
    applyReplayChartLabels();
})();

function getFrameData(frame, viewMode) {
    const { simple, full } = frame.envelope;
    if (viewMode === "advanced") {
        return coerceTelemetryNumbers(full || extractSimpleFromFull(simple || {}));
    }
    return coerceTelemetryNumbers(simple || extractSimpleFromFull(full || {}));
}

window.buildReplayMapPath = function (frames, upToIndex, viewMode) {
    const coords = [];
    for (let i = 0; i <= upToIndex && i < frames.length; i++) {
        const d = getFrameData(frames[i], viewMode);
        if (d && d.latitude != null && d.longitude != null) {
            coords.push([Number(d.longitude), Number(d.latitude)]);
        }
    }
    return coords;
};

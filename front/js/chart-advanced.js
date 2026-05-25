(function () {
    const tempEl = document.getElementById("tempChart-advanced");
    const powerEl = document.getElementById("powerChart-advanced");
    if (!tempEl || !powerEl) return;

    function palette() {
        const dark = document.documentElement.dataset.theme === "dark";
        return dark
            ? { legend: "#c5cad3", ticks: "#aeb6c4", grid: "rgba(255,255,255,0.07)" }
            : { legend: "#5c6578", ticks: "#5c6578", grid: "rgba(28,35,51,0.06)" };
    }

    function baseOptions() {
        const c = palette();
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: { ticks: { color: c.ticks, maxTicksLimit: 8 }, grid: { color: c.grid } },
                y: { ticks: { color: c.ticks }, grid: { color: c.grid } },
            },
            plugins: { legend: { labels: { color: c.legend, font: { size: 11 } } } },
        };
    }

    window.tempChartAdvanced = new Chart(tempEl.getContext("2d"), {
        type: "line",
        data: {
            labels: [],
            datasets: [
                { label: "T avg", data: [], borderColor: "#5d8a7a", tension: 0.35, pointRadius: 0, borderWidth: 2 },
                { label: "T sun", data: [], borderColor: "#c17f6a", tension: 0.35, pointRadius: 0, borderWidth: 2 },
                { label: "T shadow", data: [], borderColor: "#6b8cae", tension: 0.35, pointRadius: 0, borderWidth: 2 },
            ],
        },
        options: baseOptions(),
    });

    window.powerChart = new Chart(powerEl.getContext("2d"), {
        type: "line",
        data: {
            labels: [],
            datasets: [
                { label: "Battery V", data: [], borderColor: "#8a7a5d", tension: 0.35, pointRadius: 0, borderWidth: 2, yAxisID: "y" },
                { label: "SOC %", data: [], borderColor: "#5d8a7a", tension: 0.35, pointRadius: 0, borderWidth: 2, yAxisID: "y1" },
            ],
        },
        options: {
            ...baseOptions(),
            scales: {
                x: baseOptions().scales.x,
                y: { position: "left", ticks: { color: palette().ticks }, grid: { color: palette().grid } },
                y1: {
                    position: "right",
                    min: 0,
                    max: 100,
                    ticks: { color: palette().ticks },
                    grid: { drawOnChartArea: false },
                },
            },
        },
    });

    window.updateTempChartAdvanced = function (t) {
        pushAdvChart(window.tempChartAdvanced, [
            t.temp_avg,
            t.temp_sun,
            t.temp_shadow,
        ]);
    };

    window.updatePowerChart = function (t) {
        pushAdvChart(window.powerChart, [t.battery_voltage, t.battery_soc], 40);
    };

    function pushAdvChart(chart, values, maxPoints = 50) {
        const locale = currentLang === "ru" ? "ru-RU" : "en-GB";
        chart.data.labels.push(
            new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
        values.forEach((v, i) => chart.data.datasets[i].data.push(v));
        if (chart.data.labels.length > maxPoints) {
            chart.data.labels.shift();
            chart.data.datasets.forEach((ds) => ds.data.shift());
        }
        chart.update();
    }

    window.updateAdvancedChartsLocale = function () {
        const s = LANG[currentLang].chartSeries;
        const p = LANG[currentLang].powerChartSeries;
        window.tempChartAdvanced.data.datasets[0].label = s.avg;
        window.tempChartAdvanced.data.datasets[1].label = s.sun;
        window.tempChartAdvanced.data.datasets[2].label = s.shadow;
        window.powerChart.data.datasets[0].label = p.voltage;
        window.powerChart.data.datasets[1].label = p.soc;
        window.tempChartAdvanced.update("none");
        window.powerChart.update("none");
    };
})();

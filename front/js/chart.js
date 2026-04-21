const tempCtx = document.getElementById("tempChart").getContext("2d");

function chartPalette() {
    const dark = document.documentElement.dataset.theme === "dark";
    return dark
        ? {
              legend: "#c5cad3",
              ticks: "#aeb6c4",
              grid: "rgba(255, 255, 255, 0.07)",
          }
        : {
              legend: "#5c6578",
              ticks: "#5c6578",
              grid: "rgba(28, 35, 51, 0.06)",
          };
}

window.tempChart = new Chart(tempCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: LANG.ru.chartSeries.avg,
                data: [],
                borderColor: "#5d8a7a",
                tension: 0.35,
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: LANG.ru.chartSeries.sun,
                data: [],
                borderColor: "#c17f6a",
                tension: 0.35,
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
            },
            {
                label: LANG.ru.chartSeries.shadow,
                data: [],
                borderColor: "#6b8cae",
                tension: 0.35,
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { intersect: false, mode: "index" },
        scales: {
            x: {
                ticks: { color: chartPalette().ticks, maxTicksLimit: 8 },
                grid: { color: chartPalette().grid },
            },
            y: {
                ticks: { color: chartPalette().ticks },
                grid: { color: chartPalette().grid },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: chartPalette().legend,
                    boxWidth: 12,
                    padding: 16,
                    font: { size: 12 },
                },
            },
        },
    },
});

window.updateChartTheme = function updateChartTheme() {
    const c = chartPalette();
    window.tempChart.options.scales.x.ticks.color = c.ticks;
    window.tempChart.options.scales.y.ticks.color = c.ticks;
    window.tempChart.options.scales.x.grid.color = c.grid;
    window.tempChart.options.scales.y.grid.color = c.grid;
    window.tempChart.options.plugins.legend.labels.color = c.legend;
    window.tempChart.update("none");
};

window.updateChartLocale = function updateChartLocale() {
    const s = LANG[currentLang].chartSeries;
    window.tempChart.data.datasets[0].label = s.avg;
    window.tempChart.data.datasets[1].label = s.sun;
    window.tempChart.data.datasets[2].label = s.shadow;

    const c = chartPalette();
    window.tempChart.options.scales.x.ticks.color = c.ticks;
    window.tempChart.options.scales.y.ticks.color = c.ticks;
    window.tempChart.options.scales.x.grid.color = c.grid;
    window.tempChart.options.scales.y.grid.color = c.grid;
    window.tempChart.options.plugins.legend.labels.color = c.legend;

    window.tempChart.update("none");
};

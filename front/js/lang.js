const LANG = {
    ru: {
        title: "Телеметрия спутника",
        tagline: "Мониторинг параметров в реальном времени",
        btnPdf: "Скачать PDF",
        btnCsv: "Скачать CSV",
        themeSwitchDark: "Тёмная тема",
        themeSwitchLight: "Светлая тема",
        orient: "Ориентация аппарата",
        tableParam: "Параметр",
        tableValue: "Значение",
        labels: {
            onboard_time: "Бортовое время, с",
            velocity: "Скорость, км/с",
            roll: "Крен, °",
            pitch: "Тангаж, °",
            yaw: "Рысканье, °",
            temp_avg: "Средняя температура, °C",
            temp_sun: "Температура освещённой стороны, °C",
            temp_shadow: "Температура неосвещённой стороны, °C",
            latitude: "Широта",
            longitude: "Долгота",
            altitude: "Высота, км",
        },
        chartSeries: {
            avg: "Средняя",
            sun: "Освещённая сторона",
            shadow: "Теневая сторона",
        },
    },
    en: {
        title: "Satellite Telemetry",
        tagline: "Real-time parameter monitoring",
        btnPdf: "Download PDF",
        btnCsv: "Download CSV",
        themeSwitchDark: "Dark theme",
        themeSwitchLight: "Light theme",
        orient: "Spacecraft Orientation",
        tableParam: "Parameter",
        tableValue: "Value",
        labels: {
            onboard_time: "Onboard time, s",
            velocity: "Velocity, km/s",
            roll: "Roll, °",
            pitch: "Pitch, °",
            yaw: "Yaw, °",
            temp_avg: "Average temperature, °C",
            temp_sun: "Sun side temperature, °C",
            temp_shadow: "Shadow side temperature, °C",
            latitude: "Latitude",
            longitude: "Longitude",
            altitude: "Altitude, km",
        },
        chartSeries: {
            avg: "Average",
            sun: "Sunlit side",
            shadow: "Shadow side",
        },
    },
};

let currentLang = "ru";

function applyLang() {
    const L = LANG[currentLang];
    document.documentElement.lang = currentLang === "ru" ? "ru" : "en";
    document.title = L.title;

    document.getElementById("title").textContent = L.title;
    const tag = document.getElementById("tagline");
    if (tag) tag.textContent = L.tagline;
    document.getElementById("orient_title").textContent = L.orient;
    document.getElementById("btn-pdf").textContent = L.btnPdf;
    document.getElementById("btn-csv").textContent = L.btnCsv;

    const logo = document.getElementById("logo");
    if (logo) logo.alt = L.title;

    if (typeof window.updateChartLocale === "function") {
        window.updateChartLocale();
    }

    if (window.lastTelemetryData && typeof window.renderTable === "function") {
        window.renderTable(window.lastTelemetryData);
    }

    if (typeof window.updateThemeButtonLabel === "function") {
        window.updateThemeButtonLabel();
    }
}

document.getElementById("lang").onchange = (e) => {
    currentLang = e.target.value;
    applyLang();
};

document.addEventListener("DOMContentLoaded", () => {
    applyLang();
});

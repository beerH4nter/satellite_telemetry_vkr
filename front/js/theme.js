(function applyStoredTheme() {
    try {
        if (localStorage.getItem("telemetry-theme") === "dark") {
            document.documentElement.dataset.theme = "dark";
        }
    } catch (_) {}
})();

function telemetryThemeIsDark() {
    return document.documentElement.dataset.theme === "dark";
}

function updateThemeButtonLabel() {
    const btn = document.getElementById("btn-theme");
    if (!btn || typeof LANG === "undefined" || typeof currentLang === "undefined") return;
    const L = LANG[currentLang];
    btn.textContent = telemetryThemeIsDark() ? L.themeSwitchLight : L.themeSwitchDark;
    btn.setAttribute("aria-pressed", telemetryThemeIsDark() ? "true" : "false");
}

window.updateThemeButtonLabel = updateThemeButtonLabel;

function toggleTelemetryTheme() {
    if (telemetryThemeIsDark()) {
        document.documentElement.removeAttribute("data-theme");
        try {
            localStorage.setItem("telemetry-theme", "light");
        } catch (_) {}
    } else {
        document.documentElement.dataset.theme = "dark";
        try {
            localStorage.setItem("telemetry-theme", "dark");
        } catch (_) {}
    }

    updateThemeButtonLabel();

    if (typeof window.updateChartTheme === "function") {
        window.updateChartTheme();
    }
    if (typeof window.setTelemetryMapTheme === "function") {
        window.setTelemetryMapTheme(telemetryThemeIsDark());
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-theme");
    if (btn) {
        btn.addEventListener("click", toggleTelemetryTheme);
    }
    updateThemeButtonLabel();
});

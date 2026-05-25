const TAB_IDS = ["live-simple", "live-advanced", "replay"];

function getActiveTab() {
    return document.querySelector(".main-nav .nav-btn.active")?.dataset.tab || "live-simple";
}

function setActiveTab(tabId) {
    TAB_IDS.forEach((id) => {
        const panel = document.getElementById(`panel-${id}`);
        const btn = document.querySelector(`.main-nav .nav-btn[data-tab="${id}"]`);
        if (!panel || !btn) return;
        const on = id === tabId;
        panel.classList.toggle("hidden", !on);
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    if (tabId === "live-advanced" && typeof window.pollFullTelemetry === "function") {
        window.pollFullTelemetry();
    }
    if (tabId === "replay" && typeof window.onReplayTabShown === "function") {
        window.onReplayTabShown();
    } else if (typeof window.onReplayTabHidden === "function") {
        window.onReplayTabHidden();
    }

    if (window.lastTelemetryEnvelope && tabId.startsWith("live")) {
        applyLiveTelemetry(window.lastTelemetryEnvelope);
    }
}

function applyLiveTelemetry(envelope) {
    const { simple, full } = normalizeTelemetryFrame(envelope);
    const tab = getActiveTab();

    if (tab === "live-simple" && simple) {
        renderTable(simple);
        drawOrientation(simple.roll, simple.pitch, simple.yaw);
        updateMap(simple.latitude, simple.longitude);
        updateTempChart(simple);
    }

    if (tab === "live-advanced" && full) {
        const adv = document.getElementById("advanced-telemetry");
        renderAdvancedTable(adv, full);
        drawOrientationAdvanced(full.roll, full.pitch, full.yaw);
        updateMapAdvanced(full.latitude, full.longitude);
        updateTempChartAdvanced(full);
        updatePowerChart(full);
    }
}

document.querySelectorAll(".main-nav .nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
});

window.applyLiveTelemetry = applyLiveTelemetry;
window.getActiveTab = getActiveTab;

document.addEventListener("DOMContentLoaded", () => {
    setActiveTab("live-simple");
});

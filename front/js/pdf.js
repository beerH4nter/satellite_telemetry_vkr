function downloadPDF() {
    window.open("/api/telemetry/pdf", "_blank");
}

function downloadCSV() {
    window.open("/api/telemetry/csv", "_blank");
}

function downloadCSVFull() {
    window.open("/api/telemetry/csv/full", "_blank");
}

function downloadSessionsJSON() {
    window.open("/api/telemetry/sessions/export", "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-pdf")?.addEventListener("click", downloadPDF);
    document.getElementById("btn-csv")?.addEventListener("click", downloadCSV);
    document.getElementById("btn-csv-full")?.addEventListener("click", downloadCSVFull);
    document.getElementById("btn-json")?.addEventListener("click", downloadSessionsJSON);
});

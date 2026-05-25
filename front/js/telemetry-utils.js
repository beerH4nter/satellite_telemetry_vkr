/** Извлекает simple/full из кадра WebSocket, JSON сеанса или REST. */
function normalizeTelemetryFrame(raw) {
    if (!raw) return { simple: null, full: null };
    if (raw.simple && raw.full) {
        return { simple: raw.simple, full: raw.full };
    }
    if (raw.onboard_time_unix !== undefined && raw.full) {
        return { simple: raw.simple, full: raw.full };
    }
    const keys = Object.keys(raw);
    const isFull = keys.includes("packet_counter") || keys.includes("battery_soc");
    if (isFull) {
        return { simple: extractSimpleFromFull(raw), full: raw };
    }
    return { simple: raw, full: null };
}

function extractSimpleFromFull(full) {
    const simpleKeys = [
        "onboard_time",
        "velocity",
        "roll",
        "pitch",
        "yaw",
        "temp_avg",
        "temp_sun",
        "temp_shadow",
        "latitude",
        "longitude",
        "altitude",
    ];
    const out = {};
    for (const k of simpleKeys) {
        if (k in full) out[k] = full[k];
    }
    return out;
}

function formatValue(v) {
    if (typeof v === "number") return v.toFixed(2);
    if (typeof v === "boolean") return v ? "1" : "0";
    return String(v);
}

/** Приводит числовые поля к number (JSON иногда отдаёт строки). */
function coerceTelemetryNumbers(data) {
    if (!data || typeof data !== "object") return data;
    const out = { ...data };
    for (const key of Object.keys(out)) {
        if (key === "onboard_time") continue;
        const v = out[key];
        if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) {
            out[key] = Number(v);
        }
    }
    return out;
}

window.normalizeTelemetryFrame = normalizeTelemetryFrame;
window.extractSimpleFromFull = extractSimpleFromFull;
window.coerceTelemetryNumbers = coerceTelemetryNumbers;
window.formatTelemetryValue = formatValue;

const replayState = {
    session: null,
    frames: [],
    index: 0,
    playing: false,
    speed: 1,
    timer: null,
    viewMode: "simple",
};

function parseSessionJSON(text) {
    const data = JSON.parse(text);
    let frames = [];
    let meta = {};

    if (Array.isArray(data.frames)) {
        frames = data.frames;
        meta = data;
    } else if (Array.isArray(data) && data[0]?.frames) {
        meta = data[0];
        frames = data[0].frames;
    } else {
        throw new Error("Invalid session JSON");
    }

    if (!frames.length) throw new Error("No frames");

    return {
        meta,
        frames: frames.map((f, i) => {
            let envelope;
            if (f.simple != null || f.full != null) {
                envelope = {
                    simple: f.simple ? coerceTelemetryNumbers(f.simple) : null,
                    full: f.full ? coerceTelemetryNumbers(f.full) : null,
                };
            } else {
                envelope = normalizeTelemetryFrame(f);
                if (envelope.simple) envelope.simple = coerceTelemetryNumbers(envelope.simple);
                if (envelope.full) envelope.full = coerceTelemetryNumbers(envelope.full);
            }
            if (!envelope.simple && envelope.full) {
                envelope.simple = extractSimpleFromFull(envelope.full);
            }
            if (!envelope.full && envelope.simple) {
                envelope.full = coerceTelemetryNumbers({ ...envelope.simple });
            }
            return {
                onboardUnix: f.onboard_time_unix ?? f.onboardTimeUnix ?? i,
                envelope,
            };
        }),
    };
}

function getReplayFrameData(frame) {
    const { simple, full } = frame.envelope;
    if (replayState.viewMode === "advanced") {
        return coerceTelemetryNumbers(full || extractSimpleFromFull(simple || {}));
    }
    return coerceTelemetryNumbers(simple || extractSimpleFromFull(full || {}));
}

function replayDurationSec() {
    if (replayState.frames.length < 2) return 0;
    const a = replayState.frames[0].onboardUnix;
    const b = replayState.frames[replayState.frames.length - 1].onboardUnix;
    return Math.max(0, b - a);
}

function updateReplayUI() {
    const slider = document.getElementById("replay-seek");
    const timeLbl = document.getElementById("replay-time-label");
    const info = document.getElementById("replay-session-info");
    if (!slider) return;

    const max = Math.max(0, replayState.frames.length - 1);
    slider.max = String(max);
    slider.value = String(replayState.index);

    const cur = replayState.frames[replayState.index];
    const t0 = replayState.frames[0]?.onboardUnix || 0;
    const elapsed = cur ? cur.onboardUnix - t0 : 0;
    const total = replayDurationSec();
    timeLbl.textContent = `${elapsed.toFixed(1)} / ${total.toFixed(1)} s · кадр ${replayState.index + 1}/${replayState.frames.length}`;

    if (replayState.session?.meta) {
        const m = replayState.session.meta;
        info.textContent = `Сеанс №${m.session_id || "—"} · ${m.remote_addr || ""} · ${m.started_at || ""}`;
    }
}

function applyReplayFrame(idx) {
    if (!replayState.frames.length) return;

    replayState.index = Math.max(0, Math.min(idx, replayState.frames.length - 1));
    const frame = replayState.frames[replayState.index];
    const data = getReplayFrameData(frame);
    if (!data) return;

    const mode = replayState.viewMode;

    if (mode === "simple") {
        renderTableReplay(data);
    } else {
        renderAdvancedTable(document.getElementById("replay-advanced-telemetry"), data);
    }

    drawOrientationReplay(data.roll, data.pitch, data.yaw);

    if (typeof setReplayMapPath === "function") {
        const coords = buildReplayMapPath(replayState.frames, replayState.index, mode);
        setReplayMapPath(coords);
    }

    if (typeof syncReplayChartsToIndex === "function") {
        syncReplayChartsToIndex(replayState.frames, replayState.index, mode);
    }

    updateReplayUI();
}

function scheduleNextFrame() {
    clearTimeout(replayState.timer);
    if (!replayState.playing) return;
    if (replayState.index >= replayState.frames.length - 1) {
        replayState.playing = false;
        document.getElementById("replay-play")?.classList.remove("active");
        return;
    }

    const cur = replayState.frames[replayState.index];
    const next = replayState.frames[replayState.index + 1];
    let delayMs = 500;
    if (cur && next && next.onboardUnix > cur.onboardUnix) {
        delayMs = Math.max(20, ((next.onboardUnix - cur.onboardUnix) * 1000) / replayState.speed);
    } else {
        delayMs = 500 / replayState.speed;
    }

    replayState.timer = setTimeout(() => {
        applyReplayFrame(replayState.index + 1);
        scheduleNextFrame();
    }, delayMs);
}

function replayPlay() {
    if (!replayState.frames.length) return;
    replayState.playing = true;
    document.getElementById("replay-play")?.classList.add("active");
    scheduleNextFrame();
}

function replayPause() {
    replayState.playing = false;
    clearTimeout(replayState.timer);
    document.getElementById("replay-play")?.classList.remove("active");
}

function replayStop() {
    replayPause();
    applyReplayFrame(0);
}

function setReplayViewMode(mode) {
    if (mode !== "simple" && mode !== "advanced") return;
    replayState.viewMode = mode;

    document.querySelectorAll(".replay-view-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.replayView === mode);
    });

    const panelSimple = document.getElementById("replay-panel-simple");
    const panelAdvanced = document.getElementById("replay-panel-advanced");
    const powerWrap = document.getElementById("powerChart-replay")?.closest(".chart-container");

    panelSimple?.classList.toggle("hidden", mode !== "simple");
    panelAdvanced?.classList.toggle("hidden", mode !== "advanced");
    powerWrap?.classList.toggle("hidden", mode !== "advanced");

    if (replayState.frames.length) {
        applyReplayFrame(replayState.index);
    }
}

function clearReplayViz() {
    if (typeof clearReplayMap === "function") clearReplayMap();
    if (typeof resetReplayCharts === "function") resetReplayCharts();
    const tbl = document.getElementById("telemetry-replay");
    if (tbl) tbl.innerHTML = "";
    const adv = document.getElementById("replay-advanced-telemetry");
    if (adv) adv.innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("replay-file");
    const slider = document.getElementById("replay-seek");
    const speedSelect = document.getElementById("replay-speed");

    fileInput?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = parseSessionJSON(text);
            replayState.session = parsed;
            replayState.frames = parsed.frames;
            replayState.index = 0;
            replayPause();
            clearReplayViz();
            setReplayViewMode(replayState.viewMode);
            applyReplayFrame(0);
        } catch (err) {
            alert(LANG[currentLang].replayError + ": " + err.message);
        }
    });

    document.getElementById("replay-play")?.addEventListener("click", () => {
        if (replayState.playing) replayPause();
        else replayPlay();
    });
    document.getElementById("replay-stop")?.addEventListener("click", replayStop);

    slider?.addEventListener("input", () => {
        replayPause();
        applyReplayFrame(parseInt(slider.value, 10));
    });

    speedSelect?.addEventListener("change", () => {
        replayState.speed = parseFloat(speedSelect.value) || 1;
        if (replayState.playing) {
            replayPause();
            replayPlay();
        }
    });

    document.querySelectorAll(".replay-view-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            setReplayViewMode(btn.dataset.replayView);
        });
    });

    setReplayViewMode("simple");
});

window.onReplayTabShown = function () {
    replayPause();
};

window.onReplayTabHidden = function () {
    replayPause();
};

const LANG = {
    ru: {
        title: "Телеметрия спутника",
        tagline: "Мониторинг параметров в реальном времени",
        btnPdf: "Скачать PDF",
        btnCsv: "CSV (учебный)",
        btnCsvFull: "CSV (полный)",
        btnJson: "JSON сеансы",
        themeSwitchDark: "Тёмная тема",
        themeSwitchLight: "Светлая тема",
        tabSimple: "Учебный режим",
        tabAdvanced: "Инженерный режим",
        tabReplay: "Воспроизведение сеанса",
        hintSimple:
            "Упрощённый набор из 11 параметров — для школьников и начинающих. Данные извлекаются из полного кадра на сервере.",
        hintAdvanced:
            "Полный кадр телеметрии (~35 параметров) в духе учебных CubeSat: ОЭС, АДС, магнитометр, КИ. WebSocket + REST /api/telemetry/full/latest.",
        hintReplay:
            "Загрузите JSON сеанса (экспорт с сервера). Управление: воспроизведение, стоп, перемотка, ускорение 0.25×–8×.",
        orient: "Ориентация аппарата",
        orientAdvanced: "Ориентация (полный кадр)",
        orientReplay: "Ориентация",
        replayFile: "Загрузить JSON сеанса",
        replayPlay: "▶ Воспроизвести",
        replayStop: "■ Стоп",
        replaySpeed: "Скорость",
        replayViewSimple: "Учебный вид",
        replayViewAdvanced: "Инженерный вид",
        replayExport: "Скачать JSON с сервера",
        replayError: "Ошибка загрузки сеанса",
        noData: "Нет данных",
        tableParam: "Параметр",
        tableValue: "Значение",
        groupService: "Служебные поля кадра",
        groupOrbit: "Орбита и ориентация",
        groupThermal: "Термоконтроль",
        groupPower: "Электропитание (ОЭС)",
        groupAdcs: "АДС и датчики",
        groupComm: "Канал связи",
        labels: {
            onboard_time: "Бортовое время",
            velocity: "Скорость, км/с",
            roll: "Крен, °",
            pitch: "Тангаж, °",
            yaw: "Рысканье, °",
            temp_avg: "Средняя температура, °C",
            temp_sun: "Температура освещённой стороны, °C",
            temp_shadow: "Температура неосвещённой стороны, °C",
            latitude: "Широта, °",
            longitude: "Долгота, °",
            altitude: "Высота, км",
        },
        advancedLabels: {
            onboard_time: "Бортовое время",
            onboard_time_unix: "Бортовое время (Unix)",
            packet_counter: "Счётчик пакетов",
            frame_type: "Тип кадра TM",
            mode: "Режим КА (0=safe, 1=nom, 2=sci)",
            crc_ok: "CRC OK",
            velocity: "Скорость, км/с",
            roll: "Крен, °",
            pitch: "Тангаж, °",
            yaw: "Рысканье, °",
            temp_avg: "T средняя, °C",
            temp_sun: "T освещённая, °C",
            temp_shadow: "T тень, °C",
            latitude: "Широта, °",
            longitude: "Долгота, °",
            altitude: "Высота, км",
            battery_voltage: "Напряжение АКБ, В",
            battery_current: "Ток АКБ, мА",
            battery_soc: "Заряд АКБ, %",
            solar_current: "Ток СБ, мА",
            solar_voltage: "Напряжение СБ, В",
            gyro_x: "Гироскоп X, °/с",
            gyro_y: "Гироскоп Y, °/с",
            gyro_z: "Гироскоп Z, °/с",
            mag_x: "Магнитометр X, µT",
            mag_y: "Магнитометр Y, µT",
            mag_z: "Магнитометр Z, µT",
            accel_x: "Акселерометр X, м/с²",
            accel_y: "Акселерометр Y, м/с²",
            accel_z: "Акселерометр Z, м/с²",
            cpu_temp: "T процессора OBC, °C",
            radio_rssi: "RSSI приёма, dBm",
            radio_tx_power: "Мощность передатчика, dBm",
            uptime: "Uptime, с",
            command_count: "Принято команд",
            status_flags: "Флаги состояния",
        },
        chartSeries: {
            avg: "Средняя",
            sun: "Освещённая сторона",
            shadow: "Теневая сторона",
        },
        powerChartSeries: {
            voltage: "Напряжение АКБ, В",
            soc: "Заряд АКБ, %",
        },
    },
    en: {
        title: "Satellite Telemetry",
        tagline: "Real-time parameter monitoring",
        btnPdf: "Download PDF",
        btnCsv: "CSV (educational)",
        btnCsvFull: "CSV (full)",
        btnJson: "JSON sessions",
        themeSwitchDark: "Dark theme",
        themeSwitchLight: "Light theme",
        tabSimple: "Educational mode",
        tabAdvanced: "Engineering mode",
        tabReplay: "Session replay",
        hintSimple: "Simplified 11 parameters for students. Extracted from the full frame on the server.",
        hintAdvanced: "Full telemetry frame (~35 params), CubeSat-style. WebSocket + REST /api/telemetry/full/latest.",
        hintReplay: "Upload session JSON (server export). Play, stop, seek, speed 0.25×–8×.",
        orient: "Spacecraft orientation",
        orientAdvanced: "Orientation (full frame)",
        orientReplay: "Orientation",
        replayFile: "Upload session JSON",
        replayPlay: "▶ Play",
        replayStop: "■ Stop",
        replaySpeed: "Speed",
        replayViewSimple: "Educational view",
        replayViewAdvanced: "Engineering view",
        replayExport: "Download JSON from server",
        replayError: "Session load error",
        noData: "No data",
        tableParam: "Parameter",
        tableValue: "Value",
        groupService: "Frame service fields",
        groupOrbit: "Orbit and attitude",
        groupThermal: "Thermal control",
        groupPower: "Electrical power (EPS)",
        groupAdcs: "ADCS and sensors",
        groupComm: "Communications",
        labels: {
            onboard_time: "Onboard time",
            velocity: "Velocity, km/s",
            roll: "Roll, °",
            pitch: "Pitch, °",
            yaw: "Yaw, °",
            temp_avg: "Average temperature, °C",
            temp_sun: "Sun side temperature, °C",
            temp_shadow: "Shadow side temperature, °C",
            latitude: "Latitude, °",
            longitude: "Longitude, °",
            altitude: "Altitude, km",
        },
        advancedLabels: {
            onboard_time: "Onboard time",
            packet_counter: "Packet counter",
            frame_type: "TM frame type",
            mode: "Spacecraft mode",
            crc_ok: "CRC OK",
            velocity: "Velocity, km/s",
            roll: "Roll, °",
            pitch: "Pitch, °",
            yaw: "Yaw, °",
            temp_avg: "T avg, °C",
            temp_sun: "T sun, °C",
            temp_shadow: "T shadow, °C",
            latitude: "Latitude, °",
            longitude: "Longitude, °",
            altitude: "Altitude, km",
            battery_voltage: "Battery voltage, V",
            battery_current: "Battery current, mA",
            battery_soc: "Battery SOC, %",
            solar_current: "Solar current, mA",
            solar_voltage: "Solar voltage, V",
            gyro_x: "Gyro X, °/s",
            gyro_y: "Gyro Y, °/s",
            gyro_z: "Gyro Z, °/s",
            mag_x: "Magnetometer X, µT",
            mag_y: "Magnetometer Y, µT",
            mag_z: "Magnetometer Z, µT",
            accel_x: "Accel X, m/s²",
            accel_y: "Accel Y, m/s²",
            accel_z: "Accel Z, m/s²",
            cpu_temp: "OBC CPU temp, °C",
            radio_rssi: "RX RSSI, dBm",
            radio_tx_power: "TX power, dBm",
            uptime: "Uptime, s",
            command_count: "Commands received",
            status_flags: "Status flags",
        },
        chartSeries: {
            avg: "Average",
            sun: "Sunlit side",
            shadow: "Shadow side",
        },
        powerChartSeries: {
            voltage: "Battery voltage, V",
            soc: "Battery SOC, %",
        },
    },
};

let currentLang = "ru";

function applyLang() {
    const L = LANG[currentLang];
    document.documentElement.lang = currentLang === "ru" ? "ru" : "en";
    document.title = L.title;

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText("title", L.title);
    setText("tagline", L.tagline);
    setText("orient_title", L.orient);
    setText("orient_title_advanced", L.orientAdvanced);
    setText("orient_title_replay", L.orientReplay);
    setText("btn-pdf", L.btnPdf);
    setText("btn-csv", L.btnCsv);
    setText("btn-csv-full", L.btnCsvFull);
    setText("btn-json", L.btnJson);
    setText("tab-btn-simple", L.tabSimple);
    setText("tab-btn-advanced", L.tabAdvanced);
    setText("tab-btn-replay", L.tabReplay);
    setText("hint-simple", L.hintSimple);
    setText("hint-advanced", L.hintAdvanced);
    setText("hint-replay", L.hintReplay);
    setText("replay-file-label", L.replayFile);
    setText("replay-play", L.replayPlay);
    setText("replay-stop", L.replayStop);
    setText("replay-speed-label", L.replaySpeed);
    setText("replay-view-simple", L.replayViewSimple);
    setText("replay-view-advanced", L.replayViewAdvanced);

    const logo = document.getElementById("logo");
    if (logo) logo.alt = L.title;

    if (typeof window.updateChartLocale === "function") window.updateChartLocale();
    if (typeof window.updateAdvancedChartsLocale === "function") window.updateAdvancedChartsLocale();
    if (typeof window.updateReplayChartsLocale === "function") window.updateReplayChartsLocale();

    if (window.lastTelemetryEnvelope && typeof window.applyLiveTelemetry === "function") {
        window.applyLiveTelemetry(window.lastTelemetryEnvelope);
    }

    if (typeof window.updateThemeButtonLabel === "function") window.updateThemeButtonLabel();
}

document.getElementById("lang").onchange = (e) => {
    currentLang = e.target.value;
    applyLang();
};

document.addEventListener("DOMContentLoaded", () => {
    applyLang();
});

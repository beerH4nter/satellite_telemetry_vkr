package api

import (
	"encoding/csv"
	"net/http"
	"strconv"
	"time"

	"back/internal/processor"
	"back/internal/storage"
)

// TelemetryFullCSVHandler — CSV с полным набором параметров.
func TelemetryFullCSVHandler(store *storage.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessions := store.SessionsCopy()
		if len(sessions) == 0 {
			http.Error(w, "Нет данных телеметрии", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "text/csv; charset=utf-8")
		w.Header().Set("Content-Disposition", "attachment; filename=telemetry_full.csv")
		_, _ = w.Write([]byte("\xef\xbb\xbf"))

		cw := csv.NewWriter(w)
		cw.Comma = ','
		_ = cw.Write(fullCSVHeader())

		for _, sess := range sessions {
			startStr := sess.StartedAt.UTC().Format(time.RFC3339Nano)
			endStr := ""
			if sess.EndedAt != nil {
				endStr = sess.EndedAt.UTC().Format(time.RFC3339Nano)
			}
			for i, t := range sess.Readings {
				_ = cw.Write(fullToCSVRow(sess.ID, startStr, endStr, sess.RemoteAddr, i+1, t))
			}
		}
		cw.Flush()
	}
}

func fullCSVHeader() []string {
	return []string{
		"session_id", "session_started_server_utc", "session_ended_server_utc", "remote_addr", "frame_index_in_session",
		"onboard_time_unix", "packet_counter", "frame_type", "mode", "crc_ok",
		"velocity_km_s", "roll_deg", "pitch_deg", "yaw_deg",
		"temp_avg_c", "temp_sun_c", "temp_shadow_c",
		"latitude_deg", "longitude_deg", "altitude_km",
		"battery_voltage_v", "battery_current_ma", "battery_soc_pct",
		"solar_current_ma", "solar_voltage_v",
		"gyro_x_dps", "gyro_y_dps", "gyro_z_dps",
		"mag_x_ut", "mag_y_ut", "mag_z_ut",
		"accel_x_mps2", "accel_y_mps2", "accel_z_mps2",
		"cpu_temp_c", "radio_rssi_dbm", "radio_tx_power_dbm",
		"uptime_s", "command_count", "status_flags",
	}
}

func fullToCSVRow(sessionID uint64, sessionStart, sessionEnd, remote string, frameIdx int, t processor.FullTelemetry) []string {
	return []string{
		strconv.FormatUint(sessionID, 10),
		sessionStart,
		sessionEnd,
		remote,
		strconv.Itoa(frameIdx),
		formatFloat(t.OnboardTime),
		strconv.FormatUint(uint64(t.PacketCounter), 10),
		strconv.Itoa(int(t.FrameType)),
		strconv.Itoa(int(t.Mode)),
		strconv.Itoa(int(t.CrcOk)),
		formatFloat(float64(t.Velocity)),
		formatFloat(float64(t.Roll)),
		formatFloat(float64(t.Pitch)),
		formatFloat(float64(t.Yaw)),
		formatFloat(float64(t.TempAvg)),
		formatFloat(float64(t.TempSun)),
		formatFloat(float64(t.TempShadow)),
		formatFloat(float64(t.Latitude)),
		formatFloat(float64(t.Longitude)),
		formatFloat(float64(t.Altitude)),
		formatFloat(float64(t.BatteryVoltage)),
		formatFloat(float64(t.BatteryCurrent)),
		formatFloat(float64(t.BatterySOC)),
		formatFloat(float64(t.SolarCurrent)),
		formatFloat(float64(t.SolarVoltage)),
		formatFloat(float64(t.GyroX)),
		formatFloat(float64(t.GyroY)),
		formatFloat(float64(t.GyroZ)),
		formatFloat(float64(t.MagX)),
		formatFloat(float64(t.MagY)),
		formatFloat(float64(t.MagZ)),
		formatFloat(float64(t.AccelX)),
		formatFloat(float64(t.AccelY)),
		formatFloat(float64(t.AccelZ)),
		formatFloat(float64(t.CpuTemp)),
		formatFloat(float64(t.RadioRSSI)),
		formatFloat(float64(t.RadioTxPower)),
		strconv.FormatUint(uint64(t.Uptime), 10),
		strconv.FormatUint(uint64(t.CommandCount), 10),
		strconv.FormatUint(uint64(t.StatusFlags), 10),
	}
}

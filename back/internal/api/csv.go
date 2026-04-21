package api

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"back/internal/processor"
	"back/internal/storage"
)

// TelemetryCSVHandler отдаёт UTF-8 CSV: каждая строка — один кадр; сеансы различаются по session_id.
// Разделитель — запятая; для Excel в Windows можно открыть через «Данные → из текста» или UTF-8.
func TelemetryCSVHandler(store *storage.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessions := store.SessionsCopy()
		if len(sessions) == 0 {
			http.Error(w, "Нет данных телеметрии", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "text/csv; charset=utf-8")
		w.Header().Set("Content-Disposition", "attachment; filename=telemetry.csv")

		_, _ = w.Write([]byte("\xef\xbb\xbf"))

		cw := csv.NewWriter(w)
		cw.Comma = ','

		header := []string{
			"session_id",
			"session_started_server_utc",
			"session_ended_server_utc",
			"remote_addr",
			"frame_index_in_session",
			"onboard_time_unix",
			"velocity_km_s",
			"roll_deg",
			"pitch_deg",
			"yaw_deg",
			"temp_avg_c",
			"temp_sun_c",
			"temp_shadow_c",
			"latitude_deg",
			"longitude_deg",
			"altitude_km",
		}
		if err := cw.Write(header); err != nil {
			return
		}

		for _, sess := range sessions {
			startStr := sess.StartedAt.UTC().Format(time.RFC3339Nano)
			endStr := ""
			if sess.EndedAt != nil {
				endStr = sess.EndedAt.UTC().Format(time.RFC3339Nano)
			}
			for i, t := range sess.Readings {
				row := telemetryToCSVRow(sess.ID, startStr, endStr, sess.RemoteAddr, i+1, t)
				if err := cw.Write(row); err != nil {
					return
				}
			}
		}
		cw.Flush()
	}
}

func telemetryToCSVRow(
	sessionID uint64,
	sessionStart, sessionEnd, remote string,
	frameIdx int,
	t processor.Telemetry,
) []string {
	end := sessionEnd
	if end == "" {
		end = ""
	}
	return []string{
		strconv.FormatUint(sessionID, 10),
		sessionStart,
		end,
		remote,
		strconv.Itoa(frameIdx),
		fmt.Sprintf("%.6f", t.OnboardTime),
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
	}
}

func formatFloat(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
}

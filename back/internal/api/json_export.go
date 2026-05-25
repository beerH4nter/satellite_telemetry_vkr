package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"back/internal/processor"
	"back/internal/storage"
)

const sessionJSONVersion = 1

type sessionFrameJSON struct {
	OnboardTimeUnix float64                `json:"onboard_time_unix"`
	Simple          map[string]interface{} `json:"simple"`
	Full            map[string]interface{} `json:"full"`
}

type sessionExportJSON struct {
	Version    int                `json:"version"`
	SessionID  uint64             `json:"session_id"`
	RemoteAddr string             `json:"remote_addr"`
	StartedAt  string             `json:"started_at"`
	EndedAt    string             `json:"ended_at,omitempty"`
	Frames     []sessionFrameJSON `json:"frames"`
}

// TelemetrySessionsExportHandler — JSON сеансов для архива и режима воспроизведения.
// GET /api/telemetry/sessions/export — все сеансы (массив).
// GET /api/telemetry/sessions/export?session_id=1 — один сеанс.
func TelemetrySessionsExportHandler(store *storage.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessions := store.SessionsCopy()
		if len(sessions) == 0 {
			http.Error(w, "Нет данных телеметрии", http.StatusNotFound)
			return
		}

		if idStr := r.URL.Query().Get("session_id"); idStr != "" {
			id, err := strconv.ParseUint(idStr, 10, 64)
			if err != nil {
				http.Error(w, "Некорректный session_id", http.StatusBadRequest)
				return
			}
			for _, sess := range sessions {
				if sess.ID == id {
					writeJSON(w, sessionToExport(sess))
					return
				}
			}
			http.Error(w, "Сеанс не найден", http.StatusNotFound)
			return
		}

		out := make([]sessionExportJSON, 0, len(sessions))
		for _, sess := range sessions {
			out = append(out, sessionToExport(sess))
		}
		writeJSON(w, out)
	}
}

func sessionToExport(sess storage.CommunicationSession) sessionExportJSON {
	ended := ""
	if sess.EndedAt != nil {
		ended = sess.EndedAt.UTC().Format(time.RFC3339Nano)
	}
	frames := make([]sessionFrameJSON, 0, len(sess.Readings))
	for _, f := range sess.Readings {
		simple := f.ToSimple()
		frames = append(frames, sessionFrameJSON{
			OnboardTimeUnix: f.OnboardTime,
			Simple:          processor.FormatSimpleForFrontend(&simple),
			Full:            processor.FormatFullForFrontend(&f),
		})
	}
	return sessionExportJSON{
		Version:    sessionJSONVersion,
		SessionID:  sess.ID,
		RemoteAddr: sess.RemoteAddr,
		StartedAt:  sess.StartedAt.UTC().Format(time.RFC3339Nano),
		EndedAt:    ended,
		Frames:     frames,
	}
}

// TelemetryFullLatestHandler — последний полный кадр (REST для продвинутого режима).
func TelemetryFullLatestHandler(store *storage.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		last := store.Last()
		if last == nil {
			http.Error(w, "Нет данных телеметрии", http.StatusNotFound)
			return
		}
		writeJSON(w, processor.FormatFullForFrontend(last))
	}
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	enc := json.NewEncoder(w)
	enc.SetIndent("", "  ")
	_ = enc.Encode(v)
}

// cmd/server/main.go
package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"back/internal/api"
	"back/internal/broadcaster"
	"back/internal/processor"
	"back/internal/receiver/tcp"
	"back/internal/storage"
)

func main() {
	hub := broadcaster.NewHub()
	go hub.Run()

	events := make(chan tcp.RxEvent, 512)
	go tcp.StartListener(":9000", events)

	const maxSessions = 80
	const maxReadingsPerSession = 8000
	store := storage.NewMemoryStore(maxSessions, maxReadingsPerSession)

	go func() {
		for ev := range events {
			switch ev.Kind {
			case tcp.RxSessionStart:
				store.StartSession(ev.SessionID, ev.RemoteAddr)

			case tcp.RxData:
				frames, err := processor.ParseAll(ev.Payload)
				if err != nil {
					log.Println("parse error:", err)
					continue
				}
				for i := range frames {
					telem := frames[i]
					store.AddReading(ev.SessionID, telem)

					view := processor.FormatWSMessage(&telem)
					bs, _ := json.Marshal(view)
					hub.Broadcast(bs)
				}

			case tcp.RxSessionClosed:
				store.EndSession(ev.SessionID)
			}
		}
	}()

	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("../front")))
	mux.HandleFunc("/ws", hub.ServeWS)

	mux.HandleFunc("/api/telemetry/pdf", api.TelemetryPDFHandler(store))
	mux.HandleFunc("/api/telemetry/csv", api.TelemetryCSVHandler(store))
	mux.HandleFunc("/api/telemetry/csv/full", api.TelemetryFullCSVHandler(store))
	mux.HandleFunc("/api/telemetry/full/latest", api.TelemetryFullLatestHandler(store))
	mux.HandleFunc("/api/telemetry/sessions/export", api.TelemetrySessionsExportHandler(store))

	srv := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	go func() {
		log.Println("HTTP server listening on :8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Println("Shutting down servers...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}

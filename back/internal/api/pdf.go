package api

import (
	"fmt"
	"net/http"
	"time"

	"back/internal/processor"
	"back/internal/storage"

	"github.com/jung-kurt/gofpdf"
)

const (
	pdfFontPath     = "assets/fonts/DejaVuSansCondensed.ttf"
	pdfMaxSessions  = 25
	pdfMaxRowsShown = 45
)

func TelemetryPDFHandler(store *storage.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessions := store.SessionsCopy()
		if len(sessions) == 0 {
			http.Error(w, "Нет данных телеметрии", http.StatusNotFound)
			return
		}

		if len(sessions) > pdfMaxSessions {
			sessions = sessions[len(sessions)-pdfMaxSessions:]
		}

		w.Header().Set("Content-Type", "application/pdf")
		w.Header().Set("Content-Disposition", "attachment; filename=telemetry_sessions.pdf")

		pdf := gofpdf.New("P", "mm", "A4", "")
		pdf.AddPage()
		pdf.AddUTF8Font("DejaVuSansCondensed", "", pdfFontPath)
		pdf.SetFont("DejaVuSansCondensed", "", 12)

		pdf.Cell(0, 10, "Отчёт по сеансам связи и кадрам телеметрии")
		pdf.Ln(12)
		pdf.SetFont("DejaVuSansCondensed", "", 9)
		pdf.MultiCell(0, 5, "Сеанс связи = одно TCP-подключение к приёмнику (как окно контакта). "+
			"Внутри сеанса — последовательность кадров телеметрии. "+
			"В таблице при большом числе кадров показываются первые и последние строки; полный набор — в CSV.", "", "L", false)
		pdf.Ln(4)

		for _, sess := range sessions {
			if len(sess.Readings) == 0 {
				continue
			}
			if pdf.GetY() > 250 {
				pdf.AddPage()
			}

			pdf.SetFont("DejaVuSansCondensed", "", 11)
			title := formatSessionTitle(sess)
			pdf.Cell(0, 7, title)
			pdf.Ln(8)

			pdf.SetFont("DejaVuSansCondensed", "", 8)
			headers := []string{
				"№", "Борт. время", "V км/с", "Roll", "Pitch", "Yaw",
				"Tср", "Tсолн", "Tтень", "Шир.", "Долг.", "Выс. км",
			}
			colW := []float64{8, 28, 14, 14, 14, 14, 12, 12, 12, 14, 14, 14}
			for i, h := range headers {
				pdf.CellFormat(colW[i], 6, h, "1", 0, "C", false, 0, "")
			}
			pdf.Ln(-1)

			rows := selectRowsForPDF(sess.Readings)
			for _, row := range rows {
				if pdf.GetY() > 275 {
					pdf.AddPage()
					pdf.SetFont("DejaVuSansCondensed", "", 8)
				}
				writePDFDataRow(pdf, colW, row.idx, row.t)
			}
			pdf.Ln(6)
		}

		if err := pdf.Output(w); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}

type pdfRow struct {
	idx int
	t   processor.Telemetry
}

func formatSessionTitle(sess storage.CommunicationSession) string {
	end := "—"
	if sess.EndedAt != nil {
		end = sess.EndedAt.Format("02.01.2006 15:04:05")
	}
	return fmt.Sprintf(
		"Сеанс связи №%d  |  %s — %s  |  кадров: %d  |  %s",
		sess.ID,
		sess.StartedAt.Format("02.01.2006 15:04:05"),
		end,
		len(sess.Readings),
		sess.RemoteAddr,
	)
}

func selectRowsForPDF(readings []processor.Telemetry) []pdfRow {
	n := len(readings)
	if n <= pdfMaxRowsShown {
		out := make([]pdfRow, n)
		for i := range readings {
			out[i] = pdfRow{idx: i + 1, t: readings[i]}
		}
		return out
	}
	head := 22
	tail := pdfMaxRowsShown - head - 1
	out := make([]pdfRow, 0, head+tail+1)
	for i := 0; i < head; i++ {
		out = append(out, pdfRow{idx: i + 1, t: readings[i]})
	}
	out = append(out, pdfRow{idx: -1, t: processor.Telemetry{}})
	for i := 0; i < tail; i++ {
		idx := n - tail + i
		out = append(out, pdfRow{idx: idx + 1, t: readings[idx]})
	}
	return out
}

func writePDFDataRow(pdf *gofpdf.Fpdf, colW []float64, seq int, t processor.Telemetry) {
	sec := int64(t.OnboardTime)
	nsec := int64((t.OnboardTime - float64(sec)) * 1e9)
	ts := time.Unix(sec, nsec)
	timeStr := ts.Format("15:04:05.000")

	if seq < 0 {
		pdf.CellFormat(190, 5, fmt.Sprintf("… пропущено кадров … (всего строк см. CSV)"), "1", 0, "C", false, 0, "")
		pdf.Ln(-1)
		return
	}

	cells := []string{
		fmt.Sprintf("%d", seq),
		timeStr,
		fmt.Sprintf("%.3f", t.Velocity),
		fmt.Sprintf("%.1f", t.Roll),
		fmt.Sprintf("%.1f", t.Pitch),
		fmt.Sprintf("%.1f", t.Yaw),
		fmt.Sprintf("%.1f", t.TempAvg),
		fmt.Sprintf("%.1f", t.TempSun),
		fmt.Sprintf("%.1f", t.TempShadow),
		fmt.Sprintf("%.3f", t.Latitude),
		fmt.Sprintf("%.3f", t.Longitude),
		fmt.Sprintf("%.1f", t.Altitude),
	}
	for i, s := range cells {
		pdf.CellFormat(colW[i], 5, s, "1", 0, "C", false, 0, "")
	}
	pdf.Ln(-1)
}

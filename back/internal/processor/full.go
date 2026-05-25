package processor

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"time"
)

// FrameSize — бинарный кадр полной телеметрии (совпадает с generator/gen.py).
const FrameSize = 136

// FullTelemetry — расширенный кадр в духе учебных CubeSat (ОЭС, АДС, КИ, полезная нагрузка).
type FullTelemetry struct {
	OnboardTime   float64
	PacketCounter uint32
	FrameType     uint8
	Mode          uint8
	CrcOk         uint8
	Reserved      uint8

	Velocity float32
	Roll     float32
	Pitch    float32
	Yaw      float32

	TempAvg    float32
	TempSun    float32
	TempShadow float32

	Latitude  float32
	Longitude float32
	Altitude  float32

	BatteryVoltage float32
	BatteryCurrent float32
	BatterySOC     float32
	SolarCurrent   float32
	SolarVoltage   float32

	GyroX float32
	GyroY float32
	GyroZ float32

	MagX float32
	MagY float32
	MagZ float32

	AccelX float32
	AccelY float32
	AccelZ float32

	CpuTemp      float32
	RadioRSSI    float32
	RadioTxPower float32

	Uptime       uint32
	CommandCount uint32
	StatusFlags  uint32
}

// ParseAll разбирает один или несколько кадров из TCP-буфера.
func ParseAll(raw []byte) ([]FullTelemetry, error) {
	if len(raw) == 0 {
		return nil, fmt.Errorf("empty payload")
	}
	if len(raw)%FrameSize != 0 {
		return nil, fmt.Errorf("payload size %d is not a multiple of frame size %d", len(raw), FrameSize)
	}
	n := len(raw) / FrameSize
	out := make([]FullTelemetry, 0, n)
	for i := 0; i < n; i++ {
		t, err := parseOne(raw[i*FrameSize : (i+1)*FrameSize])
		if err != nil {
			return nil, err
		}
		out = append(out, *t)
	}
	return out, nil
}

func parseOne(raw []byte) (*FullTelemetry, error) {
	if len(raw) < FrameSize {
		return nil, fmt.Errorf("frame too short: %d", len(raw))
	}
	buf := bytes.NewReader(raw)
	var t FullTelemetry
	if err := binary.Read(buf, binary.LittleEndian, &t); err != nil {
		return nil, err
	}
	return &t, nil
}

// ToSimple извлекает параметры для школьного (упрощённого) режима.
func (f *FullTelemetry) ToSimple() Telemetry {
	return Telemetry{
		OnboardTime: f.OnboardTime,
		Velocity:    f.Velocity,
		Roll:        f.Roll,
		Pitch:       f.Pitch,
		Yaw:         f.Yaw,
		TempAvg:     f.TempAvg,
		TempSun:     f.TempSun,
		TempShadow:  f.TempShadow,
		Latitude:    f.Latitude,
		Longitude:   f.Longitude,
		Altitude:    f.Altitude,
	}
}

func formatOnboardTime(unix float64) string {
	sec := int64(unix)
	nsec := int64((unix - float64(sec)) * 1e9)
	return time.Unix(sec, nsec).Format("02.01.2006 15:04:05.000")
}

// FormatSimpleForFrontend — упрощённый вид для UI.
func FormatSimpleForFrontend(t *Telemetry) map[string]interface{} {
	return map[string]interface{}{
		"onboard_time": formatOnboardTime(t.OnboardTime),
		"velocity":     t.Velocity,
		"roll":         t.Roll,
		"pitch":        t.Pitch,
		"yaw":          t.Yaw,
		"temp_avg":     t.TempAvg,
		"temp_sun":     t.TempSun,
		"temp_shadow":  t.TempShadow,
		"latitude":     t.Latitude,
		"longitude":    t.Longitude,
		"altitude":     t.Altitude,
	}
}

// FormatFullForFrontend — полный кадр без урезания полей.
func FormatFullForFrontend(f *FullTelemetry) map[string]interface{} {
	return map[string]interface{}{
		"onboard_time":      formatOnboardTime(f.OnboardTime),
		"onboard_time_unix": f.OnboardTime,
		"packet_counter":    f.PacketCounter,
		"frame_type":        f.FrameType,
		"mode":              f.Mode,
		"crc_ok":            f.CrcOk,
		"velocity":          f.Velocity,
		"roll":              f.Roll,
		"pitch":             f.Pitch,
		"yaw":               f.Yaw,
		"temp_avg":          f.TempAvg,
		"temp_sun":          f.TempSun,
		"temp_shadow":       f.TempShadow,
		"latitude":          f.Latitude,
		"longitude":         f.Longitude,
		"altitude":          f.Altitude,
		"battery_voltage":   f.BatteryVoltage,
		"battery_current":   f.BatteryCurrent,
		"battery_soc":       f.BatterySOC,
		"solar_current":     f.SolarCurrent,
		"solar_voltage":     f.SolarVoltage,
		"gyro_x":            f.GyroX,
		"gyro_y":            f.GyroY,
		"gyro_z":            f.GyroZ,
		"mag_x":             f.MagX,
		"mag_y":             f.MagY,
		"mag_z":             f.MagZ,
		"accel_x":           f.AccelX,
		"accel_y":           f.AccelY,
		"accel_z":           f.AccelZ,
		"cpu_temp":          f.CpuTemp,
		"radio_rssi":        f.RadioRSSI,
		"radio_tx_power":    f.RadioTxPower,
		"uptime":            f.Uptime,
		"command_count":     f.CommandCount,
		"status_flags":      f.StatusFlags,
	}
}

// FormatWSMessage — конверт для WebSocket: simple + full.
func FormatWSMessage(f *FullTelemetry) map[string]interface{} {
	simple := f.ToSimple()
	return map[string]interface{}{
		"simple": FormatSimpleForFrontend(&simple),
		"full":   FormatFullForFrontend(f),
	}
}

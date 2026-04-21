package processor

import (
	"bytes"
	"encoding/binary"
	// "time"
)

type Telemetry struct {
	OnboardTime float64  `json:"onboard_time"`
	Velocity    float32 `json:"velocity"`

	Roll  float32 `json:"roll"`
	Pitch float32 `json:"pitch"`
	Yaw   float32 `json:"yaw"`

	TempAvg    float32 `json:"temp_avg"`
	TempSun    float32 `json:"temp_sun"`
	TempShadow float32 `json:"temp_shadow"`

	Latitude  float32 `json:"latitude"`
	Longitude float32 `json:"longitude"`
	Altitude  float32 `json:"altitude"`
}

func Parse(raw []byte) (*Telemetry, error) {
	buf := bytes.NewReader(raw)

	var t Telemetry
	err := binary.Read(buf, binary.LittleEndian, &t)
	if err != nil {
		return nil, err
	}

	return &t, nil
}


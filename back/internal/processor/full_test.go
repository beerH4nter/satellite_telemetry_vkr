package processor

import (
	"testing"
	"unsafe"
)

func TestFrameSizeMatchesStruct(t *testing.T) {
	got := int(unsafe.Sizeof(FullTelemetry{}))
	if got != FrameSize {
		t.Fatalf("sizeof(FullTelemetry)=%d, FrameSize=%d", got, FrameSize)
	}
}

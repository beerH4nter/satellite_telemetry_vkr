package tcp

// RxKind — тип события от приёмника TCP.
// Сеанс связи в терминах наземки = одно установленное TCP-подключение
// (как окно контакта со спутником): внутри него идёт поток кадров телеметрии.
type RxKind int

const (
	RxSessionStart RxKind = iota
	RxData
	RxSessionClosed
)

// RxEvent событие для основного цикла обработки.
type RxEvent struct {
	Kind       RxKind
	SessionID  uint64
	RemoteAddr string
	Payload    []byte
}

package storage

import (
	"sync"
	"time"

	"back/internal/processor"
)

// CommunicationSession — один сеанс связи (одно TCP-подключение): внутри много кадров телеметрии.
type CommunicationSession struct {
	ID         uint64
	RemoteAddr string
	StartedAt  time.Time
	EndedAt    *time.Time
	Readings   []processor.Telemetry
}

type MemoryStore struct {
	mu                sync.Mutex
	sessions          []CommunicationSession // хронологический порядок по StartedAt
	maxSessions       int
	maxPerSession     int
}

func NewMemoryStore(maxSessions, maxReadingsPerSession int) *MemoryStore {
	return &MemoryStore{
		maxSessions:   maxSessions,
		maxPerSession: maxReadingsPerSession,
	}
}

func (m *MemoryStore) StartSession(id uint64, remoteAddr string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.sessions = append(m.sessions, CommunicationSession{
		ID:         id,
		RemoteAddr: remoteAddr,
		StartedAt:  time.Now(),
		Readings:   nil,
	})
	m.trimSessionsLocked()
}

func (m *MemoryStore) AddReading(sessionID uint64, t processor.Telemetry) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for i := range m.sessions {
		if m.sessions[i].ID == sessionID {
			m.sessions[i].Readings = append(m.sessions[i].Readings, t)
			if len(m.sessions[i].Readings) > m.maxPerSession {
				// старые кадры сеанса отбрасываем (окно внутри связи)
				excess := len(m.sessions[i].Readings) - m.maxPerSession
				m.sessions[i].Readings = append([]processor.Telemetry(nil), m.sessions[i].Readings[excess:]...)
			}
			return
		}
	}
}

func (m *MemoryStore) EndSession(sessionID uint64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now()
	for i := range m.sessions {
		if m.sessions[i].ID == sessionID {
			m.sessions[i].EndedAt = &now
			return
		}
	}
}

func (m *MemoryStore) trimSessionsLocked() {
	for len(m.sessions) > m.maxSessions {
		m.sessions = m.sessions[1:]
	}
}

// SessionsCopy возвращает копию всех сеансов с копиями срезов показаний (для отчётов).
func (m *MemoryStore) SessionsCopy() []CommunicationSession {
	m.mu.Lock()
	defer m.mu.Unlock()

	out := make([]CommunicationSession, len(m.sessions))
	for i := range m.sessions {
		out[i] = m.sessions[i]
		out[i].Readings = append([]processor.Telemetry(nil), m.sessions[i].Readings...)
	}
	return out
}

// Last возвращает последнее принятое показание (по всем сеансам) или nil.
func (m *MemoryStore) Last() *processor.Telemetry {
	m.mu.Lock()
	defer m.mu.Unlock()

	for i := len(m.sessions) - 1; i >= 0; i-- {
		s := &m.sessions[i]
		if n := len(s.Readings); n > 0 {
			t := s.Readings[n-1]
			return &t
		}
	}
	return nil
}

package tcp

import (
	"errors"
	"io"
	"log"
	"net"
	"sync/atomic"
)

func StartListener(addr string, out chan<- RxEvent) {
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("TCP listen error: %v", err)
	}
	log.Println("TCP listening on", addr)

	var sessionSeq uint64

	for {
		conn, err := ln.Accept()
		if err != nil {
			log.Println("accept error:", err)
			continue
		}
		id := atomic.AddUint64(&sessionSeq, 1)
		log.Println("session", id, "connected:", conn.RemoteAddr())
		go handle(conn, id, out)
	}
}

func handle(conn net.Conn, sessionID uint64, out chan<- RxEvent) {
	defer func() {
		_ = conn.Close()
		out <- RxEvent{Kind: RxSessionClosed, SessionID: sessionID}
		log.Println("session", sessionID, "closed")
	}()

	out <- RxEvent{
		Kind:       RxSessionStart,
		SessionID:  sessionID,
		RemoteAddr: conn.RemoteAddr().String(),
	}

	buf := make([]byte, 4096)
	for {
		n, err := conn.Read(buf)
		if err != nil {
			if !errors.Is(err, io.EOF) {
				log.Println("session", sessionID, "read error:", err)
			}
			return
		}
		if n == 0 {
			continue
		}
		payload := make([]byte, n)
		copy(payload, buf[:n])
		out <- RxEvent{Kind: RxData, SessionID: sessionID, Payload: payload}
	}
}

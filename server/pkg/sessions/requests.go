package sessions

type request struct {
	Type int // See the requestType constants below
	Data interface{}
}

const (
	requestTypeNewSession = iota
	requestTypeDeleteSession
	requestTypeSendMsg
	requestTypePrint
)

func (m *Manager) requestFuncMapInit() {
	m.requestFuncMap[requestTypeNewSession] = newSession
	m.requestFuncMap[requestTypeDeleteSession] = deleteSession
	m.requestFuncMap[requestTypeSendMsg] = sendMsg
	m.requestFuncMap[requestTypePrint] = print
}

// ListenForRequests will block until messages are sent on the request channel.
// It is meant to be run in a new goroutine.
func (m *Manager) ListenForRequests() {
	for {
		req := <-m.requests

		if requestFunc, ok := m.requestFuncMap[req.Type]; ok {
			requestFunc(m, req.Data)
		} else {
			m.logger.Errorf(
				"The sessions manager received an invalid request type of: %v",
				req.Type,
			)
		}
	}
}

import { useRef, useState } from 'react'

function AskAI() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const requestId = useRef(0)

  const handleAsk = async () => {
    if (!question.trim() || loading) return

    const id = ++requestId.current
    const currentQuestion = question.trim()

    setLoading(true)
    setQuestion('')

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const response = await fetch('http://localhost:5001/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      const data = await response.json()

      if (id !== requestId.current) return

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response.')
      }

      if (!data.answer || typeof data.answer !== 'string') {
        throw new Error('The AI returned an empty response.')
      }

      setMessages((prev) => [
        ...prev,
        { type: 'user', text: currentQuestion },
        { type: 'ai', text: data.answer },
      ])
    } catch (error) {
      if (id !== requestId.current) return

      if (error.name === 'AbortError') {
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai',
            text: 'The AI took too long to respond. Please try again.',
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai',
            text: error.message || 'Unable to connect to the AI server.',
          },
        ])
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="section">
      <div className="card ask-card">
        <h2>Ask AI</h2>
        <p>Ask questions and get clear explanations.</p>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about your studies..."
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAsk()
            }
          }}
        />

        <button onClick={handleAsk} disabled={loading || !question.trim()}>
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>

        <div className="chat-box">
          {messages.length === 0 && !loading && (
            <p className="empty-message">
              Ask a question to start learning.
            </p>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.type === 'user' ? 'user-message' : 'ai-message'
              }
            >
              <strong>{message.type === 'user' ? 'You' : 'AI'}</strong>
              <p>{message.text}</p>
            </div>
          ))}

          {loading && (
            <div className="ai-message">
              <strong>AI</strong>
              <p>Thinking...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AskAI
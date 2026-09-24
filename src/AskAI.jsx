import { useState } from 'react'

function AskAI() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!question.trim() || loading) return

    const userQuestion = question.trim()

    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        text: userQuestion
      }
    ])

    setQuestion('')
    setLoading(true)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch('http://localhost:5001/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userQuestion
        }),
        signal: controller.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.answer || 'The AI server returned an error.')
      }

      if (!data.answer || typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('The AI returned an empty response.')
      }

      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: data.answer
        }
      ])
    } catch (error) {
      let errorMessage = 'Unable to get an AI response. Please try again.'

      if (error.name === 'AbortError') {
        errorMessage = 'The AI response took too long. Please try again.'
      } else if (error.message) {
        errorMessage = error.message
      }

      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: errorMessage
        }
      ])
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div className="ask-ai">
      <h1>Ask AI</h1>
      <p>Ask questions and get help with your studies.</p>

      <div className="chat-box">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <h3>How can I help you?</h3>
            <p>Ask me anything about your studies.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type}`}
            >
              <strong>{message.type === 'user' ? 'You' : 'AI'}</strong>
              <p>{message.text}</p>
            </div>
          ))
        )}

        {loading && (
          <div className="message ai">
            <strong>AI</strong>
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <div className="input-area">
        <textarea
          placeholder="Ask a study question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button onClick={handleAsk} disabled={loading || !question.trim()}>
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </div>
    </div>
  )
}

export default AskAI
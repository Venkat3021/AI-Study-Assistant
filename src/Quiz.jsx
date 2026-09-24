import { useRef, useState } from 'react'

function validateQuiz(quiz) {
  if (!Array.isArray(quiz) || quiz.length !== 5) {
    return false
  }

  return quiz.every((item) => {
    if (!item || typeof item !== 'object') return false
    if (typeof item.question !== 'string' || !item.question.trim()) return false
    if (!Array.isArray(item.options) || item.options.length !== 4) return false

    if (
      !item.options.every(
        (option) => typeof option === 'string' && option.trim()
      )
    ) {
      return false
    }

    if (typeof item.answer !== 'string' || !item.answer.trim()) {
      return false
    }

    return item.options.includes(item.answer)
  })
}

function Quiz() {
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState([])
  const [wrongQuestions, setWrongQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const requestId = useRef(0)

  const generateQuiz = async () => {
    if (!topic.trim() || loading) return

    const id = ++requestId.current

    setLoading(true)
    setError('')
    setQuestions([])
    setWrongQuestions([])
    setCurrentQuestion(0)
    setSelectedAnswer('')
    setScore(0)
    setFinished(false)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 45000)

      const response = await fetch('http://localhost:5001/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      const data = await response.json()

      if (id !== requestId.current) return

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz.')
      }

      if (!validateQuiz(data.quiz)) {
        throw new Error(
          'The AI returned an invalid quiz. Please try generating it again.'
        )
      }

      setQuestions(data.quiz)
    } catch (error) {
      if (id !== requestId.current) return

      if (error.name === 'AbortError') {
        setError('Quiz generation took too long. Please try again.')
      } else {
        setError(error.message || 'Unable to generate the quiz.')
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false)
      }
    }
  }

  const handleNext = () => {
    const current = questions[currentQuestion]

    if (!selectedAnswer) return

    if (selectedAnswer === current.answer) {
      setScore((prev) => prev + 1)
    } else {
      setWrongQuestions((prev) => [...prev, current])
    }

    if (currentQuestion === questions.length - 1) {
      setFinished(true)
    } else {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer('')
    }
  }

  const retryWrongAnswers = () => {
    if (wrongQuestions.length === 0) return

    setQuestions(wrongQuestions)
    setWrongQuestions([])
    setCurrentQuestion(0)
    setSelectedAnswer('')
    setScore(0)
    setFinished(false)
  }

  const restartQuiz = () => {
    setQuestions([])
    setWrongQuestions([])
    setCurrentQuestion(0)
    setSelectedAnswer('')
    setScore(0)
    setFinished(false)
    setError('')
  }

  return (
    <div className="section">
      <div className="card quiz-card">
        <h2>AI Quiz</h2>
        <p>Enter a topic and test your knowledge.</p>

        {!questions.length && !loading && (
          <>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic, e.g. React Hooks"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  generateQuiz()
                }
              }}
            />

            <button onClick={generateQuiz} disabled={!topic.trim()}>
              Generate Quiz
            </button>
          </>
        )}

        {loading && (
          <div className="loading-state">
            <p>Generating your quiz...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-state">
            <p>{error}</p>

            <button onClick={generateQuiz} disabled={!topic.trim()}>
              Try Again
            </button>
          </div>
        )}

        {questions.length > 0 && !finished && !loading && (
          <div className="quiz-container">
            <p className="quiz-progress">
              Question {currentQuestion + 1} of {questions.length}
            </p>

            <h3>{questions[currentQuestion].question}</h3>

            <div className="quiz-options">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={
                    selectedAnswer === option ? 'selected-option' : ''
                  }
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
            >
              {currentQuestion === questions.length - 1
                ? 'Finish Quiz'
                : 'Next Question'}
            </button>
          </div>
        )}

        {finished && (
          <div className="quiz-result">
            <h3>Quiz Complete!</h3>

            <p>
              You scored <strong>{score}</strong> out of{' '}
              <strong>{questions.length}</strong>.
            </p>

            {wrongQuestions.length > 0 && (
              <button onClick={retryWrongAnswers}>
                Retry Wrong Answers ({wrongQuestions.length})
              </button>
            )}

            <button onClick={restartQuiz}>
              Start New Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quiz
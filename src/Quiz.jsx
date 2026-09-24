import { useState } from 'react'

function Quiz() {
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [wrongQuestions, setWrongQuestions] = useState([])

  const validateQuiz = (quiz) => {
    if (!Array.isArray(quiz) || quiz.length !== 5) {
      return false
    }

    return quiz.every((item) => {
      if (!item || typeof item !== 'object') {
        return false
      }

      if (typeof item.question !== 'string' || !item.question.trim()) {
        return false
      }

      if (!Array.isArray(item.options) || item.options.length !== 4) {
        return false
      }

      if (
        item.options.some(
          (option) => typeof option !== 'string' || !option.trim()
        )
      ) {
        return false
      }

      if (typeof item.answer !== 'string' || !item.answer.trim()) {
        return false
      }

      if (!item.options.includes(item.answer)) {
        return false
      }

      return true
    })
  }

  const generateQuiz = async (quizTopic = topic) => {
    if (!quizTopic.trim()) {
      setError('Please enter a topic or study notes.')
      return
    }

    setLoading(true)
    setError('')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)

    try {
      const response = await fetch('http://localhost:5001/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: quizTopic
        }),
        signal: controller.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not generate quiz.')
      }

      if (!validateQuiz(data.quiz)) {
        throw new Error(
          'The AI returned invalid quiz data. Please generate the quiz again.'
        )
      }

      setQuestions(data.quiz)
      setCurrentQuestion(0)
      setSelectedAnswer('')
      setScore(0)
      setFinished(false)
      setWrongQuestions([])
    } catch (error) {
      if (error.name === 'AbortError') {
        setError('Quiz generation took too long. Please try again.')
      } else {
        setError(error.message || 'Unable to generate quiz. Please try again.')
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!selectedAnswer) return

    const question = questions[currentQuestion]
    const isCorrect = selectedAnswer === question.answer

    const updatedScore = isCorrect ? score + 1 : score

    if (!isCorrect) {
      setWrongQuestions((prev) => [...prev, question])
    }

    if (currentQuestion === questions.length - 1) {
      setScore(updatedScore)
      setFinished(true)
      return
    }

    if (isCorrect) {
      setScore(updatedScore)
    }

    setCurrentQuestion((prev) => prev + 1)
    setSelectedAnswer('')
  }

  const restartQuiz = () => {
    setQuestions([])
    setCurrentQuestion(0)
    setSelectedAnswer('')
    setScore(0)
    setFinished(false)
    setError('')
    setWrongQuestions([])
  }

  const retryWrongAnswers = () => {
    if (wrongQuestions.length === 0) {
      restartQuiz()
      return
    }

    setQuestions(wrongQuestions)
    setCurrentQuestion(0)
    setSelectedAnswer('')
    setScore(0)
    setFinished(false)
    setError('')
    setWrongQuestions([])
  }

  if (loading) {
    return (
      <div className="section-page">
        <h2>AI Study Quiz</h2>
        <p>Generating your quiz with AI...</p>
        <p>Please wait. This may take a few seconds.</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="section-page">
        <h2>AI Study Quiz</h2>

        <p>
          Enter a topic or paste your study notes and AI will create a quiz.
        </p>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Example: Operating Systems, DBMS, Python..."
          rows="6"
          style={{
            width: '100%',
            padding: '15px',
            marginTop: '15px',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            fontSize: '15px',
            resize: 'vertical'
          }}
        />

        {error && (
          <p style={{ color: '#dc2626', marginTop: '15px' }}>
            {error}
          </p>
        )}

        <button
          onClick={() => generateQuiz()}
          disabled={!topic.trim()}
          style={{ marginTop: '15px' }}
        >
          Generate Quiz
        </button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="section-page">
        <h2>Quiz Completed!</h2>

        <p>
          Your score: {score} / {questions.length}
        </p>

        {wrongQuestions.length > 0 ? (
          <>
            <p>
              You answered {wrongQuestions.length} question
              {wrongQuestions.length > 1 ? 's' : ''} incorrectly.
            </p>

            <button onClick={retryWrongAnswers}>
              Retry Wrong Answers
            </button>

            <button
              onClick={restartQuiz}
              style={{ marginLeft: '10px' }}
            >
              Create Another Quiz
            </button>
          </>
        ) : (
          <p>Excellent! You answered every question correctly.</p>
        )}
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="section-page">
      <h2>AI Study Quiz</h2>

      <p>
        Question {currentQuestion + 1} of {questions.length}
      </p>

      <h3>{question.question}</h3>

      <div className="quiz-options">
        {question.options.map((option) => (
          <button
            key={option}
            className={selectedAnswer === option ? 'selected' : ''}
            onClick={() => setSelectedAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        className="next-button"
        onClick={handleNext}
        disabled={!selectedAnswer}
      >
        {currentQuestion === questions.length - 1
          ? 'Finish Quiz'
          : 'Next'}
      </button>
    </div>
  )
}

export default Quiz
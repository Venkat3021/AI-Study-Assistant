import { useState } from 'react'
import './App.css'
import AskAI from './AskAI'
import StudyMaterials from './StudyMaterials'
import Quiz from './Quiz'

function App() {
  const [activeSection, setActiveSection] = useState('home')

  return (
    <div className="app">
      <header className="header">
        <h1>AI Study Assistant</h1>
        <p>Learn smarter with your AI-powered study companion</p>
      </header>

      {activeSection === 'home' && (
        <main className="container">
          <div className="card">
            <h2>Ask AI</h2>
            <p>Ask questions and get clear explanations.</p>
            <button onClick={() => setActiveSection('ask')}>
              Start Learning
            </button>
          </div>

          <div className="card">
            <h2>Study Materials</h2>
            <p>Upload and study your notes and documents.</p>
            <button onClick={() => setActiveSection('materials')}>
              View Materials
            </button>
          </div>

          <div className="card">
            <h2>Quiz</h2>
            <p>Test your knowledge with AI-generated quizzes.</p>
            <button onClick={() => setActiveSection('quiz')}>
              Take Quiz
            </button>
          </div>
        </main>
      )}

      {activeSection === 'ask' && (
        <>
          <AskAI />
          <button
            className="back-button"
            onClick={() => setActiveSection('home')}
          >
            Back to Home
          </button>
        </>
      )}

      {activeSection === 'materials' && (
  <>
    <StudyMaterials />
    <button
      className="back-button"
      onClick={() => setActiveSection('home')}
    >
      Back to Home
    </button>
  </>
)}

      {activeSection === 'quiz' && (
  <>
    <Quiz />

    <button
      className="back-button"
      onClick={() => setActiveSection('home')}
    >
      Back to Home
    </button>
  </>
)}
    </div>
  )
}

export default App
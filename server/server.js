require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { PDFParse } = require('pdf-parse')
const { GoogleGenAI } = require('@google/genai')

const app = express()

app.use(cors())
app.use(express.json())

const upload = multer({ storage: multer.memoryStorage() })

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

let studyMaterial = ''

app.get('/', (req, res) => {
  res.send('AI Study Assistant Backend is running')
})

app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({
        answer: 'Please enter a question.'
      })
    }

    let prompt = question

    if (studyMaterial) {
      prompt = `
You are an AI study assistant.

Use the following study material to answer the student's question.

STUDY MATERIAL:
${studyMaterial}

STUDENT QUESTION:
${question}

Give a clear and simple explanation based on the study material.
`
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt
    })

    res.json({
      answer: response.text
    })
  } catch (error) {
    console.error('Gemini API Error:', error)

    res.status(500).json({
      answer: error.message || 'Sorry, I could not generate a response.'
    })
  }
})

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Please upload a PDF file.'
      })
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        message: 'Only PDF files are supported.'
      })
    }

    const parser = new PDFParse({
      data: req.file.buffer
    })

    const result = await parser.getText()

    studyMaterial = result.text

    await parser.destroy()

    res.json({
      message: 'PDF uploaded successfully.',
      fileName: req.file.originalname
    })
  } catch (error) {
    console.error('PDF Error:', error)

    res.status(500).json({
      message: 'Could not process the PDF.'
    })
  }
})
app.post('/api/quiz', async (req, res) => {
  try {
    const { topic } = req.body

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        message: 'Please enter a topic or study notes.'
      })
    }

    const prompt = `
You are an AI study assistant.

Create exactly 5 multiple-choice questions based only on the following topic or study notes:

TOPIC / STUDY NOTES:
${topic}

Return ONLY valid JSON in exactly this format:

[
  {
    "question": "Question text",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "answer": "Correct option"
  }
]

Rules:
- Exactly 5 questions
- Exactly 4 options per question
- Only one correct answer
- The answer must exactly match one of the options
- Do not include markdown
- Do not include explanations
- Do not include any text outside the JSON
`

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt
    })

    if (!response.text) {
      return res.status(500).json({
        message: 'AI returned an empty response.'
      })
    }

    const text = response.text.trim()

    const cleanText = text
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .trim()

    let quiz

    try {
      quiz = JSON.parse(cleanText)
    } catch (error) {
      console.error('Invalid AI JSON:', cleanText)

      return res.status(500).json({
        message: 'AI returned invalid quiz data. Please try again.'
      })
    }

    if (!Array.isArray(quiz) || quiz.length === 0) {
      return res.status(500).json({
        message: 'AI returned an invalid quiz.'
      })
    }

    const validQuiz = quiz.filter((item) => {
      return (
        item &&
        typeof item.question === 'string' &&
        Array.isArray(item.options) &&
        item.options.length === 4 &&
        typeof item.answer === 'string' &&
        item.options.includes(item.answer)
      )
    })

    if (validQuiz.length === 0) {
      return res.status(500).json({
        message: 'AI returned an invalid quiz format.'
      })
    }

    res.json({
      quiz: validQuiz.slice(0, 5)
    })
  } catch (error) {
    console.error('Quiz Error:', error)

    res.status(500).json({
      message: 'Could not generate quiz. Please try again.'
    })
  }
})
app.post('/api/summary', async (req, res) => {
  try {
    if (!studyMaterial) {
      return res.status(400).json({
        message: 'Please upload a study PDF first.'
      })
    }

    const prompt = `
You are an AI study assistant.

Create a clear and useful summary of the following study material.

STUDY MATERIAL:
${studyMaterial}

Include:
- Main topics
- Important concepts
- Key points
- Important definitions
- A short final revision summary

Keep the explanation simple and useful for a student preparing for an exam.
`

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt
    })

    res.json({
      summary: response.text
    })
  } catch (error) {
    console.error('Summary Error:', error)

    res.status(500).json({
      message: 'Could not generate summary.'
    })
  }
})

const PORT = 5001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
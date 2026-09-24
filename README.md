# AI Study Assistant

An AI-powered study assistant built with React, Node.js, Express, and Google Gemini API. It helps students ask questions, summarize PDF study materials, and practice with AI-generated quizzes.

## Features

* Ask AI questions and receive clear explanations
* Upload PDF study materials
* Generate AI-powered summaries from uploaded PDFs
* Generate interactive quizzes from any topic
* Track quiz scores
* Retry questions answered incorrectly
* Loading, error, timeout, and empty states
* AI response validation for structured quiz data
* Stale response protection for API requests
* Responsive design for desktop and mobile
* Gemini API key securely stored on the backend

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* Multer
* PDF parsing

### AI

* Google Gemini API

## Project Structure

```text
ai-study-assistant/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── AskAI.jsx
│   ├── StudyMaterials.jsx
│   ├── Quiz.jsx
│   └── main.jsx
├── server/
│   ├── server.js
│   └── .gitignore
├── public/
├── .gitignore
├── package.json
└── README.md
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Venkat3021/AI-Study-Assistant.git
cd AI-Study-Assistant
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure the backend

Go to the server folder:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The API key is kept on the backend and is not exposed to the frontend.

### 4. Start the backend

From the `server` folder:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5001
```

### 5. Start the frontend

Open another terminal:

```bash
cd ai-study-assistant
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## How to Use

### Ask AI

1. Open the Ask AI section.
2. Enter a question.
3. Click Ask AI.
4. View the generated explanation.

### Study Materials

1. Open Study Materials.
2. Select a PDF file.
3. Upload the PDF.
4. Generate an AI summary.
5. Review the generated summary.

### Quiz

1. Open Quiz.
2. Enter a topic such as `Python basics`.
3. Generate the quiz.
4. Select an answer for each question.
5. Finish the quiz to see your score.
6. Retry questions that were answered incorrectly.

## AI Usage

Google Gemini API is used for:

* Answering study questions
* Generating summaries from uploaded study material
* Creating structured quiz questions

Quiz responses are requested in JSON format and validated by the backend before being sent to the frontend.

## Error Handling

The application handles:

* Empty input
* Invalid API responses
* Malformed JSON
* Incorrect response structure
* Failed API requests
* API timeouts
* Loading states
* Stale responses
* Invalid PDF uploads

User-friendly error messages are displayed when an operation fails.

## Security

The Gemini API key is stored in a backend `.env` file.

The API key is not included in frontend code and is not committed to GitHub.

Environment files are excluded using `.gitignore`.

## Limitations

* Requires an active Gemini API key.
* AI-generated answers and summaries may occasionally contain inaccuracies.
* PDF processing works best with text-based PDFs.
* The application currently uses a limited number of generated quiz questions.
* The application requires the backend server to be running locally during development.

## AI Disclosure

AI tools were used as part of development to assist with implementation, debugging, API integration, error handling, and improving the user interface. The final application was tested and adjusted manually to meet the assignment requirements.

## Time Spent

Approximately 6 hours.

## Future Improvements

* User authentication and personalized study history
* More quiz customization options
* Difficulty selection
* Progress tracking
* Better PDF text extraction
* Deployment with a production backend
* Support for additional study material formats

## License

This project was created as part of a frontend internship assignment.

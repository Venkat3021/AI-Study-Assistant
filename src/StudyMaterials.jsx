import { useState } from 'react'

function StudyMaterials() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [message, setMessage] = useState('')
  const [summary, setSummary] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]

    setMessage('')
    setSummary('')

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (selectedFile.type !== 'application/pdf') {
      setFile(null)
      setMessage('Please select a valid PDF file.')
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file || uploading) return

    setUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed.')
      }

      setMessage(
        'PDF uploaded successfully. You can now generate a summary or ask AI questions.'
      )
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessage('The upload took too long. Please try again.')
      } else {
        setMessage(error.message || 'Unable to connect to the server.')
      }
    } finally {
      clearTimeout(timeout)
      setUploading(false)
    }
  }

  const generateSummary = async () => {
    if (generatingSummary) return

    setGeneratingSummary(true)
    setMessage('')
    setSummary('')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)

    try {
      const response = await fetch('http://localhost:5001/api/summary', {
        method: 'POST',
        signal: controller.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not generate summary.')
      }

      if (
        !data.summary ||
        typeof data.summary !== 'string' ||
        !data.summary.trim()
      ) {
        throw new Error('The AI returned an empty summary.')
      }

      setSummary(data.summary)
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessage('Summary generation took too long. Please try again.')
      } else {
        setMessage(error.message || 'Unable to connect to the server.')
      }
    } finally {
      clearTimeout(timeout)
      setGeneratingSummary(false)
    }
  }

  return (
    <div className="section-page">
      <h2>Study Materials</h2>

      <p>
        Upload your study PDF and use AI to summarize and understand your
        material.
      </p>

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
      />

      {file && (
        <div className="file-info">
          <h3>Selected File</h3>
          <p>{file.name}</p>
          <p>{(file.size / 1024).toFixed(2)} KB</p>

          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
      )}

      {message && (
        <p style={{ marginTop: '20px' }}>
          {message}
        </p>
      )}

      {file && !uploading && (
        <button
          onClick={generateSummary}
          disabled={generatingSummary}
          style={{ marginTop: '20px' }}
        >
          {generatingSummary ? 'Generating Summary...' : 'Generate AI Summary'}
        </button>
      )}

      {summary && (
        <div className="file-info">
          <h3>AI Summary</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
            {summary}
          </p>
        </div>
      )}
    </div>
  )
}

export default StudyMaterials
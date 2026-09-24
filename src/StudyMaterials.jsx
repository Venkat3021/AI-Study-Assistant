import { useRef, useState } from 'react'

function StudyMaterials() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [message, setMessage] = useState('')
  const [summary, setSummary] = useState('')

  const uploadRequestId = useRef(0)
  const summaryRequestId = useRef(0)

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
      setMessage('Please select a PDF file.')
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file || uploading) return

    const id = ++uploadRequestId.current

    setUploading(true)
    setMessage('')
    setSummary('')

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeout)

      const data = await response.json()

      if (id !== uploadRequestId.current) return

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload PDF.')
      }

      setMessage(
        data.message || 'PDF uploaded successfully. You can now generate a summary.'
      )
    } catch (error) {
      if (id !== uploadRequestId.current) return

      if (error.name === 'AbortError') {
        setMessage('PDF upload took too long. Please try again.')
      } else {
        setMessage(error.message || 'Unable to upload the PDF.')
      }
    } finally {
      if (id === uploadRequestId.current) {
        setUploading(false)
      }
    }
  }

  const handleSummary = async () => {
    if (generatingSummary) return

    const id = ++summaryRequestId.current

    setGeneratingSummary(true)
    setMessage('')
    setSummary('')

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 45000)

      const response = await fetch(
        'http://localhost:5001/api/summary',
        {
          method: 'POST',
          signal: controller.signal,
        }
      )

      clearTimeout(timeout)

      const data = await response.json()

      if (id !== summaryRequestId.current) return

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary.')
      }

      if (!data.summary || typeof data.summary !== 'string') {
        throw new Error('The AI returned an empty summary.')
      }

      setSummary(data.summary)
    } catch (error) {
      if (id !== summaryRequestId.current) return

      if (error.name === 'AbortError') {
        setMessage('Summary generation took too long. Please try again.')
      } else {
        setMessage(error.message || 'Unable to generate the summary.')
      }
    } finally {
      if (id === summaryRequestId.current) {
        setGeneratingSummary(false)
      }
    }
  }

  return (
    <div className="section">
      <div className="card">
        <h2>Study Materials</h2>
        <p>Upload your PDF notes and generate an AI summary.</p>

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={uploading || generatingSummary}
        />

        {file && (
          <p>
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading || generatingSummary}
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>

        <button
          onClick={handleSummary}
          disabled={uploading || generatingSummary}
        >
          {generatingSummary ? 'Generating Summary...' : 'Generate Summary'}
        </button>

        {message && (
          <div className="message">
            <p>{message}</p>
          </div>
        )}

        {summary && (
          <div className="summary">
            <h3>AI Summary</h3>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudyMaterials
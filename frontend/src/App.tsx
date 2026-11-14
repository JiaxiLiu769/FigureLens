
import { useRef, useState, useEffect } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import './App.css'

function App() {
  // 保存用户选择的图片文件
  const [image, setImage] = useState<File | null>(null)

  // 图片预览地址
  const [preview, setPreview] = useState<string | null>(null)

  // 是否正在拖拽文件
  const [isDragging, setIsDragging] = useState(false)

  // 错误提示
  const [error, setError] = useState('')
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [recognitionMessage, setRecognitionMessage] = useState('')

  // 用于打开文件选择窗口
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 当图片变化时，创建或释放预览地址
  useEffect(() => {
    if (!image) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(image)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [image])

  // 验证并保存图片
  const handleImage = (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.')
      return
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      setError('Image size must be less than 10 MB.')
      return
    }

    setError('')
    setImage(file)
  }

  // 点击按钮选择图片
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (file) {
      handleImage(file)
    }

    event.target.value = ''
  }

  // 拖拽图片进入上传区域
  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault()
    setIsDragging(true)
  }

  // 拖拽离开
  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault()

    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  // 松开鼠标，上传图片
  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]

    if (file) {
      handleImage(file)
    }
  }

  // 删除图片
  const removeImage = () => {
    setImage(null)
    setError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleIdentify = async () => {
    if (!image || isIdentifying) return

    setIsIdentifying(true)
    setRecognitionMessage('')

    // 临时模拟识别过程
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1500)
    })

    setIsIdentifying(false)
    setRecognitionMessage(
      'Demo complete! AI recognition will be connected soon.'
    )
  }

  return (
    <div className="app">
      <h1>FigureLens</h1>

      <h2>AI-Powered Figure Recognition</h2>

      <p>
        Identify figures and compare prices from stores worldwide.
        <br />
        Simply upload a photo to get started.
      </p>

      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {preview ? (
          <div className="preview-container">
            <img
              src={preview}
              alt="Uploaded figure"
              className="preview-image"
            />

            <p className="file-name">
              {image?.name}
            </p>

            <div className="image-actions">
              <button
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </button>

              <button
                className="remove-button"
                onClick={removeImage}
              >
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">↑</div>

            <h3>Upload Your Figure Image</h3>

            <p>
              Drag and drop an image here,
              or click the button below.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Image
            </button>

            <span className="upload-hint">
              JPG, PNG, WEBP · Max 10 MB
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="error-message">{error}</p>
      )}

  {image && (
    <div className="recognition-section">
      <button
        className="identify-button"
        onClick={handleIdentify}
        disabled={isIdentifying}
      >
        {isIdentifying ? (
          <>
            <span className="spinner"></span>
            Identifying...
          </>
        ) : (
          'Identify Figure'
        )}
      </button>

      {recognitionMessage && (
        <p className="recognition-message">
          {recognitionMessage}
        </p>
      )}
    </div>
  )}

    </div>
  )
}

export default App

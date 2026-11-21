
import { useRef, useState, useEffect } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import './App.css'

// AI 识别结果的数据类型
type FigureResult = {
  character: string | null
  series: string | null
  manufacturer: string | null
  scale: string | null
  description: string | null
}

// 数据库商品的数据类型
type FigureProduct = {
  id: number
  name: string
  character: string
  series: string
  manufacturer: string | null
  scale: string | null
  price: number | null
}

const API_BASE_URL = 'http://127.0.0.1:8000'

function App() {
  // 用户选择的图片
  const [image, setImage] = useState<File | null>(null)

  // 图片预览地址
  const [preview, setPreview] = useState<string | null>(null)

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false)

  // 错误提示
  const [error, setError] = useState('')

  // AI 识别状态
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [recognitionMessage, setRecognitionMessage] = useState('')

  // AI 识别结果
  const [figureResult, setFigureResult] =
    useState<FigureResult | null>(null)

  // 数据库候选商品
  const [matchedFigures, setMatchedFigures] =
    useState<FigureProduct[]>([])

  // 数据库搜索状态
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  // 当前选择的手办
  const [selectedFigureId, setSelectedFigureId] = useState<number | null>(null)

  // 文件选择输入框
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 用于防止旧请求覆盖新图片的结果
  const requestIdRef = useRef(0)

  // 图片变化时创建预览 URL
  useEffect(() => {
    if (!image) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(image)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [image])

  // 清除之前的识别结果
  const clearResults = () => {
    requestIdRef.current += 1
    setFigureResult(null)
    setMatchedFigures([])
    setSelectedFigureId(null)
    setRecognitionMessage('')
    setSearchError('')
    setIsSearching(false)
    setIsIdentifying(false)
  }

  // 验证并保存图片
  const handleImage = (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
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
    clearResults()
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

    if (
      !event.currentTarget.contains(
        event.relatedTarget as Node
      )
    ) {
      setIsDragging(false)
    }
  }

  // 放下图片
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
    clearResults()
    setImage(null)
    setError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // AI 识别 + 数据库搜索
  const handleIdentify = async () => {
    if (!image || isIdentifying) return

    const requestId = ++requestIdRef.current

    setIsIdentifying(true)
    setRecognitionMessage('')
    setFigureResult(null)
    setMatchedFigures([])
    setSelectedFigureId(null)
    setSearchError('')
    setIsSearching(false)

    try {
      // 1. 将图片上传到 FastAPI
      const formData = new FormData()
      formData.append('file', image)

      const response = await fetch(
        `${API_BASE_URL}/api/identify`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const result = await response.json()

      if (requestId !== requestIdRef.current) return

      if (!response.ok) {
        throw new Error(
          result.detail || 'Image recognition failed'
        )
      }

      // 2. 保存 AI 识别结果
      const recognizedFigure: FigureResult = result.result

      setFigureResult(recognizedFigure)
      setRecognitionMessage(
        'Figure identified successfully!'
      )

      // 3. 根据角色名称搜索数据库
      const character = recognizedFigure.character

      if (character) {
        setIsSearching(true)

        try {
          const searchResponse = await fetch(
            `${API_BASE_URL}/api/figures?character=${encodeURIComponent(character)}`
          )

          if (!searchResponse.ok) {
            throw new Error('Failed to search figure database')
          }

          const searchResult = await searchResponse.json()

          if (requestId !== requestIdRef.current) return

          console.log('Database search result:', searchResult)

          // 4. 保存数据库返回的候选商品
          setMatchedFigures(searchResult.figures ?? [])
        } catch (searchErr) {
          if (requestId !== requestIdRef.current) return

          console.error('Database search error:', searchErr)

          setSearchError(
            searchErr instanceof Error
              ? searchErr.message
              : 'Database search failed'
          )
        } finally {
          if (requestId === requestIdRef.current) {
            setIsSearching(false)
          }
        }
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return

      console.error('API Error:', err)

      setRecognitionMessage(
        err instanceof Error
          ? err.message
          : 'Failed to connect to the server.'
      )
    } finally {
      if (requestId === requestIdRef.current) {
        setIsIdentifying(false)
      }
    }
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

      {/* 图片上传区域 */}
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

      {/* 图片格式错误 */}
      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* 识别按钮与结果 */}
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

          {/* AI 识别结果 */}
          {figureResult && (
            <section className="figure-result">
              <h2>AI Recognition Result</h2>

              <p>
                <strong>Character:</strong>{' '}
                {figureResult.character ?? 'Unknown'}
              </p>

              <p>
                <strong>Series:</strong>{' '}
                {figureResult.series ?? 'Unknown'}
              </p>

              <p>
                <strong>Manufacturer:</strong>{' '}
                {figureResult.manufacturer ?? 'Unknown'}
              </p>

              <p>
                <strong>Scale:</strong>{' '}
                {figureResult.scale ?? 'Unknown'}
              </p>

              <p>
                <strong>Description:</strong>{' '}
                {figureResult.description ?? 'No description'}
              </p>
            </section>
          )}


{/* 数据库候选商品 */}
{figureResult && (
  <section className="matches-section">
    <h2>Possible Figure Matches</h2>

    {isSearching ? (
      <p>Searching figure database...</p>
    ) : searchError ? (
      <p className="error-message">{searchError}</p>
    ) : matchedFigures.length === 0 ? (
      <p>No matching figures found in database.</p>
    ) : (
      <div className="matches-grid">
        {matchedFigures.map((figure) => (
          <div className="figure-match" key={figure.id}>
            <h3>{figure.name}</h3>

            <p>
              <strong>Character:</strong> {figure.character}
            </p>

            <p>
              <strong>Series:</strong> {figure.series}
            </p>

            <p>
              <strong>Manufacturer:</strong>{' '}
              {figure.manufacturer ?? 'Unknown'}
            </p>

            <p>
              <strong>Scale:</strong>{' '}
              {figure.scale ?? 'Unknown'}
            </p>

            <p className="figure-price">
              {typeof figure.price === 'number'
                ? `CA$${figure.price.toFixed(2)}`
                : 'Price unavailable'}
            </p>
            <p className="price-note">Demo price · Not a live offer</p>

            <button
              className="select-figure-button"
              type="button"
              aria-pressed={selectedFigureId === figure.id}
              onClick={() => setSelectedFigureId(figure.id)}
            >
              {selectedFigureId === figure.id
                ? 'Selected ✓'
                : 'Select This Figure'}
            </button>
          </div>
        ))}
      </div>
    )}
  </section>
)}

        </div>
      )}
    </div>
  )
}

export default App

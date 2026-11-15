
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FigureLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "FigureLens API is running!"}


@app.post("/api/identify")
async def identify_figure(file: UploadFile = File(...)):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format"
        )

    max_size = 10 * 1024 * 1024
    content = await file.read(max_size + 1)

    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail="Image exceeds 10 MB"
        )

    return {
        "success": True,
        "filename": file.filename,
        "size": len(content),
        "message": "Image received successfully",
    }

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 1. CORS Setup (The "Permission" Bridge)
# This allows our Frontend (port 3000) to talk to our Backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "NexusDoc API is running"}

# 2. The Upload Endpoint
@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # For now, we just print the name and return a success message
    # In the next milestone, this is where we will process the PDF
    print(f"Received file: {file.filename}")
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "status": "Successfully received"
    }
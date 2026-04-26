# NexusDoc AI: Full-Stack RAG Document Assistant

NexusDoc AI is a **Retrieval-Augmented Generation (RAG)** platform that allows users to upload documents (PDF/DOCX), index them into a high-performance vector database, and have context-aware conversations with their data.

## Live Links
* **Frontend (Vercel):** [https://nexus-doc-ai.vercel.app]
* **Backend API (Render):** [https://nexus-doc-ai.onrender.com]
* **API Documentation:** [https://nexus-doc-ai.onrender.com/docs]

> **Note on Demo Performance:** This project is hosted on **Free Tier** services (Render/Neon). 
> * **Cold Starts:** The backend may take **50-90 seconds** to "spin up" after a period of inactivity.
> * **Resource Limits:** The system is optimized for low-memory usage (under 512MB RAM) using API-based embeddings.

---

## Tech Stack

### Backend (Python/FastAPI)
* **Core:** FastAPI, Python 3.13, `uv` package manager.
* **AI/RAG:** LangChain, Groq (Llama 3.1), Hugging Face Inference API.
* **Vector DB:** Pinecone.
* **Database:** PostgreSQL (Managed by Neon), SQLAlchemy ORM, Alembic migrations.
* **Storage:** Cloudinary (Document hosting).
* **Auth:** JWT (JSON Web Tokens) with `passlib` & `bcrypt`.

### Frontend (Next.js/TypeScript)
* **Core:** Next.js 14/15 (App Router), TypeScript.
* **Styling:** Tailwind CSS.
* **State Management:** React Hooks & Context API.
* **Networking:** Axios / TanStack Query.

---

## Features
* **AI Document Indexing:** Upload PDFs/DOCX to Cloudinary; text is automatically extracted, chunked, and vectorized.
* **Contextual Chat:** Chat with uploaded documents using Llama 3.1, with the system only answering based on the provided context.
* **Efficient Memory Management:** Uses API-based embedding endpoints to maintain a small server footprint.
* **Authentication:** Secure user registration and login.
* **Modern DevOps:** Managed with `uv` for lightning-fast dependency resolution and deterministic builds.

---

## Architecture
The system follows a modular **Service-Repository** pattern:
1.  **Endpoints:** Handle HTTP requests (FastAPI).
2.  **Services:** Business logic (Document processing, AI RAG chain, Cloudinary integration).
3.  **Repositories:** Database abstraction (SQLAlchemy).
4.  **Vector Store:** External indexing (Pinecone).

---

## Demo Access
To explore the platform:
* **Email:** `admin@nexus.com`
* **Password:** `@NexusAI2026!`
*(Please do not upload sensitive personal documents to the demo account.)*

---

## ⚙️ Local Setup

1.  **Clone the Repo:**
    ```bash
    git clone [https://github.com/yourusername/nexus-doc-ai.git](https://github.com/yourusername/nexus-doc-ai.git)
    cd nexus-doc-ai/backend
    ```
2.  **Install Dependencies (using uv):**
    ```bash
    uv sync
    ```
3.  **Environment Variables:**
    Create a `.env` file in the `backend` folder with:
    * `DATABASE_URL`, `GROQ_API_KEY`, `HUGGINGFACE_API_TOKEN`, `PINECONE_API_KEY`, `CLOUDINARY_URL`.
4.  **Run Migrations:**
    ```bash
    uv run alembic upgrade head
    ```
5.  **Start the Server:**
    ```bash
    uv run uvicorn app.main:app --reload
    ```

---

## License
This project is proprietary and intended for portfolio demonstration purposes. Not licensed for commercial redistribution.

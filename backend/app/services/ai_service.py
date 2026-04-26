import os

from langchain_core.messages import HumanMessage, AIMessage
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from configs.settings import settings

class AIService:
    def __init__(self):
        self.embeddings = HuggingFaceInferenceAPIEmbeddings(
            api_key=settings.huggingface_api_token,
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.llm = ChatGroq(
            temperature=0.1,
            model_name="llama-3.1-8b-instant", 
            groq_api_key=settings.groq_api_key
        )
        self.index_name = "nexus-doc"

    async def process_and_index(self, file_path: str):
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_documents(docs)
        
        PineconeVectorStore.from_documents(
            chunks, 
            self.embeddings, 
            index_name=self.index_name
        )
        return len(chunks)

    async def chat(self, question: str, history: list = None):
        """
        history: List of dictionaries [{'role': 'user', 'content': '...'}, ...]
        """
        vectorstore = PineconeVectorStore(index_name=self.index_name, embedding=self.embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        
        # 1. Format history for the prompt
        formatted_history = []
        if history:
            # Only take the last 6 messages to keep context window clean
            for msg in history[-6:]:
                if msg['role'] == 'user':
                    formatted_history.append(HumanMessage(content=msg['content']))
                else:
                    formatted_history.append(AIMessage(content=msg['content']))

        # 2. Advanced Prompt with System Instructions
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are NexusDoc Intelligence. Answer the user's question using only the provided context. If the answer isn't in the context, say you don't know."),
            ("placeholder", "{chat_history}"),
            ("user", "Context:\n{context}\n\nQuestion: {input}")
        ])
        
        # 3. Retrieve relevant documents
        docs = retriever.invoke(question)
        context = "\n\n".join(d.page_content for d in docs)
        
        # 4. Run Chain
        chain = prompt | self.llm
        response = chain.invoke({
            "context": context, 
            "input": question,
            "chat_history": formatted_history
        })
        
        return {
            "answer": response.content,
            "sources": list(set([os.path.basename(d.metadata.get("source", "Unknown")) for d in docs]))
        }
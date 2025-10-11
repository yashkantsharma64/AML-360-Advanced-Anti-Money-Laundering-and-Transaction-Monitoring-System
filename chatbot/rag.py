from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_ollama import OllamaLLM

llm = OllamaLLM(model="llama3.1:8b")
import pandas as pd

file_path = ('./usd_amount_dataset_with_score.csv')
data = pd.read_csv(file_path)

loader = CSVLoader(file_path=file_path)
docs = loader.load_and_split()

from langchain_huggingface import HuggingFaceEmbeddings
import faiss
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

dim = len(embeddings.embed_query(" "))

index = faiss.IndexFlatL2(dim)

vector_store = FAISS(
    embedding_function=embeddings,
    index=index,
    docstore=InMemoryDocstore(),
    index_to_docstore_id={}
)

vector_store.add_documents(documents=docs)

from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

retriever = vector_store.as_retriever()

system_prompt = (
    "You are an assistant for question-answering tasks using RAG from a .csv file. "
    "Use the following pieces of retrieved context to answer "
    "the question. Since this is a csv file then you may be asked to look a specific attribute (eg. transaction_id) and return some other attribute from the file so search in the same entry for this task. Also you may be asked to count the number of entries on a specific condition (eg. give all the entries where transaction_type is 'NEFT'), then you have to look at the whole file and count. "
    "The suspicious_flag is 1 (transaction is suspicious) if the total score is greater than 3 otherwise it is safe. If you don't know the answer, say that you "
    "don't know. Use three sentences maximum and keep the "
    "answer concise."
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
    
])

question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

query = "What was the transaction with transaction_id 'f207dcd6-f136-44ea-9d0c-a091d8494005' suspicious?"

answer= rag_chain.invoke({"input": query})
print(answer['answer'])
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { LangChainAdapter } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  GOOGLE_API_KEY,
} = process.env;

// Initialize Gemini 2.0 Flash for the chat model
const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: GOOGLE_API_KEY,
});

// Initialize Gemini for the embedding model
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  apiKey: GOOGLE_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// Rate limiting variables to manage API calls
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2-second delay between requests

export async function POST(req: Request) {
  try {
    // Implement request throttling to prevent quota exhaustion
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    
    lastRequestTime = Date.now();

    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    let docContext = "";

    // Generate embedding for the user's query using the Gemini embedding model
    const embedding = await embeddings.embedQuery(latestMessage);

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding,
        },
        limit: 5, // Retrieve 5 most relevant documents
      });

      const documents = await cursor.toArray();
      const docsMap = documents?.map(doc => doc.text);
      docContext = JSON.stringify(docsMap);
      
      // Truncate context to save tokens on the API call
      const maxContextLength = 2000;
      if (docContext.length > maxContextLength) {
        docContext = docContext.substring(0, maxContextLength) + "...";
      }
    } catch (err) {
      console.error("Error querying the database:", err);
      docContext = ""; // Proceed without context if the DB query fails
    }

    const template = {
      role: "system",
      content: `You are an AI assistant who knows everything about Formula One.
Use the below context to augment what you know about Formula One racing.
The context will provide you with the most recent page data from Wikipedia,
the official F1 website, and others.
If the context doesn't include the information you need, answer based on your
existing knowledge and don't mention the source of your information or
what the context does or doesn't include.
Format responses using markdown where applicable and don't return images.

----------------
START CONTEXT
${docContext}
END CONTEXT
----------------

QUESTION: ${latestMessage}
----------------`
    };

    // Use Gemini 2.0 Flash for response generation
    try {
      const stream = await gemini.stream([template, ...messages]);
      // Use LangChainAdapter for proper streaming response
      return LangChainAdapter.toDataStreamResponse(stream);
    } catch (err) {
      // Handle rate limiting gracefully
      if ((err as any).status === 429) {
        return new Response(
          JSON.stringify({
            error: "I'm currently experiencing high demand. Please try again in a few minutes."
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      throw err;
    }

  } catch (err) {
    console.error("Error in chat route:", err);
    
    // Provide a generic fallback response for any unhandled errors
    return new Response(
      JSON.stringify({
        error: "Sorry, I encountered an issue processing your F1 question. Please try again."
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}



















// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
// import { LangChainAdapter } from "ai";
// import { DataAPIClient } from "@datastax/astra-db-ts";

// const {
//   ASTRA_DB_NAMESPACE,
//   ASTRA_DB_COLLECTION,
//   ASTRA_DB_API_ENDPOINT,
//   ASTRA_DB_APPLICATION_TOKEN,
//   GOOGLE_API_KEY
// } = process.env;

// // Initialize Gemini 2.0 Flash chat model
// const gemini = new ChatGoogleGenerativeAI({
//   model: "gemini-2.0-flash", // Updated to Gemini 2.0 Flash
//   temperature: 0,
//   apiKey: GOOGLE_API_KEY,
// });

// // Initialize BGE embedding model
// const embeddings = new HuggingFaceTransformersEmbeddings({
//   model: "BAAI/bge-large-en-v1.5", // 1024 dimensions
// });

// const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
// const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// // Rate limiting variables
// let lastRequestTime = 0;
// const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

// export async function POST(req: Request) {
//   try {
//     // Implement request throttling to prevent quota exhaustion
//     const now = Date.now();
//     const timeSinceLastRequest = now - lastRequestTime;
    
//     if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
//       await new Promise(resolve => 
//         setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
//       );
//     }
    
//     lastRequestTime = Date.now();

//     const { messages } = await req.json();
//     const latestMessage = messages[messages.length - 1].content;

//     let docContext = "";

//     // Generate embedding using BGE model
//     const embedding = await embeddings.embedQuery(latestMessage);

//     try {
//       const collection = await db.collection(ASTRA_DB_COLLECTION);
//       const cursor = collection.find(null, {
//         sort: {
//           $vector: embedding,
//         },
//         limit: 5 // Reduced from 10 to 5 as requested
//       });

//       const documents = await cursor.toArray();
//       const docsMap = documents?.map(doc => doc.text);
//       docContext = JSON.stringify(docsMap);
      
//       // Truncate context if too long to save tokens
//       const maxContextLength = 2000;
//       if (docContext.length > maxContextLength) {
//         docContext = docContext.substring(0, maxContextLength) + "...";
//       }
//     } catch (err) {
//       console.log("Error querying DB...");
//       docContext = "";
//     }

//     const template = {
//       role: "system",
//       content: `You are an AI assistant who knows everything about Formula One.
// Use the below context to augment what you know about Formula One racing.
// The context will provide you with the most recent page data from wikipedia,
// the official F1 website and others.
// If the context doesn't include the information you need answer based on your
// existing knowledge and don't mention the source of your information or
// what the context does or doesn't include.
// Format responses using markdown where applicable and don't return images.

// ----------------
// START CONTEXT
// ${docContext}
// END CONTEXT
// ----------------

// QUESTION: ${latestMessage}
// ----------------`
//     };

//     // Use Gemini 2.0 Flash for response generation with error handling
//     try {
//       const stream = await gemini.stream([template, ...messages]);
//       return LangChainAdapter.toDataStreamResponse(stream);
//     } catch (err) {
//       // Handle rate limiting gracefully
//       if (err.status === 429) {
//         return new Response(
//           JSON.stringify({
//             error: "I'm currently experiencing high demand. Please try again in a few minutes, or ask a simpler question about Formula One."
//           }),
//           { 
//             status: 200, 
//             headers: { 'Content-Type': 'application/json' } 
//           }
//         );
//       }
//       throw err;
//     }

//   } catch (err) {
//     console.error("Error in chat route:", err);
    
//     // Provide fallback response for any errors
//     return new Response(
//       JSON.stringify({
//         error: "Sorry, I encountered an issue processing your F1 question. Please try again."
//       }),
//       { 
//         status: 500, 
//         headers: { 'Content-Type': 'application/json' } 
//       }
//     );
//   }
// }


















// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
// // import { GoogleGenerativeAIStream, StreamingTextResponse } from "ai";
// import { GoogleGenerativeAIStream, StreamingTextResponse } from "@ai-sdk/streaming"; 

// import { DataAPIClient } from "@datastax/astra-db-ts";

// const {
//   ASTRA_DB_NAMESPACE,
//   ASTRA_DB_COLLECTION,
//   ASTRA_DB_API_ENDPOINT,
//   ASTRA_DB_APPLICATION_TOKEN,
//   GOOGLE_API_KEY
// } = process.env;

// // Initialize Gemini chat model
// const gemini = new ChatGoogleGenerativeAI({
//   model: "gemini-1.5-pro",
//   temperature: 0,
//   apiKey: GOOGLE_API_KEY,
//   streaming: true,
// });

// // Initialize BGE embedding model
// const embeddings = new HuggingFaceTransformersEmbeddings({
//   model: "BAAI/bge-large-en-v1.5", // 1024 dimensions
// });

// const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
// const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// export async function POST(req: Request) {
//   try {
//     const { messages } = await req.json();
//     const latestMessage = messages[messages.length - 1].content;

//     let docContext = "";

//     // Generate embedding using BGE model
//     const embedding = await embeddings.embedQuery(latestMessage);

//     try {
//       const collection = await db.collection(ASTRA_DB_COLLECTION);
//       const cursor = collection.find(null, {
//         sort: {
//           $vector: embedding,
//         },
//         limit: 10
//       });

//       const documents = await cursor.toArray();
//       const docsMap = documents?.map(doc => doc.text);
//       docContext = JSON.stringify(docsMap);
//     } catch (err) {
//       console.log("Error querying DB...");
//       docContext = "";
//     }

//     const template = {
//       role: "system",
//       content: `You are an AI assistant who knows everything about Formula One.
// Use the below context to augment what you know about Formula One racing.
// The context will provide you with the most recent page data from wikipedia,
// the official F1 website and others.
// If the context doesn't include the information you need answer based on your
// existing knowledge and don't mention the source of your information or
// what the context does or doesn't include.
// Format responses using markdown where applicable and don't return images.

// ----------------
// START CONTEXT
// ${docContext}
// END CONTEXT
// ----------------

// QUESTION: ${latestMessage}
// ----------------`
//     };

//     // Use Gemini for response generation
//     const response = await gemini.stream([template, ...messages]);
    
//     // Convert to streaming response
//     const stream = GoogleGenerativeAIStream(response);
//     return new StreamingTextResponse(stream);

//   } catch (err) {
//     console.error("Error in chat route:", err);
//     throw err;
//   }
// }








// import OpenAI from "openai"
// import { OpenAIStream, StreamingTextResponse} from "ai" 
// import { DataAPIClient } from "@datastax/astra-db-ts"


// const {
// ASTRA_DB_NAMESPACE,
// ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT,
// ASTRA_DB_APPLICATION_TOKEN, 
// OPENAI_API_KEY
// } = process. env

// const openai = new OpenAI ({apiKey: OPENAI_API_KEY});

// const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
// const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE});

// export async function POST(req: Request) {
//     try{
//         const {messages} = await req.json();
//         const latestMessage = messages[messages.length - 1].content

//         let docContext = ""

//         const embedding = await openai.embeddings.create({
//             model: "text-embedding-3-small",
//             input: latestMessage,
//             encoding_format: "float"
//         })

//         try {
//             const collection = await db.collection(ASTRA_DB_COLLECTION)
//             const cursor = collection.find(null, {
//                 sort: {
//                     $vector: embedding.data[0].embedding,
//                 },
//                 limit: 10
//             })

//             const documents = await cursor.toArray()
            
//             const docsMap = documents?.map(doc => doc.text)

//             docContext = JSON.stringify(docsMap)
        
//         } catch (err) {
//             console.log("Error quering DB...")
//             docContext = ""
//         }

//         const template = {
//             role: "system",
//             content: `You are an AI assistant who knows everything about Formula One. 
//             Use the below context to augment what you know about Formula One racing. 
//             The context will provide you with the most recent page data from wikipedia, 
//             the official F1 website and others. 
//             If the context doesn't include the information you need answer based on your 
//             existing knowledge and don't mention the source of your information or 
//             what the context does or doesn't include.
//             Format responses using markdown where applicable and don't return images.'

//             ----------------
//             START CONTEXT
//             ${docContext}
//             END CONTEXT
//             ----------------
//             QUESTION: ${latestMessage}
//             ----------------
//         `
//         }

//         const response = await openai.chat.completions.create({
//             model: "gpt-4",
//             stream: true,
//             messages: [template, ...messages],
//         })

//         const stream = OpenAIStream(response);
//         return new StreamingTextResponse(stream);
//     } catch (err) {
//         throw err
//     }

// }

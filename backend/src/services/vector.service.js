// Import the Pinecone library
const { Pinecone } =require("@pinecone-database/pinecone");

// Initialize a Pinecone client with your API key
const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME || "brainstackai";

const pc = new Pinecone({ apiKey });

// Create or connect to an index name : brainstackai

const brainstackaiIndex = pc.index(indexName);

async function createMemory({ vectors, metadata, messageId }){
    if (!Array.isArray(vectors) || vectors.length === 0) {
        throw new Error("Cannot upsert memory: embedding vector is empty or missing")
    }

    await brainstackaiIndex.upsert({
        records: [
            {
                id: messageId,
                values: vectors,
                metadata: metadata
            }
        ]
    })
}


async function queryMemory({queryVector,limit = 5, metadata}){ // limit for number of results 
    const data = await brainstackaiIndex.query({
        vector: queryVector,
        topK: limit, // limit number of results
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })

    return data.matches;
}


module.exports = {
    createMemory,
    queryMemory
}


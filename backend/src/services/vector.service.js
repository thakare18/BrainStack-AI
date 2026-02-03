// Import the Pinecone library
const { Pinecone } =require("@pinecone-database/pinecone");

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create or connect to an index name : brainstackai

const brainstackaiIndex = pc.Index("brainstackai");

async function createMemory(vectors,metadata,messageId){
    await brainstackaiIndex.upsert({
        id : messageId,
        values : vectors,
        metadata : metadata
    })
}


async function queryMemory({queryVector,limit = 5, metadata}){ // limit for number of results 
    const data = await brainstackaiIndex.query({
        vector: queryVector,
        topk: limit, // limit number of results
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })

    return data.matches;
}


module.exports = {
    createMemory,
    queryMemory
}


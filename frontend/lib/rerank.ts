import 'server-only';

let vectorHost = '';
// Let open source users could one click deploy
if (process.env.VECTOR_HOST) {
    vectorHost = process.env.VECTOR_HOST;
} else if (process.env.MEMFREE_HOST) {
    vectorHost = process.env.MEMFREE_HOST;
} else {
    throw new Error('Neither MEMFREE_HOST nor VECTOR_HOST is defined');
}

export async function rerank(query: string, documents: string[]) {
    const url = `${vectorHost}/embedding/rerank`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.API_TOKEN!,
        },
        body: JSON.stringify({
            query,
            documents,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.top_docs;
}

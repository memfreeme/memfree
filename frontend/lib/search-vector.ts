const VECTOR_HOST = process.env.VECTOR_HOST;

export async function searchVector(userId: string, query: string) {
    const url = `${VECTOR_HOST}/api/vector/search`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: process.env.API_TOKEN!,
            },
            body: JSON.stringify({
                userId,
                query,
            }),
        });
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('fetch failed:', error);
        return null;
    }
}

export async function rerank(query: string, documents: string[]) {
    const url = `${VECTOR_HOST}/embedding/rerank`;
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

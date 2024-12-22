
interface PresignedResponse {
    url: string;
    file: string;
}

class UploadError extends Error {
    constructor(
        message: string,
        public fileName: string,
    ) {
        super(message);
        this.name = 'UploadError';
    }
}

export interface UploadedFile {
    name: string;
    url: string;
    type: string;
}

export async function getPresignedUrl(filename: string): Promise<PresignedResponse> {
    const response = await fetch(`/api/pre-signed`, {
        method: 'POST',
        body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
        throw new UploadError(`Failed to get presigned URL`, filename);
    }

    return response.json();
}

export async function uploadFileToR2(presignedUrl: string, file: File): Promise<void> {
    const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });

    if (!response.ok) {
        throw new UploadError('Upload failed', file.name);
    }
}

export async function uploadSingleFile(file: File): Promise<UploadedFile> {
    const presignedData = await getPresignedUrl(file.name);
    await uploadFileToR2(presignedData.url, file);
    return {
        name: file.name,
        url: `https://image.memfree.me/${presignedData.file}`,
        type: file.type,
    };
}
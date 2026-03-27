export async function validateAudioBlob(blob: Blob): Promise<boolean> {
    // First, check the MIME type of the blob
    if (!blob.type.startsWith('audio/')) {
        return false;
    }

    // Try loading the blob as an audio element to ensure it's a valid audio file
    return new Promise((resolve) => {
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);

        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(audio.src); // Clean up the object URL
            // If metadata loads successfully, it's a valid audio file
            resolve(true);
        };

        audio.onerror = () => {
            URL.revokeObjectURL(audio.src); // Clean up the object URL
            // If there's an error loading the audio, it's not valid
            resolve(false);
        };
    });
}

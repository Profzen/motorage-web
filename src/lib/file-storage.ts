import { unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Deletes a file from the public directory given its relative URL.
 * Example: "/uploads/2026/01/123456-file.pdf"
 */
export async function deletePublicFile(fileUrl: string): Promise<boolean> {
    try {
        if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
            return false;
        }

        // Remove the leading slash and join with current working directory and public
        const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
        const absolutePath = join(process.cwd(), 'public', relativePath);

        await unlink(absolutePath);
        return true;
    } catch (error) {
        console.error(`Error deleting file: ${fileUrl}`, error);
        return false;
    }
}

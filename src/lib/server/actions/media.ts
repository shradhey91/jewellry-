

'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import mime from 'mime-types';

const BASE_UPLOADS_DIR = path.join(process.cwd(), 'public');

export type MediaFile = {
  url: string;
  name: string;
  type: 'image' | 'video' | 'other';
};

async function ensureDirExists(dir: string) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

export async function uploadFileAction(formData: FormData): Promise<{ success: boolean; url?: string; message: string }> {
    const file = formData.get('file') as File | null;
    const subfolder = formData.get('subfolder') as string || 'uploads';

    if (!file) {
        return { success: false, message: 'No file provided.' };
    }
    
    // Basic validation to prevent path traversal
    if (subfolder.includes('..') || subfolder.startsWith('/')) {
         return { success: false, message: 'Invalid subfolder path.' };
    }

    const UPLOADS_DIR = path.join(BASE_UPLOADS_DIR, subfolder);

    try {
        await ensureDirExists(UPLOADS_DIR);
        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const filePath = path.join(UPLOADS_DIR, filename);

        await fs.writeFile(filePath, buffer);

        const publicUrl = `/${subfolder}/${filename}`;
        
        revalidatePath('/admin/media');

        return { success: true, url: publicUrl, message: 'File uploaded successfully.' };
    } catch (error) {
        console.error('File upload failed:', error);
        return { success: false, message: 'File upload failed.' };
    }
}

export async function getUploadedMedia(): Promise<MediaFile[]> {
    try {
        const allMedia: MediaFile[] = [];
        const uploadDirs = ['uploads', 'themes', 'megamenu']; // Scan base dirs

        // Recursive function to scan directories
        const scanDir = async (currentPath: string, relativePath: string) => {
            try {
                await fs.access(currentPath);
                const entries = await fs.readdir(currentPath, { withFileTypes: true });

                for (const entry of entries) {
                    if (entry.name === '.gitkeep') continue;

                    const fullEntryPath = path.join(currentPath, entry.name);
                    const newRelativePath = path.join(relativePath, entry.name);

                    if (entry.isDirectory()) {
                        await scanDir(fullEntryPath, newRelativePath);
                    } else {
                        const mimeType = mime.lookup(fullEntryPath) || 'application/octet-stream';
                        let type: MediaFile['type'] = 'other';
                        if (mimeType.startsWith('image/')) {
                            type = 'image';
                        } else if (mimeType.startsWith('video/')) {
                            type = 'video';
                        }
                        allMedia.push({
                            url: `/${newRelativePath.replace(/\\/g, '/')}`, // Ensure forward slashes for URL
                            name: entry.name,
                            type,
                        });
                    }
                }
            } catch (error) {
                 if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    console.error(`Failed to read from media directory ${currentPath}:`, error);
                }
            }
        };

        for (const dir of uploadDirs) {
            await scanDir(path.join(BASE_UPLOADS_DIR, dir), dir);
        }
        
        allMedia.sort((a, b) => {
            const timeA = parseInt(a.name.split('-')[0]);
            const timeB = parseInt(b.name.split('-')[0]);
            if (isNaN(timeA) || isNaN(timeB)) return 0;
            return timeB - timeA;
        });

        return allMedia;
    } catch (error) {
        console.error('Failed to get uploaded media:', error);
        return [];
    }
}

export async function deleteFileAction(fileUrl: string): Promise<{ success: boolean; message: string }> {
    if (!fileUrl.startsWith('/')) {
        return { success: false, message: 'Invalid file path.' };
    }

    try {
        const filePath = path.join(process.cwd(), 'public', fileUrl);
        await fs.unlink(filePath);
        revalidatePath('/admin/media');
        return { success: true, message: 'File deleted successfully.' };
    } catch (error) {
        console.error('File deletion failed:', error);
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return { success: false, message: 'File not found.' };
        }
        return { success: false, message: 'Failed to delete file.' };
    }
}

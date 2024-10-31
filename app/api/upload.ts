// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filter: part => part.mimetype?.includes('image') || false,
  });

  try {
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const fileField = files.file;
    const folderField = fields.folder;

    if (!fileField || !folderField) {
      return res.status(400).json({ message: 'File or folder missing' });
    }

    // Handle potential array of files
    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    // Handle potential array of folder names
    const folder = Array.isArray(folderField) ? folderField[0] : folderField;

    if (!file || !folder) {
      return res.status(400).json({ message: 'File or folder is missing' });
    }

    const fileName = `${Date.now()}_${file.originalFilename}`;
    const newPath = path.join(uploadDir, folder, fileName);

    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.rename(file.filepath, newPath);

    const fileUrl = `/uploads/${folder}/${fileName}`;
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
}
// utils/fileUpload.ts

import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

export async function uploadFileToServer(
  file: File | null,
  folder: string
): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  // Generate a unique filename
  const filename = `${uuidv4()}${path.extname(file.name)}`;

  // Ensure the upload directory exists
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  // Read file content as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write the file to the server
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);

  // Return the public URL of the uploaded file
  return `/uploads/${folder}/${filename}`;
}

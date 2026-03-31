import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'
import fs from 'fs'

const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE ?? '52428800', 10)

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${randomUUID()}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
})

export function getUploadPath(storedName: string): string {
  return path.join(uploadDir, storedName)
}

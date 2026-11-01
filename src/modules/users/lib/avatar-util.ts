import { RequestHandler } from "express";
import multer from "multer";

import { HTTP_STATUS } from "../../../shared/constants";
import { AppError } from "../../../shared/utils/error.util";
import { In_AvatarImageType, In_DTO_UserExportRow } from "../dto";

export const AVATAR_IMAGE_TYPES: readonly In_AvatarImageType[] = [
  {
    mimeType: "image/jpeg",
    extension: "jpg",
    matches: (buffer) => startsWith(buffer, [0xff, 0xd8, 0xff]),
  },
  {
    mimeType: "image/png",
    extension: "png",
    matches: (buffer) =>
      startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    mimeType: "image/gif",
    extension: "gif",
    matches: (buffer) =>
      ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6)),
  },
  {
    mimeType: "image/webp",
    extension: "webp",
    matches: (buffer) =>
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP",
  },
];

export const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
export const AVATAR_ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set(
  AVATAR_IMAGE_TYPES.map(({ mimeType }) => mimeType),
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_SIZE, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (AVATAR_ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(
      new AppError(
        "File harus berupa gambar JPEG, PNG, GIF, atau WEBP.",
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ),
    );
  },
}).single("avatar");

const toUploadError = (error: unknown): unknown => {
  if (!(error instanceof multer.MulterError)) {
    return error;
  }
  const message =
    error.code === "LIMIT_FILE_SIZE"
      ? `Ukuran avatar maksimal ${AVATAR_MAX_SIZE / 1024 / 1024} MB.`
      : "Upload avatar tidak valid.";
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

export const avatarUpload: RequestHandler = (req, res, next) => {
  upload(req, res, (error: unknown) =>
    next(error ? toUploadError(error) : undefined),
  );
};

const startsWith = (buffer: Buffer, bytes: number[]): boolean =>
  buffer.length >= bytes.length &&
  bytes.every((byte, index) => buffer[index] === byte);

/** Mendeteksi tipe gambar dari isi file; `undefined` bila bukan gambar yang didukung. */
export const detectAvatarType = (
  buffer: Buffer,
): In_AvatarImageType | undefined =>
  AVATAR_IMAGE_TYPES.find(({ matches }) => matches(buffer));

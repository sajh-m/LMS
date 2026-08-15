import { deleteCloudinaryImage } from "../middlewares/upload.js";

// Drop-in replacement for the old local-file deletion.
// Every caller (bookService, bookController) already uses this function,
// so we just swap the implementation here with no other changes needed.
export async function deleteUploadedFile(imageUrl) {
  await deleteCloudinaryImage(imageUrl);
}

import { deleteImage } from "../middlewares/upload.js";

// Every caller in bookService already uses this exact function name -
// keeping it stable here means switching storage modes never requires
// touching bookService.js at all.
export async function deleteUploadedFile(imageRef) {
  await deleteImage(imageRef);
}

import { Key } from "../schemas/core/utils/key";

function generateUUID(): Key {
  return crypto.randomUUID();
}

export default generateUUID;

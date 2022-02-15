import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Gets the root absolute path of the project
 * @returns the root path of the project
 */
export const getRootDirectory = () => {
  return join(__dirname, "../../");
};

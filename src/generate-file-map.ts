import path from 'path';

/**
 * Generates a file map for resolved file paths.
 * @param {string[]} filePaths - An array of file paths resolved by glob patterns.
 * @param {string} prefix - An optional prefix for file keys.
 * @returns {Record<string, string>} - A map of file keys to file paths.
 */
export default function generateFileMap(filePaths: string[], prefix = '') {
    const result = {} as Record<string, string>;

    filePaths.forEach((filePath) => {
        const relativePath = path.relative(process.cwd(), filePath); // Normalize to relative path
        const key = `${prefix}${relativePath}`; // Use full relative path as the key
        result[key] = relativePath; // Add to the result map
    });

    return result;
}

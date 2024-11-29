import fs from 'fs';
import path from 'path';

export default function generateFileMap(dir: string, prefix = '') {
    const result = {} as Record<string, string>;
    if (!fs.existsSync(dir)) {
        console.warn(`Directory not found: ${dir}`);
        return result;
    }

    const entries = fs.readdirSync(dir);

    entries.forEach((entry) => {
        const entryPath = path.join(dir, entry);
        const stats = fs.statSync(entryPath);

        if (stats.isDirectory()) {
            // Recursively handle subdirectories
            Object.assign(result, generateFileMap(entryPath, `${prefix}${entry}/`));
        } else {
            const baseName = path.parse(entry).name;
            result[`${prefix}${baseName}`] = entryPath;
        }
    });

    return result;
}

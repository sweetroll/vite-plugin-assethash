import type { UserConfig } from 'vite';
import fastGlob from 'fast-glob';
import generateFileMap from './generate-file-map.js';

type Props = {
    inputs: string[];
};

export default function assetHashPlugin(options: Props) {
    const { inputs } = options;

    if (!inputs || !Array.isArray(inputs)) {
        throw new Error("The 'inputs' option must be an array.");
    }

    return {
        name: 'vite-plugin-assethash',
        config: (userConfig: UserConfig) => {
            // Resolve glob patterns and generate the file map
            const resolvedPaths = fastGlob.sync(inputs);
            const fileMap = generateFileMap(resolvedPaths);

            // Merge file map into Vite's rollupOptions.input
            const rollupOptions = userConfig.build?.rollupOptions || {};
            rollupOptions.input = { ...((rollupOptions.input as Record<string, string>) || {}), ...fileMap };

            return {
                build: {
                    rollupOptions
                }
            };
        }
    };
}

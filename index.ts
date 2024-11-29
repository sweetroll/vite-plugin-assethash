import type { UserConfig } from 'vite';
import generateFileMap from './generate-file-map';

export default function assetHashPlugin({ inputs = [] }: { inputs: string[] }) {
    return {
        name: 'vite-plugin-assethash',
        config: (userConfig: UserConfig) => {
            const fileMap = {};

            // Generate file map for each directory in the inputs array
            inputs.forEach((dir) => {
                Object.assign(fileMap, generateFileMap(dir));
            });

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

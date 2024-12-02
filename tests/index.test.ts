import { describe, it, expect, vi } from 'vitest';
import assetHashPlugin from '../src/index.js';
import generateFileMap from '../src/generate-file-map.js';

// Mock the `generateFileMap` function
vi.mock('../src/generate-file-map.js', () => ({
    default: vi.fn()
}));

describe('vite-plugin-assethash', () => {
    it('should have the correct plugin name', () => {
        const plugin = assetHashPlugin({ inputs: [] });
        expect(plugin.name).toBe('vite-plugin-assethash');
    });

    it('should generate file map and merge it into rollupOptions.input', () => {
        const mockFileMap = {
            file1: '/path/to/file1.js',
            file2: '/path/to/file2.js'
        };
        (generateFileMap as ReturnType<typeof vi.fn>).mockImplementation((dir) => {
            if (dir === 'src') {
                return mockFileMap;
            }
            return {};
        });

        const plugin = assetHashPlugin({ inputs: ['src'] });
        const userConfig = {
            build: {
                rollupOptions: {
                    input: {
                        existing: '/path/to/existing.js'
                    }
                }
            }
        };

        const resultConfig = plugin.config(userConfig);

        expect(generateFileMap).toHaveBeenCalledWith('src');
        expect(resultConfig.build.rollupOptions.input).toEqual({
            existing: '/path/to/existing.js',
            file1: '/path/to/file1.js',
            file2: '/path/to/file2.js'
        });
    });

    it('should handle empty inputs without modifying the config', () => {
        const plugin = assetHashPlugin({ inputs: [] });
        const userConfig = {
            build: {
                rollupOptions: {
                    input: {
                        existing: '/path/to/existing.js'
                    }
                }
            }
        };

        const resultConfig = plugin.config(userConfig);

        expect(resultConfig.build.rollupOptions.input).toEqual({
            existing: '/path/to/existing.js'
        });
    });

    it('should initialize rollupOptions.input if not defined', () => {
        const mockFileMap = {
            file1: '/path/to/file1.js'
        };
        (generateFileMap as ReturnType<typeof vi.fn>).mockImplementation((dir) => {
            if (dir === 'src') {
                return mockFileMap;
            }
            return {};
        });

        const plugin = assetHashPlugin({ inputs: ['src'] });
        const userConfig = {
            build: {
                rollupOptions: {}
            }
        };

        const resultConfig = plugin.config(userConfig);

        expect(resultConfig.build.rollupOptions.input).toEqual({
            file1: '/path/to/file1.js'
        });
    });

    it('should throw if generateFileMap fails', () => {
        (generateFileMap as ReturnType<typeof vi.fn>).mockImplementation(() => {
            throw new Error('Failed to generate file map');
        });

        const plugin = assetHashPlugin({ inputs: ['src'] });
        const userConfig = {
            build: {}
        };

        expect(() => plugin.config(userConfig)).toThrow('Failed to generate file map');
    });
});

import { describe, it, expect, vi } from 'vitest';
import assetHashPlugin from '../src/index.js';
import generateFileMap from '../src/generate-file-map.js';

// Mock the `generateFileMap` function
vi.mock('../src/generate-file-map.js', () => ({
    default: vi.fn()
}));

// Mock `fast-glob` for glob handling
vi.mock('fast-glob', () => ({
    default: {
        sync: vi.fn()
    }
}));

import fastGlob from 'fast-glob';

describe('vite-plugin-assethash', () => {
    it('should have the correct plugin name', () => {
        const plugin = assetHashPlugin({ inputs: [] });
        expect(plugin.name).toBe('vite-plugin-assethash');
    });

    it('should resolve glob patterns and generate file map for all resolved paths', () => {
        const mockFileMap = {
            '/path/to/file1.jpg': '/path/to/file1.jpg',
            '/path/to/file2.png': '/path/to/file2.png'
        };

        (fastGlob.sync as ReturnType<typeof vi.fn>).mockImplementation((patterns) => {
            if (patterns.includes('./src/**/*')) {
                return ['src/file1.jpg', 'src/file2.png'];
            }
            return [];
        });

        (generateFileMap as ReturnType<typeof vi.fn>).mockImplementation((resolvedPaths) => {
            if (JSON.stringify(resolvedPaths) === JSON.stringify(['src/file1.jpg', 'src/file2.png'])) {
                return mockFileMap;
            }
            return {};
        });

        const plugin = assetHashPlugin({ inputs: ['./src/**/*'] });
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

        expect(fastGlob.sync).toHaveBeenCalledWith(['./src/**/*']);
        expect(generateFileMap).toHaveBeenCalledWith(['src/file1.jpg', 'src/file2.png']);
        expect(resultConfig.build.rollupOptions.input).toEqual({
            existing: '/path/to/existing.js',
            '/path/to/file1.jpg': '/path/to/file1.jpg',
            '/path/to/file2.png': '/path/to/file2.png'
        });
    });

    it('should handle empty glob patterns without modifying the config', () => {
        (fastGlob.sync as ReturnType<typeof vi.fn>).mockImplementation(() => []);

        const plugin = assetHashPlugin({ inputs: ['./empty-pattern/**/*'] });
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

        expect(fastGlob.sync).toHaveBeenCalledWith(['./empty-pattern/**/*']);
        expect(generateFileMap).toHaveBeenCalledWith([]);
        expect(resultConfig.build.rollupOptions.input).toEqual({
            existing: '/path/to/existing.js'
        });
    });

    it('should initialize rollupOptions.input if not defined and resolve globs', () => {
        const mockFileMap = {
            file1: '/path/to/file1.js'
        };

        (fastGlob.sync as ReturnType<typeof vi.fn>).mockImplementation(() => ['src/file1.js']);
        (generateFileMap as ReturnType<typeof vi.fn>).mockImplementation((resolvedPaths) => {
            if (JSON.stringify(resolvedPaths) === JSON.stringify(['src/file1.js'])) {
                return mockFileMap;
            }
            return {};
        });

        const plugin = assetHashPlugin({ inputs: ['./src/**/*.js'] });
        const userConfig = {
            build: {
                rollupOptions: {}
            }
        };

        const resultConfig = plugin.config(userConfig);

        expect(fastGlob.sync).toHaveBeenCalledWith(['./src/**/*.js']);
        expect(generateFileMap).toHaveBeenCalledWith(['src/file1.js']);
        expect(resultConfig.build.rollupOptions.input).toEqual({
            file1: '/path/to/file1.js'
        });
    });

    it('should throw if generateFileMap fails', () => {
        (fastGlob.sync as ReturnType<typeof vi.fn>).mockImplementation(() => ['src/file1.js']);
        (generateFileMap as ReturnType<typeof vi.fn>).mockImplementation(() => {
            throw new Error('Failed to generate file map');
        });

        const plugin = assetHashPlugin({ inputs: ['./src/**/*.js'] });
        const userConfig = {
            build: {}
        };

        expect(() => plugin.config(userConfig)).toThrow('Failed to generate file map');
    });
});

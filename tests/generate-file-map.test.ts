import { describe, it, expect } from 'vitest';
import path from 'path';
import generateFileMap from '../src/generate-file-map.js';

describe('generateFileMap', () => {
    it('returns an empty object for an empty file path array', () => {
        const result = generateFileMap([]);
        expect(result).toEqual({});
    });

    it('maps a flat list of file paths correctly using full relative paths as keys', () => {
        const filePaths = ['src/file1.txt', 'src/file2.txt'];

        const result = generateFileMap(filePaths);
        expect(result).toEqual({
            'src/file1.txt': 'src/file1.txt',
            'src/file2.txt': 'src/file2.txt'
        });
    });

    it('handles nested file paths correctly using full relative paths as keys', () => {
        const filePaths = ['root/file1.txt', 'root/subdir/file2.txt'];

        const result = generateFileMap(filePaths);
        expect(result).toEqual({
            'root/file1.txt': 'root/file1.txt',
            'root/subdir/file2.txt': 'root/subdir/file2.txt'
        });
    });

    it('maps files with the same name but different extensions using full relative paths as keys', () => {
        const filePaths = ['src/file1.txt', 'src/file1.png'];

        const result = generateFileMap(filePaths);
        expect(result).toEqual({
            'src/file1.txt': 'src/file1.txt',
            'src/file1.png': 'src/file1.png'
        });
    });

    it('maps files with the same name but in different directories using full relative paths as keys', () => {
        const filePaths = ['src/file1.txt', 'nested/file1.txt'];

        const result = generateFileMap(filePaths);
        expect(result).toEqual({
            'src/file1.txt': 'src/file1.txt',
            'nested/file1.txt': 'nested/file1.txt'
        });
    });

    it('applies prefix correctly to full relative paths as keys', () => {
        const filePaths = ['some-dir/file1.txt', 'another-dir/file2.txt'];

        const result = generateFileMap(filePaths, 'prefix/');
        expect(result).toEqual({
            'prefix/some-dir/file1.txt': 'some-dir/file1.txt',
            'prefix/another-dir/file2.txt': 'another-dir/file2.txt'
        });
    });

    it('normalizes file paths to relative paths', () => {
        const absolutePaths = [path.resolve('src/file1.txt'), path.resolve('nested/file2.txt')];

        const result = generateFileMap(absolutePaths);
        expect(result).toEqual({
            [path.relative(process.cwd(), path.resolve('src/file1.txt'))]: path.relative(
                process.cwd(),
                path.resolve('src/file1.txt')
            ),
            [path.relative(process.cwd(), path.resolve('nested/file2.txt'))]: path.relative(
                process.cwd(),
                path.resolve('nested/file2.txt')
            )
        });
    });
});

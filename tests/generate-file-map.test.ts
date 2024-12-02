import { describe, it, expect, vi, afterEach } from 'vitest';
import fs, { Dirent } from 'fs';
import generateFileMap from '../src/generate-file-map.js';

vi.mock('fs');

describe('generateFileMap', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return an empty object if the directory does not exist', () => {
        vi.spyOn(fs, 'existsSync').mockReturnValue(false);

        const result = generateFileMap('non-existent-dir');
        expect(result).toEqual({});
        expect(fs.existsSync).toHaveBeenCalledWith('non-existent-dir');
    });

    it('should return an empty object if the directory is empty', () => {
        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
        vi.spyOn(fs, 'readdirSync').mockReturnValue([]);

        const result = generateFileMap('empty-dir');
        expect(result).toEqual({});
        expect(fs.readdirSync).toHaveBeenCalledWith('empty-dir', { withFileTypes: true });
    });

    it('should map files in a flat directory', () => {
        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
        vi.spyOn(fs, 'readdirSync').mockReturnValue([
            { name: 'file1.txt', isDirectory: () => false } as Dirent,
            { name: 'file2.txt', isDirectory: () => false } as Dirent
        ]);

        const result = generateFileMap('flat-dir');
        expect(result).toEqual({
            file1: 'flat-dir/file1.txt',
            file2: 'flat-dir/file2.txt'
        });
    });

    it('should handle nested directories', () => {
        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
        vi.spyOn(fs, 'readdirSync').mockImplementation((dir) => {
            if (dir === 'root')
                return [
                    { name: 'subdir', isDirectory: () => true } as Dirent,
                    { name: 'file1.txt', isDirectory: () => false } as Dirent
                ];
            if (dir === 'root/subdir') return [{ name: 'file2.txt', isDirectory: () => false } as Dirent];
            return [];
        });

        const result = generateFileMap('root');
        expect(result).toEqual({
            file1: 'root/file1.txt',
            'subdir/file2': 'root/subdir/file2.txt'
        });
    });

    it('should apply prefix correctly', () => {
        vi.spyOn(fs, 'existsSync').mockReturnValue(true);
        vi.spyOn(fs, 'readdirSync').mockReturnValue([{ name: 'file1.txt', isDirectory: () => false } as Dirent]);

        const result = generateFileMap('some-dir', 'prefix/');
        expect(result).toEqual({
            'prefix/file1': 'some-dir/file1.txt'
        });
    });
});

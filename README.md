# vite-plugin-assethash

![Tests](https://github.com/sweetroll/vite-plugin-assethash/actions/workflows/test.yml/badge.svg)

A Vite plugin to hash files from specified directories and add them to the Rollup manifest.

## Usage

Install with

```sh
npm install --save-dev '@sweetroll/vite-plugin-assethash'
```

In `vite.config.ts`, add:

```typescript
import assetHash from '@sweetroll/vite-plugin-assethash';

// ...

export default defineConfig({
    // ...

    plugins: [
        // ...
        assetHash({
            inputs: ['./your/asset/directories', './go/here']
        })
    ]
});
```

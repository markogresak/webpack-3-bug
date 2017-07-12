## An example environment reproducing an error with webpack 3

Using most of our production config without actual code. There are most likely some unused parts but I tried to leave most of the code as-is to be as similar to the actual project as possible.

### Error message:

```
ERROR in chunk js [entry]
app-[hash].js
Cannot get final name for export "default" in "delegated ./node_modules/lodash-es/_freeGlobal.js from dll-reference vendor_95ddba43b83140df6377" (known exports: true, known reexports: )
```

### To run this example:

(it will most likely not work on windows)

``` sh
yarn
yarn run build
```

### Tested on:

Node version: 8.1.2
OS: macOS Sierra 10.12.5

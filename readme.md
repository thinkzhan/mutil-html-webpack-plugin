> mutil-html-webpack-plugin

    mutil-html-webpack-plugin

> useage

```
-page
    -somepage
        -page.vm
        -page.js
```

```javascript
    const MutilHtmlWebpackPlugin = require('mutil-html-webpack-plugin');

    new MutilHtmlWebpackPlugin ({
        page: './src/page', //input dir
        toPage: '../vm', //output dir，relative to 'publicPath', default: publicPath
        ext: '.vm', // input file ext, default: '.vm'
        toExt: '.html', // ouput file ext, default: '.vm'
        alwaysWriteToDisk: true,
        moreChunks : ['commons', 'vendor'], // common chunks of all page
        pagemap: true, // ouput pagemap
        ignorePages: ['somepage'], // ignore page
        specialPages: { // rewrite some page, only support 'moreChunks' currently
            'somepage' : {
                moreChunks: ['vendor']
            }
        }

    })
```

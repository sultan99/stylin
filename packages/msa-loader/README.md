# @stylin/msa-loader
The primary webpack loader for generation Mapping Style Annotations.
<br/>

## Installation
```sh
npm install --save-dev @stylin/msa-loader
```

You need to install [style-loader](https://github.com/webpack-contrib/style-loader) or [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin):

```sh
npm install --save-dev style-loader
// or
npm install --save-dev mini-css-extract-plugin
```
### ⚠ Important
Don't install both, use one of them.
<br/>

### Optional loader and recommended
```sh
npm install --save-dev sass-loader
```

<br/>

In webpack configuration file, place `@stylin/msa-loader` after `style-loader` or `mini-css-extract-plugin` in modules/rules.

### webpack.config.js configuration with style-loader:
```js
module.exports = {
  module: {
    rules: [{
      test: /\.scss$/i,
      use: [
        `@stylin/ts-loader`, // only if you use TypeScript
        `@stylin/msa-loader`,
        `style-loader`,
        {loader: `css-loader`, options: {modules: true}},
        `sass-loader`, // optional
      ],
    }],
  }
}
```
<br/>

### webpack.config.js configuration with `MiniCssExtractPlugin`:
```js
const MiniCssExtractPlugin = require(`mini-css-extract-plugin`)

module.exports = {
  plugins: [new MiniCssExtractPlugin()],
  ...
  module: {
    rules: [{
      test: /\.scss$/i,
      use: [
        `@stylin/ts-loader`,  // only if you use TypeScript
        `@stylin/msa-loader`,
        {
          loader: MiniCssExtractPlugin.loader,
          options: {publicPath: `folder-where-css-files-will-be-stored`}
        },
        {loader: `css-loader`, options: {modules: true}},
        `sass-loader`, // optional
      ],
    }],
  }
}
```
<br/>

### ⚠ Important
Set `modules` to true in options of css-loader: 

`{loader: 'css-loader', options: {modules: true}}`

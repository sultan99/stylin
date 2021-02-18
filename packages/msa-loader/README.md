## Webpack loader

In webpack config, place `@stylin/msa-loader` after `style-loader` in modules/rules.

Set `modules` to true in options of css-loader: 

`{loader: 'css-loader', options: {modules: true}}`

```sh
npm install --save @stylin/loader
```

#### `webpack.config.js`
```js
module.exports = {
  ...
  module: {
    rules: [{
      test: /\.scss$/i,
      use: [
        `@stylin/msa-loader`,
        `style-loader`,
        {loader: `css-loader`, options: {modules: true}},
        `sass-loader`, // optional
      ],
    }],
  }
}
```


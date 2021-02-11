const CopyPlugin = require(`copy-webpack-plugin`)
const HtmlWebPackPlugin = require(`html-webpack-plugin`)
const path = require(`path`)

const rootPath = dir => path.resolve(__dirname, dir)

module.exports = {
  entry: `./src/index.tsx`,
  output: {
    path: rootPath(`./dist`),
    filename: `[hash].js`
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {loader: `babel-loader`},
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        exclude: /node_modules/,
        use: [{
          loader: `file-loader`,
          options: {name: `[hash].[ext]`}
        }],
      },
      {
        test: /\.scss$/i,
        use: [
          `style-loader`,
          {loader: rootPath(`../../packages/loader/dist`)},
          {loader: `css-loader`, options: {modules: true}},
          `sass-loader`,
        ],
      },
      {
        test: /\.(svg)$/i,
        use: [
          {loader: `url-loader`, options: {limit: 2000}},
        ],
      },
    ],
  },
  resolve: {
    extensions: [`.ts`, `.tsx`, `.scss`, `.js`, `.jsx`],
    alias: {
      '@': rootPath(`./src`),
      '@stylin': rootPath(`../../packages`),
    }
  },
  devServer: {
    contentBase: rootPath(`./dist`),
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: rootPath(`./src/index.html`)
    }),
    new CopyPlugin({
      patterns: [
        {from: rootPath(`./public`)},
      ],
    }),
  ]
}

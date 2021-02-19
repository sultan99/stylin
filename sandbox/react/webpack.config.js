const MiniCssExtractPlugin = require(`mini-css-extract-plugin`)
const HtmlWebPackPlugin = require(`html-webpack-plugin`)
const CopyPlugin = require(`copy-webpack-plugin`)
const path = require(`path`)

const rootPath = dir => path.resolve(__dirname, dir)

module.exports = {
  entry: `./src/index.tsx`,
  output: {
    path: rootPath(`./dist`),
    filename: `[name].[contenthash].js`
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
          options: {name: `[name].[contenthash].[ext]`}
        }],
      },
      {
        test: /\.scss$/i,
        use: [
          {loader: rootPath(`../../packages/ts-loader/dist`)},
          {loader: rootPath(`../../packages/msa-loader/dist`)},
          {
            loader: MiniCssExtractPlugin.loader,
            options: {publicPath: rootPath(`public/css`)}
          },
          // `style-loader`,
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
      '@stylin/style': rootPath(`../../packages/style/dist`),
    }
  },
  devServer: {
    contentBase: rootPath(`./dist`),
  },
  plugins: [
    new MiniCssExtractPlugin(),
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

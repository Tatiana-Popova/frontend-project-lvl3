const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// module.exports = {
//   mode: process.env.NODE_ENV || 'development',
//   entry: './src/index.js',
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'dist '),
//   },
//   // devServer: {
//   //   port: 4200,
//   // },
//   plugins: [
//     new HTMLWebpackPlugin({
//       template: './index.html',
//     }),
//     new CleanWebpackPlugin(),
//     new MiniCssExtractPlugin({
//       filename: '[contenthash].bundle.css',
//     }),
//   ],
//   module: {
//     rules: [
//       {
//         test: /\.js$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-env'],
//           },
//         },
//       },
//       {
//         test: /\.css$/,
//         use: [MiniCssExtractPlugin.loader, 'css-loader'],
//       },
//       {
//         test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
//         use: 'url-loader?limit=10000',
//       },
//       {
//         test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
//         use: 'file-loader',
//       },
//     ],
//   },
// };

const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    port: 4200,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000',
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new CleanWebpackPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: '[contenthash].bundle.css',
    // }),
  ],
};

module.exports = config;

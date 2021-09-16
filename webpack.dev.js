const path = require('path')
const ManifestPlugin = require('./extension-manifest-plugin'); 
const cssLoader = {loader: 'css-loader', options: {url: false}}

const targetDir = path.resolve(__dirname, 'build');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  target: 'web',
  output: {
    filename: 'index.js',
    path: targetDir,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/i,
        use: ['raw-loader', 'extract-loader', cssLoader, 'sass-loader'],
      },
    ],
  },
  plugins: [
    new ManifestPlugin(targetDir)
  ]
}

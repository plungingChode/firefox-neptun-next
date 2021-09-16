const path = require('path')
const ManifestPlugin = require('./extension-manifest-plugin'); 
const cssLoader = {loader: 'css-loader', options: {url: false}}

const targetPath = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  target: 'web',
  output: {
    filename: 'index.js',
    path: targetPath,
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
    new ManifestPlugin(targetPath)
  ]
}

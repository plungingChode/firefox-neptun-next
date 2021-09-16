const path = require('path')
const ManifestPlugin = require('./extension-manifest-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const cssLoader = {loader: 'css-loader', options: {url: false}}

const targetPath = path.resolve(__dirname, 'dist')

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
    plugins: [new TsconfigPathsPlugin({configFile: './tsconfig.json'})],
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
  plugins: [new ManifestPlugin(targetPath)],
}

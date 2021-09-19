const path = require('path')
const ManifestPlugin = require('./extension-manifest-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const cssLoader = {loader: 'css-loader', options: {url: false}}

const targetPath = path.resolve(__dirname, 'dist')

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.ts',
    background: './src/background.ts'
  },
  target: 'web',
  output: {
    filename: '[name].js',
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
  plugins: [
    new ManifestPlugin(targetPath),
    new CssMinimizerPlugin()
  ],
}

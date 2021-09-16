const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')
const manifest = require('./manifest-template.json')

/**
 * Generate a Firefox extension manifest from a template and the
 * project's package.json file.
 */
class ExtensionManifestWebpackPlugin {
  /**
   * @param {String} path output directory of the Webpack build
   */
  constructor(path) {
    this.path = path
  }

  apply(compiler) {
    compiler.hooks.done.tap('ExtensionManifestWebpackPlugin', () => {
      manifest.version = pkg.version
      fs.writeFileSync(
        path.resolve(this.path, 'manifest.json'),
        JSON.stringify(manifest),
        'utf-8'
      )
    })
  }
}

module.exports = ExtensionManifestWebpackPlugin

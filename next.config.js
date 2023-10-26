const path = require('path')

module.exports = {
  // reactStrictMode: false, // React Strict Mode is off
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  }
}

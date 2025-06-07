module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
      flexbox: 'no-2009',
      // Suppress the color-adjust warning
      ignoreWarnings: [{ rule: 'color-adjust' }]
    })
  ]
}; 
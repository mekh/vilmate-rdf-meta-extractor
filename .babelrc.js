module.exports = {
  plugins: ['syntax-async-generators'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
}

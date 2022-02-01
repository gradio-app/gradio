const fs = require('fs')
const paths = ['C:/libjpeg-turbo']

if (process.arch === 'x64') {
  paths.unshift('C:/libjpeg-turbo64')
}

paths.forEach(function (path) {
  if (exists(path)) {
    process.stdout.write(path)
    process.exit()
  }
})

function exists (path) {
  try {
    return fs.lstatSync(path).isDirectory()
  } catch (e) {
    return false
  }
}

const query = process.argv[2]
const fs = require('fs')
const childProcess = require('child_process')

const SYSTEM_PATHS = [
  '/lib',
  '/usr/lib',
  '/usr/lib64',
  '/usr/local/lib',
  '/opt/local/lib',
  '/opt/homebrew/lib',
  '/usr/lib/x86_64-linux-gnu',
  '/usr/lib/i386-linux-gnu',
  '/usr/lib/arm-linux-gnueabihf',
  '/usr/lib/arm-linux-gnueabi',
  '/usr/lib/aarch64-linux-gnu'
]

/**
 * Checks for lib using ldconfig if present, or searching SYSTEM_PATHS
 * otherwise.
 * @param {string} lib - library name, e.g. 'jpeg' in 'libjpeg64.so' (see first line)
 * @return {boolean} exists
 */
function hasSystemLib (lib) {
  const libName = 'lib' + lib + '.+(so|dylib)'
  const libNameRegex = new RegExp(libName)

  // Try using ldconfig on linux systems
  if (hasLdconfig()) {
    try {
      if (childProcess.execSync('ldconfig -p 2>/dev/null | grep -E "' + libName + '"').length) {
        return true
      }
    } catch (err) {
      // noop -- proceed to other search methods
    }
  }

  // Try checking common library locations
  return SYSTEM_PATHS.some(function (systemPath) {
    try {
      const dirListing = fs.readdirSync(systemPath)
      return dirListing.some(function (file) {
        return libNameRegex.test(file)
      })
    } catch (err) {
      return false
    }
  })
}

/**
 * Checks for ldconfig on the path and /sbin
 * @return {boolean} exists
 */
function hasLdconfig () {
  try {
    // Add /sbin to path as ldconfig is located there on some systems -- e.g.
    // Debian (and it can still be used by unprivileged users):
    childProcess.execSync('export PATH="$PATH:/sbin"')
    process.env.PATH = '...'
    // execSync throws on nonzero exit
    childProcess.execSync('hash ldconfig 2>/dev/null')
    return true
  } catch (err) {
    return false
  }
}

/**
 * Checks for freetype2 with --cflags-only-I
 * @return Boolean exists
 */
function hasFreetype () {
  try {
    if (childProcess.execSync('pkg-config cairo --cflags-only-I 2>/dev/null | grep freetype2').length) {
      return true
    }
  } catch (err) {
    // noop
  }
  return false
}

/**
 * Checks for lib using pkg-config.
 * @param {string} lib - library name
 * @return {boolean} exists
 */
function hasPkgconfigLib (lib) {
  try {
    // execSync throws on nonzero exit
    childProcess.execSync('pkg-config --exists "' + lib + '" 2>/dev/null')
    return true
  } catch (err) {
    return false
  }
}

function main (query) {
  switch (query) {
    case 'gif':
    case 'cairo':
      return hasSystemLib(query)
    case 'pango':
      return hasPkgconfigLib(query)
    case 'freetype':
      return hasFreetype()
    case 'jpeg':
      return hasPkgconfigLib('libjpeg')
    case 'rsvg':
      return hasPkgconfigLib('librsvg-2.0')
    default:
      throw new Error('Unknown library: ' + query)
  }
}

process.stdout.write(main(query).toString())

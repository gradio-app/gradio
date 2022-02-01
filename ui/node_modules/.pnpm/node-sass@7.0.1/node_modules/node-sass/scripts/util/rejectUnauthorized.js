var pkg = require('../../package.json');

/**
 * Get the value of a CLI argument
 *
 * @param {String} name
 * @param {Array} args
 * @api private
 */
function getArgument(name, args) {
  var flags = args || process.argv.slice(2),
    index = flags.lastIndexOf(name);

  if (index === -1 || index + 1 >= flags.length) {
    return null;
  }

  return flags[index + 1];
}

/**
 * Get the value of reject-unauthorized
 * If environment variable SASS_REJECT_UNAUTHORIZED is non-zero,
 * .npmrc variable sass_reject_unauthorized or
 * process argument --sass-reject_unauthorized is provided,
 * set rejectUnauthorized to true
 * Else set to false by default
 *
 * @return {Boolean} The value of rejectUnauthorized
 * @api private
 */
module.exports = function() {
  var rejectUnauthorized = false;

  if (getArgument('--sass-reject-unauthorized')) {
    rejectUnauthorized = getArgument('--sass-reject-unauthorized');
  } else if (process.env.SASS_REJECT_UNAUTHORIZED !== '0') {
    rejectUnauthorized = true;
  } else if (process.env.npm_config_sass_reject_unauthorized) {
    rejectUnauthorized = process.env.npm_config_sass_reject_unauthorized;
  } else if (pkg.nodeSassConfig && pkg.nodeSassConfig.rejectUnauthorized) {
    rejectUnauthorized = pkg.nodeSassConfig.rejectUnauthorized;
  } 

  return rejectUnauthorized;
};

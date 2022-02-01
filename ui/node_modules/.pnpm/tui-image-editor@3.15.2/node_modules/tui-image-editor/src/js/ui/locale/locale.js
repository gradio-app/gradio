/**
 * Translate messages
 */
class Locale {
  constructor(locale) {
    this._locale = locale;
  }

  /**
   * localize message
   * @param {string} message - message who will be localized
   * @returns {string}
   */
  localize(message) {
    return this._locale[message] || message;
  }
}

export default Locale;

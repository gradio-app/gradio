/**
 * @param {Object} submenuInfo - submenu info for make template
 *   @param {Locale} locale - Translate text
 *   @param {Function} makeSvgIcon - svg icon generator
 *   @param {string} name - history name
 *   @param {string} detail - history detail information
 * @returns {string}
 */
export default ({ locale, makeSvgIcon, name, detail }) => `
    <div class="tui-image-editor-history-item history">
        <div class="history-item-icon">
            ${makeSvgIcon(['normal', 'active'], `history-${name.toLowerCase()}`, true)}
        </div>
        <span>
            ${locale.localize(name)}
            ${detail ? `(${locale.localize(detail)})` : ''}
        </span>
        <div class="history-item-checkbox">
            ${makeSvgIcon(['normal'], 'history-check', true)}
        </div>
    </div>
`;

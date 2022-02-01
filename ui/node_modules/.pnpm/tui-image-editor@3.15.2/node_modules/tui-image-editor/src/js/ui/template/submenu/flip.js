/**
 * @param {Object} submenuInfo - submenu info for make template
 *   @param {Locale} locale - Translate text
 *   @param {Function} makeSvgIcon - svg icon generator
 * @returns {string}
 */
export default ({ locale, makeSvgIcon }) => `
    <ul class="tie-flip-button tui-image-editor-submenu-item">
        <li>
            <div class="tui-image-editor-button flipX">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'flip-x', true)}
                </div>
                <label>
                    ${locale.localize('Flip X')}
                </label>
            </div>
            <div class="tui-image-editor-button flipY">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'flip-y', true)}
                </div>
                <label>
                    ${locale.localize('Flip Y')}
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="tui-image-editor-button resetFlip">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'flip-reset', true)}
                </div>
                <label>
                    ${locale.localize('Reset')}
                </label>
            </div>
        </li>
    </ul>
`;

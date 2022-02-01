/**
 * @param {Object} submenuInfo - submenu info for make template
 *   @param {Locale} locale - Translate text
 *   @param {Function} makeSvgIcon - svg icon generator
 * @returns {string}
 */
export default ({ locale, makeSvgIcon }) => `
    <ul class="tui-image-editor-submenu-item">
        <li class="tie-rotate-button">
            <div class="tui-image-editor-button clockwise">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'rotate-clockwise', true)}
                </div>
                <label> 30 </label>
            </div>
            <div class="tui-image-editor-button counterclockwise">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'rotate-counterclockwise', true)}
                </div>
                <label> -30 </label>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-newline tui-image-editor-range-wrap">
            <label class="range">${locale.localize('Range')}</label>
            <div class="tie-rotate-range"></div>
            <input class="tie-rotate-range-value tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`;

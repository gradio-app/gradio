/**
 * @param {Object} submenuInfo - submenu info for make template
 *   @param {Locale} locale - Translate text
 *   @param {Function} makeSvgIcon - svg icon generator
 * @returns {string}
 */
export default ({ locale, makeSvgIcon }) => `
    <ul class="tui-image-editor-submenu-item">
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-range-wrap tui-image-editor-newline">
                <label class="range">${locale.localize('Width')}&nbsp;</label>
                <div class="tie-width-range"></div>
                <input class="tie-width-range-value tui-image-editor-range-value" value="0" /> <label>px</label>
                <div class="tui-image-editor-partition tui-image-editor-newline"></div>
                <label class="range">${locale.localize('Height')}</label>
                <div class="tie-height-range"></div>
                <input class="tie-height-range-value tui-image-editor-range-value" value="0" /> <label>px</label>
            </div>
        </li>
        <li class="tui-image-editor-partition tui-image-editor-newline"></li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-checkbox-wrap">
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-lock-aspect-ratio">
                        <span>${locale.localize('Lock Aspect Ratio')}</span>
                    </label>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition tui-image-editor-newline"></li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-partition tui-image-editor-newline"></li>
        <li class="tie-resize-button action">
            <div class="tui-image-editor-button apply">
                ${makeSvgIcon(['normal', 'active'], 'apply')}
                <label>
                    ${locale.localize('Apply')}
                </label>
            </div>
            <div class="tui-image-editor-button cancel">
                ${makeSvgIcon(['normal', 'active'], 'cancel')}
                <label>
                    ${locale.localize('Cancel')}
                </label>
            </div>
        </li>
    </ul>
`;

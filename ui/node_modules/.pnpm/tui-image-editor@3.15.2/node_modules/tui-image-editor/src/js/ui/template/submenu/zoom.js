/**
 * @param {Object} submenuInfo - submenu info for make template
 *   @param {Locale} locale - Translate text
 *   @param {Function} makeSvgIcon - svg icon generator
 * @returns {string}
 */
export default ({ locale, makeSvgIcon }) => `
    <ul class="tie-zoom-button tui-image-editor-submenu-item">
        <li>
            <div class="tui-image-editor-button zoomIn">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'zoom-in', true)}
                </div>
                <label>
                    ${locale.localize('Zoom In')}
                </label>
            </div>
            <div class="tui-image-editor-button zoomOut">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'zoom-out', true)}
                </div>
                <label>
                    ${locale.localize('Zoom Out')}
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="tui-image-editor-button hand">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'zoom-hand', true)}
                </div>
                <label>
                    ${locale.localize('Hand')}
                </label>
            </div>
        </li>
    </ul>
`;

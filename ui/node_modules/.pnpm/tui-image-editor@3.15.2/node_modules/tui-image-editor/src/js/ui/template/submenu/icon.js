/**
 * @param {Object} submenuInfo - submenu info for make template
 *   @param {Locale} locale - Translate text
 *   @param {Function} makeSvgIcon - svg icon generator
 * @returns {string}
 */
export default ({ locale, makeSvgIcon }) => `
    <ul class="tui-image-editor-submenu-item">
        <li class="tie-icon-add-button">
            <div class="tui-image-editor-button" data-icontype="icon-arrow">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'icon-arrow', true)}
                </div>
                <label>
                    ${locale.localize('Arrow')}
                </label>
            </div>
            <div class="tui-image-editor-button" data-icontype="icon-arrow-2">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'icon-arrow-2', true)}
                </div>
                <label>
                    ${locale.localize('Arrow-2')}
                </label>
            </div>
            <div class="tui-image-editor-button" data-icontype="icon-arrow-3">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'icon-arrow-3', true)}
                </div>
                <label>
                    ${locale.localize('Arrow-3')}
                </label>
            </div>
            <div class="tui-image-editor-button" data-icontype="icon-star">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'icon-star', true)}
                </div>
                <label>
                    ${locale.localize('Star-1')}
                </label>
            </div>
            <div class="tui-image-editor-button" data-icontype="icon-star-2">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'icon-star-2', true)}
                </div>
                <label>
                    ${locale.localize('Star-2')}
                </label>
            </div>

            <div class="tui-image-editor-button" data-icontype="icon-polygon">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'icon-polygon', true)}
                </div>
                <label>
                    ${locale.localize('Polygon')}
                </label>
            </div>

            <div class="tui-image-editor-button" data-icontype="icon-location">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'icon-location', true)}
                </div>
                <label>
                    ${locale.localize('Location')}
                </label>
            </div>

            <div class="tui-image-editor-button" data-icontype="icon-heart">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'icon-heart', true)}
                </div>
                <label>
                    ${locale.localize('Heart')}
                </label>
            </div>

            <div class="tui-image-editor-button" data-icontype="icon-bubble">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'icon-bubble', true)}
                </div>
                <label>
                    ${locale.localize('Bubble')}
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li class="tie-icon-add-button">
            <div class="tui-image-editor-button" style="margin:0">
                <div>
                    <input type="file" accept="image/*" class="tie-icon-image-file">
                    ${makeSvgIcon(['normal', 'active'], 'icon-load', true)}
                </div>
                <label>
                    ${locale.localize('Custom icon')}
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="tie-icon-color" title="${locale.localize('Color')}"></div>
        </li>
    </ul>
`;

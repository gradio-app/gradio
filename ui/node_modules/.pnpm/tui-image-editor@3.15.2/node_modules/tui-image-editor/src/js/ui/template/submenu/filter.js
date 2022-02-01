/**
 * @param {Locale} locale - Translate text
 * @returns {string}
 */
export default ({ locale }) => `
    <ul class="tui-image-editor-submenu-item">
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-checkbox-wrap fixed-width">
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-grayscale">
                        <span>${locale.localize('Grayscale')}</span>
                    </label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-invert">
                        <span>${locale.localize('Invert')}</span>
                    </label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-sepia">
                        <span>${locale.localize('Sepia')}</span>
                    </label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-vintage">
                        <span>${locale.localize('Sepia2')}</span>
                    </label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-blur">
                        <span>${locale.localize('Blur')}</span>
                    </label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-sharpen">
                        <span>${locale.localize('Sharpen')}</span>
                    </label>
                </div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-emboss">
                        <span>${locale.localize('Emboss')}</span>
                    </label>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled" style="margin-bottom: 7px;">
                <div class="tui-image-editor-checkbox-wrap">
                    <div class="tui-image-editor-checkbox">
                        <label>
                            <input type="checkbox" class="tie-remove-white">
                            <span>${locale.localize('Remove White')}</span>
                        </label>
                    </div>
                </div>
                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">
                    <label>${locale.localize('Distance')}</label>
                    <div class="tie-removewhite-distance-range"></div>
                </div>
            </div>
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-brightness">
                        <span>${locale.localize('Brightness')}</span>
                    </label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div class="tie-brightness-range"></div>
                </div>
            </div>
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-noise">
                        <span>${locale.localize('Noise')}</span>
                    </label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div class="tie-noise-range"></div>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-submenu-align">
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-pixelate">
                        <span>${locale.localize('Pixelate')}</span>
                    </label>
                </div>
                <div class="tui-image-editor-range-wrap short">
                    <div class="tie-pixelate-range"></div>
                </div>
            </div>
            <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">
                <div class="tui-image-editor-newline tui-image-editor-checkbox-wrap">
                    <div class="tui-image-editor-checkbox">
                        <label>
                            <input type="checkbox" class="tie-color-filter">
                            <span>${locale.localize('Color Filter')}</span>
                        </label>
                    </div>
                </div>
                <div class="tui-image-editor-newline tui-image-editor-range-wrap short">
                    <label>${locale.localize('Threshold')}</label>
                    <div class="tie-colorfilter-threshold-range"></div>
                </div>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="filter-color-item">
                <div class="tie-filter-tint-color" title="${locale.localize('Tint')}"></div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-tint">
                        <span></span>
                    </label>
                </div>
            </div>
            <div class="filter-color-item">
                <div class="tie-filter-multiply-color" title="${locale.localize('Multiply')}"></div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-multiply">
                        <span></span>
                    </label>
                </div>
            </div>
            <div class="filter-color-item">
                <div class="tie-filter-blend-color" title="${locale.localize('Blend')}"></div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-blend">
                        <span></span>
                    </label>
                </div>
            </div>
        </li>
    </ul>
`;

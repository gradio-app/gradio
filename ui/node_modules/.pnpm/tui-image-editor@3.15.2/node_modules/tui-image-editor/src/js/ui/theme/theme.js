import { extend, forEach, map } from 'tui-code-snippet';
import style from '@/ui/template/style';
import standardTheme from '@/ui/theme/standard';
import icon from '@svg/default.svg';
import { styleLoad } from '@/util';

/**
 * Theme manager
 * @class
 * @param {Object} customTheme - custom theme
 * @ignore
 */
class Theme {
  constructor(customTheme) {
    this.styles = this._changeToObject(extend({}, standardTheme, customTheme));
    styleLoad(this._styleMaker());

    this._loadDefaultSvgIcon();
  }

  /**
   * Get a Style cssText or StyleObject
   * @param {string} type - style type
   * @returns {string|object} - cssText or StyleObject
   */
  // eslint-disable-next-line complexity
  getStyle(type) {
    let result = null;
    const firstProperty = type.replace(/\..+$/, '');
    const option = this.styles[type];
    switch (type) {
      case 'common.bi':
        result = this.styles[type].image;
        break;
      case 'menu.icon':
        result = {
          active: this.styles[`${firstProperty}.activeIcon`],
          normal: this.styles[`${firstProperty}.normalIcon`],
          hover: this.styles[`${firstProperty}.hoverIcon`],
          disabled: this.styles[`${firstProperty}.disabledIcon`],
        };
        break;
      case 'submenu.icon':
        result = {
          active: this.styles[`${firstProperty}.activeIcon`],
          normal: this.styles[`${firstProperty}.normalIcon`],
        };
        break;
      case 'submenu.label':
        result = {
          active: this._makeCssText(this.styles[`${firstProperty}.activeLabel`]),
          normal: this._makeCssText(this.styles[`${firstProperty}.normalLabel`]),
        };
        break;
      case 'submenu.partition':
        result = {
          vertical: this._makeCssText(
            extend({}, option, { borderLeft: `1px solid ${option.color}` })
          ),
          horizontal: this._makeCssText(
            extend({}, option, { borderBottom: `1px solid ${option.color}` })
          ),
        };
        break;

      case 'range.disabledPointer':
      case 'range.disabledBar':
      case 'range.disabledSubbar':
      case 'range.pointer':
      case 'range.bar':
      case 'range.subbar':
        option.backgroundColor = option.color;
        result = this._makeCssText(option);
        break;
      default:
        result = this._makeCssText(option);
        break;
    }

    return result;
  }

  /**
   * Make css resource
   * @returns {string} - serialized css text
   * @private
   */
  _styleMaker() {
    const submenuLabelStyle = this.getStyle('submenu.label');
    const submenuPartitionStyle = this.getStyle('submenu.partition');

    return style({
      subMenuLabelActive: submenuLabelStyle.active,
      subMenuLabelNormal: submenuLabelStyle.normal,
      submenuPartitionVertical: submenuPartitionStyle.vertical,
      submenuPartitionHorizontal: submenuPartitionStyle.horizontal,
      biSize: this.getStyle('common.bisize'),
      subMenuRangeTitle: this.getStyle('range.title'),
      submenuRangePointer: this.getStyle('range.pointer'),
      submenuRangeBar: this.getStyle('range.bar'),
      submenuRangeSubbar: this.getStyle('range.subbar'),

      submenuDisabledRangePointer: this.getStyle('range.disabledPointer'),
      submenuDisabledRangeBar: this.getStyle('range.disabledBar'),
      submenuDisabledRangeSubbar: this.getStyle('range.disabledSubbar'),

      submenuRangeValue: this.getStyle('range.value'),
      submenuColorpickerTitle: this.getStyle('colorpicker.title'),
      submenuColorpickerButton: this.getStyle('colorpicker.button'),
      submenuCheckbox: this.getStyle('checkbox'),
      menuIconSize: this.getStyle('menu.iconSize'),
      submenuIconSize: this.getStyle('submenu.iconSize'),
      menuIconStyle: this.getStyle('menu.icon'),
      submenuIconStyle: this.getStyle('submenu.icon'),
    });
  }

  /**
   * Change to low dimensional object.
   * @param {object} styleOptions - style object of user interface
   * @returns {object} low level object for style apply
   * @private
   */
  _changeToObject(styleOptions) {
    const styleObject = {};
    forEach(styleOptions, (value, key) => {
      const keyExplode = key.match(/^(.+)\.([a-z]+)$/i);
      const [, property, subProperty] = keyExplode;

      if (!styleObject[property]) {
        styleObject[property] = {};
      }
      styleObject[property][subProperty] = value;
    });

    return styleObject;
  }

  /**
   * Style object to Csstext serialize
   * @param {object} styleObject - style object
   * @returns {string} - css text string
   * @private
   */
  _makeCssText(styleObject) {
    const converterStack = [];

    forEach(styleObject, (value, key) => {
      if (['backgroundImage'].indexOf(key) > -1 && value !== 'none') {
        value = `url(${value})`;
      }

      converterStack.push(`${this._toUnderScore(key)}: ${value}`);
    });

    return converterStack.join(';');
  }

  /**
   * Camel key string to Underscore string
   * @param {string} targetString - change target
   * @returns {string}
   * @private
   */
  _toUnderScore(targetString) {
    return targetString.replace(/([A-Z])/g, ($0, $1) => `-${$1.toLowerCase()}`);
  }

  /**
   * Load default svg icon
   * @private
   */
  _loadDefaultSvgIcon() {
    if (!document.getElementById('tui-image-editor-svg-default-icons')) {
      const parser = new DOMParser();
      const encodedURI = icon.replace(/data:image\/svg\+xml;base64,/, '');
      const dom = parser.parseFromString(atob(encodedURI), 'text/xml');

      document.body.appendChild(dom.documentElement);
    }
  }

  /**
   * Make className for svg icon
   * @param {string} iconType - normal' or 'active' or 'hover' or 'disabled
   * @param {boolean} isSubmenu - submenu icon or not.
   * @returns {string}
   * @private
   */
  _makeIconClassName(iconType, isSubmenu) {
    const iconStyleInfo = isSubmenu ? this.getStyle('submenu.icon') : this.getStyle('menu.icon');
    const { path, name } = iconStyleInfo[iconType];

    return path && name ? iconType : `${iconType} use-default`;
  }

  /**
   * Make svg use link path name
   * @param {string} iconType - normal' or 'active' or 'hover' or 'disabled
   * @param {boolean} isSubmenu - submenu icon or not.
   * @returns {string}
   * @private
   */
  _makeSvgIconPrefix(iconType, isSubmenu) {
    const iconStyleInfo = isSubmenu ? this.getStyle('submenu.icon') : this.getStyle('menu.icon');
    const { path, name } = iconStyleInfo[iconType];

    return path && name ? `${path}#${name}-` : '#';
  }

  /**
   * Make svg use link path name
   * @param {Array.<string>} useIconTypes - normal' or 'active' or 'hover' or 'disabled
   * @param {string} menuName - menu name
   * @param {boolean} isSubmenu - submenu icon or not.
   * @returns {string}
   * @private
   */
  _makeSvgItem(useIconTypes, menuName, isSubmenu) {
    return map(useIconTypes, (iconType) => {
      const svgIconPrefix = this._makeSvgIconPrefix(iconType, isSubmenu);
      const iconName = this._toUnderScore(menuName);
      const svgIconClassName = this._makeIconClassName(iconType, isSubmenu);

      return `<use xlink:href="${svgIconPrefix}ic-${iconName}" class="${svgIconClassName}"/>`;
    }).join('');
  }

  /**
   * Make svg icon set
   * @param {Array.<string>} useIconTypes - normal' or 'active' or 'hover' or 'disabled
   * @param {string} menuName - menu name
   * @param {boolean} isSubmenu - submenu icon or not.
   * @returns {string}
   */
  makeMenSvgIconSet(useIconTypes, menuName, isSubmenu = false) {
    return `<svg class="svg_ic-${isSubmenu ? 'submenu' : 'menu'}">${this._makeSvgItem(
      useIconTypes,
      menuName,
      isSubmenu
    )}</svg>`;
  }
}

export default Theme;

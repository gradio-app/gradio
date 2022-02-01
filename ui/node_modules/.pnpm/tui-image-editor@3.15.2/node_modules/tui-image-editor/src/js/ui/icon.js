import snippet from 'tui-code-snippet';
import Colorpicker from '@/ui/tools/colorpicker';
import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/icon';
import { isSupportFileApi, assignmentForDestroy } from '@/util';
import { defaultIconPath, eventNames, selectorNames } from '@/consts';

/**
 * Icon ui class
 * @class
 * @ignore
 */
class Icon extends Submenu {
  constructor(subMenuElement, { locale, makeSvgIcon, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'icon',
      makeSvgIcon,
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });

    this.iconType = null;
    this._iconMap = {};

    this._els = {
      registerIconButton: this.selector('.tie-icon-image-file'),
      addIconButton: this.selector('.tie-icon-add-button'),
      iconColorpicker: new Colorpicker(this.selector('.tie-icon-color'), {
        defaultColor: '#ffbb3b',
        toggleDirection: this.toggleDirection,
        usageStatistics: this.usageStatistics,
      }),
    };

    this.colorPickerInputBox = this._els.iconColorpicker.colorpickerElement.querySelector(
      selectorNames.COLOR_PICKER_INPUT_BOX
    );
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();
    this._els.iconColorpicker.destroy();

    assignmentForDestroy(this);
  }

  /**
   * Add event for icon
   * @param {Object} actions - actions for icon
   *   @param {Function} actions.registerCustomIcon - register icon
   *   @param {Function} actions.addIcon - add icon
   *   @param {Function} actions.changeColor - change icon color
   */
  addEvent(actions) {
    const registerIcon = this._registerIconHandler.bind(this);
    const addIcon = this._addIconHandler.bind(this);

    this.eventHandler = {
      registerIcon,
      addIcon,
    };

    this.actions = actions;
    this._els.iconColorpicker.on('change', this._changeColorHandler.bind(this));
    this._els.registerIconButton.addEventListener('change', registerIcon);
    this._els.addIconButton.addEventListener('click', addIcon);

    this.colorPickerInputBox.addEventListener(
      eventNames.FOCUS,
      this._onStartEditingInputBox.bind(this)
    );
    this.colorPickerInputBox.addEventListener(
      eventNames.BLUR,
      this._onStopEditingInputBox.bind(this)
    );
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    this._els.iconColorpicker.off();
    this._els.registerIconButton.removeEventListener('change', this.eventHandler.registerIcon);
    this._els.addIconButton.removeEventListener('click', this.eventHandler.addIcon);

    this.colorPickerInputBox.removeEventListener(
      eventNames.FOCUS,
      this._onStartEditingInputBox.bind(this)
    );
    this.colorPickerInputBox.removeEventListener(
      eventNames.BLUR,
      this._onStopEditingInputBox.bind(this)
    );
  }

  /**
   * Clear icon type
   */
  clearIconType() {
    this._els.addIconButton.classList.remove(this.iconType);
    this.iconType = null;
  }

  /**
   * Register default icon
   */
  registerDefaultIcon() {
    snippet.forEach(defaultIconPath, (path, type) => {
      this.actions.registerDefaultIcons(type, path);
    });
  }

  /**
   * Set icon picker color
   * @param {string} iconColor - rgb color string
   */
  setIconPickerColor(iconColor) {
    this._els.iconColorpicker.color = iconColor;
  }

  /**
   * Returns the menu to its default state.
   */
  changeStandbyMode() {
    this.clearIconType();
    this.actions.cancelAddIcon();
  }

  /**
   * Change icon color
   * @param {string} color - color for change
   * @private
   */
  _changeColorHandler(color) {
    color = color || 'transparent';
    this.actions.changeColor(color);
  }

  /**
   * Change icon color
   * @param {object} event - add button event object
   * @private
   */
  _addIconHandler(event) {
    const button = event.target.closest('.tui-image-editor-button');

    if (button) {
      const iconType = button.getAttribute('data-icontype');
      const iconColor = this._els.iconColorpicker.color;
      this.actions.discardSelection();
      this.actions.changeSelectableAll(false);
      this._els.addIconButton.classList.remove(this.iconType);
      this._els.addIconButton.classList.add(iconType);

      if (this.iconType === iconType) {
        this.changeStandbyMode();
      } else {
        this.actions.addIcon(iconType, iconColor);
        this.iconType = iconType;
      }
    }
  }

  /**
   * register icon
   * @param {object} event - file change event object
   * @private
   */
  _registerIconHandler(event) {
    let imgUrl;

    if (!isSupportFileApi) {
      alert('This browser does not support file-api');
    }

    const [file] = event.target.files;

    if (file) {
      imgUrl = URL.createObjectURL(file);
      this.actions.registerCustomIcon(imgUrl, file);
    }
  }
}

export default Icon;

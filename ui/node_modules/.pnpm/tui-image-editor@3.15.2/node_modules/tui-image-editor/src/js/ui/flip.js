import snippet from 'tui-code-snippet';
import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/flip';
import { assignmentForDestroy } from '@/util';

/**
 * Flip ui class
 * @class
 * @ignore
 */
class Flip extends Submenu {
  constructor(subMenuElement, { locale, makeSvgIcon, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'flip',
      makeSvgIcon,
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });
    this.flipStatus = false;

    this._els = {
      flipButton: this.selector('.tie-flip-button'),
    };
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();

    assignmentForDestroy(this);
  }

  /**
   * Add event for flip
   * @param {Object} actions - actions for flip
   *   @param {Function} actions.flip - flip action
   */
  addEvent(actions) {
    this.eventHandler.changeFlip = this._changeFlip.bind(this);
    this._actions = actions;
    this._els.flipButton.addEventListener('click', this.eventHandler.changeFlip);
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    this._els.flipButton.removeEventListener('click', this.eventHandler.changeFlip);
  }

  /**
   * change Flip status
   * @param {object} event - change event
   * @private
   */
  _changeFlip(event) {
    const button = event.target.closest('.tui-image-editor-button');
    if (button) {
      const flipType = this.getButtonType(button, ['flipX', 'flipY', 'resetFlip']);
      if (!this.flipStatus && flipType === 'resetFlip') {
        return;
      }

      this._actions.flip(flipType).then((flipStatus) => {
        const flipClassList = this._els.flipButton.classList;
        this.flipStatus = false;

        flipClassList.remove('resetFlip');
        snippet.forEach(['flipX', 'flipY'], (type) => {
          flipClassList.remove(type);
          if (flipStatus[type]) {
            flipClassList.add(type);
            flipClassList.add('resetFlip');
            this.flipStatus = true;
          }
        });
      });
    }
  }
}

export default Flip;

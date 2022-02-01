import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/mask';
import { assignmentForDestroy, isSupportFileApi } from '@/util';

/**
 * Mask ui class
 * @class
 * @ignore
 */
class Mask extends Submenu {
  constructor(subMenuElement, { locale, makeSvgIcon, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'mask',
      makeSvgIcon,
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });

    this._els = {
      applyButton: this.selector('.tie-mask-apply'),
      maskImageButton: this.selector('.tie-mask-image-file'),
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
   * Add event for mask
   * @param {Object} actions - actions for crop
   *   @param {Function} actions.loadImageFromURL - load image action
   *   @param {Function} actions.applyFilter - apply filter action
   */
  addEvent(actions) {
    const loadMaskFile = this._loadMaskFile.bind(this);
    const applyMask = this._applyMask.bind(this);

    this.eventHandler = {
      loadMaskFile,
      applyMask,
    };

    this.actions = actions;
    this._els.maskImageButton.addEventListener('change', loadMaskFile);
    this._els.applyButton.addEventListener('click', applyMask);
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    this._els.maskImageButton.removeEventListener('change', this.eventHandler.loadMaskFile);
    this._els.applyButton.removeEventListener('click', this.eventHandler.applyMask);
  }

  /**
   * Apply mask
   * @private
   */
  _applyMask() {
    this.actions.applyFilter();
    this._els.applyButton.classList.remove('active');
  }

  /**
   * Load mask file
   * @param {object} event - File change event object
   * @private
   */
  _loadMaskFile(event) {
    let imgUrl;

    if (!isSupportFileApi()) {
      alert('This browser does not support file-api');
    }

    const [file] = event.target.files;

    if (file) {
      imgUrl = URL.createObjectURL(file);
      this.actions.loadImageFromURL(imgUrl, file);
      this._els.applyButton.classList.add('active');
    }
  }
}

export default Mask;

/**
 * Menu Panel Class
 * @class
 * @ignore
 */

class Panel {
  /**
   * @param {HTMLElement} menuElement - menu dom element
   * @param {Object} options - menu options
   *   @param {string} options.name - name of panel menu
   */
  constructor(menuElement, { name }) {
    this.name = name;
    this.items = [];

    this.panelElement = this._makePanelElement();
    this.listElement = this._makeListElement();

    this.panelElement.appendChild(this.listElement);
    menuElement.appendChild(this.panelElement);
  }

  /**
   * Make Panel element
   * @returns {HTMLElement}
   */
  _makePanelElement() {
    const panel = document.createElement('div');

    panel.className = `tie-panel-${this.name}`;

    return panel;
  }

  /**
   * Make list element
   * @returns {HTMLElement} list element
   * @private
   */
  _makeListElement() {
    const list = document.createElement('ol');

    list.className = `${this.name}-list`;

    return list;
  }

  /**
   * Make list item element
   * @param {string} html - history list item html
   * @returns {HTMLElement} list item element
   */
  makeListItemElement(html) {
    const listItem = document.createElement('li');

    listItem.innerHTML = html;
    listItem.className = `${this.name}-item`;
    listItem.setAttribute('data-index', this.items.length);

    return listItem;
  }

  /**
   * Push list item element
   * @param {HTMLElement} item - list item element to add to the list
   */
  pushListItemElement(item) {
    this.listElement.appendChild(item);
    this.listElement.scrollTop += item.offsetHeight;
    this.items.push(item);
  }

  /**
   * Delete list item element
   * @param {number} start - start index to delete
   * @param {number} end - end index to delete
   */
  deleteListItemElement(start, end) {
    const { items } = this;

    for (let i = start; i < end; i += 1) {
      this.listElement.removeChild(items[i]);
    }
    items.splice(start, end - start + 1);
  }

  /**
   * Get list's length
   * @returns {number}
   */
  getListLength() {
    return this.items.length;
  }

  /**
   * Add class name of item
   * @param {number} index - index of item
   * @param {string} className - class name to add
   */
  addClass(index, className) {
    if (this.items[index]) {
      this.items[index].classList.add(className);
    }
  }

  /**
   * Remove class name of item
   * @param {number} index - index of item
   * @param {string} className - class name to remove
   */
  removeClass(index, className) {
    if (this.items[index]) {
      this.items[index].classList.remove(className);
    }
  }

  /**
   * Toggle class name of item
   * @param {number} index - index of item
   * @param {string} className - class name to remove
   */
  toggleClass(index, className) {
    if (this.items[index]) {
      this.items[index].classList.toggle(className);
    }
  }
}

export default Panel;

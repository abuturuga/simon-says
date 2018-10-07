((app) => {

  /**
   * Creates a new document element.
   *
   * @param   {string} className CSS class name
   * @returns {HTMLElement}
   */
  const $ = className => {
    const element = document.createElement('div');
    element.classList.add(className);
    return element;
  };

  /**
   * This component is responsible with rendering and managing
   * the interaction with the tiles from the game.
   *
   * @class
   */
  class TilesContainerComponent {

    constructor(rootSelector) {
      this.$rootElement = document.querySelector(rootSelector);
      this.$tilesContainer = null;
      this.$tiles = [];

      this.onTileClickCallback = () => {};
      this.isSelectable = false;
    }
    
    /**
     * Appends multiple childs elements into a container element.
     *
     * @param {HTMLElement} $container
     * @param {HTMLElement} $elements
     */
    appendToContainer($container, $elements) {
      $elements.forEach($element => $container.appendChild($element));
    }
    
    /**
     * Build a special CSS className in order to select a tile
     * by the number which it holds.
     *
     * @param    {number}  value  Number from the grid
     * @returns  {string}         CSS class name
     */
    getTileKey(value) {
      return `key-${value}`;
    }
    
    /**
     * Toggle a class on the container in order to indicate to user
     * that it can select the tiles with an hover effect.
     *
     * @param   {boolean} isSelectable Flag used to toggle CSS class
     */
    toggleSelectableTiles(isSelectable) {
      const className = 'is-selectable';

      isSelectable
        ? this.$tilesContainer.classList.add(className)
        : this.$tilesContainer.classList.remove(className);
    }

    onTileClick(callback) {
      if (!this.$tilesContainer) return;
  
      this.$tilesContainer.addEventListener('click', event => {
        const { target } = event;
  
        if (target.classList.contains('tile')) {
          const value = target.getAttribute('value');
          target.classList.add('selected');
          callback(parseInt(value));
        }
      });
    }
    
    clearTilesState() {
      this.$tiles.forEach($tile =>
        $tile.classList.remove('selected', 'pattern')
      );
    }

    showPattern(tiles) {
      this.clearTilesState();

      tiles.forEach(value => {
        const key = this.getTileKey(value);
        const $tile = document.querySelector(`.${key}`);

        $tile.classList.add('pattern');
      });
    }

    renderTile(value) {
      const element = $(`tile`);
      element.innerHTML = value;
      element.setAttribute('value', value);
      element.classList.add(this.getTileKey(value));
      return element;
    }
    
    renderRow(row) {
      const $tiles = row.map(tile => this.renderTile(tile));
      this.$tiles = [...this.$tiles, ...$tiles];

      const $row = $('row');
      this.appendToContainer($row, $tiles);
      return $row;
    }

    renderTiles(tiles) {
      this.$tiles = [];

      const $container = $('tiles-container');
      const $rows = tiles.map(row => this.renderRow(row));
      
      this.appendToContainer($container, $rows);
      return $container;
    }

    render(tiles) {
      this.$tilesContainer = this.renderTiles(tiles);
  
      this.$rootElement.innerHTML = '';
      this.$rootElement.appendChild(this.$tilesContainer);
    }
  }

  app.TilesContainerComponent = TilesContainerComponent;
})(window.app);
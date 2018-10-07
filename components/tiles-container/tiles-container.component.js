((app) => {

  const COMPONENT_CLASS = 'tiles-container',
        COMPONENT_SELECTABLE_CLASS = `${COMPONENT_CLASS}-selectable`,
        ROW_CLASS = `${COMPONENT_CLASS}--row`,
        TILE_CLASS = `${COMPONENT_CLASS}--tile`,
        TILE_SELECTED_CLASS = `${TILE_CLASS}-selected`,
        TILE_PATTERN_CLASS = `${TILE_CLASS}-pattern`;

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
     * @private
     * @param {HTMLElement} $container
     * @param {HTMLElement} $elements
     */
    _appendToContainer($container, $elements) {
      $elements.forEach($element => $container.appendChild($element));
    }
    
    /**
     * Build a special CSS className in order to select a tile
     * by the number which it holds.
     *
     * @private
     * @param    {number}  value  Number from the grid
     * @returns  {string}         CSS class name
     */
    _getTileKey(value) {
      return `key-${value}`;
    }
    
    /**
     * Toggle a class on the container in order to indicate to user
     * that it can select the tiles with an hover effect.
     *
     * @public
     * @param   {boolean} isSelectable Flag used to toggle CSS class
     */
    toggleSelectableTiles(isSelectable) {
      isSelectable
        ? this.$tilesContainer.classList.add(COMPONENT_SELECTABLE_CLASS)
        : this.$tilesContainer.classList.remove(COMPONENT_SELECTABLE_CLASS);

      this.isSelectable = isSelectable;
    }

    /**
     * Invoke the callback function only when a tile is selected.
     *
     * @public
     * @param {Function} callback Handle tile selection
     */
    onTileClick(callback) {
      if (!this.$tilesContainer) return;
  
      this.$tilesContainer.addEventListener('click', event => {
        const { target } = event;
        if (target.classList.contains(TILE_CLASS) && this.isSelectable) {
          const value = target.getAttribute('value');
          target.classList.add(TILE_SELECTED_CLASS);
          callback(parseInt(value));
        }
      });
    }
    
    /**
     * Remove any style on the tiles that indicates an user action.
     * 
     * @public
     */
    clearTilesState() {
      this.$tiles.forEach($tile =>
        $tile.classList.remove(TILE_SELECTED_CLASS, TILE_PATTERN_CLASS)
      );
    }

    /**
     * Display the pattern on the component.
     *
     * @public
     * @param {Array} tiles Array with the pattern
     */
    showPattern(tiles) {
      this.clearTilesState();

      tiles.forEach(value => {
        const key = this._getTileKey(value);
        const $tile = document.querySelector(`.${key}`);

        $tile.classList.add(TILE_PATTERN_CLASS);
      });
    }

    /**
     * Display the selected tiles.
     *
     * @public
     * @param {Array} tiles Array with the pattern
     */
    showSelected(tiles) {
      tiles.forEach(value => {
        const key = this._getTileKey(value);
        const $tile = document.querySelector(`.${key}`);

        $tile.classList.add(TILE_SELECTED_CLASS);
      });
    }

    /**
     * Render a tile based on a number value.
     *
     * @private
     * @param {number} value Tile number
     * @returns {HTMLElement}
     */
    _renderTile(value) {
      const element = $(TILE_CLASS);
      element.innerHTML = value;
      element.setAttribute('value', value);
      element.classList.add(this._getTileKey(value));
      return element;
    }
    
    /**
     * Render an entire row of tiles.
     *
     * @private
     * @param {Array} row Tiles row
     * @returns {HTMLElement}
     */
    _renderRow(row) {
      const $tiles = row.map(tile => this._renderTile(tile));
      this.$tiles = [...this.$tiles, ...$tiles];

      const $row = $(ROW_CLASS);
      this._appendToContainer($row, $tiles);
      return $row;
    }

    /**
     * Map the tiles array into the corresponding html elements.
     * 
     * @private
     * @param {Array} tiles 2 diminesional array with tiles
     * @returns {HTMLElement}
     */
    _renderTiles(tiles) {
      this.$tiles = [];

      const $container = $(COMPONENT_CLASS);
      const $rows = tiles.map(row => this._renderRow(row));
      
      this._appendToContainer($container, $rows);
      return $container;
    }

    /**
     * Render the component into the provided root element.
     * 
     * @public
     * @param {Array} tiles 2 dimensional array with tiles
     */
    render(tiles) {
      this.$tilesContainer = this._renderTiles(tiles);
  
      this.$rootElement.innerHTML = '';
      this.$rootElement.appendChild(this.$tilesContainer);
    }
  }

  app.TilesContainerComponent = TilesContainerComponent;
})(window.app);
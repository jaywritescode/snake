import _ from 'lodash';
import { html, render } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import jss from 'jss';
import preset from 'jss-preset-default';

import './index.css';

jss.setup(preset());

const width = 28;
const height = 16;
const area = (width + 2) * (height + 2);

const States = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in progress',
  GAME_OVER: 'game over',
};

const styles = {
  'board': {
    display: 'grid',
    gridTemplateColumns: `repeat(${width + 2}, 1fr)`,
    gridGap: '2px',

    border: '3px solid rgb(43, 51, 104)',
    position: 'relative',
    cursor: 'none',
  },
};
const stylesheet = jss.createStyleSheet(styles);
stylesheet.attach();

let state = States.WAITING;

function initialize() {

}

const reset = () => {
  console.log('reset');
};

// const RIGHT = 'right', LEFT = 'left', UP = 'up', DOWN = 'down';

// const initialCoords = [[3, 3], [3, 4], [3, 5]].map(([row, col]) => row * width + col);
// const initialSnake = {
//   coords: initialCoords,
//   direction: RIGHT,

//   head() {
//     return _.last(this.coords)
//   },

//   collides() {
//     return _.uniq(this.coords).length != this.size();
//   },

//   size() {
//     return this.coords.length;
//   },

//   has(coord) {
//     return this.coords.includes(coord);
//   },
// };

// The game logic assumes that there is a wall around the border of the board.
// const initialWall = new Set(
//   Array.of(
//     _.range(width), // top
//     _.range(0, area, width), // left side
//     _.times(width, (i) => area - i - 1), // bottom
//     _.range(width - 1, area, width) // right side
//   ).flat()
// );

const cells = repeat(_.range(area), _.identity, idx => html`<div id="cell-${idx}" class="cell" />`);
const board = html`
  <div class="${stylesheet.classes.board}">
    ${cells}
    ${state === States.WAITING && html`<div class="overlay" @click=${reset}>click to start</div>`}
  </div>`;

render(board, document.getElementById('app'));
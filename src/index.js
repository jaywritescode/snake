import _ from 'lodash';
import { html, render, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { classMap } from 'lit-html/directives/class-map';
import jss from 'jss';
import preset from 'jss-preset-default';

import './index.css';

const width = 30;
const height = 18;
const area = width * height;
const speed = 200;

const WAITING = 'waiting',
  IN_PROGRESS = 'in progress',
  GAME_OVER = 'game over';

const RIGHT = 'right',
  LEFT = 'left',
  UP = 'up',
  DOWN = 'down';

const keyFunctions = {
  ArrowUp: () => {
    game.changeDirection(UP);
  },
  ArrowDown: (snake) => {
    game.changeDirection(DOWN);
  },
  ArrowRight: (snake) => {
    game.changeDirection(RIGHT);
  },
  ArrowLeft: (snake) => {
    game.changeDirection(LEFT);
  },
  Space: () => {
    isPaused ? unpause() : pause();
  },
};

const opposites = Object.freeze({
  [UP]: DOWN,
  [DOWN]: UP,
  [RIGHT]: LEFT,
  [LEFT]: RIGHT,
});

const moveFunctions = Object.freeze({
  [RIGHT]: (coord) => coord + 1,
  [LEFT]: (coord) => coord - 1,
  [UP]: (coord) => coord - width,
  [DOWN]: (coord) => coord + width,
});

// These are required to make sure the move functions above never overflow or underflow.
const borders = Array.of(
    _.range(width), // top
    _.range(0, area, width), // left side
    _.times(width, (i) => area - i - 1), // bottom
    _.range(width - 1, area, width), // right side
  ).flat();
const initialSnake = [[3, 3], [3, 4], [3, 5],].map(([row, col]) => row * width + col);

const Snake = () => {
  return {
    coords: initialSnake,
    direction: RIGHT,

    head() {
      return _.last(this.coords);
    },

    has(coord) {
      return this.coords.includes(coord);
    },

    collides() {
      return _.uniq(this.coords).length != this.coords.length;
    },

    size() {
      return initialCoords.length;
    },
  };
};

/* Initial state */
let state = WAITING;
let game = null;
let timer = null;
let isPaused = false;

const Game = (walls = borders) => {
  var snake = Snake();
  var blocks = new Set(walls);
  var food = _.tap(new Set(), set => set.add(getValidFoodCoord()));

  function isSnake(coord) {
    return snake.has(coord);
  }

  function isWall(coord) {
    return blocks.has(coord);
  }

  function isFood(coord) {
    return food?.has(coord);
  }

  function getValidFoodCoord() {
    return _.sample(
      _.range(area).filter(coord => !(isSnake(coord) || isWall(coord) || isFood(coord))),
    );
  };

  const updateFood = (coord) => {
    food.add(getValidFoodCoord());
    food.delete(coord);
  };

  const forward = () => {
    const { direction } = snake;
    return moveFunctions[direction](snake.head());
  };

  const update = () => {
    let _;
    const next = forward();

    if (food.has(next)) {
      snake.coords = [...snake.coords, next];
      updateFood(next);
    } else {
      [_, ...snake.coords] = [...snake.coords, next];
    }

    return !(snake.collides() || blocks.has(snake.head()));
  }

  const changeDirection = (direction) => {
    if (direction == opposites[snake.direction]) {
      return;
    }
    snake.direction = direction;
  }

  return { isSnake, isWall, isFood, update, changeDirection };
};

const doNext = () => {
  if (game.update()) {
    updateView();
  }
  else {
    gameOver();
  }
}

const reset = () => {
  game = Game();
  state = IN_PROGRESS;
};

const start = () => {
  reset();
  updateView();
  run();
};

const run = () => {
  if (timer) {
    return;
  }

  isPaused = false;
  timer = setInterval(doNext, speed);
};

const gameOver = () => {
  clearInterval(timer);
  timer = null;
  state = GAME_OVER;
};

const pause = () => {
  clearInterval(timer);
  timer = null;
  isPaused = true;
};

const unpause = () => {
  isPaused = false;
  timer = setInterval(doNext, speed);
};

/* Presentation layer */

window.addEventListener('keydown', (evt) => {
  if (state !== IN_PROGRESS) {
    return;
  }

  const { code } = evt;
  if (Object.keys(keyFunctions).includes(code)) {
    keyFunctions[code].call();
    evt.preventDefault();
  }
});

jss.setup(preset());

const styles = {
  board: {
    display: 'grid',
    gridTemplateColumns: `repeat(${width}, 1fr)`,
    gridGap: '2px',

    border: '3px solid rgb(43, 51, 104)',
    position: 'relative',
    cursor: 'none',
  },

  snake: {
    backgroundColor: 'var(--snake-color)',
    borderRadius: '4px',
  },

  food: {
    backgroundColor: 'var(--food-color)',
    borderRadius: '50%',
  },

  wall: {
    backgroundColor: 'var(--wall-color)',
  },
};
const stylesheet = jss.createStyleSheet(styles);
stylesheet.attach();

const template = () => {
  function classes(idx) {
    if (!game) {
      return false;
    }

    return {
      [stylesheet.classes.snake]: game.isSnake(idx),
      [stylesheet.classes.food]: game.isFood(idx),
      [stylesheet.classes.wall]: game.isWall(idx),
    };
  }

  const overlays = {
    [WAITING]: html`<div class="overlay" @click=${start}>click to start</div>`,
    [GAME_OVER]: html`<div class="overlay" @click=${start}>game over</div>`,
  };

  return html` <div class="${stylesheet.classes.board}">
    ${repeat(
      _.range(area),
      _.identity,
      (idx) =>
        html`<div id="cell-${idx}" class="cell ${classMap(classes(idx))}" />`,
    )}
    ${_.defaultTo(overlays[state], nothing)}
  </div>`;
};

const renderRoot = document.getElementById('app');
const updateView = () => {
  render(template(), renderRoot);
};
updateView();

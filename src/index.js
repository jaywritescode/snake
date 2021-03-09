import _ from 'lodash';
import { html, render, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { classMap } from 'lit-html/directives/class-map';
import jss from 'jss';
import preset from 'jss-preset-default';

import './index.css';

jss.setup(preset());

const width = 30;
const height = 18;
const area = width * height;
const speed = 200;

const States = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in progress',
  GAME_OVER: 'game over',
};

const RIGHT = 'right',
  LEFT = 'left',
  UP = 'up',
  DOWN = 'down';

const keyFunctions = {
  ArrowUp: () => {
    snake.direction = snake.direction == DOWN ? DOWN : UP;
  },
  ArrowDown: () => {
    snake.direction = snake.direction == UP ? UP : DOWN;
  },
  ArrowRight: () => {
    snake.direction = snake.direction == LEFT ? LEFT : RIGHT;
  },
  ArrowLeft: () => {
    snake.direction = snake.direction == RIGHT ? RIGHT : LEFT;
  },
  Space: () => {
    isPaused ? unpause() : pause();
  },
};

// These values can never overflow or underflow because of the wall around the board.
const moveFunctions = Object.freeze({
  [RIGHT]: (coord) => coord + 1,
  [LEFT]: (coord) => coord - 1,
  [UP]: (coord) => coord - width,
  [DOWN]: (coord) => coord + width,
});

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

const Snake = (initialCoords = []) => {
  return {
    coords: initialCoords,
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

/* Nil state */
let state = States.WAITING;
const snake = Snake();
const walls = new Set(
  Array.of(
    _.range(width), // top
    _.range(0, area, width), // left side
    _.times(width, (i) => area - i - 1), // bottom
    _.range(width - 1, area, width), // right side
  ).flat(),
);
const food = new Set();
let timer = null;
let isPaused = false;

const assignFood = () => {
  return _.sample(
    _.range(area).filter((x) => !(snake.has(x) || walls.has(x) || food.has(x))),
  );
};

const updateFood = (coord) => {
  if (!food.has(coord)) {
    return;
  }

  food.add(assignFood());
  food.delete(coord);
};

const forward = () => {
  const { direction } = snake;
  return moveFunctions[direction](snake.head());
};

const doNext = () => {
  let _;
  const next = forward();

  if (food.has(next)) {
    snake.coords = [...snake.coords, next];
    updateFood(next);
  } else {
    [_, ...snake.coords] = [...snake.coords, next];
  }

  if (snake.collides() || walls.has(snake.head())) {
    gameOver();
  }
  _update();
};

const reset = () => {
  snake.coords = [
    [3, 3],
    [3, 4],
    [3, 5],
  ].map(([row, col]) => row * width + col);
  food.add(assignFood());
  state = States.IN_PROGRESS;
  _update();
};

const start = () => {
  reset();
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
  state = States.GAME_OVER;
};

const _update = () => {
  render(template(), renderRoot);
};

window.addEventListener('keydown', (evt) => {
  if (state !== States.IN_PROGRESS) {
    return;
  }

  const { code } = evt;
  if (Object.keys(keyFunctions).includes(code)) {
    keyFunctions[code].call();
    evt.preventDefault();
  }
});

const classes = (idx) => {
  return {
    [stylesheet.classes.snake]: snake.has(idx),
    [stylesheet.classes.food]: food.has(idx),
    [stylesheet.classes.wall]: walls.has(idx),
  };
};
const cells = repeat(
  _.range(area),
  _.identity,
  (idx) =>
    html`<div id="cell-${idx}" class="cell ${classMap(classes(idx))}" />`,
);
const overlay = () => {
  switch (state) {
    case States.WAITING:
      return html`<div class="overlay" @click=${start}>click to start</div>`;
    case States.GAME_OVER:
      return html`<div class="overlay" @click=${start}>game over</div>`;
    default:
      return nothing;
  }
};
const template = () => html` <div class="${stylesheet.classes.board}">
    ${cells} ${overlay()}
  </div>`;
const renderRoot = document.getElementById('app');
_update();

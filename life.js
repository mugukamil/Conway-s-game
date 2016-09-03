function $(selector, container) {
  return (container || document).querySelector(selector);
}

class Life {

  constructor(seed) {
    this.seed = seed;
    this.height = seed.length;
    this.width = seed[0].length;

    this.prevBoard = [];
    // this.board = seed.slice().map(row => row.slice());
    this.board = this.cloneArray(seed);
  }

  cloneArray(arr) {
    return arr.slice().map(row => row.slice());
  }

  next() {
    this.prevBoard = this.cloneArray(this.board);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let neighbors = this.aliveNeighbors(this.prevBoard, x, y);
        let alive = !!this.board[y][x];

        if (alive) {
          if (neighbors < 2 || neighbors > 3) {
            this.board[y][x] = 0;
          }
        } else {
          if (neighbors === 3) {
            this.board[y][x] = 1;
          }
        }
      }
    }
  }

  aliveNeighbors(arr, x, y) {
    let prevRow = arr[y - 1] || [];
    let nextRow = arr[y + 1] || [];

    return [
      prevRow[x - 1], prevRow[x], prevRow[x + 1],
      arr[y][x - 1], arr[y][x + 1],
      nextRow[x - 1], nextRow[x], nextRow[x + 1]
    ].reduce((prev, cur) => prev + +!!cur, 0);
  }

  toString() {
    return this.board.map(row => row.join(' ')).join('\n');
  }
}

class LifeView {
  constructor(table, size) {
    this.grid = grid;
    this.size = size;
    this.started = false;
    this.autoplay = false;
    this.createGrid();
  }

  createGrid() {
    const fragment = document.createDocumentFragment();
    this.grid.innerHTML = '';
    this.checkboxes = [];

    for (let y = 0; y < this.size; y++) {
      let row = document.createElement('tr');
      this.checkboxes[y] = [];

      for (let x = 0; x < this.size; x++) {
        let cell = document.createElement('td');
        let checkbox = document.createElement('input');
        this.checkboxes[y][x] = checkbox;
        checkbox.coords = [y, x];

        checkbox.type = 'checkbox';
        cell.appendChild(checkbox);
        row.appendChild(cell);
      }

      fragment.appendChild(row);
    }

    this.grid.addEventListener('change', (e) => {
      if (e.target.nodeName.toLowerCase() == 'input') {
        this.started = false;
      }
    });

    this.grid.addEventListener('keyup', (e) => {
      let checkbox = e.target;

      if (checkbox.nodeName.toLowerCase() == 'input') {
        let coords = checkbox.coords;
        let y = coords[0];
        let x = coords[1];

        switch (e.keyCode) {
          case 37:
            if (x > 0) {
              this.checkboxes[y][x - 1].focus();
            }
            break;
          case 38:
            if (y > 0) {
              this.checkboxes[y - 1][x].focus();
            }
            break;
          case 39:
            if (x < this.size - 1) {
              this.checkboxes[y][x + 1].focus();
            }
            break;
          case 40:
            if (y < this.size - 1) {
              this.checkboxes[y + 1][x].focus();
            }
            break;
        }
      }
    });

    this.grid.appendChild(fragment);
  }

  get boardArray() {
    return this.checkboxes
      .map(row => row
        .map(checkbox => +checkbox.checked));
  }

  play() {
    this.game = new Life(this.boardArray);
    this.started = true;
  }

  next() {
    if (!this.started || this.game) {
      this.play();
    }

    this.game.next();
    let board = this.game.board;

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.checkboxes[y][x].checked = !!board[y][x]
      }
    }

    if (this.autoplay) {
      setTimeout(() => {
        this.next();
      }, 1000);
    }
  }
}

const lifeView = new LifeView(document.querySelector('#grid'), 12);

$('button.next').addEventListener('click', (e) => {
  lifeView.next();
});

$('#autoplay').addEventListener('change', function(e) {
  $('button.next').textContent = this.checked ? 'Start' : 'Next';

  lifeView.autoplay = this.checked;
});

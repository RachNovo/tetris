
// if (typeof window !== 'undefined') {
//   const startEl = document.getElementById("start");
//   startEl.addEventListener("click", () => {
//     start();
//   });

//   const pauseEl = document.getElementById("pause");
//   pauseEl.addEventListener("click", () => {
//     pause();
//   });

//   const quitEl = document.getElementById("quit");
//   quitEl.addEventListener("click", () => {
//     quit();
//   });
// }


/*
Tetris



-fun facts on start page
  -how much faster is each level
  -facts about history of tetris
    -quote about tetris not being popular in the us
    -inventor of tetris
    -origin of tetris name
  -revenue of tetris company? compared to how much the inventor got
  -how it was first coded
  -what's the music in the game
  -what the pieces are called
  -origin of the tetrinimos

window.requestAnimationFrame(main);
event handlers


*/

//['back to default from 3', 'to rotation 1', 'to rotation 2', 'to rotation 3']
const rotationFormula = {
    I: {
      a: [[-2, 1], [1, 2], [2, -1], [-1, -2]],
      b: [[-1, 0], [0, 1], [1, 0], [0, -1]],
      c: [[0, -1], [-1, 0], [0, 1], [1, 0]],
      d: [[1, -2], [-2, -1], [-1, 2], [2, 1]]
    },
    J: {
      a: [[-1, 1], [1, 1], [1, -1], [-1, -1]],
      b: [[0, 0], [0, 0], [0, 0], [0, 0]],
      c: [[0, -2], [-2, 0], [0, 2], [2, 0]],
      d: [[1, -1], [-1, -1], [-1, 1], [1, 1]]
    },
    L: {
      a: [[-1, 1], [1, 1], [1, -1], [-1, -1]],
      b: [[0, 0], [0, 0], [0, 0], [0, 0]],
      c: [[1, -1], [-1, -1], [-1, 1], [1, 1]],
      d: [[2, 0], [0, -2], [-2, 0], [0, 2]]
    },
    O: {
      a: [[0, 0], [0, 0], [0, 0], [0, 0]],
      b: [[0, 0], [0, 0], [0, 0], [0, 0]],
      c: [[0, 0], [0, 0], [0, 0], [0, 0]],
      d: [[0, 0], [0, 0], [0, 0], [0, 0]]
    },
    S: {
      a: [[-1, 1], [1, 1], [1, -1], [-1, -1]],
      b: [[0, 2], [2, 0], [0, -2], [-2, 0]],
      c: [[-1, -1], [-1, 1], [1, 1], [1, -1]],
      d: [[0, 0], [0, 0], [0, 0], [0, 0]]
    },
    T: {
      a: [[-1, -1], [-1, 1], [1, 1], [1, -1]],
      b: [[0, 0], [0, 0], [0, 0], [0, 0]],
      c: [[1, 1], [1, -1], [-1, -1], [-1, 1]],
      d: [[1, -1], [-1, -1], [-1, 1], [1, 1]]
    },
    Z: {
      a: [[-2, 0], [0, 2], [2, 0], [0, -2]],
      b: [[-1, 1], [1, 1], [1, -1], [-1, -1]],
      c: [[0, 0], [0, 0], [0, 0], [0, 0]],
      d: [[1, 1], [1, -1], [-1, -1], [-1, 1]]
    }
  };
  
  let board = [];
  let bag = [];
  let speed = 1;
  let level = 1;
  let lines = 0;
  let delay = 800;
  let intervalId = 0;
  let paused = false;
  let context = null;
  let currentPiece = '';
  let pieceNum = 0;
  let state = {};
  
  const start = (contextStore, stateFuncs) => {
    state = stateFuncs;
    context = contextStore;
    level = 1;
    paused = false;
    if(intervalId === 0) {
      console.log('game has started');
      intervalId = setInterval(() => {
        if(!paused) {
          listen(board);
          lineHandler();
          if(!existsCurrentPiece(board)) addPiece();
          bag.length === 0 && fillBag();
          state.setNextPiece(bag[0]);
          move('down');
        }
      }, delay);
    }
  };
  
  const listen = () => {
    if (typeof window !== 'undefined') {
      document.onkeydown = function(event, context) {
    
        const moveLeft = (context) => move('left', context);
        const moveRight = (context) => move('right', context);
        const moveDown = (context) => move('down', context);
        const rotatePiece = (context) => rotate('down', context);
    
        const codes = {
          Space: hardMoveDown,
          ArrowLeft: moveLeft,
          ArrowUp: rotatePiece,
          ArrowRight: moveRight,
          ArrowDown: moveDown,
          KeyP: pause,
          KeyQ: quit
        }
        if (event.code) {
          codes[event.code]?.(context);
        };
      };
    }
  };
  
  const drawBoard = () => {
    const colors = {
      I: '#58c4f4',
      J: '#0834f4',
      L: '#f87404',
      O: '#f8f404',
      S: '#10f404',
      T: '#b804f4',
      Z: '#fc2804'
    };
    const pieceSize = 10;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    board?.forEach((row, rowIndex) => {
      row?.forEach((space, spaceIndex) => {
        if (space !== null) {
          context.rect(0, 0, context.canvas.width, context.canvas.height);
          context.fillStyle = colors[space.piece];
          context.fillRect(spaceIndex * pieceSize, rowIndex * pieceSize, pieceSize, pieceSize);
          context.strokeStyle = "black";
          const offSet = spaceIndex === 0 ? .5 : -.5;
          context.strokeRect(spaceIndex * pieceSize + offSet, rowIndex * pieceSize - .5, pieceSize, pieceSize);
        };
      })
    });
  };
  
  const addPiece = () => {
    let newBoard = createCopy(board);
    const newPiece = bag.shift();
    const positions = spawnPositions[newPiece];
    if(!canAddPiece(positions)) {
      quit();
      return;
    }
    for(let subPiece in positions) {
      const pieces = {
        I: { piece: 'I', isCurrent: true, subSection: '', orientation: 0 },
        O: { piece: 'O', isCurrent: true, subSection: '', orientation: 0 },
        L: { piece: 'L', isCurrent: true, subSection: '', orientation: 0 },
        J: { piece: 'J', isCurrent: true, subSection: '', orientation: 0 },
        T: { piece: 'T', isCurrent: true, subSection: '', orientation: 0 },
        S: { piece: 'S', isCurrent: true, subSection: '', orientation: 0 },
        Z: { piece: 'Z', isCurrent: true, subSection: '', orientation: 0 }
      };
      currentPiece = pieces[newPiece];
      currentPiece.subSection = subPiece;
      newBoard[positions[subPiece][0]][positions[subPiece][1]] = currentPiece;
    }
    pieceNum++;
    board = newBoard;
  };
  
  const canAddPiece = (positions) => {
    if(board.length === 0) return true;
    let canAddPiece = true;
    for(let subPiece in positions) {
      if(board?.[positions[subPiece][0]]?.[positions[subPiece][1]] !== null) {
        canAddPiece = false;
      }
    }
    return canAddPiece;
  };
  
  const createCopy = (board) => {
    const newBoard = createBlankBoard();
    board?.forEach((row, rowIndex) => {
      row?.forEach((space, spaceIndex) => {
        if (space !== null) {
          newBoard[rowIndex].splice(spaceIndex, 1, space);
        }
      });
    });
    return newBoard;
  };
  
  const createBlankBoard = () => {
    return ([
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null]
    ]);
  }
  
  const spawnPositions = {
    I: { a: [0, 5], b: [1, 5], c: [2, 5], d: [3, 5] },
    J: { a: [0, 5], b: [1, 5], c: [2, 4], d: [2, 5] },
    L: { a: [0, 4], b: [1, 4], c: [2, 4], d: [2, 5] },
    O: { a: [0, 4], b: [0, 5], c: [1, 4], d: [1, 5] },
    S: { a: [0, 4], b: [0, 5], c: [1, 3], d: [1, 4] },
    T: { a: [0, 3], b: [0, 4], c: [0, 5], d: [1, 4] },
    Z: { a: [0, 4], b: [0, 5], c: [1, 5], d: [1, 6] }
  };
  
  const fillBag = () => {
    const pieces = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    bag = pieces
      .map(el => ({ el, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ el }) => el);
  };
  
  const existsCurrentPiece = (board) => {
    let existsCurrentPiece = false;
    board.forEach((row) => {
      row.forEach((space) => {
        if (space?.isCurrent) {
          existsCurrentPiece = true;
        };
      })
    });
    return existsCurrentPiece;
  };
  
  const pause = () => {
    paused = !paused;
    console.log(`game is paused: ${paused}`);
  };
  
  const lineHandler = () => {
    const newBoard = createCopy(board);
    board?.forEach((row, rowIndex) => {
      if(!row.includes(null)) {
        lines++
        state.setLines(lines);
        if (lines >= level * 10) {
          level++;
          state.setLevel(level);
          delay = delay - 50;
          console.log('delay is: ', delay);
        }
        newBoard.splice(rowIndex, 1);
        newBoard.unshift([null, null, null, null, null, null, null, null, null, null]);
      }
    })
    board = newBoard;
    drawBoard(context);
  };
  
  const quit = () => {
    console.log('game is over/quit');
    clearInterval(intervalId);
    intervalId = undefined;
  };
  
  const canMove = (direction) => {
    let canMove = true;
    board?.forEach((row, rowIndex) => {
      row?.forEach((space, spaceIndex) => {
        if (space?.isCurrent) {
          let targetSpace;
          if (direction === 'left') targetSpace = row[spaceIndex - 1];
          if (direction === 'right') targetSpace = row[spaceIndex + 1];
          if (direction === 'down') targetSpace = board[rowIndex + 1] && board[rowIndex + 1][spaceIndex];
          if (!(targetSpace?.isCurrent || targetSpace === null)) {
            canMove = false;
          }
        }
      })
    })
    return canMove;
  };
  
  const move = (direction) => {
    const newBoard = createBlankBoard();
    if (!canMove(direction)) {
      if(direction === 'down') {
        board?.forEach((row) => {
          row?.forEach((space) => {
            if (space?.isCurrent) {
              space.isCurrent = false;
            };
          });
        });
      } else {
        return;
      };
    }
    board?.forEach((row, rowIndex) => {
      row?.forEach((space, spaceIndex) => {
        if (space?.isCurrent) {
          if (direction === 'down') newBoard[rowIndex + 1].splice(spaceIndex, 1, space);
          if (direction === 'left') newBoard[rowIndex].splice(spaceIndex - 1, 1, space);
          if (direction === 'right') newBoard[rowIndex].splice(spaceIndex + 1, 1, space);
        } else if (space !== null) {
          newBoard[rowIndex].splice(spaceIndex, 1, space);
        }
      })
    });
    board = newBoard;
    drawBoard(context);
  };
  
  const hardMoveDown = () => {
    if (!canMove('down')) return;
    for(let i = 0; i < 20; i++) {
      move('down');
    }
  };
  
  const canRotate = () => {
    let canRotate = true;
    board?.forEach((row, rowIndex) => {
      row?.forEach((space, spaceIndex) => {
        if (space?.isCurrent) {
          const nextOrientation = space.orientation < 3 ? space.orientation + 1 : 0;
          const positionFormula = rotationFormula[space.piece][space.subSection][nextOrientation];
          const targetSpace = board?.[rowIndex + positionFormula[0]]?.[spaceIndex + positionFormula[1]];
          if (!(targetSpace?.isCurrent || targetSpace === null)) {
            canRotate = false;
          };
        };
      });
    });
    return canRotate;
  };
  
  const rotate = () => {
    if (!canRotate()) return board;
    let newBoard = createBlankBoard();
    board?.forEach((row, rowIndex) => {
      row?.forEach((space, spaceIndex) => {
        if (space?.isCurrent) {
          const nextOrientation = space.orientation < 3 ? space.orientation + 1 : 0;
          const positionFormula = rotationFormula[space.piece][space.subSection][nextOrientation];
          newBoard[rowIndex + positionFormula[0]][spaceIndex + positionFormula[1]] = { ...space, orientation: nextOrientation };
        } else if (space !== null) {
          newBoard[rowIndex].splice(spaceIndex, 1, space);
        };
      });
    });
    board = newBoard;
    drawBoard(context);
  };
  
  export {
    start,
    lineHandler,
    move,
    hardMoveDown,
    rotate,
    createBlankBoard,
    createCopy,
    fillBag,
    paused,
    pause,
    addPiece,
    existsCurrentPiece,
    spawnPositions,
    bag,
    board,
    drawBoard
  };
  
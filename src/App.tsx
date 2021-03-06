import { create } from 'domain';
import React from 'react';
import './App.css';
import { Cell, DoubledCoord } from './double';
import { createRows, HexGrid, iterRowCol } from './hexgrid';

interface Hex {
  x: number;
  y: number;
}

function distance(a: Hex, b: Hex): number {
  return 0;
}

const startOrder = 4;

var rows: number[][] = createRows(startOrder);

function setInRows(rows: number[][], coord: DoubledCoord, value: number) {
  const c = coord.toRowAndColumn();
  if (rows[c.row] && rows[c.row][c.col] >= 0) {
    rows[c.row][c.col] = value;
  }
}

function getDoubleCoords(rows: number[][], newDot: DoubledCoord) {
  const doublePts: DoubledCoord[] = [];
  rows.forEach((arr, row) => {
    arr.forEach((x, col) => {
      if (x === 1) {
        const otherDot = DoubledCoord.FromRowAndColumn(row, col);

        // TODO block double points
        const diff = DoubledCoord.subtract(newDot, otherDot);
        const double1 = DoubledCoord.add(newDot, diff);
        const double2 = DoubledCoord.add(otherDot, DoubledCoord.multiply(diff, -1));
        doublePts.push(double1);
        doublePts.push(double2);
      }
    });
  });

  return doublePts;
}

function getMiddleCoords(rows: number[][], newDot: DoubledCoord) {
  const middlePts: DoubledCoord[] = [];
  rows.forEach((arr, row) => {
    arr.forEach((x, col) => {
      if (x === 1) {
        const otherDot = DoubledCoord.FromRowAndColumn(row, col);
        const midDot = DoubledCoord.multiply(DoubledCoord.add(otherDot, newDot), .5);
        middlePts.push(midDot);
      }
    });
  });

  return middlePts;
}

// -1 is empty cell, just for offset, always ignore these and never set a value there
// 0 is empty
// 1 is filled
// 2 is blocked! (already a mid point!)
function addNewDot(rows: number[][], i: number, j: number) {
  if (rows[i][j] != 0) { return; }

  const newDot = DoubledCoord.FromRowAndColumn(i, j);

  const doublePts = getDoubleCoords(rows, newDot);
  doublePts.forEach(pt => {
    setInRows(rows, pt, 3);
  });

  const middlePts = getMiddleCoords(rows, newDot);
  middlePts.forEach(pt => {
    setInRows(rows, pt, 2);
  })

  rows[i][j] = 1;
}

function testAddNewDot(rows: number[][], i: number, j: number) {
  if (rows[i][j] != 0) { return Number.MAX_SAFE_INTEGER; }

  const newDot = DoubledCoord.FromRowAndColumn(i, j);
  const doublePts = getDoubleCoords(rows, newDot);
  const middlePts = getMiddleCoords(rows, newDot);

  const newPts: { [key: string]: boolean } = {};

  let count = 0;
  doublePts.forEach(pt => {
    if (!newPts[pt.toString()]) count++;
    newPts[pt.toString()] = true;
  });

  middlePts.forEach(pt => {
    if (!newPts[pt.toString()]) count++;
    newPts[pt.toString()] = true;
  });

  return count;
}

function countOnes(rows: number[][]) {
  let count = 0;
  iterRowCol(rows, (x) => {
    if (x === 1) { count++; }
  });
  return count;
}

function clear(rows: number[][]) {
  iterRowCol(rows, (x, row, col) => {
    if (x > 0) { rows[row][col] = 0; }
  });
}

function copy(rows: number[][]) {
  let newRows: number[][] = [];
  iterRowCol(rows, (value, row, col) => {
    newRows[row] = newRows[row] || [];
    newRows[row][col] = value;
  });
  return newRows;
}

function result(rows: number[][]) {
  return rows.map((row) => {
    const indexes: number[] = [];
    let deadCells = 0;
    row.forEach((x, col) => {
      if (x === -1) { deadCells++ }
      // this doesn't handle DEAD CELLS!
      if (x === 1) indexes.push(col - deadCells);
    });
    return `{${indexes.join(',')}}`;
  }).join(', ');
}

function fromResult(str: string) {
  console.log("entered!");

  // parse the string and turn it into rows and set the rows...
  const splits = str.split("},");
  const order = (splits.length + 1) / 2;
  console.log("I think it is order", order);
  const enteredRows = createRows(order);

  // this doesn't handle DEAD CELLS!
  splits.forEach((row, i) => {
    row = row.replace("{", "");
    row = row.replace("}", "");
    console.log("row", row);
    const cells = row.split(",").map(c => Number.parseInt(c.trim())).filter(n => !isNaN(n));
    console.log(cells);
    // j needs to be offset by number of deadcells in that row.
    const deadcells = enteredRows[i].filter(x => x === -1).length;
    cells.forEach(j => {
      addNewDot(enteredRows, i, j + deadcells);
    });
  });

  return {
    order,
    rows: enteredRows,
  };
}

function getRandom(max: number) {
  return Math.floor(Math.random() * max);
}

function randomOrder(num: number) {
  // place a random order or 1-num in an array.
  var arr = [];
  for (let i = 0; i < num; i++) {
    arr.push({
      index: i,
      rand: Math.random()
    });
  }
  arr.sort((a, b) => a.rand - b.rand);
  return arr.map(x => x.index);
}

function time(count: number, func: () => void) {
  const start = performance.now();

  for (let i = 0; i < count; i++) {
    func();
  }

  return performance.now() - start;
}

console.log(() => {
  console.log("testing!");

  const newtime = time(1000, () => randomOpenCell(rows));
  console.log("new time!", newtime);

  const oldtime = time(1000, () => old_randomOpenCell(rows));

  console.log("old time!", oldtime);

});

function randomOpenCell(rows: number[][]) {
  const rowOrder = randomOrder(rows.length);
  for (let i = 0; i < rows.length; i++) {
    const row = rowOrder[i];
    const row_arr = rows[row];

    const openIndexes: number[] = [];
    row_arr.forEach((x, col) => {
      if (x === 0) {
        openIndexes.push(col);
      }
    });

    if (openIndexes.length) {
      const col = getRandom(openIndexes.length);
      return { row, col };
    }
  }

  throw "FULL!";
}

// This checks every cell currently, which is quite impractical at larger sizes
function fast_randomOpenCell(rows: number[][]) {
  // this like.. DIES at the end....
  for (let i = 0; i < 10000; i++) {
    const row = getRandom(rows.length);
    const col = getRandom(rows[row].length);
    if (rows[row][col] === 0) {
      return { row, col };
    }
  }
  return old_randomOpenCell(rows);
}

// This checks every cell currently, which is quite impractical at larger sizes
function old_randomOpenCell(rows: number[][]) {
  let selected = { row: 0, col: 0 };
  let curMax = -1;
  let full = true;

  // pick a random open cell 
  iterRowCol(rows, (x, row, col) => {
    if (x === 0) {
      full = false;
      const r = Math.random();
      if (r > curMax) {
        curMax = r;
        selected = { row, col };
      }
    }
  });
  if (full) { throw "FULL!" }
  return selected;
}

function fillOne(rows: number[][], tries = 10) {
  // ideally search open cells for whatever adds the LEAST blocked tiles
  // or just check a few 
  let lowestBlocked = Number.MAX_SAFE_INTEGER;
  let lowestCell: Cell | null = null;
  for (let i = 0; i < tries; i++) {
    // This is a lot of overhead. really we just want to check what NEW ones would be added.
    const randomCell = fast_randomOpenCell(rows);
    const blocked = testAddNewDot(rows, randomCell.row, randomCell.col);
    // this should be outdated now and is way slower (i hope)
    // const newRows = copy(rows);
    // addNewDot(newRows, randomCell.row, randomCell.col);
    // const blocked = countBlocked(newRows);
    if (blocked < lowestBlocked) {
      lowestBlocked = blocked;
      lowestCell = randomCell;
    }
  }

  addNewDot(rows, lowestCell!.row, lowestCell!.col);
  return rows;
}

let best = 0;
let bestRows: number[][] = [];

function App() {
  const [scale, setScale] = React.useState(100);
  const [tries, setTries] = React.useState(10);
  const [order, setOrder] = React.useState(startOrder);

  const [, setNonce] = React.useState(Math.random());
  const rerender = React.useCallback(() => setNonce(Math.random()), [setNonce]);

  const currentCount = countOnes(rows);
  if (currentCount > best) {
    best = currentCount;
    bestRows = copy(rows);
  }

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  if (canvasRef.current) {
    const context = canvasRef.current.getContext("2d")!;
    const w = canvasRef.current.width = window.innerWidth;
    const h = canvasRef.current.height = window.innerHeight - 120;
    context.clearRect(0, 0, w, h);
    context.fillStyle = "black";
    context.fillRect(0, 0, w, h);

    const scale = h / rows.length;

    iterRowCol(rows, (value, row, col) => {
      let color = "white";
      switch (value) {
        case -1: color = "lightgrey"; return;
        case 1: color = "red"; break;
        case 2: case 3: color = "grey"; break;
      }

      context.fillStyle = color;
      const y = (DoubledCoord.FromRowAndColumn(row, col).x) * scale;
      const x = (DoubledCoord.FromRowAndColumn(row, col).y + order) * (scale) / 2;
      context.fillRect(x, y, scale, scale);
    });
  }

  return (
    <div className="App" >
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", padding: 10 }}>
        <button onClick={() => { clear(rows); rerender(); }}>Clear</button>
        <span>Scale: <input type="range" min="1" max="100" value={scale} onChange={e => {
          const newScale = Number.parseFloat(e.target.value);
          setScale(newScale);
          rerender();
        }} /></span>
        <span>Order: <input type="number" value={order} onChange={e => {
          const newOrder = Number.parseInt(e.target.value)
          setOrder(newOrder);
          rows = createRows(newOrder);
          best = 0;
          rerender();
        }} /></span>
        <span> Score: {currentCount}</span>
        <span> Best: {best}</span>
      </div>

      <div>
        Current: <input style={{ maxWidth: 2000 }} value={result(rows)} onChange={(e) => {
          const str = e.target.value;
          const result = fromResult(str);
          rows = result.rows;
          setOrder(result.order);
          rerender();
        }} />  Best: <input readOnly style={{ maxWidth: 200 }} value={result(bestRows)} />

      </div>
      <div>
        Tries: <input type="number" value={tries} style={{ width: 50 }} onChange={(e) => setTries(Number.parseInt(e.target.value))} />
        <button onClick={() => {
          try {
            rows = fillOne(rows, tries);
            rerender();
          }
          catch { }
        }}>Fill NEXT</button>
        <button onClick={() => {
          const fillerFunc = () => {
            try {
              rows = fillOne(rows, tries);
              rerender();
              setTimeout(fillerFunc, 0);
            }
            catch { };
          }

          fillerFunc();
        }}>Fill All</button>
        <button onClick={() => {
          let count = 0;
          let maxCount = 10;
          const fillerFunc = () => {
            if (count > maxCount) { return; }
            try {
              rows = fillOne(rows, tries);
              rerender();
              setTimeout(fillerFunc, 0);
            }
            catch {
              count++;
              clear(rows);
              setTimeout(fillerFunc, 0);
            };
          };
          fillerFunc();
        }}>Fill 10</button>

        <button onClick={() => {
          // if FULL clear(rows);
          const fillerFunc = () => {
            try {
              const row = rows[order - 1];
              const newRow = fillOne([row], tries);
              rows[order - 1] = newRow[0];
              rerender();
              setTimeout(fillerFunc, 0);
            }
            catch { };
          }

          fillerFunc();
        }}>Fill middle row</button>
        
        {/* <button onClick={() => {
          // where are the corners?
          // 2 in first row.
          // 2 in middle row
          // 2 in last row (after dead cells)
          const fillerFunc = () => {
            try {
              const row = rows[order - 1];
              const newRow = fillOne([row], tries);
              rows[order - 1] = newRow[0];
              rerender();
              setTimeout(fillerFunc, 0);
            }
            catch { };
          }

          fillerFunc();
        }}>Fill near corners</button> */}

      </div>

      {order > 50 ? <canvas style={{ display: "block", width: "100%", height: "100%" }} ref={canvasRef}></canvas> : null}

      <div style={{ position: "relative", scale: `${scale / 100}` }}>
        {order <= 50 ? rows.map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "center" }}>
          {r.map((x, j) => {
            let color = "white";
            switch (x) {
              case -1: color = "lightgrey"; break;
              case 1: color = "red"; break;
              case 2: case 3: color = "grey"; break;
            }

            const size = 50;

            return <div key={j}
              style={{
                width: size,
                height: size,
                display: x === -1 ? "none" : "flex",
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
                userSelect: "none",
                backgroundColor: color,
                border: "1px solid black",
                borderRadius: size * 2,
                position: "absolute",
                top: (DoubledCoord.FromRowAndColumn(i, j).x) * size,
                left: (DoubledCoord.FromRowAndColumn(i, j).y + order) * (size + 5) / 2,
              }}
              onClick={rows[i][j] <= 1 ? () => {
                if (rows[i][j] === 1) {
                  rows[i][j] = 0;
                  // need to clear everything! yuck!
                }
                else if (rows[i][j] === 0) {
                  addNewDot(rows, i, j);
                }
                rerender();
              } : undefined}>{DoubledCoord.FromRowAndColumn(i, j).toString()}</div>;
          })}
        </div>) : null}
      </div>
    </div>
  );
}

export default App;

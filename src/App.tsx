import { create } from 'domain';
import React from 'react';
import './App.css';
import { DoubledCoord } from './double';

interface Hex {
  x: number;
  y: number;
}

function distance(a: Hex, b: Hex): number {
  return 0;
}

const startOrder = 4;

function createRows(order: number) {
  let rows: number[][] = [];
  // rows start at ORDER, and increase by 1 per row, reaching (2*ORDER) - 1 then decrease
  let rowLength = order;
  for (let i = 0; i < order; i++) {
    rows[i] = [];
    for (let j = 0; j < rowLength; j++) {
      rows[i][j] = 0;
    }
    rowLength++;
  }

  // instead of shrinking OFFSET the new ones!
  let deadCells = 0;
  for (let i = order; i < order * 2 - 1; i++) {
    rows[i] = [];
    deadCells++;
    rowLength--;
    for (let j = 0; j < rowLength + deadCells - 1; j++) {
      rows[i][j] = 0;
      if (j < deadCells) {
        rows[i][j] = -1;
      }
    }
  }

  return rows;
}

var rows: number[][] = createRows(startOrder);

function midPoint(i: number, j: number, oi: number, oj: number) {
  // i first...

}

function doublePoint(di: number, dj: number, order: number) {
  // for every j over HALF? we subtract 1?
  if (di >= order) {
    // double crosses boundary
    console.log("across!", di, order, di - order);
    dj -= (di - order) + 1;
  }

  if (rows[di] && rows[di][dj] >= 0) {
    console.log("adding double point", di, dj);
    rows[di][dj] = 2;
  }
}

function ForEveryPoint(map: number[][], func: (map: number[][], row: number, col: number, value: number) => void) {
  map.forEach((arr, row) => {
    arr.forEach((value, col) => {
      func(map, row, col, value);
    });
  });
}

function setInRows(rows: number[][], coord: DoubledCoord, value: number) {
  const c = coord.toRowAndColumn();
  if (rows[c.row] && rows[c.row][c.col] >= 0) {
    rows[c.row][c.col] = value;
  }
}

// -1 is empty cell, just for offset, always ignore these and never set a value there
// 0 is empty
// 1 is filled
// 2 is blocked! (already a mid point!)
function addNewDot(rows: number[][], i: number, j: number) {
  if (rows[i][j] != 0) { return; }

  const newDot = DoubledCoord.FromRowAndColumn(i, j);

  // for EVERY non-0 spot we need to find a mid point. if INTEGER then we block them

  rows.forEach((arr, row) => {
    arr.forEach((x, col) => {
      if (x === 1) {
        const otherDot = DoubledCoord.FromRowAndColumn(row, col);

        // TODO block double points
        const diff = DoubledCoord.subtract(newDot, otherDot);
        const double1 = DoubledCoord.add(newDot, diff);
        const double2 = DoubledCoord.add(otherDot, DoubledCoord.multiply(diff, -1));
        setInRows(rows, double1, 3);
        setInRows(rows, double2, 3);

        // TODO block mid point
        // mid point should be AVERAGE og the 2 spots.
        console.log("new", newDot);
        console.log("other", otherDot);
        const midDot = DoubledCoord.multiply(DoubledCoord.add(otherDot, newDot), .5);
        console.log("avg", DoubledCoord.multiply(DoubledCoord.add(otherDot, newDot), .5));
        const mid = midDot.toRowAndColumn();
        setInRows(rows, midDot, 2);
      }
    });
  })

  rows[i][j] = 1;
}

function iterRowCol(rows: number[][], func: (value: number, row: number, col: number, rows: number[][]) => void) {
  rows.forEach((arr, row) => {
    arr.forEach((value, col) => {
      func(value, row, col, rows);
    });
  });
}

function countOnes(rows: number[][]) {
  let count = 0;
  iterRowCol(rows, (x) => {
    if (x === 1) { count++; }
  });
  return count;
}

function countBlocked(rows: number[][]) {
  let count = 0;
  iterRowCol(rows, (x) => {
    if (x > 1) { count++; }
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

function randomOpenCell(rows: number[][]) {
  let selected = { row: 0, col: 0 };
  let curMax = -1;
  let full = true;
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

let best = 0;
let bestRows: number[][] = [];

function App() {
  const [order, setOrder] = React.useState(startOrder);
  React.useEffect(() => {
    createRows(order);
    best = 0;
    rerender();
  }, [order, setOrder]);

  const [, setNonce] = React.useState(Math.random());
  const rerender = React.useCallback(() => setNonce(Math.random()), [setNonce]);

  const currentCount = countOnes(rows);
  if (currentCount > best) {
    best = currentCount;
    bestRows = copy(rows);
  }

  return (
    <div className="App" >
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", padding: 10 }}>
        <button onClick={() => { clear(rows); rerender(); }}>Clear</button>
        <span>Order: <input type="number" value={order} onChange={e => {
          setOrder(Number.parseInt(e.target.value));
          rerender();
        }} /></span>
        <span> Score: {currentCount}</span>
        <span> Best: {best}</span>
      </div>

      <div>
        Current: <input style={{ maxWidth: 100 }} value={result(rows)} onChange={(e) => {
          // parse the string and turn it into rows and set the rows...

          const str = e.target.value;

          const splits = str.split("},");

          const enteredRows = createRows((rows.length + 1)/ 2);

          splits.forEach((row, i) => {
            row = row.replace("{", "");
            console.log("row", row);
            const cells = row.split(",").map(c => Number.parseInt(c.trim())).filter(n => !isNaN(n));
            console.log(cells);
            cells.forEach(j => {
              addNewDot(enteredRows, i, j);
            });
          });

          rows = enteredRows;
          rerender();
        }} />
        Best<input style={{ maxWidth: 100 }} value={result(bestRows)} />
        <button onClick={() => {
          try {
            // ideally search open cells for whatever adds the LEAST blocked tiles
            // or just check a few 

            let lowestBlocked = 999999999999999;
            let lowestRows = rows;
            const checkNum = 10;
            for (let i = 0; i < checkNum; i++) {
              const randomCell = randomOpenCell(rows);
              const newRows = copy(rows);
              addNewDot(newRows, randomCell.row, randomCell.col);
              const blocked = countBlocked(newRows);
              if (blocked < lowestBlocked) {
                lowestBlocked = blocked;
                lowestRows = newRows;
              }
            }

            rows = lowestRows;
            rerender();
          }
          catch { }
        }}>Fill NEXT</button>
      </div>

      <div style={{ position: "relative" }}>
        {order < 19 ? rows.map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "center" }}>
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

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
  console.log("Adding dot", i,j);

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
        const midDot = DoubledCoord.multiply(DoubledCoord.add(otherDot, newDot), .5);
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

function fromResult(str: string){
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
    const deadcells = enteredRows[i].filter(x => x===-1).length;
    cells.forEach(j => {
      addNewDot(enteredRows, i, j + deadcells);
    });
  });

  return {
    order,
    rows: enteredRows,
  };
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

function fillOne(rows: number[][], tries = 10) {
  // ideally search open cells for whatever adds the LEAST blocked tiles
  // or just check a few 
  let lowestBlocked = 999999999999999;
  let lowestRows = rows;
  for (let i = 0; i < tries; i++) {
    const randomCell = randomOpenCell(rows);
    const newRows = copy(rows);
    addNewDot(newRows, randomCell.row, randomCell.col);
    const blocked = countBlocked(newRows);
    if (blocked < lowestBlocked) {
      lowestBlocked = blocked;
      lowestRows = newRows;
    }
  }

  return lowestRows;
}

let best = 0;
let bestRows: number[][] = [];

function App() {
  const [tries, setTries] = React.useState(10);
  const [order, setOrder] = React.useState(startOrder);

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
        }} />  Best<input style={{ maxWidth: 200 }} value={result(bestRows)} />

      </div>
      <div>
        Tries: <input type="number" value={tries} style={{width: 50}} onChange={(e)=>setTries(Number.parseInt(e.target.value))} />
        <button onClick={() => {
          try {
            rows = fillOne(rows, tries);
            rerender();
          }
          catch { }
        }}>Fill NEXT</button>
        <button onClick={() => {
          const fillerFunc = () =>{
            try{
              rows = fillOne(rows, tries);
              rerender();
              setTimeout(fillerFunc, 0);
            }
            catch {};
          }

          fillerFunc();
        }}>Fill All</button>
        <button onClick={() => {
          let count = 0;
          let maxCount = 10;
          const fillerFunc = () =>{
            if(count > maxCount){ return;}
            try{
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
      </div>

      <div style={{ position: "relative" }}>
        {order > 50 ? "Sorry this is too big right now. Set order to 50 or less." : null}
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

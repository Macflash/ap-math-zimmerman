import { create } from 'domain';
import React from 'react';
import './App.css';

const startOrder = 4;
var rows: number[][] = [];
function createRows(order: number) {
  rows = [];
  // rows start at ORDER, and increase by 1 per row, reaching (2*ORDER) - 1 then decrease
  let rowLength = order;
  for (let i = 0; i < order; i++) {
    rows[i] = [];
    for (let j = 0; j < rowLength; j++) {
      rows[i][j] = 0;
    }
    rowLength++;
  }
  rowLength--;
  for (let i = order; i < order * 2 - 1; i++) {
    rows[i] = [];
    rowLength--;
    for (let j = 0; j < rowLength; j++) {
      rows[i][j] = 0;
    }
  }
}
createRows(startOrder);

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

// 0 is empty
// 1 is filled
// 2 is blocked! (already a mid point!)
function addNewDot(i: number, j: number, order: number) {
  if (rows[i][j] != 0) { return; }
  // for EVERY non-0 spot we need to find a mid point. if INTEGER then we block them

  rows.forEach((row, oi) => {
    row.forEach((x, oj) => {
      if (x === 1) {
        // block double point
        doublePoint(i * 2 - oi, j * 2 - oj, order);
        doublePoint(oi * 2 - i, oj * 2 - j, order);

        // block mid point

        let movedi = oi;
        let movedj = oj;

        if(movedi >= order){
          console.log("OVER!");
          movedj -= movedi - order + 1;
        }

        let di = i - movedi;
        let dj = j - movedj;

        let mi = i - di / 2;
        let mj = j - dj / 2;
        console.log("first", i,j);
        console.log("second", oi,oj);
        console.log("diff", di, dj);
        console.log("mid point", mi, mj);

        if (rows[mi] && rows[mi][mj] === 0) {
          // rows[mi][mj] = 3;
        }
      }
    });
  })

  rows[i][j] = 1;
}

function App() {
  const [order, setOrder] = React.useState(startOrder);
  React.useEffect(() => {
    createRows(order);
    rerender();
  }, [order, setOrder]);

  const [, setNonce] = React.useState(Math.random());
  const rerender = React.useCallback(() => setNonce(Math.random()), [setNonce]);

  return (
    <div className="App">
      <div>
        <input type="number" value={order} onChange={e => {
          setOrder(Number.parseInt(e.target.value));
          rerender();
        }} />
      </div>

      {order < 19 ? rows.map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "center" }}>
        {r.map((x, j) => <div key={j} style={{ width: 20, height: 20, backgroundColor: rows[i][j] === 1 ? "red" : rows[i][j] === 2 ? "grey" : rows[i][j] === 3 ? "black" : "white", border: "1px solid black", borderRadius: 100 }}
          onClick={rows[i][j] === 0 ? () => {
            addNewDot(i, j, order);
            rerender();
          } : undefined}>{ }</div>)}
      </div>) : null}

    </div>
  );
}

export default App;

import { Cell, DoubledCoord } from "./double";

export class Grid {
    // Store all cells in an offset hex grid
    private rows: number[][];

    // We will want to update this whenever we change the grid
    private counts: CellCount;

    constructor(public readonly order: number) {
        this.rows = createRows(order);
        this.counts = countRows(this.rows);
    }

    ToResult() {
        return this.rows.map((row) => {
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

    static FromResult(str: string) {
        // TODO
        //     // parse the string and turn it into rows and set the rows...
        //    const splits = str.split("},");
        //    const order = (splits.length + 1) / 2;
        //    const grid = new HexGrid(order);

        //    // this doesn't handle DEAD CELLS!
        //    splits.forEach((row, i) => {
        //        row = row.replace("{", "");
        //        row = row.replace("}", "");
        //        console.log("row", row);
        //        const cells = row.split(",").map(c => Number.parseInt(c.trim())).filter(n => !isNaN(n));
        //        console.log(cells);
        //        // j needs to be offset by number of deadcells in that row.
        //        const deadcells = grid.rows[i].filter(x => x === -1).length;
        //        cells.forEach(j => {
        //        addNewDot(enteredRows, i, j + deadcells);
        //        });});

        //        return {
        //          order,
        //          rows: enteredRows,
        //        };
    }
}

export function createRows(order: number) {
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

export function iterRowCol(rows: number[][], func: (value: number, row: number, col: number, rows: number[][]) => void) {
    rows.forEach((arr, row) => {
        arr.forEach((value, col) => {
            func(value, row, col, rows);
        });
    });
}


type CellCount = { [value: number]: number };
export function countRows(rows: number[][]) {
    const counts: CellCount = {};
    iterRowCol(rows, (x) => {
        counts[x] = counts[x] || 0;
        counts[x]++;
    });
    return counts;
}

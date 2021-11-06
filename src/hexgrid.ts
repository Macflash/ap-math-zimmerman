import { Cell, DoubledCoord } from "./double";

class CellSet {
    private map = new Map<string, Cell>();
    constructor(private readonly value: number, rows?: number[][]) {
        if (!rows) { return; }
        iterRowCol(rows, (value, row, col) => {
            if (this.value === value) {
                this.add(row, col);
            }
        });
    }

    private key(i: number, j: number) {
        return `${i},${j}`;
    }

    add(row: number, col: number) {
        try {
            this.map.set(this.key(row, col), { row, col });
        } catch { }
    }

    remove(row: number, col: number) {
        try {
            this.map.delete(this.key(row, col));
        } catch { }
    }

    iter(callback: (cell: Cell) => void) {
        this.map.forEach(callback);
    }
}

export class Grid {
    // Store all cells in an offset hex grid
    private rows: number[][];

    private filledCells: CellSet = new CellSet(1);
    private openCells: CellSet;

    constructor(public readonly order: number) {
        this.rows = createRows(order);
        this.openCells = new CellSet(0, this.rows);
    }

    private blockCell(row: number, col: number, overwriteFilledCells = false) {
        if (this.rows[row][col] < 0) { return; }
        // By default don't block already filled cells!
        if (this.rows[row][col] === 1 && !overwriteFilledCells) { return; }
        this.rows[row][col] = 2;
        this.openCells.remove(row, col);
        if (overwriteFilledCells) this.filledCells.remove(row, col);
    }

    fillCell(row: number, col: number) {
        // We don't allow this!
        if (this.rows[row][col] != 0) { return; }

        const newCell = DoubledCoord.FromRowAndColumn(row, col);

        // iter filled cells (oo fancy!)
        this.filledCells.iter(cell => {
            const otherCell = DoubledCoord.FromRowAndColumn(cell.row, cell.col);
            const doubleCells = DoubledCoord.DoublePoints(newCell, otherCell).map(coord => coord.toRowAndColumn());
            const middleCell = DoubledCoord.MidPoint(newCell, otherCell).toRowAndColumn();
            this.blockCell(doubleCells[0].row, doubleCells[0].col);
            this.blockCell(doubleCells[1].row, doubleCells[1].col);
            this.blockCell(middleCell.row, middleCell.col);
        })

        this.rows[row][col] = 1;
        this.filledCells.add(row, col);
        this.openCells.remove(row, col);
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

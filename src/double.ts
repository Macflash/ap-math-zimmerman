export function CreateDoubledArray(order: number) {
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
    rowLength--;
    for (let i = order; i < order * 2 - 1; i++) {
        rows[i] = [];
        rowLength--;
        for (let j = 0; j < rowLength; j++) {
            rows[i][j] = 0;
        }
    }

    return rows;
}

export interface Cell { row: number, col: number };

export class DoubledCoord {
    constructor(public x: number, public y: number) { }

    static FromRowAndColumn(row: number, col: number) {
        return new DoubledCoord(row, col * 2 - row);
    }

    toString() { return `${this.x}, ${this.y}` };

    toRowAndColumn(): Cell {
        let row = this.x;
        let col = (this.y + this.x) / 2;
        return { row, col };
    }

    static add(a: DoubledCoord, b: DoubledCoord) {
        return new DoubledCoord(a.x + b.x, a.y + b.y);
    }

    static subtract(a: DoubledCoord, b: DoubledCoord) {
        return new DoubledCoord(a.x - b.x, a.y - b.y);
    }

    static multiply(a: DoubledCoord, k: number) {
        return new DoubledCoord(a.x * k, a.y * k);
    }

    static DoublePoints(a: DoubledCoord, b: DoubledCoord) {
        const diff = DoubledCoord.subtract(a, b);
        return [
            DoubledCoord.add(a, diff),
            DoubledCoord.add(b, DoubledCoord.multiply(diff, -1))
        ];
    }

    static MidPoint(a: DoubledCoord, b: DoubledCoord) {
        return DoubledCoord.multiply(DoubledCoord.add(a, b), .5);
    }
}
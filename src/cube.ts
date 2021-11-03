export class Hex {
    constructor(public q: number, public r: number, public s: number) { }

    static equals(a: Hex, b: Hex) {
        return a.q == b.q && a.r == b.r && a.s == b.s;
    }

    static notEquals(a: Hex, b: Hex) {
        return !Hex.equals(a, b);
    }

    static add(a: Hex, b: Hex) {
        return new Hex(a.q + b.q, a.r + b.r, a.s + b.s);
    }

    static subtract(a: Hex, b: Hex) {
        return new Hex(a.q - b.q, a.r - b.r, a.s - b.s);
    }

    static multiply(a: Hex, k: number) {
        return new Hex(a.q * k, a.r * k, a.s * k);
    }

    static hex_length(hex: Hex) {
        return (Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) / 2;
    }

    static hex_distance(a: Hex, b: Hex) {
        return Hex.hex_length(Hex.subtract(a, b));
    }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vec2 = void 0;
var vec2 = /** @class */ (function () {
    function vec2(x, y) {
        this.arr = [x, y];
    }
    Object.defineProperty(vec2.prototype, "x", {
        get: function () {
            return this.arr[0];
        },
        set: function (x) {
            this.arr[0] = x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(vec2.prototype, "y", {
        get: function () {
            return this.arr[1];
        },
        set: function (y) {
            this.arr[1] = y;
        },
        enumerable: false,
        configurable: true
    });
    vec2.prototype.add = function (v) {
        return new vec2(this.x + v.x, this.y + v.y);
    };
    vec2.prototype.sub = function (v) {
        return new vec2(this.x - v.x, this.y - v.y);
    };
    vec2.prototype.length = function () {
        return Math.hypot.apply(Math, this.arr);
    };
    vec2.prototype.normalized = function () {
        var length = this.length();
        return new vec2(this.y / length, this.y / length);
    };
    vec2.prototype.normalize = function () {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    };
    vec2.prototype.scalar_mul = function (vec) {
        return this.x * vec.x + this.y * vec.y;
    };
    vec2.prototype.mul = function (scalar) {
        return new vec2(this.x * scalar, this.y * scalar);
    };
    vec2.prototype.toString = function () {
        return "(" + this.x + "," + this.y + ")";
    };
    return vec2;
}());
exports.vec2 = vec2;

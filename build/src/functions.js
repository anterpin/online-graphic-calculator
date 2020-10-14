"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = exports.Sqrt = exports.Pow = exports.Atan = exports.Acos = exports.Asin = exports.Tanh = exports.Cosh = exports.Sinh = exports.Tan = exports.Cos = exports.Sin = exports.Exp = exports.Log = exports.Sub = exports.Negative = exports.Add = exports.Divide = exports.Abs = exports.Multiply = exports.Costant = void 0;
var Costant = /** @class */ (function () {
    function Costant(value) {
        this.value = value;
    }
    Costant.prototype.calculate = function (x) {
        return this.value;
    };
    Object.defineProperty(Costant.prototype, "derivate", {
        get: function () {
            return new Costant(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Costant.prototype, "text", {
        get: function () {
            return this.value.toString();
        },
        enumerable: false,
        configurable: true
    });
    return Costant;
}());
exports.Costant = Costant;
var Multiply = /** @class */ (function () {
    function Multiply() {
        var f = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            f[_i] = arguments[_i];
        }
        this.f = f;
    }
    Multiply.prototype.calculate = function (x) {
        var sum = 1;
        for (var _i = 0, _a = this.f; _i < _a.length; _i++) {
            var f = _a[_i];
            var res = f.calculate(x);
            if ((Number.isNaN(res) && sum === 0) || (Number.isNaN(sum) && res === 0)) {
                sum = 0;
                continue;
            }
            sum *= f.calculate(x);
        }
        return sum;
    };
    Object.defineProperty(Multiply.prototype, "derivate", {
        get: function () {
            var func = this.f[0];
            for (var i = 1; i < this.f.length; i++) {
                func = new Add(new Multiply(func.derivate, this.f[i]), new Multiply(func, this.f[i].derivate));
            }
            return func;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Multiply.prototype, "text", {
        get: function () {
            var text = '';
            for (var _i = 0, _a = this.f; _i < _a.length; _i++) {
                var f = _a[_i];
                text += "(" + f.text + ")";
            }
            return text;
        },
        enumerable: false,
        configurable: true
    });
    return Multiply;
}());
exports.Multiply = Multiply;
var Abs = /** @class */ (function () {
    function Abs(a) {
        this.a = a;
    }
    Abs.prototype.calculate = function (x) {
        return Math.abs(this.a.calculate(x));
    };
    Object.defineProperty(Abs.prototype, "derivate", {
        get: function () {
            return new Multiply(new Divide(new Variable(), new Abs(new Variable())), this.a.derivate);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Abs.prototype, "text", {
        get: function () {
            return "|" + this.a.text + "|";
        },
        enumerable: false,
        configurable: true
    });
    return Abs;
}());
exports.Abs = Abs;
var Divide = /** @class */ (function () {
    function Divide(n, d) {
        this.n = n;
        this.d = d;
    }
    Divide.prototype.calculate = function (x) {
        return this.n.calculate(x) / this.d.calculate(x);
    };
    Object.defineProperty(Divide.prototype, "derivate", {
        get: function () {
            return new Divide(new Sub(new Multiply(this.n.derivate, this.d), new Multiply(this.n, this.d.derivate)), new Pow(this.d, new Costant(2)));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Divide.prototype, "text", {
        get: function () {
            return "(" + this.n.text + ")/(" + this.d.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Divide;
}());
exports.Divide = Divide;
var Add = /** @class */ (function () {
    function Add() {
        var f = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            f[_i] = arguments[_i];
        }
        this.f = f;
    }
    Add.prototype.calculate = function (x) {
        var sum = 0;
        for (var _i = 0, _a = this.f; _i < _a.length; _i++) {
            var f = _a[_i];
            sum += f.calculate(x);
        }
        return sum;
    };
    Object.defineProperty(Add.prototype, "derivate", {
        get: function () {
            return new (Add.bind.apply(Add, __spreadArrays([void 0], this.f.map(function (f) { return f.derivate; }))))();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Add.prototype, "text", {
        get: function () {
            return this.f.map(function (f) { return f.text; }).join('+');
        },
        enumerable: false,
        configurable: true
    });
    return Add;
}());
exports.Add = Add;
var Negative = /** @class */ (function () {
    function Negative(f) {
        this.f = f;
    }
    Negative.prototype.calculate = function (x) {
        return -this.f.calculate(x);
    };
    Object.defineProperty(Negative.prototype, "derivate", {
        get: function () {
            return new Negative(this.derivate);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Negative.prototype, "text", {
        get: function () {
            return '-' + this.f.text;
        },
        enumerable: false,
        configurable: true
    });
    return Negative;
}());
exports.Negative = Negative;
var Sub = /** @class */ (function () {
    function Sub(a, b) {
        this.a = a;
        this.b = b;
    }
    Sub.prototype.calculate = function (x) {
        return this.a.calculate(x) - this.b.calculate(x);
    };
    Object.defineProperty(Sub.prototype, "derivate", {
        get: function () {
            return new Sub(this.a.derivate, this.b.derivate);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sub.prototype, "text", {
        get: function () {
            return this.a.text + "-" + this.b.text;
        },
        enumerable: false,
        configurable: true
    });
    return Sub;
}());
exports.Sub = Sub;
var Log = /** @class */ (function () {
    function Log(f) {
        this.f = f;
    }
    Log.prototype.calculate = function (x) {
        return Math.log(this.f.calculate(x));
    };
    Object.defineProperty(Log.prototype, "derivate", {
        get: function () {
            return new Divide(this.f.derivate, new Abs(this.f));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Log.prototype, "text", {
        get: function () {
            return "log(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Log;
}());
exports.Log = Log;
var Exp = /** @class */ (function () {
    function Exp(f) {
        this.f = f;
    }
    Exp.prototype.calculate = function (x) {
        return Math.exp(this.f.calculate(x));
    };
    Object.defineProperty(Exp.prototype, "derivate", {
        get: function () {
            return new Multiply(this, this.f.derivate);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Exp.prototype, "text", {
        get: function () {
            return "e^" + this.f.text;
        },
        enumerable: false,
        configurable: true
    });
    return Exp;
}());
exports.Exp = Exp;
var Sin = /** @class */ (function () {
    function Sin(f) {
        this.f = f;
    }
    Sin.prototype.calculate = function (x) {
        return Math.sin(this.f.calculate(x));
    };
    Object.defineProperty(Sin.prototype, "derivate", {
        get: function () {
            return new Multiply(new Cos(this.f), this.f.derivate);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sin.prototype, "text", {
        get: function () {
            return "sin(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Sin;
}());
exports.Sin = Sin;
var Cos = /** @class */ (function () {
    function Cos(f) {
        this.f = f;
    }
    Cos.prototype.calculate = function (x) {
        return Math.cos(this.f.calculate(x));
    };
    Object.defineProperty(Cos.prototype, "derivate", {
        get: function () {
            return new Multiply(new Sub(new Costant(0), new Sin(this.f)), this.f.derivate);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cos.prototype, "text", {
        get: function () {
            return "cos(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Cos;
}());
exports.Cos = Cos;
var Tan = /** @class */ (function () {
    function Tan(f) {
        this.f = f;
    }
    Tan.prototype.calculate = function (x) {
        return Math.tan(this.f.calculate(x));
    };
    Object.defineProperty(Tan.prototype, "derivate", {
        get: function () {
            return new Divide(this.f.derivate, new Pow(new Cos(this.f), new Costant(2)));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tan.prototype, "text", {
        get: function () {
            return "tan(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Tan;
}());
exports.Tan = Tan;
var Sinh = /** @class */ (function () {
    function Sinh(f) {
        this.f = f;
    }
    Sinh.prototype.calculate = function (x) {
        return Math.sinh(this.f.calculate(x));
    };
    Object.defineProperty(Sinh.prototype, "derivate", {
        get: function () {
            return new Multiply(new Cosh(this.f), this.f.derivate);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sinh.prototype, "text", {
        get: function () {
            return "sinh(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Sinh;
}());
exports.Sinh = Sinh;
var Cosh = /** @class */ (function () {
    function Cosh(f) {
        this.f = f;
    }
    Cosh.prototype.calculate = function (x) {
        return Math.cosh(this.f.calculate(x));
    };
    Object.defineProperty(Cosh.prototype, "derivate", {
        get: function () {
            return new Multiply(new Sub(new Costant(0), new Sinh(this.f)), this.f.derivate);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cosh.prototype, "text", {
        get: function () {
            return "cosh(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Cosh;
}());
exports.Cosh = Cosh;
var Tanh = /** @class */ (function () {
    function Tanh(f) {
        this.f = f;
    }
    Tanh.prototype.calculate = function (x) {
        return Math.tanh(this.f.calculate(x));
    };
    Object.defineProperty(Tanh.prototype, "derivate", {
        get: function () {
            return new Divide(this.f.derivate, new Pow(new Cosh(this.f), new Costant(2)));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tanh.prototype, "text", {
        get: function () {
            return "tanh(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Tanh;
}());
exports.Tanh = Tanh;
var Asin = /** @class */ (function () {
    function Asin(f) {
        this.f = f;
    }
    Asin.prototype.calculate = function (x) {
        return Math.asin(this.f.calculate(x));
    };
    Object.defineProperty(Asin.prototype, "derivate", {
        get: function () {
            return new Divide(this.f.derivate, new Sqrt(new Sub(new Costant(1), new Pow(this.f, new Costant(2)))));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Asin.prototype, "text", {
        get: function () {
            return "asin(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Asin;
}());
exports.Asin = Asin;
var Acos = /** @class */ (function () {
    function Acos(f) {
        this.f = f;
    }
    Acos.prototype.calculate = function (x) {
        return Math.acos(this.f.calculate(x));
    };
    Object.defineProperty(Acos.prototype, "derivate", {
        get: function () {
            return new Sub(new Costant(0), new Asin(this.f).derivate);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Acos.prototype, "text", {
        get: function () {
            return "acos(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Acos;
}());
exports.Acos = Acos;
var Atan = /** @class */ (function () {
    function Atan(f) {
        this.f = f;
    }
    Atan.prototype.calculate = function (x) {
        return Math.atan(this.f.calculate(x));
    };
    Object.defineProperty(Atan.prototype, "derivate", {
        get: function () {
            return new Divide(this.f.derivate, new Add(new Costant(1), new Pow(this.f, new Costant(2))));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Atan.prototype, "text", {
        get: function () {
            return "atan(" + this.f.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Atan;
}());
exports.Atan = Atan;
var Pow = /** @class */ (function () {
    function Pow(base, exp) {
        this.base = base;
        this.exp = exp;
    }
    Pow.prototype.calculate = function (x) {
        return Math.pow(this.base.calculate(x), this.exp.calculate(x));
    };
    Object.defineProperty(Pow.prototype, "derivate", {
        get: function () {
            if (this.exp instanceof Costant) {
                return new Multiply(this.exp, new Pow(this.base, new Costant(this.exp.value - 1)), this.base.derivate);
            }
            var brackets_div = new Divide(new Multiply(this.exp, this.base.derivate), this.base);
            var brakets = new Add(new Multiply(this.exp.derivate, new Log(this.base)), brackets_div);
            return new Multiply(this, brakets);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pow.prototype, "text", {
        get: function () {
            return "(" + this.base.text + ")^(" + this.exp.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Pow;
}());
exports.Pow = Pow;
var Sqrt = /** @class */ (function () {
    function Sqrt(base) {
        this.base = base;
    }
    Sqrt.prototype.calculate = function (x) {
        return Math.sqrt(this.base.calculate(x));
    };
    Object.defineProperty(Sqrt.prototype, "derivate", {
        get: function () {
            return new Multiply(new Divide(this.base.derivate, this), new Costant(-1.2));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sqrt.prototype, "text", {
        get: function () {
            return "sqrt(" + this.base.text + ")";
        },
        enumerable: false,
        configurable: true
    });
    return Sqrt;
}());
exports.Sqrt = Sqrt;
var Variable = /** @class */ (function () {
    function Variable() {
    }
    Variable.prototype.calculate = function (x) {
        return x;
    };
    Object.defineProperty(Variable.prototype, "derivate", {
        get: function () {
            return new Costant(1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Variable.prototype, "text", {
        get: function () {
            return 'x';
        },
        enumerable: false,
        configurable: true
    });
    return Variable;
}());
exports.Variable = Variable;

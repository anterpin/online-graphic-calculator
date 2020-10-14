"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var math_1 = require("./math");
var F = require("./functions");
var canvas = null;
var ctx = null;
var plane = null;
var manager = null;
var functions = [];
var Converter = /** @class */ (function () {
    function Converter() {
    }
    //  (-1,1)------(0,1)------(1,1)
    //     |          |          |
    //  (-1,0)------(0,0)------(1,0)
    //     |          |          |
    //  (-1,-1)-----(0,-1)-----(1,-1)
    //  (0,0)-------(w/2,0)---------(w,0)
    //    |             |             |
    // (0,h/2)------(w/2,h/2)-------(w,h/2)
    //    |             |             |
    //  (0,h)-------(w/2,h)---------(w,h)
    // (bl,tr)--------(c,tr)-------(tr,tr)
    //    |             |             |
    // (bl,c)---------(c,c)--------(tr,c)
    //    |             |             |
    // (bl,bl)--------(c,bl)-------(tr,bl)
    Converter.coords_to_viewport = function (point, rect) {
        var diff = point.sub(rect.center);
        var half_borders = rect.borders.mul(0.5);
        return new math_1.vec2(diff.x / half_borders.x, diff.y / half_borders.y);
    };
    Converter.viewport_to_pixel = function (v) {
        var translate = new math_1.vec2(canvas.width / 2, canvas.height / 2);
        var shrink = new math_1.vec2(v.x * translate.x, -v.y * translate.y);
        return shrink.add(translate);
    };
    Converter.coords_to_pixel = function (point, rect) {
        return Converter.viewport_to_pixel(Converter.coords_to_viewport(point, rect));
    };
    Converter.pixel_to_viewport = function (pixel) {
        var translate = new math_1.vec2(canvas.width / 2, canvas.height / 2);
        var shrink = pixel.sub(translate);
        return new math_1.vec2(shrink.x / translate.x, -shrink.y / translate.y);
    };
    Converter.viewport_to_coords = function (v, rect) {
        var half_borders = rect.borders.mul(0.5);
        var diff = new math_1.vec2(v.x * half_borders.x, v.y * half_borders.y);
        return diff.add(rect.center);
    };
    Converter.pixel_to_coords = function (pixel, rect) {
        return Converter.viewport_to_coords(Converter.pixel_to_viewport(pixel), rect);
    };
    Converter.coords_step_per_pixel = function (rect) {
        var pixel1 = new math_1.vec2(1, 0);
        var pixel2 = pixel1.add(new math_1.vec2(1, 0));
        var coord1 = Converter.pixel_to_coords(pixel1, rect);
        var coord2 = Converter.pixel_to_coords(pixel2, rect);
        return coord2.sub(coord1).x;
    };
    return Converter;
}());
var Rect = /** @class */ (function () {
    function Rect(bl, tr) {
        this.bottom_left_corner = bl;
        this.top_right_corner = tr;
    }
    Rect.prototype.x_check = function (x) {
        return this.bottom_left_corner.x <= x && x <= this.top_right_corner.x;
    };
    Rect.prototype.y_check = function (y) {
        return this.bottom_left_corner.y <= y && y <= this.top_right_corner.y;
    };
    Rect.prototype.contains = function (point) {
        return this.x_check(point.x) && this.y_check(point.y);
    };
    Object.defineProperty(Rect.prototype, "center", {
        get: function () {
            return this.bottom_left_corner.add(this.top_right_corner).mul(0.5);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "borders", {
        get: function () {
            return this.top_right_corner.sub(this.bottom_left_corner);
        },
        enumerable: false,
        configurable: true
    });
    return Rect;
}());
var Plane = /** @class */ (function () {
    function Plane() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        var mousewheel = function (e) {
            var scale = (e.deltaY < 0) ? plane.zoom_sensibility : 1 / plane.zoom_sensibility;
            plane.zoom *= scale;
            var pixel_zoom = new math_1.vec2(e.x, e.y);
            var pixel_center = Converter.coords_to_pixel(plane.center, plane.visible_region);
            var diff = pixel_zoom.sub(pixel_center);
            plane.center = Converter.pixel_to_coords(pixel_zoom, plane.visible_region);
            plane.defineVisibleRegion();
            // the zoom center coords should occupy the same pixels during the zoom transform
            var pixel_new_center = pixel_center.sub(diff);
            plane.center = Converter.pixel_to_coords(pixel_new_center, plane.visible_region);
            plane.drawChart();
        };
        var mousedown = function (e) {
            if (plane.grabbed_point) {
                plane.grabbed_point = null;
                return;
            }
            plane.grabbed_point = Converter.pixel_to_coords(new math_1.vec2(e.x, e.y), plane.visible_region);
            plane.center_position_on_grab = plane.center;
            plane.visible_region_on_grab = plane.visible_region;
        };
        var mousemove = function (e) {
            if (!plane.grabbed_point) {
                return;
            }
            var grabbed_point_new_position = Converter.pixel_to_coords(new math_1.vec2(e.x, e.y), plane.visible_region_on_grab);
            var diff = grabbed_point_new_position.sub(plane.grabbed_point);
            plane.center = plane.center_position_on_grab.sub(diff);
            plane.drawChart();
        };
        var mouseup = function (e) {
            plane.grabbed_point = null;
            plane.center_position_on_grab = null;
            plane.visible_region_on_grab = null;
        };
        canvas.addEventListener('mousedown', mousedown);
        canvas.addEventListener('mouseup', mouseup);
        canvas.addEventListener('mouseout', mouseup);
        canvas.addEventListener('mousewheel', mousewheel);
        canvas.addEventListener('mousemove', mousemove);
        window.addEventListener('resize', function (event) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            plane.drawChart();
        });
        this.reset();
        this.drawChart();
    }
    Plane.prototype.reset = function () {
        this.numbers_per_zoom = 8;
        this.center = new math_1.vec2(0, 0);
        this.zoom = 1;
        this.zoom_sensibility = 0.94;
        this.defineVisibleRegion();
    };
    Plane.prototype.get_mantix_and_exponent = function (n) {
        if (n < 0)
            return null;
        var order = Math.floor(Math.log10(n));
        var mantix = n / (Math.pow(10, order));
        return { mantix: mantix, order: order };
    };
    Plane.prototype.setScaleByVisibleRegion = function () {
        var number_range = this.visible_region.borders.x;
        var scale = number_range / 6;
        var _a = this.get_mantix_and_exponent(scale), mantix = _a.mantix, order = _a.order;
        var orden = Math.pow(10, order);
        var step = 10 / 3;
        var limit = 4.6;
        if (mantix <= limit - step) {
            this.step_divider = 5;
            this.scale = orden;
        }
        else if (mantix <= limit) {
            this.step_divider = 4;
            this.scale = 2 * orden;
        }
        else if (mantix <= limit + step) {
            this.step_divider = 5;
            this.scale = 5 * orden;
        }
        else {
            this.step_divider = 5;
            this.scale = 10 * orden;
        }
    };
    Object.defineProperty(Plane.prototype, "aspect", {
        get: function () {
            return canvas.offsetHeight / canvas.offsetWidth;
        },
        enumerable: false,
        configurable: true
    });
    Plane.prototype.drawLabels = function (color1, color2, font, size) {
        if (color1 === void 0) { color1 = 'black'; }
        if (color2 === void 0) { color2 = 'grey'; }
        if (font === void 0) { font = 'Arial'; }
        if (size === void 0) { size = 15; }
        var nearest_line_point_x = Math.trunc(this.center.x / this.scale) * this.scale;
        var nearest_line_point_y = Math.trunc(this.center.y / this.scale) * this.scale;
        var offset_x = new math_1.vec2(0.5, 0).mul(size);
        var offset_y = new math_1.vec2(0, -1).mul(size);
        var order = this.get_mantix_and_exponent(this.scale).order;
        var digits = order >= 0 ? 0 : -order;
        // horizontal lines
        var pixel_step = Converter.coords_step_per_pixel(this.visible_region);
        var offset_x_axes_visible = this.visible_region.y_check(pixel_step * offset_y.y * 2);
        var x_axes_visible = offset_x_axes_visible && this.visible_region.y_check(0);
        for (var i = nearest_line_point_x; this.visible_region.x_check(i); i += this.scale) {
            if (i === 0)
                continue;
            var center = null;
            ctx.font = size + "px " + font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (x_axes_visible) {
                ctx.fillStyle = color1;
                center = new math_1.vec2(i, 0);
            }
            else {
                var y_coord = nearest_line_point_y > 0 ? this.visible_region.bottom_left_corner.y : this.visible_region.top_right_corner.y;
                center = new math_1.vec2(i, y_coord);
                ctx.fillStyle = color2;
            }
            var pixel_center = Converter.coords_to_pixel(center, this.visible_region);
            // offsets
            if (!x_axes_visible && nearest_line_point_y > 0) {
                pixel_center = pixel_center.add(offset_y);
            }
            else {
                pixel_center = pixel_center.sub(offset_y);
            }
            ctx.fillText(i.toFixed(digits), pixel_center.x, pixel_center.y);
        }
        for (var i = nearest_line_point_x - this.scale; this.visible_region.x_check(i); i -= this.scale) {
            if (i === 0)
                continue;
            var center = null;
            ctx.font = size + "px " + font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (x_axes_visible) {
                ctx.fillStyle = color1;
                center = new math_1.vec2(i, 0);
            }
            else {
                var y_coord = nearest_line_point_y > 0 ? this.visible_region.bottom_left_corner.y : this.visible_region.top_right_corner.y;
                center = new math_1.vec2(i, y_coord);
                ctx.fillStyle = color2;
            }
            var pixel_center = Converter.coords_to_pixel(center, this.visible_region);
            // offsets
            if (!x_axes_visible && nearest_line_point_y > 0) {
                pixel_center = pixel_center.add(offset_y);
            }
            else {
                pixel_center = pixel_center.sub(offset_y);
            }
            ctx.fillText(i.toFixed(digits), pixel_center.x, pixel_center.y);
        }
        // vertical lines
        var offset_y_axes_visible = this.visible_region.x_check(-pixel_step * offset_x.x * 4);
        var y_axes_visible = offset_y_axes_visible && this.visible_region.x_check(0);
        for (var i = nearest_line_point_y; this.visible_region.y_check(i); i += this.scale) {
            if (i === 0)
                continue;
            var center = null;
            ctx.font = size + "px " + font;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            if (y_axes_visible) {
                ctx.fillStyle = color1;
                center = new math_1.vec2(0, i);
            }
            else {
                var x_coord = nearest_line_point_x > 0 ? this.visible_region.bottom_left_corner.x : this.visible_region.top_right_corner.x;
                center = new math_1.vec2(x_coord, i);
                ctx.fillStyle = color2;
            }
            var pixel_center = Converter.coords_to_pixel(center, this.visible_region);
            // offsets
            if (!y_axes_visible && nearest_line_point_x > 0) {
                ctx.textAlign = 'left';
                pixel_center = pixel_center.add(offset_x);
            }
            else {
                pixel_center = pixel_center.sub(offset_x);
            }
            ctx.fillText(i.toFixed(digits), pixel_center.x, pixel_center.y);
        }
        for (var i = nearest_line_point_y - this.scale; this.visible_region.y_check(i); i -= this.scale) {
            if (i === 0)
                continue;
            var center = null;
            ctx.font = size + "px " + font;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            if (y_axes_visible) {
                ctx.fillStyle = color1;
                center = new math_1.vec2(0, i);
            }
            else {
                var x_coord = nearest_line_point_x > 0 ? this.visible_region.bottom_left_corner.x : this.visible_region.top_right_corner.x;
                center = new math_1.vec2(x_coord, i);
                ctx.fillStyle = color2;
            }
            var pixel_center = Converter.coords_to_pixel(center, this.visible_region);
            // offsets
            if (!y_axes_visible && nearest_line_point_x > 0) {
                ctx.textAlign = 'left';
                pixel_center = pixel_center.add(offset_x);
            }
            else {
                pixel_center = pixel_center.sub(offset_x);
            }
            ctx.fillText(i.toFixed(digits), pixel_center.x, pixel_center.y);
        }
    };
    Plane.prototype.drawAxes = function (lineWidth, color) {
        if (color === void 0) { color = 'black'; }
        ctx.strokeStyle = color;
        ctx.beginPath();
        if (this.visible_region.x_check(0)) {
            var upper_point = new math_1.vec2(0, this.visible_region.top_right_corner.y);
            var upper_point_in_pixel = Converter.coords_to_pixel(upper_point, this.visible_region);
            ctx.moveTo(upper_point_in_pixel.x, upper_point_in_pixel.y);
            var lower_point = new math_1.vec2(0, this.visible_region.bottom_left_corner.y);
            var lower_point_in_pixel = Converter.coords_to_pixel(lower_point, this.visible_region);
            ctx.lineTo(lower_point_in_pixel.x, lower_point_in_pixel.y);
        }
        if (this.visible_region.y_check(0)) {
            var left_point = new math_1.vec2(this.visible_region.bottom_left_corner.x, 0);
            var left_point_in_pixel = Converter.coords_to_pixel(left_point, this.visible_region);
            ctx.moveTo(left_point_in_pixel.x, left_point_in_pixel.y);
            var right_point = new math_1.vec2(this.visible_region.top_right_corner.x, 0);
            var right_point_in_pixel = Converter.coords_to_pixel(right_point, this.visible_region);
            ctx.lineTo(right_point_in_pixel.x, right_point_in_pixel.y);
        }
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    };
    Plane.prototype.drawGrid = function (lineWidth, step_divider, color) {
        if (color === void 0) { color = 'lightgrey'; }
        var nearest_line_point_x = Math.trunc(this.center.x / this.scale) * this.scale;
        var nearest_line_point_y = Math.trunc(this.center.y / this.scale) * this.scale;
        ctx.strokeStyle = color;
        ctx.beginPath();
        // vertical lines draw from nearest point to center
        for (var i = nearest_line_point_x; this.visible_region.x_check(i); i += (this.scale / step_divider)) {
            var upper_point = new math_1.vec2(i, this.visible_region.top_right_corner.y);
            var upper_point_in_pixel = Converter.coords_to_pixel(upper_point, this.visible_region);
            ctx.moveTo(upper_point_in_pixel.x, upper_point_in_pixel.y);
            var lower_point = new math_1.vec2(i, this.visible_region.bottom_left_corner.y);
            var lower_point_in_pixel = Converter.coords_to_pixel(lower_point, this.visible_region);
            ctx.lineTo(lower_point_in_pixel.x, lower_point_in_pixel.y);
        }
        for (var i = nearest_line_point_x - (this.scale / step_divider); this.visible_region.x_check(i); i -= (this.scale / step_divider)) {
            var upper_point = new math_1.vec2(i, this.visible_region.top_right_corner.y);
            var upper_point_in_pixel = Converter.coords_to_pixel(upper_point, this.visible_region);
            ctx.moveTo(upper_point_in_pixel.x, upper_point_in_pixel.y);
            var lower_point = new math_1.vec2(i, this.visible_region.bottom_left_corner.y);
            var lower_point_in_pixel = Converter.coords_to_pixel(lower_point, this.visible_region);
            ctx.lineTo(lower_point_in_pixel.x, lower_point_in_pixel.y);
        }
        // horizontal lines draw from nearest point to center
        for (var i = nearest_line_point_y; this.visible_region.y_check(i); i += (this.scale / step_divider)) {
            var left_point = new math_1.vec2(this.visible_region.bottom_left_corner.x, i);
            var left_point_in_pixel = Converter.coords_to_pixel(left_point, this.visible_region);
            ctx.moveTo(left_point_in_pixel.x, left_point_in_pixel.y);
            var right_point = new math_1.vec2(this.visible_region.top_right_corner.x, i);
            var right_point_in_pixel = Converter.coords_to_pixel(right_point, this.visible_region);
            ctx.lineTo(right_point_in_pixel.x, right_point_in_pixel.y);
        }
        for (var i = nearest_line_point_y - (this.scale / step_divider); this.visible_region.y_check(i); i -= (this.scale / step_divider)) {
            var left_point = new math_1.vec2(this.visible_region.bottom_left_corner.x, i);
            var left_point_in_pixel = Converter.coords_to_pixel(left_point, this.visible_region);
            ctx.moveTo(left_point_in_pixel.x, left_point_in_pixel.y);
            var right_point = new math_1.vec2(this.visible_region.top_right_corner.x, i);
            var right_point_in_pixel = Converter.coords_to_pixel(right_point, this.visible_region);
            ctx.lineTo(right_point_in_pixel.x, right_point_in_pixel.y);
        }
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    };
    Plane.prototype.defineVisibleRegion = function () {
        var range_from_center = new math_1.vec2(this.zoom * this.numbers_per_zoom, this.zoom * this.numbers_per_zoom * this.aspect);
        this.visible_region = new Rect(this.center.sub(range_from_center), this.center.add(range_from_center));
        this.setScaleByVisibleRegion();
    };
    Plane.prototype.check_pixel = function (y, pixel, func, threshold) {
        var coords = Converter.pixel_to_coords(pixel, this.visible_region);
        if (Number.isNaN(y))
            return false;
        if (Math.abs(y - coords.y) < threshold)
            return true;
        else
            return false;
    };
    Plane.prototype.drawFunction = function (f, color, lineWidth) {
        if (lineWidth === void 0) { lineWidth = 2; }
        var begin = this.visible_region.bottom_left_corner.x;
        var end = this.visible_region.top_right_corner.x;
        var derivate = f.derivate;
        ctx.fillStyle = color;
        var pixel_step = Converter.coords_step_per_pixel(this.visible_region);
        var step = null;
        var previews = true;
        for (var x = begin; x <= end; x += step) {
            var y = f.calculate(x);
            if (Number.isNaN(y)) {
                step = pixel_step;
                previews = false;
                continue;
            }
            if (!previews) {
                // get back some values
                var step1 = null;
                for (var i = x; i > x - (1 * pixel_step); i -= step1) {
                    var y_1 = f.calculate(i);
                    if (Number.isNaN(y_1))
                        break;
                    var pixel_1 = Converter.coords_to_pixel(new math_1.vec2(i, y_1), this.visible_region);
                    ctx.fillRect(pixel_1.x, pixel_1.y, lineWidth, lineWidth);
                    if (!this.visible_region.y_check(Converter.pixel_to_coords(pixel_1, this.visible_region).y))
                        break;
                    var der_1 = derivate.calculate(i);
                    if (Math.abs(der_1) > 1)
                        step1 = Math.abs(pixel_step / der_1);
                    else
                        step1 = pixel_step;
                }
            }
            var pixel = Converter.coords_to_pixel(new math_1.vec2(x, y), this.visible_region);
            previews = true;
            if (!this.visible_region.y_check(Converter.pixel_to_coords(pixel, this.visible_region).y)) {
                step = pixel_step;
                previews = false;
                continue;
            }
            ctx.fillRect(pixel.x, pixel.y, lineWidth, lineWidth);
            var der = derivate.calculate(x);
            if (Math.abs(der) > 1)
                step = Math.abs(pixel_step / der);
            else
                step = pixel_step;
        }
    };
    Plane.prototype.drawChart = function () {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        this.defineVisibleRegion();
        this.drawGrid(1, this.step_divider);
        this.drawGrid(2, 1);
        this.drawAxes(2);
        for (var _i = 0, functions_1 = functions; _i < functions_1.length; _i++) {
            var func = functions_1[_i];
            this.drawFunction(func.func, func.color);
        }
        this.drawLabels();
    };
    return Plane;
}());
var EquationsManager = /** @class */ (function () {
    function EquationsManager() {
        this.last_error_message = null;
        window.addEventListener('message', function (event) {
            var data = JSON.parse(event.data);
            try {
                if (data.center)
                    plane.center = new math_1.vec2(data.center[0], data.center[1]);
                if (data.zoom && data.zoom > 0)
                    plane.zoom = data.zoom;
                functions = [];
                var func_index = 0;
                for (var _i = 0, _a = data.functions; _i < _a.length; _i++) {
                    var func_obj = _a[_i];
                    var func = manager.parse(func_obj.expression);
                    if (func)
                        functions.push({ color: func_obj.color, func: func });
                    else
                        window.parent.postMessage(JSON.stringify({
                            error: manager.last_error_message,
                            func_index: func_index
                        }), '*');
                    func_index++;
                }
                plane.drawChart();
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    EquationsManager.prototype.parse = function (str) {
        var func = new F.Sqrt(new F.Variable());
        // func = new Divide(new Sinh(new Variable()),new Variable())
        //func = new Log(new Variable())
        return func;
    };
    return EquationsManager;
}());
window.addEventListener('load', function (event) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    manager = new EquationsManager();
    plane = new Plane();
});

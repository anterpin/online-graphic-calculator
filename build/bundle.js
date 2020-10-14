!function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";var n=this&&this.__spreadArrays||function(){for(var e=0,t=0,r=arguments.length;t<r;t++)e+=arguments[t].length;var n=Array(e),i=0;for(t=0;t<r;t++)for(var o=arguments[t],c=0,a=o.length;c<a;c++,i++)n[i]=o[c];return n};Object.defineProperty(t,"__esModule",{value:!0});var i=r(1),o=r(2),c=null,a=null,s=null,l=null,u=[],f=function(){function e(){}return e.coords_to_viewport=function(e,t){var r=e.sub(t.center),n=t.borders.mul(.5);return new i.vec2(r.x/n.x,r.y/n.y)},e.viewport_to_pixel=function(e){var t=new i.vec2(c.width/2,c.height/2);return new i.vec2(e.x*t.x,-e.y*t.y).add(t)},e.coords_to_pixel=function(t,r){return e.viewport_to_pixel(e.coords_to_viewport(t,r))},e.pixel_to_viewport=function(e){var t=new i.vec2(c.width/2,c.height/2),r=e.sub(t);return new i.vec2(r.x/t.x,-r.y/t.y)},e.viewport_to_coords=function(e,t){var r=t.borders.mul(.5);return new i.vec2(e.x*r.x,e.y*r.y).add(t.center)},e.pixel_to_coords=function(t,r){return e.viewport_to_coords(e.pixel_to_viewport(t),r)},e.coords_step_per_pixel=function(t){var r=new i.vec2(1,0),n=r.add(new i.vec2(1,0)),o=e.pixel_to_coords(r,t);return e.pixel_to_coords(n,t).sub(o).x},e}(),h=function(){function e(e,t){this.bottom_left_corner=e,this.top_right_corner=t}return e.prototype.x_check=function(e){return this.bottom_left_corner.x<=e&&e<=this.top_right_corner.x},e.prototype.y_check=function(e){return this.bottom_left_corner.y<=e&&e<=this.top_right_corner.y},e.prototype.contains=function(e){return this.x_check(e.x)&&this.y_check(e.y)},Object.defineProperty(e.prototype,"center",{get:function(){return this.bottom_left_corner.add(this.top_right_corner).mul(.5)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"borders",{get:function(){return this.top_right_corner.sub(this.bottom_left_corner)},enumerable:!1,configurable:!0}),e}(),p=function(){function e(){c.width=c.offsetWidth,c.height=c.offsetHeight;var e=1,t=function(t,r,n,o){void 0===o&&(o=null);var c=t<0?s.zoom_sensibility:1/s.zoom_sensibility;s.zoom*=c,o&&(s.zoom=e*(1/o)*s.zoom_sensibility);var a=new i.vec2(r,n),l=f.coords_to_pixel(s.center,s.visible_region),u=a.sub(l);s.center=f.pixel_to_coords(a,s.visible_region),s.defineVisibleRegion();var h=l.sub(u);s.center=f.pixel_to_coords(h,s.visible_region),s.drawChart()},r=function(e,t){s.grabbed_point?s.grabbed_point=null:(s.grabbed_point=f.pixel_to_coords(new i.vec2(e,t),s.visible_region),s.center_position_on_grab=s.center,s.visible_region_on_grab=s.visible_region)},n=function(e,t){if(s.grabbed_point){var r=f.pixel_to_coords(new i.vec2(e,t),s.visible_region_on_grab).sub(s.grabbed_point);s.center=s.center_position_on_grab.sub(r),s.drawChart()}};c.addEventListener("mousewheel",(function(e){t(e.deltaY,e.x,e.y)}));var o=new Hammer.Manager(c);o.add(new Hammer.Pan),o.add(new Hammer.Pinch),o.on("pinchstart",(function(){e=s.zoom})),o.on("pinch",(function(e){return t(e.deltaY,e.center.x,e.center.y,e.scale)})),o.on("panstart",(function(e){return r(e.center.x,e.center.y)})),o.on("panmove",(function(e){return n(e.center.x,e.center.y)})),o.on("panend",(function(e){return s.grabbed_point=null,s.center_position_on_grab=null,void(s.visible_region_on_grab=null)})),window.addEventListener("resize",(function(e){c.width=c.offsetWidth,c.height=c.offsetHeight,s.drawChart()})),this.reset(),this.drawChart()}return e.prototype.reset=function(){this.numbers_per_zoom=8,this.center=new i.vec2(0,0),this.zoom=1,this.zoom_sensibility=.94,this.defineVisibleRegion()},e.prototype.get_mantix_and_exponent=function(e){if(e<0)return null;var t=Math.floor(Math.log10(e));return{mantix:e/Math.pow(10,t),order:t}},e.prototype.setScaleByVisibleRegion=function(){var e=this.visible_region.borders.x/6,t=this.get_mantix_and_exponent(e),r=t.mantix,n=t.order,i=Math.pow(10,n),o=4.6-10/3*(1-c.width/1500);r<=o-10/3?(this.step_divider=5,this.scale=i):r<=o?(this.step_divider=4,this.scale=2*i):r<=o+10/3?(this.step_divider=5,this.scale=5*i):(this.step_divider=5,this.scale=10*i)},Object.defineProperty(e.prototype,"aspect",{get:function(){return c.offsetHeight/c.offsetWidth},enumerable:!1,configurable:!0}),e.prototype.drawLabels=function(e,t,r,n){void 0===e&&(e="black"),void 0===t&&(t="grey"),void 0===r&&(r="Arial"),void 0===n&&(n=15);for(var o=Math.trunc(this.center.x/this.scale)*this.scale,c=Math.trunc(this.center.y/this.scale)*this.scale,s=new i.vec2(.5,0).mul(n),l=new i.vec2(0,-1).mul(n),u=this.get_mantix_and_exponent(this.scale).order,h=u>=0?0:-u,p=f.coords_step_per_pixel(this.visible_region),v=this.visible_region.y_check(p*l.y*2)&&this.visible_region.y_check(0),b=o;this.visible_region.x_check(b);b+=this.scale)if(0!==b){var d=null;if(a.font=n+"px "+r,a.textAlign="center",a.textBaseline="middle",v)a.fillStyle=e,d=new i.vec2(b,0);else{var _=c>0?this.visible_region.bottom_left_corner.y:this.visible_region.top_right_corner.y;d=new i.vec2(b,_),a.fillStyle=t}var g=f.coords_to_pixel(d,this.visible_region);g=!v&&c>0?g.add(l):g.sub(l),a.fillText(b.toFixed(h),g.x,g.y)}for(b=o-this.scale;this.visible_region.x_check(b);b-=this.scale)if(0!==b){d=null;if(a.font=n+"px "+r,a.textAlign="center",a.textBaseline="middle",v)a.fillStyle=e,d=new i.vec2(b,0);else{_=c>0?this.visible_region.bottom_left_corner.y:this.visible_region.top_right_corner.y;d=new i.vec2(b,_),a.fillStyle=t}g=f.coords_to_pixel(d,this.visible_region);g=!v&&c>0?g.add(l):g.sub(l),a.fillText(b.toFixed(h),g.x,g.y)}var y=this.visible_region.x_check(-p*s.x*4)&&this.visible_region.x_check(0);for(b=c;this.visible_region.y_check(b);b+=this.scale)if(0!==b){d=null;if(a.font=n+"px "+r,a.textAlign="right",a.textBaseline="middle",y)a.fillStyle=e,d=new i.vec2(0,b);else{var x=o>0?this.visible_region.bottom_left_corner.x:this.visible_region.top_right_corner.x;d=new i.vec2(x,b),a.fillStyle=t}g=f.coords_to_pixel(d,this.visible_region);!y&&o>0?(a.textAlign="left",g=g.add(s)):g=g.sub(s),a.fillText(b.toFixed(h),g.x,g.y)}for(b=c-this.scale;this.visible_region.y_check(b);b-=this.scale)if(0!==b){d=null;if(a.font=n+"px "+r,a.textAlign="right",a.textBaseline="middle",y)a.fillStyle=e,d=new i.vec2(0,b);else{x=o>0?this.visible_region.bottom_left_corner.x:this.visible_region.top_right_corner.x;d=new i.vec2(x,b),a.fillStyle=t}g=f.coords_to_pixel(d,this.visible_region);!y&&o>0?(a.textAlign="left",g=g.add(s)):g=g.sub(s),a.fillText(b.toFixed(h),g.x,g.y)}},e.prototype.drawAxes=function(e,t){if(void 0===t&&(t="black"),a.strokeStyle=t,a.beginPath(),this.visible_region.x_check(0)){var r=new i.vec2(0,this.visible_region.top_right_corner.y),n=f.coords_to_pixel(r,this.visible_region);a.moveTo(n.x,n.y);var o=new i.vec2(0,this.visible_region.bottom_left_corner.y),c=f.coords_to_pixel(o,this.visible_region);a.lineTo(c.x,c.y)}if(this.visible_region.y_check(0)){var s=new i.vec2(this.visible_region.bottom_left_corner.x,0),l=f.coords_to_pixel(s,this.visible_region);a.moveTo(l.x,l.y);var u=new i.vec2(this.visible_region.top_right_corner.x,0),h=f.coords_to_pixel(u,this.visible_region);a.lineTo(h.x,h.y)}a.lineWidth=e,a.stroke()},e.prototype.drawGrid=function(e,t,r){void 0===r&&(r="lightgrey");var n=Math.trunc(this.center.x/this.scale)*this.scale,o=Math.trunc(this.center.y/this.scale)*this.scale;a.strokeStyle=r,a.beginPath();for(var c=n;this.visible_region.x_check(c);c+=this.scale/t){var s=new i.vec2(c,this.visible_region.top_right_corner.y),l=f.coords_to_pixel(s,this.visible_region);a.moveTo(l.x,l.y);var u=new i.vec2(c,this.visible_region.bottom_left_corner.y),h=f.coords_to_pixel(u,this.visible_region);a.lineTo(h.x,h.y)}for(c=n-this.scale/t;this.visible_region.x_check(c);c-=this.scale/t){s=new i.vec2(c,this.visible_region.top_right_corner.y),l=f.coords_to_pixel(s,this.visible_region);a.moveTo(l.x,l.y);u=new i.vec2(c,this.visible_region.bottom_left_corner.y),h=f.coords_to_pixel(u,this.visible_region);a.lineTo(h.x,h.y)}for(c=o;this.visible_region.y_check(c);c+=this.scale/t){var p=new i.vec2(this.visible_region.bottom_left_corner.x,c),v=f.coords_to_pixel(p,this.visible_region);a.moveTo(v.x,v.y);var b=new i.vec2(this.visible_region.top_right_corner.x,c),d=f.coords_to_pixel(b,this.visible_region);a.lineTo(d.x,d.y)}for(c=o-this.scale/t;this.visible_region.y_check(c);c-=this.scale/t){p=new i.vec2(this.visible_region.bottom_left_corner.x,c),v=f.coords_to_pixel(p,this.visible_region);a.moveTo(v.x,v.y);b=new i.vec2(this.visible_region.top_right_corner.x,c),d=f.coords_to_pixel(b,this.visible_region);a.lineTo(d.x,d.y)}a.lineWidth=e,a.stroke()},e.prototype.defineVisibleRegion=function(){var e=new i.vec2(this.zoom*this.numbers_per_zoom,this.zoom*this.numbers_per_zoom*this.aspect);this.visible_region=new h(this.center.sub(e),this.center.add(e)),this.setScaleByVisibleRegion()},e.prototype.check_pixel=function(e,t,r,n){var i=f.pixel_to_coords(t,this.visible_region);return!Number.isNaN(e)&&Math.abs(e-i.y)<n},e.prototype.drawFunction=function(e,t,r){void 0===r&&(r=2);var n=this.visible_region.bottom_left_corner.x,o=this.visible_region.top_right_corner.x,c=e.derivate;a.fillStyle=t;for(var s=f.coords_step_per_pixel(this.visible_region),l=null,u=!0,h=0,p=n;p<=o;p+=l){var v=e.calculate(p);if(Number.isNaN(v))l=s,u=!1;else{if(!u)for(var b=null,d=p;d>p-1*s;d-=b){var _=e.calculate(d);if(Number.isNaN(_))break;var g=f.coords_to_pixel(new i.vec2(d,_),this.visible_region);if(a.fillRect(g.x,g.y,r,r),!this.visible_region.y_check(f.pixel_to_coords(g,this.visible_region).y))break;for(var y=c.calculate(d),x=Math.abs(s/y);p===p+x&&0!==x;)x*=8;if(b=Math.abs(y)>1?x:s,h>13e4)break;h++}var w=f.coords_to_pixel(new i.vec2(p,v),this.visible_region);if(u=!0,this.visible_region.y_check(f.pixel_to_coords(w,this.visible_region).y)){a.fillRect(w.x,w.y,r,r);for(var m=c.calculate(p),j=Math.abs(s/m);p===p+j&&0!==j;)j*=8;if(l=Math.abs(m)>1?j:s,h>13e4)break;h++}else l=s,u=!1}}},e.prototype.drawEquation=function(e,t,r){void 0===r&&(r=2),a.fillStyle=t;for(var n=0;n<c.width;n++)for(var o=0;o<c.width;o++){var s=f.pixel_to_coords(new i.vec2(n,o).add(new i.vec2(-1,-1)),this.visible_region),l=f.pixel_to_coords(new i.vec2(n,o).add(new i.vec2(1,-1)),this.visible_region),u=f.pixel_to_coords(new i.vec2(n,o).add(new i.vec2(-1,1)),this.visible_region),h=f.pixel_to_coords(new i.vec2(n,o).add(new i.vec2(1,1)),this.visible_region),p=e.calculate(s.x),v=e.calculate(l.x);if(!Number.isNaN(p)||!Number.isNaN(v)){var b=e.calculate(u.x),d=e.calculate(h.x);((p-s.y)*(d-h.y)<0||(v-l.y)*(b-u.y)<0)&&a.fillRect(n,o,r,r)}}},e.prototype.drawChart=function(){a.clearRect(0,0,c.offsetWidth,c.offsetHeight),this.defineVisibleRegion(),this.drawGrid(1,this.step_divider),this.drawGrid(2,1),this.drawAxes(2);for(var e=0,t=u;e<t.length;e++){var r=t[e];this.drawFunction(r.func,r.color)}this.drawLabels()},e}(),v=function(){function e(){var e=this;window.addEventListener("message",(function(t){var r=JSON.parse(t.data);try{var n={};if(r.center&&(s.center=new i.vec2(r.center[0],r.center[1])),r.zoom&&r.zoom>0&&(s.zoom=r.zoom),r.functions){u=[],e.error_messages=[];for(var o=0,c=r.functions;o<c.length;o++){var a=c[o],f=l.parse(a.expression.toLowerCase());f&&u.push({color:a.color,func:f})}n.error_messages=e.error_messages}void 0!==r.get_center_and_zoom&&r.get_center_and_zoom&&(n.zoom=s.zoom,n.center=s.center),s.drawChart(),window.parent.postMessage(JSON.stringify(n),"*")}catch(e){console.log(e)}}))}return e.prototype.parse_func=function(e,t){for(var r=[{t:"sqrt",f:o.Sqrt},{t:"asin",f:o.Asin},{t:"acos",f:o.Acos},{t:"atan",f:o.Atan},{t:"sinh",f:o.Sinh},{t:"cosh",f:o.Cosh},{t:"tanh",f:o.Tanh},{t:"sin",f:o.Sin},{t:"cos",f:o.Cos},{t:"tan",f:o.Tan},{t:"exp",f:o.Exp},{t:"log",f:o.Log},{t:"abs",f:o.Abs},{t:"D",f:o.Der}],n=[],i=0,c=e.split("^");i<c.length;i++){for(var a=c[i],s=null,l=0,u=r;l<u.length;l++){var f=u[l],h="^"+f.t+"(\\(\\)|x|d+)$",p=new RegExp(h,"g").exec(a);if(null!==p){var v=null;v="x"===p[1]?new o.Variable:Number.isNaN(Number(p[1]))?t.shift():new o.Costant(parseInt(p[1])),s=new f.f(v)}}if(null===s&&("x"===a?s=new o.Variable:Number.isNaN(Number(a))?"()"===a&&(s=t.shift()):s=new o.Costant(Number(a))),null===s)throw new Error("undefined "+a);n.push(s)}if(1===n.length)return n[0];for(var b=n[0],d=1;d<n.length;d++)b=new o.Pow(b,n[d]);return b},e.prototype.parse_monome=function(e,t){for(var r,i,c=[],a=0,s=e.split("*");a<s.length;a++){var l=s[a];if(""===l)throw new Error("empty value");for(var u=[],f=0,h=l.split("/");f<h.length;f++){var p=h[f];if(""===p)throw new Error("empty value");var v=this.parse_func(p,t);u.push(v)}1===u.length?c.push(u[0]):c.push(new((r=o.Divide).bind.apply(r,n([void 0],u))))}return 1===c.length?c[0]:new((i=o.Multiply).bind.apply(i,n([void 0],c)))},e.prototype.retrive_function=function(e,t){var r,i;if(""===e)throw new Error("empty value");for(var c=e.split("+"),a=[],s=0;s<c.length;s++){var l=c[s];if(""===l){if(0===s)continue;throw new Error("empty value")}for(var u=l.split("-"),f=[],h=!1,p=0;p<u.length;p++){var v=u[p];if(""===v){if(0===p){h=!0;continue}throw new Error("empty value")}var b=this.parse_monome(v,t);h&&(h=!1,b=new o.Negative(b)),f.push(b)}1===f.length?a.push(f[0]):a.push(new((r=o.Sub).bind.apply(r,n([void 0],f))))}return 1===a.length?a[0]:new((i=o.Add).bind.apply(i,n([void 0],a)))},e.prototype.parse_block=function(e){var t=[];t.push({index:-1,functions:[]});for(var r=e.split(""),n=0;n<r.length;n++){var i=e[n];if("("===i)t.push({index:n,functions:[]});else if(")"===i){if(1===t.length)throw new Error("missing opening (");var o=t.pop(),c=r.join("").slice(o.index+1,n).split(" ").join(""),a=this.retrive_function(c,o.functions);t[t.length-1].functions.push(a);for(var s=o.index+1;s<n;s++)r[s]=" "}}if(1===t.length){c=r.join("").split(" ").join("");var l=t.pop().functions;return this.retrive_function(c,l)}throw new Error("missing closing )")},e.prototype.parse=function(e){try{var t=this.parse_block(e);return this.error_messages.push(null),t}catch(e){return this.error_messages.push(e.toString()),null}},e}();window.addEventListener("load",(function(e){c=document.getElementById("canvas"),a=c.getContext("2d"),l=new v,s=new p}))},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.vec2=void 0;var n=function(){function e(e,t){this.arr=[e,t]}return Object.defineProperty(e.prototype,"x",{get:function(){return this.arr[0]},set:function(e){this.arr[0]=e},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"y",{get:function(){return this.arr[1]},set:function(e){this.arr[1]=e},enumerable:!1,configurable:!0}),e.prototype.add=function(t){return new e(this.x+t.x,this.y+t.y)},e.prototype.sub=function(t){return new e(this.x-t.x,this.y-t.y)},e.prototype.length=function(){return Math.hypot.apply(Math,this.arr)},e.prototype.normalized=function(){var t=this.length();return new e(this.y/t,this.y/t)},e.prototype.normalize=function(){var e=this.length();return this.x/=e,this.y/=e,this},e.prototype.scalar_mul=function(e){return this.x*e.x+this.y*e.y},e.prototype.mul=function(t){return new e(this.x*t,this.y*t)},e.prototype.toString=function(){return"("+this.x+","+this.y+")"},e}();t.vec2=n},function(e,t,r){"use strict";var n=this&&this.__spreadArrays||function(){for(var e=0,t=0,r=arguments.length;t<r;t++)e+=arguments[t].length;var n=Array(e),i=0;for(t=0;t<r;t++)for(var o=arguments[t],c=0,a=o.length;c<a;c++,i++)n[i]=o[c];return n};Object.defineProperty(t,"__esModule",{value:!0}),t.Der=t.Variable=t.Sqrt=t.Pow=t.Atan=t.Acos=t.Asin=t.Tanh=t.Cosh=t.Sinh=t.Tan=t.Cos=t.Sin=t.Exp=t.Log=t.Sub=t.Negative=t.Add=t.Divide=t.Abs=t.Multiply=t.Costant=void 0;var i=function(){function e(e){this.value=e}return e.prototype.calculate=function(e){return this.value},Object.defineProperty(e.prototype,"derivate",{get:function(){return new e(0)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return this.value.toString()},enumerable:!1,configurable:!0}),e}();t.Costant=i;var o=function(){function e(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];if(e.length<=1)throw new Error("multiply costructor arg length "+e.length);e.filter((function(e){return!(e instanceof i&&1===e.value)}));for(var r=0,n=e;r<n.length;r++){var o=n[r];if(o instanceof i&&0===o.value)return void(this.f=[new i(0)])}this.f=e}return e.prototype.calculate=function(e){for(var t=1,r=0,n=this.f;r<n.length;r++){var i=n[r],o=i.calculate(e);Number.isNaN(o)&&0===t||Number.isNaN(t)&&0===o?t=0:t*=i.calculate(e)}return t},Object.defineProperty(e.prototype,"derivate",{get:function(){for(var t=this.f[0],r=1;r<this.f.length;r++)t=new s(new e(t.derivate,this.f[r]),new e(t,this.f[r].derivate));return t},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){for(var e="",t=0,r=this.f;t<r.length;t++){e+="("+r[t].text+")"}return e},enumerable:!1,configurable:!0}),e}();t.Multiply=o;var c=function(){function e(e){this.a=e}return e.prototype.calculate=function(e){return Math.abs(this.a.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new e(this.a.derivate)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"|"+this.a.text+"|"},enumerable:!1,configurable:!0}),e}();t.Abs=c;var a=function(){function e(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];if(e.length<=1)throw new Error("divide costructor arg length "+e.length);this.f=e}return e.prototype.calculate=function(e){for(var t=this.f[0].calculate(e),r=1;r<this.f.length;r++){var n=this.f[r].calculate(e);Number.isNaN(n)&&0===t||Number.isNaN(t)&&0===n?t=0:t/=this.f[r].calculate(e)}return t},Object.defineProperty(e.prototype,"derivate",{get:function(){for(var t=this.f[0],r=1;r<this.f.length;r++){var n=this.f[r];t=new e(new u(new o(t.derivate,n),new o(t,n.derivate)),new m(n,new i(2)))}return t},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return this.f.map((function(e){return"("+e.text+")"})).join("/")},enumerable:!1,configurable:!0}),e}();t.Divide=a;var s=function(){function e(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];if(e.length<=1)throw new Error("add costructor arg length "+e.length);this.f=e}return e.prototype.calculate=function(e){for(var t=0,r=0,n=this.f;r<n.length;r++){t+=n[r].calculate(e)}return t},Object.defineProperty(e.prototype,"derivate",{get:function(){return new(e.bind.apply(e,n([void 0],this.f.map((function(e){return e.derivate})))))},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return this.f.map((function(e){return e.text})).join("+")},enumerable:!1,configurable:!0}),e}();t.Add=s;var l=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return-this.f.calculate(e)},Object.defineProperty(e.prototype,"derivate",{get:function(){return new e(this.f.derivate)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"-"+this.f.text},enumerable:!1,configurable:!0}),e}();t.Negative=l;var u=function(){function e(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];if(e.length<=1)throw new Error("sub costructor arg length "+e.length);this.f=e}return e.prototype.calculate=function(e){for(var t=this.f[0].calculate(e),r=1;r<this.f.length;r++)t-=this.f[r].calculate(e);return t},Object.defineProperty(e.prototype,"derivate",{get:function(){return new(e.bind.apply(e,n([void 0],this.f.map((function(e){return e.derivate})))))},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return this.f.map((function(e){return e.text})).join("-")},enumerable:!1,configurable:!0}),e}();t.Sub=u;var f=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.log(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new a(this.f.derivate,new c(this.f))},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"log("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Log=f;var h=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.exp(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new o(this,this.f.derivate)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"e^("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Exp=h;var p=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.sin(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new o(new v(this.f),this.f.derivate)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"sin("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Sin=p;var v=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.cos(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new o(new u(new i(0),new p(this.f)),this.f.derivate)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"cos("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Cos=v;var b=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.tan(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new a(this.f.derivate,new m(new v(this.f),new i(2)))},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"tan("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Tan=b;var d=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.sinh(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new o(new _(this.f),this.f.derivate)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"sinh("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Sinh=d;var _=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.cosh(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new o(new d(this.f),this.f.derivate)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"cosh("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Cosh=_;var g=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.tanh(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new a(this.f.derivate,new m(new _(this.f),new i(2)))},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"tanh("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Tanh=g;var y=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.asin(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new a(this.f.derivate,new j(new u(new i(1),new m(this.f,new i(2)))))},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"asin("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Asin=y;var x=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.acos(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new u(new i(0),new y(this.f).derivate)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"acos("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Acos=x;var w=function(){function e(e){this.f=e}return e.prototype.calculate=function(e){return Math.atan(this.f.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new a(this.f.derivate,new s(new i(1),new m(this.f,new i(2))))},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"atan("+this.f.text+")"},enumerable:!1,configurable:!0}),e}();t.Atan=w;var m=function(){function e(e,t){this.base=e,this.exp=t}return e.prototype.calculate=function(e){return Math.pow(this.base.calculate(e),this.exp.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){if(this.exp instanceof i)return new o(this.exp,new e(this.base,new i(this.exp.value-1)),this.base.derivate);var t=new a(new o(this.exp,this.base.derivate),this.base),r=new s(new o(this.exp.derivate,new f(this.base)),t);return new o(this,r)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"("+this.base.text+")^("+this.exp.text+")"},enumerable:!1,configurable:!0}),e}();t.Pow=m;var j=function(){function e(e){this.base=e}return e.prototype.calculate=function(e){return Math.sqrt(this.base.calculate(e))},Object.defineProperty(e.prototype,"derivate",{get:function(){return new o(new a(this.base.derivate,this),new i(-1.2))},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"sqrt("+this.base.text+")"},enumerable:!1,configurable:!0}),e}();t.Sqrt=j;var P=function(){function e(){}return e.prototype.calculate=function(e){return e},Object.defineProperty(e.prototype,"derivate",{get:function(){return new i(1)},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return"x"},enumerable:!1,configurable:!0}),e}();t.Variable=P;var O=function(){function e(e){this.f=e.derivate}return e.prototype.calculate=function(e){return this.f.calculate(e)},Object.defineProperty(e.prototype,"derivate",{get:function(){return this.f.derivate},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"text",{get:function(){return this.f.text},enumerable:!1,configurable:!0}),e}();t.Der=O}]);
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _Vector = __webpack_require__(1);
	
	var _Vector2 = _interopRequireDefault(_Vector);
	
	var _Canvas = __webpack_require__(2);
	
	var _Canvas2 = _interopRequireDefault(_Canvas);
	
	var _DeltaTime = __webpack_require__(3);
	
	var _DeltaTime2 = _interopRequireDefault(_DeltaTime);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Game = (function () {
	  function Game(canvas) {
	    _classCallCheck(this, Game);
	
	    this.canvas = new _Canvas2.default(canvas);
	    this.deltaTime = new _DeltaTime2.default();
	
	    this.grid = new Grid(this);
	    this.sound = new Sound(this);
	  }
	
	  _createClass(Game, [{
	    key: 'loop',
	    value: function loop() {
	      var deltaTime = this.deltaTime.snapshot;
	
	      this.canvas.clear();
	      this.render();
	      this.tick();
	
	      requestAnimationFrame(this.loop.bind(this));
	    }
	  }, {
	    key: 'tick',
	    value: function tick() {
	      var dtSnapshot = this.deltaTime.snapshot;
	
	      this.grid.tick(dtSnapshot);
	      this.sound.tick(dtSnapshot);
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      this.grid.render(this.canvas);
	    }
	  }]);
	
	  return Game;
	})();
	
	var Grid = (function () {
	  function Grid(game) {
	    _classCallCheck(this, Grid);
	
	    this.game = game;
	
	    this.activeColor = 'white';
	    this.inactiveColor = '#333';
	
	    this.count = 7;
	    this.size = 100;
	    this.margin = 5;
	
	    this.x = 0;
	
	    this.lastMove = game.deltaTime.t;
	  }
	
	  _createClass(Grid, [{
	    key: 'tick',
	    value: function tick(deltaTime) {
	      if (deltaTime.t - this.lastMove >= 0.5) {
	        this.x = (this.x + 1) % this.count;
	        if (this.x == 0) {
	          this.game.sound.pulse();
	        }
	        this.lastMove = deltaTime.t;
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render(canvas) {
	      var _this = this;
	
	      var calcPos = function calcPos(x) {
	        return x * (_this.size + _this.margin);
	      };
	      var xOffset = canvas.width / 2 - this.width / 2;
	      var yOffset = canvas.height / 2 - this.width / 2;
	
	      for (var y = 0; y < this.count; y++) {
	        for (var x = 0; x < this.count; x++) {
	          var color = this.inactiveColor;
	
	          if (x == this.x && y == 3) {
	            color = this.activeColor;
	          }
	
	          canvas.ctx.fillStyle = color;
	          canvas.ctx.fillRect(xOffset + calcPos(x), yOffset + calcPos(y), 100, 100);
	        }
	      }
	    }
	  }, {
	    key: 'width',
	    get: function get() {
	      return (this.size + this.margin) * this.count;
	    }
	  }]);
	
	  return Grid;
	})();
	
	var Sound = (function () {
	  function Sound() {
	    _classCallCheck(this, Sound);
	
	    this.ctx = new AudioContext();
	    this.output = this.ctx.destination;
	    this.oscillator = this.ctx.createOscillator();
	    this.gain = this.ctx.createGain();
	
	    this.oscillator.frequency.value = 440;
	    this.oscillator.connect(this.gain);
	    this.gain.connect(this.output);
	
	    this.oscillator.start();
	
	    this.gainVal = 1;
	    this.gain.gain.value = this.gainVal;
	  }
	
	  _createClass(Sound, [{
	    key: 'tick',
	    value: function tick(deltaTime) {
	      this.gainVal = Math.max(0, this.gainVal - deltaTime.dt * 100);
	
	      this.gain.gain.value = this.gainVal;
	
	      console.log(deltaTime.dt, this.gainVal, this.gain.gain.value);
	    }
	  }, {
	    key: 'pulse',
	    value: function pulse() {
	      this.gainVal = 1;
	    }
	  }]);
	
	  return Sound;
	})();
	
	var gameCanvas = document.getElementById('gameCanvas');
	var game = new Game(gameCanvas);
	game.loop();

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Vector = (function () {
	  function Vector(options) {
	    _classCallCheck(this, Vector);
	
	    this.x = options.x || 0;
	    this.y = options.y || 0;
	  }
	
	  _createClass(Vector, [{
	    key: "add",
	    value: function add(u) {
	      return Vector.add(this, u);
	    }
	  }, {
	    key: "sub",
	    value: function sub(u) {
	      return Vector.sub(this, u);
	    }
	  }, {
	    key: "mul",
	    value: function mul(s) {
	      return Vector.mul(this, s);
	    }
	  }, {
	    key: "dot",
	    value: function dot(u) {
	      return Vector.dot(this, u);
	    }
	  }, {
	    key: "cross",
	    value: function cross(u) {
	      return Vector.cross(this, u);
	    }
	  }, {
	    key: "norm",
	    value: function norm() {
	      return Vector.norm(this);
	    }
	  }, {
	    key: "mag",
	    get: function get() {
	      return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	    }
	  }], [{
	    key: "add",
	    value: function add(u, v) {
	      return new Vector({
	        x: u.x + v.x,
	        y: u.y + v.y
	      });
	    }
	  }, {
	    key: "sub",
	    value: function sub(u, v) {
	      return new Vector({
	        x: u.x - v.x,
	        y: u.y - v.y
	      });
	    }
	  }, {
	    key: "mul",
	    value: function mul(u, s) {
	      return new Vector({
	        x: u.x * s,
	        y: u.y * s
	      });
	    }
	  }, {
	    key: "norm",
	    value: function norm(u) {
	      return new Vector({
	        x: u.x / u.mag,
	        y: u.y / u.mag
	      });
	    }
	  }, {
	    key: "dot",
	    value: function dot(u, v) {
	      return u.x * v.x + u.y * v.y;
	    }
	  }, {
	    key: "cross",
	    value: function cross(u, v) {
	      return new Vector({
	        x: u.x * v.x,
	        y: u.y * v.y
	      });
	    }
	  }]);
	
	  return Vector;
	})();
	
	exports.default = Vector;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Canvas = (function () {
	  function Canvas(domCanvas) {
	    _classCallCheck(this, Canvas);
	
	    this.domCanvas = domCanvas;
	    this.ctx = this.domCanvas.getContext('2d');
	
	    this.width = this.domCanvas.width;
	    this.height = this.domCanvas.height;
	  }
	
	  _createClass(Canvas, [{
	    key: 'clear',
	    value: function clear() {
	      this.ctx.clearRect(0, 0, this.width, this.height);
	    }
	  }]);
	
	  return Canvas;
	})();
	
	exports.default = Canvas;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var DeltaTime = (function () {
	  function DeltaTime() {
	    _classCallCheck(this, DeltaTime);
	
	    this.lastTick = window.performance.now();
	    this.startTime = new Date().getTime();
	  }
	
	  _createClass(DeltaTime, [{
	    key: "dt",
	    get: function get() {
	      var now = window.performance.now();
	      var dt = now - this.lastTick;
	
	      this.lastTick = now;
	      return dt / 1000;
	    }
	  }, {
	    key: "t",
	    get: function get() {
	      var now = new Date().getTime();
	      var sinceStart = now - this.startTime;
	
	      return sinceStart / 1000;
	    }
	  }, {
	    key: "snapshot",
	    get: function get() {
	      return { t: this.t, dt: this.dt };
	    }
	  }]);
	
	  return DeltaTime;
	})();
	
	exports.default = DeltaTime;

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDZlM2QxMzY5NTc1MzExZDVmOTgiLCJ3ZWJwYWNrOi8vLy4vc3JjL2VudHJ5LmpzIiwid2VicGFjazovLy8uL3NyYy9WZWN0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0NhbnZhcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvRGVsdGFUaW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0NqQ00sSUFBSTtBQUNSLFlBREksSUFBSSxDQUNJLE1BQU0sRUFBRTsyQkFEaEIsSUFBSTs7QUFFTixTQUFJLENBQUMsTUFBTSxHQUFHLHFCQUFXLE1BQU0sQ0FBQztBQUNoQyxTQUFJLENBQUMsU0FBUyxHQUFHLHlCQUFlOztBQUVoQyxTQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztBQUMxQixTQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQztJQUM3Qjs7Z0JBUEcsSUFBSTs7NEJBU0Q7QUFDTCxXQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVE7O0FBRXZDLFdBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ25CLFdBQUksQ0FBQyxNQUFNLEVBQUU7QUFDYixXQUFJLENBQUMsSUFBSSxFQUFFOztBQUVYLDRCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO01BQzVDOzs7NEJBRU07QUFDTCxXQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FB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QUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO01BQ2xDOzs7VUF2QkcsU0FBUzs7O21CQTJCQSxTQUFTLEMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBkNmUzZDEzNjk1NzUzMTFkNWY5OFxuICoqLyIsImltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InXHJcbmltcG9ydCBDYW52YXMgZnJvbSAnLi9DYW52YXMnXHJcbmltcG9ydCBEZWx0YVRpbWUgZnJvbSAnLi9EZWx0YVRpbWUnXHJcblxyXG5cclxuY2xhc3MgR2FtZSB7XHJcbiAgY29uc3RydWN0b3IoY2FudmFzKSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IG5ldyBDYW52YXMoY2FudmFzKVxyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBuZXcgRGVsdGFUaW1lKClcclxuXHJcbiAgICB0aGlzLmdyaWQgPSBuZXcgR3JpZCh0aGlzKVxyXG4gICAgdGhpcy5zb3VuZCA9IG5ldyBTb3VuZCh0aGlzKVxyXG4gIH1cclxuXHJcbiAgbG9vcCgpIHtcclxuICAgIHZhciBkZWx0YVRpbWUgPSB0aGlzLmRlbHRhVGltZS5zbmFwc2hvdFxyXG5cclxuICAgIHRoaXMuY2FudmFzLmNsZWFyKClcclxuICAgIHRoaXMucmVuZGVyKClcclxuICAgIHRoaXMudGljaygpXHJcblxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubG9vcC5iaW5kKHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgdGljaygpIHtcclxuICAgIHZhciBkdFNuYXBzaG90ID0gdGhpcy5kZWx0YVRpbWUuc25hcHNob3RcclxuXHJcbiAgICB0aGlzLmdyaWQudGljayhkdFNuYXBzaG90KVxyXG4gICAgdGhpcy5zb3VuZC50aWNrKGR0U25hcHNob3QpXHJcbiAgfVxyXG5cclxuICByZW5kZXIoKSB7XHJcbiAgICB0aGlzLmdyaWQucmVuZGVyKHRoaXMuY2FudmFzKVxyXG4gIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIEdyaWQge1xyXG4gIGNvbnN0cnVjdG9yKGdhbWUpIHtcclxuICAgIHRoaXMuZ2FtZSA9IGdhbWVcclxuXHJcbiAgICB0aGlzLmFjdGl2ZUNvbG9yID0gJ3doaXRlJ1xyXG4gICAgdGhpcy5pbmFjdGl2ZUNvbG9yID0gJyMzMzMnXHJcblxyXG4gICAgdGhpcy5jb3VudCA9IDdcclxuICAgIHRoaXMuc2l6ZSA9IDEwMFxyXG4gICAgdGhpcy5tYXJnaW4gPSA1XHJcblxyXG4gICAgdGhpcy54ID0gMFxyXG5cclxuICAgIHRoaXMubGFzdE1vdmUgPSBnYW1lLmRlbHRhVGltZS50XHJcbiAgfVxyXG5cclxuICBnZXQgd2lkdGgoKSB7XHJcbiAgICByZXR1cm4gKHRoaXMuc2l6ZSArIHRoaXMubWFyZ2luKSAqIHRoaXMuY291bnRcclxuICB9XHJcblxyXG4gIHRpY2soZGVsdGFUaW1lKSB7XHJcbiAgICBpZiAoZGVsdGFUaW1lLnQgLSB0aGlzLmxhc3RNb3ZlID49IDAuNSkge1xyXG4gICAgICB0aGlzLnggPSAodGhpcy54ICsgMSkgJSB0aGlzLmNvdW50XHJcbiAgICAgIGlmICh0aGlzLnggPT0gMCkgeyB0aGlzLmdhbWUuc291bmQucHVsc2UoKSB9XHJcbiAgICAgIHRoaXMubGFzdE1vdmUgPSBkZWx0YVRpbWUudFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKGNhbnZhcykge1xyXG4gICAgbGV0IGNhbGNQb3MgPSB4ID0+IHggKiAodGhpcy5zaXplICsgdGhpcy5tYXJnaW4pXHJcbiAgICBsZXQgeE9mZnNldCA9IChjYW52YXMud2lkdGggLyAyKSAtICh0aGlzLndpZHRoIC8gMilcclxuICAgIGxldCB5T2Zmc2V0ID0gKGNhbnZhcy5oZWlnaHQgLyAyKSAtICh0aGlzLndpZHRoIC8gMilcclxuXHJcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuY291bnQ7IHkrKykge1xyXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMuY291bnQ7IHgrKykge1xyXG4gICAgICAgIGxldCBjb2xvciA9IHRoaXMuaW5hY3RpdmVDb2xvclxyXG5cclxuICAgICAgICBpZiAoeCA9PSB0aGlzLnggJiYgeSA9PSAzKSB7XHJcbiAgICAgICAgICBjb2xvciA9IHRoaXMuYWN0aXZlQ29sb3JcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhbnZhcy5jdHguZmlsbFN0eWxlID0gY29sb3JcclxuICAgICAgICBjYW52YXMuY3R4LmZpbGxSZWN0KFxyXG4gICAgICAgICAgeE9mZnNldCArIGNhbGNQb3MoeCksIHlPZmZzZXQgKyBjYWxjUG9zKHkpLFxyXG4gICAgICAgICAgMTAwLCAxMDApXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5jbGFzcyBTb3VuZCB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKVxyXG4gICAgdGhpcy5vdXRwdXQgPSB0aGlzLmN0eC5kZXN0aW5hdGlvblxyXG4gICAgdGhpcy5vc2NpbGxhdG9yID0gdGhpcy5jdHguY3JlYXRlT3NjaWxsYXRvcigpXHJcbiAgICB0aGlzLmdhaW4gPSB0aGlzLmN0eC5jcmVhdGVHYWluKClcclxuXHJcbiAgICB0aGlzLm9zY2lsbGF0b3IuZnJlcXVlbmN5LnZhbHVlID0gNDQwXHJcbiAgICB0aGlzLm9zY2lsbGF0b3IuY29ubmVjdCh0aGlzLmdhaW4pXHJcbiAgICB0aGlzLmdhaW4uY29ubmVjdCh0aGlzLm91dHB1dClcclxuXHJcbiAgICB0aGlzLm9zY2lsbGF0b3Iuc3RhcnQoKVxyXG5cclxuICAgIHRoaXMuZ2FpblZhbCA9IDFcclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gdGhpcy5nYWluVmFsXHJcbiAgfVxyXG5cclxuICB0aWNrKGRlbHRhVGltZSkge1xyXG4gICAgdGhpcy5nYWluVmFsID0gTWF0aC5tYXgoXHJcbiAgICAgIDAsIHRoaXMuZ2FpblZhbCAtIChkZWx0YVRpbWUuZHQgKiAxMDApKVxyXG5cclxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gdGhpcy5nYWluVmFsXHJcblxyXG4gICAgY29uc29sZS5sb2coZGVsdGFUaW1lLmR0LCB0aGlzLmdhaW5WYWwsIHRoaXMuZ2Fpbi5nYWluLnZhbHVlKVxyXG4gIH1cclxuXHJcbiAgcHVsc2UoKSB7XHJcbiAgICB0aGlzLmdhaW5WYWwgPSAxXHJcbiAgfVxyXG59XHJcblxyXG5cclxudmFyIGdhbWVDYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUNhbnZhcycpO1xyXG52YXIgZ2FtZSA9IG5ldyBHYW1lKGdhbWVDYW52YXMpXHJcbmdhbWUubG9vcCgpXHJcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2VudHJ5LmpzXG4gKiovIiwiY2xhc3MgVmVjdG9yIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMueCA9IG9wdGlvbnMueCB8fCAwXG4gICAgdGhpcy55ID0gb3B0aW9ucy55IHx8IDBcbiAgfVxuXG4gIGdldCBtYWcoKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChcbiAgICAgIE1hdGgucG93KHRoaXMueCwgMikgKyBNYXRoLnBvdyh0aGlzLnksIDIpXG4gICAgKVxuICB9XG5cbiAgYWRkKHUpIHsgcmV0dXJuIFZlY3Rvci5hZGQodGhpcywgdSkgfVxuICBzdWIodSkgeyByZXR1cm4gVmVjdG9yLnN1Yih0aGlzLCB1KSB9XG4gIG11bChzKSB7IHJldHVybiBWZWN0b3IubXVsKHRoaXMsIHMpIH1cblxuICBkb3QodSkgeyByZXR1cm4gVmVjdG9yLmRvdCAodGhpcywgdSkgfVxuICBjcm9zcyh1KSB7IHJldHVybiBWZWN0b3IuY3Jvc3ModGhpcywgdSkgfVxuXG4gIG5vcm0oKSB7IHJldHVybiBWZWN0b3Iubm9ybSh0aGlzKSB9XG5cbiAgc3RhdGljIGFkZCh1LCB2KSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3Ioe1xuICAgICAgeDogdS54ICsgdi54LFxuICAgICAgeTogdS55ICsgdi55XG4gICAgfSlcbiAgfVxuXG4gIHN0YXRpYyBzdWIodSwgdikge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHtcbiAgICAgIHg6IHUueCAtIHYueCxcbiAgICAgIHk6IHUueSAtIHYueVxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgbXVsKHUsIHMpIHtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih7XG4gICAgICB4OiB1LnggKiBzLFxuICAgICAgeTogdS55ICogc1xuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgbm9ybSh1KSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3Ioe1xuICAgICAgeDogdS54IC8gdS5tYWcsXG4gICAgICB5OiB1LnkgLyB1Lm1hZ1xuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgZG90KHUsIHYpIHtcbiAgICByZXR1cm4gKHUueCAqIHYueCkgKyAodS55ICogdi55KVxuICB9XG5cbiAgc3RhdGljIGNyb3NzKHUsIHYpIHtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih7XG4gICAgICB4OiB1LnggKiB2LngsXG4gICAgICB5OiB1LnkgKiB2LnlcbiAgICB9KVxuICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgVmVjdG9yO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvVmVjdG9yLmpzXG4gKiovIiwiY2xhc3MgQ2FudmFzIHtcclxuICBjb25zdHJ1Y3Rvcihkb21DYW52YXMpIHtcclxuICAgIHRoaXMuZG9tQ2FudmFzID0gZG9tQ2FudmFzXHJcbiAgICB0aGlzLmN0eCA9IHRoaXMuZG9tQ2FudmFzLmdldENvbnRleHQoJzJkJylcclxuXHJcbiAgICB0aGlzLndpZHRoID0gdGhpcy5kb21DYW52YXMud2lkdGhcclxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5kb21DYW52YXMuaGVpZ2h0XHJcbiAgfVxyXG5cclxuICBjbGVhcigpIHtcclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodClcclxuICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYW52YXNcclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvQ2FudmFzLmpzXG4gKiovIiwiY2xhc3MgRGVsdGFUaW1lIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMubGFzdFRpY2sgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KClcclxuICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICB9XHJcblxyXG4gIGdldCBkdCgpIHtcclxuICAgIHZhciBub3cgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KClcclxuICAgIHZhciBkdCA9IG5vdyAtIHRoaXMubGFzdFRpY2tcclxuXHJcbiAgICB0aGlzLmxhc3RUaWNrID0gbm93XHJcbiAgICByZXR1cm4gZHQgLyAxMDAwXHJcbiAgfVxyXG5cclxuICBnZXQgdCgpIHtcclxuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgdmFyIHNpbmNlU3RhcnQgPSBub3cgLSB0aGlzLnN0YXJ0VGltZVxyXG5cclxuICAgIHJldHVybiBzaW5jZVN0YXJ0IC8gMTAwMFxyXG4gIH1cclxuXHJcbiAgZ2V0IHNuYXBzaG90KCkge1xyXG4gICAgcmV0dXJuIHsgdDogdGhpcy50LCBkdDogdGhpcy5kdCB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGVsdGFUaW1lXHJcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL0RlbHRhVGltZS5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=
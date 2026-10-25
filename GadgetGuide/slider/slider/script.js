function lerp(f0, f1, t) {
  return (1 - t) * f0 + t * f1;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(val, max));
}

function DragScroll(obj) {
  this.$el = document.querySelector(obj.el);
  this.$wrap = this.$el.querySelector(obj.wrap);
  this.$items = this.$el.querySelectorAll(obj.item);
  this.$bar = this.$el.querySelector(obj.bar);
  this.init();
}

DragScroll.prototype.init = function () {
  this.progress = 0;
  this.speed = 0;
  this.oldX = 0;
  this.x = 0;
  this.playrate = 0;
  this.scale = 0;

  this.bindings();
  this.events();
  this.calculate();
  this.raf();
};

DragScroll.prototype.bindings = function () {
  var self = this;
  this.events = this.events.bind(this);
  this.calculate = this.calculate.bind(this);
  this.raf = this.raf.bind(this);
  this.handleWheel = this.handleWheel.bind(this);
  this.move = this.move.bind(this);
  this.handleTouchStart = this.handleTouchStart.bind(this);
  this.handleTouchMove = this.handleTouchMove.bind(this);
  this.handleTouchEnd = this.handleTouchEnd.bind(this);
};

DragScroll.prototype.calculate = function () {
  this.progress = 0;
  this.wrapWidth = this.$items[0].clientWidth * this.$items.length;
  this.$wrap.style.width = this.wrapWidth + "px";
  this.maxScroll = this.wrapWidth - this.$el.clientWidth;
};

DragScroll.prototype.handleWheel = function (e) {
  this.progress += e.deltaY;
  this.move();
};

DragScroll.prototype.handleTouchStart = function (e) {
  e.preventDefault();
  this.dragging = true;
  this.startX = e.clientX || e.touches[0].clientX;
  this.$el.classList.add("dragging");
};

DragScroll.prototype.handleTouchMove = function (e) {
  if (!this.dragging) return false;
  var x = e.clientX || e.touches[0].clientX;
  this.progress += (this.startX - x) * 2.5;
  this.startX = x;
  this.move();
};

DragScroll.prototype.handleTouchEnd = function () {
  this.dragging = false;
  this.$el.classList.remove("dragging");
};

DragScroll.prototype.move = function () {
  this.progress = clamp(this.progress, 0, this.maxScroll);
};

DragScroll.prototype.events = function () {
  window.addEventListener("resize", this.calculate);
  window.addEventListener("wheel", this.handleWheel);

  this.$el.addEventListener("touchstart", this.handleTouchStart);
  window.addEventListener("touchmove", this.handleTouchMove);
  window.addEventListener("touchend", this.handleTouchEnd);

  window.addEventListener("mousedown", this.handleTouchStart);
  window.addEventListener("mousemove", this.handleTouchMove);
  window.addEventListener("mouseup", this.handleTouchEnd);
  document.body.addEventListener("mouseleave", this.handleTouchEnd);
};

DragScroll.prototype.raf = function () {
  this.x = lerp(this.x, this.progress, 0.1);
  this.playrate = this.x / this.maxScroll;

  this.$wrap.style.transform = "translateX(" + -this.x + "px)";
  this.$bar.style.transform = "scaleX(" + (0.18 + this.playrate * 0.82) + ")";

  this.speed = Math.min(100, this.oldX - this.x);
  this.oldX = this.x;

  this.scale = lerp(this.scale, this.speed, 0.1);
  for (var i = 0; i < this.$items.length; i++) {
    var item = this.$items[i];
    var img = item.querySelector("img");
    item.style.transform = "scale(" + (1 - Math.abs(this.speed) * 0.002) + ")";
    img.style.transform = "scaleX(" + (1 + Math.abs(this.speed) * 0.004) + ")";
  }
};

var scroll = new DragScroll({
  el: ".carousel",
  wrap: ".carousel--wrap",
  item: ".carousel--item",
  bar: ".carousel--progress-bar"
});

function raf() {
  requestAnimationFrame(raf);
  scroll.raf();
}
raf();

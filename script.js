"use strict"
window.onload = () => {
  class Pew {
    constructor(theta, x, y) {
      this.x = x;
      this.y = y;
      this.r = 0;
      this.xi = x;
      this.yi = y;
      this.size = 4;
      this.theta = theta;
      this.hit = false;
    }

    update(specks) {
      this.r += 4;
      this.xi = this.r * Math.cos(this.theta) + this.x;
      this.yi = this.r * Math.sin(this.theta) + this.y;
      if ((this.xi > W || this.xi < 0) || (this.yi > H || this.yi < 0)) {
        this.hit = true;
        return;
      }

      for (let speck of specks) {
        // check if rectangles overlap with a speck 
        if ((speck.x - speck.size / 2) < (this.xi + this.size / 2) && (speck.x + speck.size / 2) > (this.xi - this.size / 2) && (speck.y - speck.size / 2) < (this.yi + this.size / 2) && (speck.y + speck.size / 2) > (this.yi - this.size / 2)) {
          speck.size += 1;
          this.hit = true;
          return;
        }
      }
    }

    draw() {
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.fillStyle = `hsl(${Math.abs(360 * Math.cos(this.r))}, 100%, 50%)`;
      ctx.fillRect(this.xi, this.yi, this.size, this.size);
    }
  }

  class Bang {
    constructor(size, x, y) {
      this.x = x;
      this.y = y;
      this.r = 0;
      this.size = size;
      this.particles = [];
      for (let i = 0; i < this.size; i++) {
        const theta = 2 * Math.PI * Math.random();
        this.particles.push([this.size * Math.cos(theta), this.size * Math.sin(theta)]);
      }
    }

    draw() {
      ctx.shadowBlur = 4;
      for (let particle of this.particles) {
        ctx.shadowColor = ctx.fillStyle = `rgba(${150 + 50 * Math.cos(2 * this.r * Math.PI)}, ${150 + 50 * Math.sin(2 * Math.PI * this.x / W)}, ${200 * this.y / H}, ${1 - this.r})`;
        ctx.fillRect(this.r * particle[0] + this.x, this.r * particle[1] + this.y, 2, 2);
      }
      this.r += 1 / 60;
    }
  }

  class Speck {
    constructor() {
      this.size = 4 * Math.random() + 6;
      this.r = 1.5 * this.size;
      this.maxSize = this.size + 6 * Math.random() + 2;
      this.maxVelocity = 1.2 * Math.random();
      this.maxForce = 1.5 * this.size;
      this.x = W * Math.random();
      this.y = H * Math.random();
      this.vx = 2 * Math.random() - 1;
      this.vy = 2 * Math.random() - 1;
      this.ax = 0;
      this.ay = 0;
      this.fx = 0; 
      this.fy = 0;
    }

    update(specks) {
      let count = 0;
      this.fx = 0;
      this.fy = 0;
      for (let speck of specks) {
        if (speck === this) continue;
        const a =  this.x - speck.x;
        const b =  this.y - speck.y;
        const d = Math.sqrt(a * a + b * b);
        if (d < this.r) {
          // alignment
          this.fx += speck.vx;
          this.fy += speck.vy;
          // separation
          this.fx += (15 * (this.x - speck.x)) / d;
          this.fy += (15 * (this.y - speck.y)) / d;
          // cohesion
          this.fx += speck.x;
          this.fy += speck.y;
          count += 1;
        }
      }

      if (count > 0) {
        this.fx /= count;
        this.fy /= count;
        this.fx -= this.x;
        this.fy -= this.y;
        this.fx -= this.vx;
        this.fy -= this.vy;
        this.fx /= Math.sqrt(this.fx * this.fx + this.fy * this.fy);
        this.fy /= Math.sqrt(this.fx * this.fx + this.fy * this.fy);
        this.fx *= this.size;
        this.fy *= this.size;
      }

      const scale_x = this.fx ? 1 : -1;
      const scale_y = this.fy ? 1 : -1;
      if (Math.abs(this.fx) > this.maxForce) this.fx = scale_x * this.maxForce;
      if (Math.abs(this.fy) > this.maxForce) this.fy = scale_y * this.maxForce;
      this.ax += this.fx / this.size;
      this.ay += this.fy / this.size;
      this.vx += this.ax;
      this.vy += this.ay;

      const scale_vx = (this.vx) ? 1 : -1;
      const scale_vy = (this.vy) ? 1 : -1;
      if (Math.abs(this.vx) > this.maxVelocity) this.vx = scale_vx * this.maxVelocity;
      if (Math.abs(this.vy) > this.maxVelocity) this.vy = scale_vy * this.maxVelocity;
      this.x += this.vx;
      this.y += this.vy;
      this.ax = 0;
      this.ay = 0;

      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }

    draw() {
      ctx.shadowBlur = this.size;
      ctx.shadowColor = ctx.fillStyle = `rgb(${255 * this.size / 18}, ${155 + 100 * Math.cos(this.y / this.size)}, ${155 + 100 * Math.sin(this.x / this.size)})`;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  class Cowboy {
    constructor() {
      this.vx = 0; // velocity
      this.vy = 0;
      this.ax = 0; // acceleration
      this.ay = 0;
      this.fx = 0; // force
      this.fy = 0;
      this.b = 10; // base
      this.h = 25; // height
      this.theta = 0;
      this.t = 0; // time
      this.x = W / 2; // coordinates
      this.y = 0.8 * H;
      this.maxVelocity = 3;  
      this.maxForce = 6;
      this.target_x = W / 2; // player follows the target
      this.target_y = H / 2;
      // player is a traingle; these are its vertices:
      this.vertex_x1 = this.x; 
      this.vertex_y1 = this.y;
      this.vertex_x2 = this.x + this.b; 
      this.vertex_y2 = this.y + this.h;
      this.vertex_x3 = this.x - this.b; 
      this.vertex_y3 = this.y + this.h;
    }

    update() {
      this.t += 1 / 60;
      if (this.t > 360) this.t = 0;
      this.fx = this.target_x - this.x;
      this.fy = this.target_y - this.y;
      const d = Math.sqrt(this.fx * this.fx + this.fy * this.fy);
      // normalize the force
      this.fx /= d;
      this.fy /= d;
      // then set its magnitude w.r.t. the distance from the target
      // i assume the max distance is the screen diagonal
      this.fx *= this.maxForce * d / D; 
      this.fy *= this.maxForce * d / D; 
      this.fx -= this.vx;
      this.fy -= this.vy;
      this.ax = this.fx;
      this.ay = this.fy;
      this.vx += this.ax;
      this.vy += this.ay;
      const scale_vx = (this.vx) ? 1 : -1;
      const scale_vy = (this.vy) ? 1 : -1;
      if (Math.abs(this.vx) > this.maxVelocity) this.vx = scale_vx * this.maxVelocity;
      if (Math.abs(this.vy) > this.maxVelocity) this.vy = scale_vy * this.maxVelocity;
      this.x += this.vx;
      this.y += this.vy;
      // rotate player by thete using rotation matrix R = [[cos -sin], [sin cos]]
      this.theta = Math.atan2(this.vy, this.vx);
      // adding 90deg to the calculated theta to fix weird player rotation 
      // which i don't really know the reason for :(
      const cosTheta = Math.cos(this.theta + Math.PI / 2);
      const sinTheta = Math.sin(this.theta + Math.PI / 2);
      // because the rotation is done around the origin, the position vector
      // is subtracted before multiplication and added back again afterwards
      this.vertex_x1 = cosTheta - sinTheta + this.x;
      this.vertex_y1 = sinTheta + cosTheta + this.y;
      this.vertex_x2 = this.b * cosTheta - this.h * sinTheta + this.x;
      this.vertex_y2 = this.b * sinTheta + this.h * cosTheta + this.y;
      this.vertex_x3 = Math.abs(-this.b * cosTheta - this.h * sinTheta + this.x);
      this.vertex_y3 = Math.abs(-this.b * sinTheta + this.h * cosTheta + this.y);
      return;
    }

    draw() {
      ctx.shadowBlur = 0;
      ctx.fillStyle = `hsl(${Math.abs(360 * Math.cos(this.t))}, 100%, 50%)`;
      ctx.beginPath();
      ctx.moveTo(this.vertex_x1, this.vertex_y1);
      ctx.lineTo(this.vertex_x2, this.vertex_y2);
      ctx.lineTo(this.vertex_x3, this.vertex_y3);
      ctx.fill();
      ctx.closePath();
    }
  }

  let W;
  let H;
  let D;
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  function setSize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    W = canvas.width;
    H = canvas.height;
    D = Math.sqrt(W * W + H * H);
  }
  window.addEventListener("resize", setSize);
  setSize();

  let t = 0;
  let scoreVal = 0;
  let isPlaying = true;
  const pews = [];
  const bangs = [];
  const specks = [];
  const num_specks = 125;
  const player = new Cowboy();
  for (let i = 0; i < num_specks; i++) {
    const speck = new Speck();
    // check if a speck overlaps with the player
    const d1 = (speck.x - player.vertex_x2) * (player.vertex_y1 - player.vertex_y2) - (player.vertex_x1 - player.vertex_x2) * (speck.y - player.vertex_y2);
    const d2 = (speck.x - player.vertex_x3) * (player.vertex_y2 - player.vertex_y3) - (player.vertex_x2 - player.vertex_x3) * (speck.y - player.vertex_y3);
    const d3 = (speck.x - player.vertex_x1) * (player.vertex_y3 - player.vertex_y1) - (player.vertex_x3 - player.vertex_x1) * (speck.y - player.vertex_y1);
    // if it does, skip it 
    if (!((d1 < 0) || (d2 < 0) || (d3 < 0)) && ((d1 > 0) || (d2 > 0) || (d3 > 0))) {
      continue;
    }
    // otherwise, add to the array
    specks.push(speck);
  }
  const score = document.getElementById("score");

  canvas.addEventListener("mousemove", mousePress);
  function mousePress(event) {
    // do not register move if the game is not on.
    if (!canvas || !isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    player.target_x = event.clientX - rect.left;
    player.target_y = event.clientY - rect.top;
    return;
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    player.update()
    player.draw();

    const toRemovePews = [];
    const toRemoveBangs = [];
    for (let speck of specks) {
      speck.update(specks); 
      speck.draw();

      // check if a speck overlaps with the player
      const d1 = (speck.x - player.vertex_x2) * (player.vertex_y1 - player.vertex_y2) - (player.vertex_x1 - player.vertex_x2) * (speck.y - player.vertex_y2);
      const d2 = (speck.x - player.vertex_x3) * (player.vertex_y2 - player.vertex_y3) - (player.vertex_x2 - player.vertex_x3) * (speck.y - player.vertex_y3);
      const d3 = (speck.x - player.vertex_x1) * (player.vertex_y3 - player.vertex_y1) - (player.vertex_x3 - player.vertex_x1) * (speck.y - player.vertex_y1);
      // if so, stop the game
      if (!((d1 < 0) || (d2 < 0) || (d3 < 0)) && ((d1 > 0) || (d2 > 0) || (d3 > 0))) {
        isPlaying = false;
      }

      if (speck.size > speck.maxSize) {
        bangs.push(new Bang(speck.size, speck.x, speck.y));

        speck.x = 0;
        speck.y = 0;
        speck.size = 4 * Math.random() + 4;

        scoreVal += 1;
        score.textContent = `${scoreVal}`;
      }

      // handling pews inside the specks loop, because it looks better
      for (let i = 0; i < pews.length; i++) {
        pews[i].update(specks);
        pews[i].draw();
        if (pews[i].hit) toRemovePews.push(i);
      }

      t += 1;
      if (t % 1250 === 0 && pews.length < 100) {
        t = 0;
        pews.push(new Pew(player.theta, player.x, player.y));
      }
    }

    for (let index of toRemovePews) {
      pews.pop(index);
    }

    for (let i = 0; i < bangs.length; i++) {
      bangs[i].draw();
      if (bangs[i].r > 1) toRemoveBangs.push(i);
    }
    for (let index of toRemoveBangs) {
      bangs.pop(index);
    }
  }

  function frame() {
    if (isPlaying) {
      drawFrame();
      window.requestAnimationFrame(frame);
      return;
    }
    const playerBang = new Bang(player.h, player.x, player.y);
    for (let i = 0; i < 60; i++) {
      playerBang.draw();
    }
    return;
  }
  frame();
};
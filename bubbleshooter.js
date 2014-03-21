var Ship = function (x, y, angle) {
    "use strict";
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.angle = angle;
    this.radius = 15;
    this.outlineColor = 'white';
    this.shipColor = '#ddf';
    this.thrusterColor = 'darkred';
    this.angleStep = Math.PI / 24;
    this.bullets = [];
    this.bulletLife = 1000;     // in milliseconds
    this.reloadTime = 100;      // in milliseconds
    this.lastShotTime = 0;
    this.kills = 0;
    this.shotsFired = 0;
    
    this.thrust = function (on) {
        if (on) {
            this.dx += Math.cos(this.angle);
            this.dy += Math.sin(this.angle);
            this.thrusterColor = 'red';
        }
        else {
            this.thrusterColor = 'darkred';
        }
    };
    
    this.reverse = function () {
        this.dx -= Math.cos(this.angle);
        this.dy -= Math.sin(this.angle);
    };
    
    this.draw = function (context) {
        // bullets
        for (var i = 0; i < this.bullets.length; i++) {
            this. bullets[i].draw(context);
        }
        // ship start // saving for translation and rotation; restore later
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        // ship body
        context.strokeStyle = this.outlineColor;
        context.lineWidth = 1;
        context.fillStyle = this.shipColor;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(this.radius, 0);
        context.lineTo(-this.radius / 2, this.radius * Math.sqrt(5) / 3);
        context.lineTo(-this.radius, 0);
        context.lineTo(-this.radius / 2, -this.radius * Math.sqrt(3) / 2);
        context.closePath();
        context.fill();
        context.stroke();
        // ship rear
        context.fillStyle = this.thrusterColor;
        context.beginPath();
        context.moveTo(-this.radius / 2, this.radius * Math.sqrt(5) / 3);
        context.lineTo(-this.radius, 0);
        context.lineTo(-this.radius / 2, -this.radius * Math.sqrt(3) / 2);
        context.closePath();
        context.fill();
        context.restore();
        return true;
    };
    
    this.shoot = function() {
        if (new Date().getTime() >= this.lastShotTime + this.reloadTime) {
            this.lastShotTime = new Date().getTime();
            var newBullet = new Bullet(
                this.x + this.radius * Math.cos(this.angle),
                this.y + this.radius * Math.sin(this.angle),
                100 * Math.cos(this.angle) + this.dx,
                100 * Math.sin(this.angle) + this.dy);
            this.bullets.push(newBullet);
            this.reverse();
            this.shotsFired++;
            return true;
        } else {
            return false;
        }
    };
};

var Bullet = function (x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = 2;
    this.color = '#9ef';
    this.creation = new Date().getTime();
    this.hits = 0;
    
    this.draw = function (context) {
        // context.fillStyle = this.color;
        // context.fillRect(this.x, this.y, 2, 2);
        context.lineWidth = 1;
        context.strokeStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        context.stroke();
        return true;
    };
    
};

var Bubble = function (x, y) {
    this.x = x;
    this.y = y;
    this.shield = 1;
    this.dx = Math.random() * 2;
    this.dy = Math.random() * 2;
    this.spawn = new Date().getTime();
    this.age = new Date().getTime() - this.spawn;
    this.outlineColor = 'lightgray';
    this.hits = 0;
    this.radius = (this.age <= 1000) ? 25 : 50;

    this.draw = function(context) {
        context.strokeStyle = this.outlineColor;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        context.stroke();
        context.beginPath();
        context.arc(this.x, this.y, this.radius * 0.8, 0, -Math.PI / 2, true);
        context.stroke();
        // context.fill();
        return true;
    };
    
    this.hitBy = function(bullet) {
          return (distance(bullet.x, bullet.y, this.x, this.y) < this.radius + bullet.radius) ? true : false;
    };
};

function bubbleshooter() {
    "use strict";
    var canvas = document.getElementById('bubbleshooter'),
        context = canvas.getContext('2d'),
        bgcanvas = document.getElementById('bubbleshooter-bg'),
        bgcontext = bgcanvas.getContext('2d');
    var craft = new Ship(canvas.width / 2, canvas.height / 2, 0);
    var minx = craft.radius,
        maxx = canvas.width - craft.radius,
        miny = craft.radius,
        maxy = canvas.height - craft.radius;
    var enemy = new Bubble(100, 100);
    var friction = 0.05;
    var keys = [];
    var startTime = new Date().getTime();
    
    window.addEventListener("keydown", function(e) {
        // space and arrow keys
        if ([32, 37, 38, 39, 40, 32].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    // start this thing
    init();
    animate();
    
    function init() {
        var quadrille = 20;
        var gridSpacing = bgcanvas.width / quadrille;
        for (var i = 0; i < quadrille; i++) {
            bgcontext.lineWidth = 0.5;
            bgcontext.strokeStyle = '#456';
            bgcontext.beginPath();
            bgcontext.moveTo(i * gridSpacing, 0);
            bgcontext.lineTo(i * gridSpacing, bgcanvas.height);
            bgcontext.stroke();
            bgcontext.beginPath();
            bgcontext.moveTo(0,i * gridSpacing, 0);
            bgcontext.lineTo(bgcanvas.width, i * gridSpacing);
            bgcontext.stroke();
        }
        draw();
        // key events
        document.body.addEventListener("keydown", function (e) { keys[e.keyCode] = true; });
        document.body.addEventListener("keyup",   function (e) { keys[e.keyCode] = false; });
        window.requestAnimFrame = function(){
            return (
                window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function(/* function */ callback){
                    window.setTimeout(callback, 1000 / 3);
                }
        );
        }();//    window.setInterval(animate, 10);
    }
    
    function timeElapsed() {
        return Math.round((new Date().getTime() - startTime)/1000);
    }
    
    function animate() {
        requestAnimFrame(animate);
        craft.x += craft.dx * friction;
        craft.y += craft.dy * friction;
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
        // enemy
        if (enemy.hits == enemy.shield) {
            enemy = new Bubble(Math.random() * (canvas.width - 2 * enemy.radius) + enemy.radius, Math.random() * (canvas.height - 2 * enemy.radius) + enemy.radius);
            craft.kills += 1;
            console.log('kills : ' + craft.kills);
            console.log('shots : ' + craft.shotsFired);
            console.log('time = ' + timeElapsed() + ' seconds');
            console.log('kills/shots = ' + (craft.kills / craft.shotsFired));
            console.log('kills/seconds = ' + (craft.kills/timeElapsed()));
            console.log(' - - - - - - - - - - - - - - - - - ');
        }
        if (enemy.x <= enemy.radius || enemy.x >= canvas.width - enemy.radius) { enemy.dx = -enemy.dx; }
        if (enemy.y <= enemy.radius || enemy.y >= canvas.height - enemy.radius) { enemy.dy = -enemy.dy; }
        // craft
        if (craft.x <= minx || craft.x >= maxx) { craft.dx = -craft.dx; }
        if (craft.y <= miny || craft.y >= maxy) { craft.dy = -craft.dy; }
        // bullets
        for (var i = 0; i < craft.bullets.length; i++) {
            // remove old bullets
            if (craft.bullets[i].creation + craft.bulletLife < new Date().getTime()) {
                craft.bullets.splice(i, 1);
            } else {
                // bounce bullets off edges
                if (craft.bullets[i].x <= craft.bullets[i].radius || craft.bullets[i].x >= canvas.width - craft.bullets[i].radius) { craft.bullets[i].dx = -craft.bullets[i].dx; }
                if (craft.bullets[i].y <= craft.bullets[i].radius || craft.bullets[i].y >= canvas.height - craft.bullets[i].radius) { craft.bullets[i].dy = -craft.bullets[i].dy; }
                // move bullets
                craft.bullets[i].x += craft.bullets[i].dx * friction;
                craft.bullets[i].y += craft.bullets[i].dy * friction;
                // log hits
                if (enemy.hitBy(craft.bullets[i])) {
                    enemy.radius += 1;
                    craft.bullets.splice(i, 1);
                    enemy.hits += 1;
                }
            }
        }
        draw();
    }
    
    function draw() {
        context.clear();
        if (keys[37]) { craft.angle -= craft.angleStep; } // left
        if (keys[39]) { craft.angle += craft.angleStep; } // right
        if (keys[38]) { craft.thrust(true); } else { craft.thrust(false); } // up
        if (keys[32]) { craft.shoot(); } // spacebar
        craft.draw(context);
        enemy.draw(context);
    }
}

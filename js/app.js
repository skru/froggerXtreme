//LEVEL///////////////////////////////////////////////
/*Level class takes5 arguments. each one an array of arrays*/
var Level = function(allEnemies, rowImages, startPos, allBlocks, allCoins) {
    this.allEnemies = allEnemies[levelCount]; /*levelCount is used to iterate through the arrays */
    this.rowImages = rowImages[levelCount];
    this.startPos = startPos[levelCount];
    this.allBlocks = allBlocks[levelCount];
    this.allCoins = allCoins[levelCount];
    this.boundary = [];
    this.water = [];
    this.exit = [];
    this.paused = false;

    // this iterates through rowImages and creates an array for blocks,
    // water and the exit
    for (row = 0; row < this.rowImages.length; row++) {
        for (var col = 0; col < this.rowImages.length; col++) {
            if (this.rowImages[row][col] === 'images/boundary.png') {
                var arr = [];
                arr.push((col) * 32);
                arr.push((row) * 32);
                this.boundary.push(arr);
            } else if (this.rowImages[row][col] === 'images/water.png') {
                var arr2 = [];
                arr2.push((col) * 32);
                arr2.push((row) * 32);
                this.water.push(arr2);
            } else {
                if (this.rowImages[row][col] === 'images/exit.png') {
                    var arr3 = [];
                    this.exit.push((col) * 32);
                    this.exit.push((row) * 32);
                }
            }
        }
    }
    this.laser = new SoundPool(10);
    this.laser.init("laser");
    this.explosion = new SoundPool(20);
    this.explosion.init("explosion");
    this.hurt = new SoundPool(10);
    this.hurt.init("hurt");
    this.dead = new SoundPool(10);
    this.dead.init("dead");
    this.start = new SoundPool(10);
    this.start.init("start");
};
Level.prototype.scenes = function() {
    if (levelCount === 0) {
        ctx.fillStyle = 'black';
        ctx.fillRect(64, 96, 288, 288);
        ctx.fillStyle = 'red';
        ctx.fillRect(96, 128, 32, 32);
        ctx.fillStyle = 'white';
        ctx.font = '20px Serif';
        ctx.fillText('= LAVA     AVOID', 160, 148);
        ctx.fillStyle = 'blue';
        ctx.fillRect(96, 192, 32, 32);
        ctx.fillStyle = 'white';
        ctx.fillText('= WATER  AVOID', 160, 212);
        ctx.drawImage(Resources.get('images/point.png'), 96, 256);
        ctx.fillStyle = 'white';
        ctx.fillText('= 25 POINTS', 160, 276);
        ctx.drawImage(Resources.get('images/block.png'), 96, 320);
        ctx.fillStyle = 'white';
        ctx.fillText('= USE', 160, 340);
        ctx.fillStyle = 'black';
    } else if (levelCount === 3) {
        ctx.fillStyle = 'black';
        ctx.font = '20px Serif';
        ctx.textAlign = 'center';
        ctx.fillText('more levels and stuff coming soon', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'start';
    }

};

Level.prototype.pause = function() {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 640, 640, 0.8);
        ctx.fillStyle = 'white';
        ctx.font = "30px Sans-Serif";
        ctx.textAlign = 'center';

        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'start';
        ctx.globalAlpha = 1;

    }
    /* re initialises the level object and adds deleted coins back to their array */
Level.prototype.gameover = function() {
    for (var i = 0; i < deleted.length; i++) {
        this.allCoins.push(deleted[i]);
    }
    deleted = [];
    level = new Level(allEnemies, rowImages, startPos, allBlocks, allCoins);
    player.pos[0] = level.startPos[0];
    player.pos[1] = level.startPos[1];
};

/* resets player position and checks if player is totally dead (0 lives) if so calls gameover() */
Level.prototype.loseLife = function() {
    player.pos[0] = level.startPos[0];
    player.pos[1] = level.startPos[1];
    player.lives = player.lives - 1;
    if (player.lives === 0) {
        levelCount = 0;
        level.gameover();
        player.lives = 3;
        player.score = 0;
        level.dead.get();
    } else {
        level.hurt.get();
    }
};

// initialises level with new parameters by setting levelCount+1
Level.prototype.levelEnd = function() {
    for (var i = 0; i < deleted.length; i++) {
        this.allCoins.push(deleted[i]);
    }
    deleted = [];
    level.start.get();
    levelCount += 1;
    level = new Level(allEnemies, rowImages, startPos, allBlocks, allCoins);
    player.pos[0] = level.startPos[0];
    player.pos[1] = level.startPos[1];
    player.score = player.score + 100;

};

//scoreboard
Level.prototype.scoreboard = function() {
    ctx.font = "25px Sans-Serif";
    ctx.fillText(("LIVES: " + player.lives + " SCORE: " +
        player.score + " LEVEL: " + (levelCount + 1)), 0, 20);
};

//BLOCKS/////////////////////////////////////////////
/* Block class. position, speed, horizontal or vertical, forwards/backwards, loop = what coordinate to switch direction */
var Block = function(pos, speed, dir, rev, loop) {
    this.sprite = 'images/block.png';
    this.pos = pos;
    this.size = [32, 32];
    this.speed = speed;
    this.dir = dir;
    this.rev = rev;
    this.loop = loop;
};
/* updates blocks, if they hit their loop, switch direction */
Block.prototype.update = function(dt) {

    if (this.dir === 'horizontal' && this.rev === "f") {
        this.pos[0] += (this.size[0] * (dt * this.speed));
        if (this.pos[0] > this.loop[1]) {
            this.rev = "b";
        }
    } else if (this.dir === 'horizontal' && this.rev === "b") {
        this.pos[0] -= (this.size[0] * (dt * this.speed));
        if (this.pos[0] < this.loop[0]) {
            this.rev = "f";
        }
    } else if (this.dir === 'vertical' && this.rev === "f") {
        this.pos[1] += (this.size[1] * (dt * this.speed));
        if (this.pos[1] > this.loop[1]) {
            this.rev = "b";
        }
    } else if (this.dir === 'vertical' && this.rev === "b") {
        this.pos[1] -= (this.size[1] * (dt * this.speed));
        if (this.pos[1] < this.loop[0]) {
            this.rev = "f";
        }
    }
};
/* rounds a number (i) to the nearest multiple (j) */
function NearestMultiple(i, j) {
        i = Math.round(i);
        return Math.round(i / j) * j;
    }
    /* round x and y the nearest 32, had to do this so my collision detection
    works properly. TODO: implement better collision detection! */
Block.prototype.render = function() {
    var x = Math.round(this.pos[0]);
    x = NearestMultiple(x, 32);
    var y = Math.round(this.pos[1]);
    y = NearestMultiple(y, 32);
    ctx.drawImage(Resources.get(this.sprite), x, y);
};

//ENEMIES/////////////////////////////////////////////
/* same as Block class, need to make an entity class and inherit from there */
var Enemy = function(pos, speed, dir, rev, loop) {
    this.sprite = 'images/enemy2.png';
    this.pos = pos;
    this.size = [32, 32];
    this.speed = speed;
    this.dir = dir;
    this.rev = rev;
    this.loop = loop;
};

Enemy.prototype.update = function(dt) {
    if (this.dir === 'horizontal' && this.rev === "f") {
        this.pos[0] += (this.size[0] * (dt * this.speed));
        if (this.pos[0] > this.loop[1]) {
            this.pos[0] = this.loop[0];
        }
    } else if (this.dir === 'horizontal' && this.rev === "b") {
        this.pos[0] -= (this.size[0] * (dt * this.speed));
        if (this.pos[0] < this.loop[0]) {
            this.pos[0] = this.loop[1];
        }
    } else if (this.dir === 'vertical' && this.rev === "f") {
        this.pos[1] += (this.size[1] * (dt * this.speed));
        if (this.pos[1] > this.loop[1]) {
            this.pos[1] = this.loop[0];
        }
    } else if (this.dir === 'vertical' && this.rev === "b") {
        this.pos[1] -= (this.size[1] * (dt * this.speed));
        if (this.pos[1] < this.loop[0]) {
            this.pos[1] = this.loop[1];
        }
    }
};

Enemy.prototype.render = function() {
    var x = this.pos[0];
    var y = this.pos[1];
    ctx.drawImage(Resources.get(this.sprite), x, y);
};

//PLAYER/////////////////////////////////////////////////
/* Player class, startPos is the starting position on the grid */
var Player = function(startPos, pos, speed, score, lives) {
    this.sprite = 'images/player.png';
    this.pos = pos;
    this.size = [31.9, 31.9];
    this.speed = speed;
    this.onBlock = false;
    this.score = score;
    this.startPos = startPos;
    this.lives = lives;
};

/* checks if player is adjacent to a boundary. If so, pushes the direction
to restrictedList */
var restrictedList = [];

function checkBoundary(pos) {
        for (var boundaryBlock = 0; boundaryBlock < level.boundary.length; boundaryBlock++) {
            if (pos[1] - 32 === level.boundary[boundaryBlock][1] &&
                pos[0] === level.boundary[boundaryBlock][0]) {
                restrictedList.push("up");
            } else if (pos[1] + 32 === level.boundary[boundaryBlock][1] &&
                pos[0] === level.boundary[boundaryBlock][0]) {
                restrictedList.push("down");
            } else if (pos[0] - 32 === level.boundary[boundaryBlock][0] &&
                pos[1] === level.boundary[boundaryBlock][1]) {
                restrictedList.push("left");
            } else if (pos[0] + 32 === level.boundary[boundaryBlock][0] &&
                pos[1] === level.boundary[boundaryBlock][1]) {
                restrictedList.push("right");
            }
            player.onBlock = false;
        }
    }
    /* a simple object that will contain one keydown string at a time */
var keyPress = {
    value: null
};

/* takes keydown value from event listener and sets the variable direction
to a string, checks player boundaries and references restrictesList to see if there is a restriction on moving in that direction (checkBoundary()) */
var pause = {}
Player.prototype.handleInput = function(input) {
    switch (input) {
        case 'space':
            if (pause.value !== 'paused') {
                level.paused = true;
                pause.value = 'paused';
            } else {
                level.paused = false;
                delete pause.value;
                ctx.globalAlpha = 1
            }
            break;
        case 'up':
            var direction = 'up';
            level.laser.get();
            break;
        case 'down':
            direction = 'down';
            level.laser.get();
            break;
        case 'left':
            direction = 'left';
            level.laser.get();
            break;
        case 'right':
            direction = 'right';
            level.laser.get();
            break;
        default:
    }
    restrictedList = [];
    checkBoundary(player.pos);
    if (isNotIn(input)) {
        delete keyPress.value;

    } else {
        keyPress.value = direction;
    }
};

function isNotIn(key) {
    for (i = 0; i < restrictedList.length; i++) {
        if (restrictedList[i] === key) {
            return true;
        }
    }
}

/* updates Player position and deletes the value of keyPress */
Player.prototype.update = function(dt) {
    if (keyPress.value) {
        switch (keyPress.value) {
            case 'up':
                this.pos[1] -= 32;
                break;
            case 'down':
                this.pos[1] += 32;
                break;
            case 'left':
                this.pos[0] -= 32;
                break;
            case 'right':
                this.pos[0] += 32;
                break;
            default:
        }
        delete keyPress.value;
    }
};

Player.prototype.render = function() {
    var x = this.pos[0];
    var y = this.pos[1];
    ctx.drawImage(Resources.get(this.sprite), x, y);
};

document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
$('#square1').click(function(e) {
    e.preventDefault();
    player.handleInput('up');
});
$('#square2').click(function(e) {
    e.preventDefault();
    player.handleInput('right');
});
$('#square3').click(function(e) {
    e.preventDefault();
    player.handleInput('down');
});
$('#square4').click(function(e) {
    e.preventDefault();
    player.handleInput('left');
});


//COINS/////////////////////////////////////////////
var Coin = function(pos) {
    this.sprite = 'images/point.png';
    this.pos = pos;
};

Coin.prototype.render = function() {
    var x = this.pos[0];
    var y = this.pos[1];
    ctx.drawImage(Resources.get(this.sprite), x, y);
};

//COLLISIONS////////////////////////////////////////
/* i modified code from http://jlongster.com/Making-Sprite-based-Games-with-Canvas to help me with this */
function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
        b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
        pos[0] + size[0], pos[1] + size[1],
        pos2[0], pos2[1],
        pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkPlayerBounds() {
        if (player.pos[0] < 0) {
            player.pos[0] = 0;
        } else if (player.pos[0] > 640 - player.size[0]) {
            player.pos[0] = 640 - player.size[0];
        } else if (player.pos[1] < 0) {
            player.pos[1] = 0;
        } else if (player.pos[1] > 640 - player.size[1]) {
            player.pos[1] = 640 - player.size[1];
        }
    }
    /* checks if player position is colliding with the exit, enemies, blocks, coins or water. */
var deleted = [];

function checkCollisions() {
    checkPlayerBounds();
    if (player.pos[0] === level.exit[0] &&
        player.pos[1] === level.exit[1]) {
        level.levelEnd(); // next level
    }
    for (var enemy = 0; enemy < level.allEnemies.length; enemy++) {
        var pos = level.allEnemies[enemy].pos;
        var size = level.allEnemies[enemy].size;
        if (boxCollides(pos, size, player.pos, player.size)) {
            level.loseLife(); // lose life, reset position
        }
    }
    if (level.allBlocks.length > 0) {
        for (var i = 0; i < level.allBlocks.length; i++) {
            var pos1 = level.allBlocks[i].pos;
            var size1 = level.allBlocks[i].size;
            if (boxCollides(pos1, size1, player.pos, player.size)) {
                player.onBlock = true;
                if (level.allBlocks[i].dir === 'horizontal') {
                    var x = player.pos[0];
                    //if on a block, follow its movement
                    player.pos[0] = NearestMultiple(level.allBlocks[i].pos[0], 32);
                    if (player.pos[0] != x) {
                        level.explosion.get();
                        x = player.pos[0];
                    }
                }
                if (level.allBlocks[i].dir === 'vertical') {
                    var y = player.pos[1];
                    player.pos[1] = NearestMultiple(level.allBlocks[i].pos[1], 32);
                    if (player.pos[1] != y) {
                        level.explosion.get();
                        y = player.pos[1];
                    }
                }
            }
        }

        for (var i = 0; i < level.allCoins.length; i++) {
            if (player.pos[0] === level.allCoins[i].pos[0] &&
                player.pos[1] === level.allCoins[i].pos[1]) {
                player.score = player.score + 25; // score
                var coin = level.allCoins.splice(i, 1); //cut coin from array
                deleted.push(coin[0]); /*add coin to deleted array, so can be added back when game over) a workaround, couldn't make it work by passing allCoins into the new level object */
            }
        }
    }

    for (var puddle = 0; puddle < level.water.length; puddle++) {
        if (player.pos[1] === level.water[puddle][1] &&
            player.pos[0] >= level.water[puddle][0] &&
            player.pos[0] - 32 < level.water[puddle][0] &&
            player.onBlock === false) {
            level.loseLife();
        }
    }
}

//INITIALISE//////////////////////////////////////////
//iterator to control levels
var levelCount = 0;

var enemies = [];
var allEnemies = []

function makeEnemies(arr) {
    for (var i = 0; i < arr.length; i++) {
        for (var x = 0; x < arr[i].length; x++) {
            var enemy = arr[i][x];
            //console.log(enemy)
            enemies.push(new Enemy(enemy[0], enemy[1], enemy[2], enemy[3],
                enemy[4], enemy[5]))
        }
        allEnemies.push(enemies)
        enemies = []
    }
}

makeEnemies([
    [
        [
            [128, 160], 3, "vertical", 'f', [160, 288]
        ]
    ],
    [
        [
            [128, 160], 3, "vertical", 'f', [160, 288]
        ],
        [
            [224, 160], 5, "vertical", 'f', [160, 448]
        ],
        [
            [448, 96], 4, "vertical", 'b', [96, 288]
        ],
        [
            [384, 96], 2, "vertical", 'f', [96, 288]
        ],
        [
            [0, 96], 10, "horizontal", 'f', [0, 640]
        ],
        [
            [96, 32], 10, "horizontal", 'f', [0, 640]
        ],
        [
            [320, 640], 10, "horizontal", 'f', [0, 640]
        ],

    ],
    [
        [
            [224, 96], 6, "vertical", 'b', [96, 640]
        ],
        [
            [320, 96], 4, "vertical", 'f', [96, 384]
        ],
        [
            [320, 512], 5, "horizontal", 'b', [320, 544]
        ],
        [
            [0, 32], 5, "horizontal", 'b', [0, 448]
        ],
    ],
    []
]);

var blocks = [];
var allBlocks = []

function makeBlocks(arr) {
    for (var i = 0; i < arr.length; i++) {
        for (var x = 0; x < arr[i].length; x++) {
            var block = arr[i][x];
            blocks.push(new Block(block[0], block[1], block[2], block[3],
                block[4], block[5]))
        }
        allBlocks.push(blocks)
        blocks = []
    }
}

makeBlocks([
    [
        [
            [574, 32], 4, "vertical", "f", [32, 158]
        ]
    ],
    [
        [
            [32, 608], 5, "horizontal", "f", [32, 480]
        ],
        [
            [384, 576], 3, "horizontal", "b", [384, 512]
        ],
        [
            [32, 480], 8, "horizontal", "b", [32, 640]
        ],
        [
            [226, 320], 4, "horizontal", "f", [226, 608]
        ],
        [
            [226, 288], 4, "horizontal", "f", [226, 608]
        ],
        [
            [480, 256], 2, "horizontal", "f", [480, 608]
        ],
        [
            [480, 224], 2, "horizontal", "f", [480, 608]
        ]

    ],
    [
        [
            [96, 576], 9, "horizontal", "f", [96, 512]
        ],
        [
            [96, 544], 9, "horizontal", "f", [96, 512]
        ],
        [
            [96, 512], 9, "horizontal", "f", [96, 512]
        ],
        [
            [96, 480], 9, "horizontal", "f", [96, 512]
        ],
        [
            [96, 448], 9, "horizontal", "f", [96, 512]
        ],
        [
            [96, 416], 9, "horizontal", "f", [96, 512]
        ],
        [
            [96, 384], 9, "horizontal", "f", [96, 512]
        ],
        [
            [96, 352], 9, "horizontal", "f", [96, 512]
        ],
        [
            [0, 192], 4, "vertical", "f", [192, 256]
        ],
        [
            [32, 192], 4, "vertical", "f", [192, 256]
        ],
        [
            [160, 192], 3, "horizontal", "f", [160, 256]
        ],
        [
            [416, 192], 2, "horizontal", "f", [416, 480]
        ],
        [
            [480, 96], 2, "vertical", "f", [96, 160]
        ],
        [
            [480, 64], 2, "vertical", "b", [0, 64]
        ],
    ],
    []
]);

var coins = [];
var allCoins = [];

function makeCoins(arr) {
    for (var i = 0; i < arr.length; i++) {
        for (var x = 0; x < arr[i].length; x++) {
            coins.push(new Coin(arr[i][x]))
        }
        allCoins.push(coins)
        coins = []
    }
}

makeCoins([
    [
        [96, 576],
        [128, 576],
        [160, 576],
        [192, 576],
        [224, 576],
        [256, 576],
        [288, 576],
        [320, 576],
        [352, 576],
        [384, 576],
        [416, 576],
        [448, 576],
        [480, 576],
        [512, 576],
        [544, 576],
        [576, 576],
        [576, 544],
        [576, 512],
        [576, 480],
        [576, 448],
        [576, 416],
        [576, 384],
        [576, 352],
        [576, 320],
        [576, 288],
        [576, 256],
        [576, 224],
        [576, 192],
        [576, 160],
    ],
    [
        [576, 544],
        [544, 544],
        [608, 544],
        [512, 576],
        [480, 576],
        [416, 576],
        [384, 576],
        [64, 576],
        [64, 544],
        [64, 512],
        [512, 448],
        [512, 416],
        [512, 384],
        [480, 384],
        [128, 416],
        [128, 384],
        [128, 352],
        [96, 352],
        [64, 352],
        [64, 224],
        [96, 224],
        [128, 224],
        [160, 224],
        [192, 224],
        [448, 576],
        [224, 224],
        [256, 224],
        [288, 224],
        [320, 224],
        [320, 256],
        [320, 320],
        [352, 320],
        [384, 320],
        [416, 320],
        [448, 320],
        [480, 320],
        [512, 320],
        [544, 320],
        [544, 288],
        [352, 160],
        [320, 160],
        [288, 160],
        [352, 128],
        [320, 128],
        [288, 128],
        [32, 32],
        [64, 32],
        [96, 32],
        [128, 32],
        [160, 32],
        [192, 32],
        [224, 32],
        [256, 32],
        [288, 32],
        [320, 32],
        [320, 64],
        [352, 64],
        [384, 64],
        [416, 64],
        [448, 64],
        [480, 64],
        [512, 96],
        [544, 96],
        [576, 64],
        [576, 32]
    ],
    [
        [32, 32],
        [64, 32],
        [96, 32],
        [128, 32],
        [160, 32],
        [256, 32],
        [288, 32],
        [320, 32],
        [352, 32],
        [384, 32],
        [416, 32],
        [544, 32],
        [608, 32],
        [608, 192],
        [544, 192],
        [416, 192],
        [256, 192],
        [160, 192],
        [0, 192],
        [32, 192],
        [128, 384],
        [160, 384],
        [192, 384],
        [224, 384],
        [256, 384],
        [288, 384],
        [320, 384],
        [352, 384],
        [384, 384],
        [416, 384],
        [448, 384],
        [480, 384],
        [128, 416],
        [160, 416],
        [192, 416],
        [224, 416],
        [256, 416],
        [288, 416],
        [320, 416],
        [352, 416],
        [384, 416],
        [416, 416],
        [448, 416],
        [480, 416],
        [128, 448],
        [160, 448],
        [192, 448],
        [224, 448],
        [256, 448],
        [288, 448],
        [320, 448],
        [352, 448],
        [384, 448],
        [416, 448],
        [448, 448],
        [480, 448],
        [128, 480],
        [160, 480],
        [192, 480],
        [224, 480],
        [256, 480],
        [288, 480],
        [320, 480],
        [352, 480],
        [384, 480],
        [416, 480],
        [448, 480],
        [480, 480],



    ],
    []
]);

/*an array of arrays of arrays(?) that is used to make up the background,
water, boundaries and exit. */
var b = 'images/boundary.png';
var X = 'images/white.png';
var e = 'images/exit.png';
var w = 'images/water.png';
var R = 'images/enemy2.png';
var G = 'images/goodtext.png';
var B = 'images/badtext.png';
var rowImages = [
    [
        [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, w, e, w],
        [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, b, w, X, w],
        [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, b, w, X, w],
        [w, w, b, b, b, b, b, b, b, b, b, w, w, w, w, w, b, w, w, w],
        [w, w, b, w, w, w, w, w, w, w, b, w, w, w, w, w, b, w, w, w],
        [w, w, b, w, w, w, w, w, w, w, b, w, w, w, w, w, b, X, X, X],
        [w, w, b, w, w, w, w, w, w, w, b, w, w, w, w, w, b, X, X, X],
        [w, w, b, w, w, w, w, w, w, w, b, w, w, w, w, w, b, X, X, X],
        [w, w, b, w, w, w, w, w, w, w, b, w, w, w, w, w, b, X, X, X],
        [w, w, b, w, w, w, w, w, w, w, b, w, w, w, w, w, b, X, X, X],
        [w, w, b, w, w, w, w, w, w, w, b, w, w, w, w, w, b, X, X, X],
        [w, w, b, b, b, b, b, b, b, b, b, w, w, w, w, w, b, X, X, X],
        [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, b, X, X, X],
        [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, b, X, X, X],
        [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, b, X, X, X],
        [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, b, X, X, X],
        [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X]
    ],
    [
        [b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b, X, e, X],
        [w, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [w, X, X, X, X, w, w, w, w, X, X, X, X, X, X, X, X, X, X, X],
        [w, X, X, X, w, w, w, w, w, w, w, w, w, w, w, X, X, X, X, w],
        [w, X, X, X, X, X, X, X, X, X, X, X, w, w, w, w, w, w, w, w],
        [w, X, X, X, w, w, w, w, w, X, X, X, X, X, X, X, X, X, X, w],
        [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X, X, w],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, w, w, w, w, w, w, w],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, w, w, w, w, w, w, w],
        [X, X, X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w],
        [X, X, X, w, b, b, b, w, w, w, w, w, w, w, w, w, w, w, w, w],
        [X, X, X, X, X, X, X, w, w, w, w, w, w, w, w, w, w, w, w, w],
        [w, w, w, w, X, X, X, w, X, X, X, X, X, X, X, X, X, X, X, w],
        [w, w, w, w, X, X, X, X, X, X, X, w, w, X, X, X, X, X, X, w],
        [b, b, b, b, b, b, b, w, b, b, b, w, w, w, w, X, X, X, w, w],
        [b, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w],
        [b, X, X, X, w, b, b, b, b, b, b, b, b, b, b, b, b, b, b, b],
        [X, X, X, X, X, X, X, w, w, w, w, w, w, w, w, w, b, X, X, X],
        [X, X, X, X, X, X, X, X, w, w, X, X, X, w, w, w, X, X, X, X],
        [b, X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, b, X, X, X]
    ],
    [
        [b, b, b, b, b, b, b, b, b, b, b, b, b, b, w, w, X, X, w, e],
        [w, X, X, X, X, X, w, w, X, X, X, X, X, X, w, w, w, X, w, X],
        [X, X, w, w, w, X, w, w, X, w, w, w, w, X, w, w, w, X, w, X],
        [X, X, w, w, w, X, w, w, X, w, w, w, w, X, w, w, w, X, w, X],
        [X, X, w, w, w, X, w, w, X, w, w, w, w, X, w, w, w, X, w, X],
        [X, X, w, w, w, X, w, w, X, w, w, w, w, X, w, w, w, X, w, X],
        [X, X, w, w, w, X, w, w, X, w, w, w, w, X, w, w, w, X, X, X],
        [w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X, X, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X, w, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X, w, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X],
        [X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X],
        [X, X, X, X, X, w, w, w, w, w, w, w, w, w, w, w, w, w, X, X]
    ],
    [
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X]
    ],

];


//player start positions in an array
var startPos = [
    [32, 576],
    [576, 576],
    [576, 576],
    [32.32]
];
var level = new Level(allEnemies, rowImages, startPos, allBlocks, allCoins);
/*player(startPosition,position,speed,score,lives).
note: have to start with 4 lives instaed of 3 because of a bug where gameover() is being called at the beginning of the game */

var player = new Player([], [], 5, 0, 4);



/* i modified this code from: http://blog.sklambert.com/html5-canvas-game-html5-audio-and-finishing-touches/ */
/**
 * A sound pool to use for the sound effects
 */
function SoundPool(maxSize) {
    var size = maxSize; // Max sounds allowed in the pool
    var pool = [];
    this.pool = pool;
    var currSound = 0;
    /*
     * Populates the pool array with the given sound
     */
    this.init = function(object) {
        if (object == "laser") {
            for (var i = 0; i < size; i++) {
                // Initalize the sound
                laser = new Audio('sounds/laser.wav');
                laser.volume = .12;
                laser.load();
                pool[i] = laser;
            }
        } else if (object == "explosion") {
            for (var i = 0; i < size; i++) {
                var explosion = new Audio("");
                explosion.volume = .1
                explosion.load();
                pool[i] = explosion;
            }
        } else if (object == "hurt") {
            for (var i = 0; i < size; i++) {
                var hurt = new Audio("sounds/hurt.wav");
                hurt.volume = .1
                hurt.load()
                pool[i] = hurt
            }
        } else if (object == "dead") {
            for (var i = 0; i < size; i++) {
                var dead = new Audio("sounds/dead.wav");
                dead.volume = .1;
                dead.load();
                pool[i] = dead;
            }
        } else if (object == "start") {
            for (var i = 0; i < size; i++) {
                // Initalize the sound
                var start = new Audio("sounds/start.wav");
                start.volume = .12;
                start.load();
                pool[i] = start;
            }
        }
    };
    /*
     * Plays a sound
     */
    this.get = function() {
        if (pool[currSound].currentTime == 0 || pool[currSound].ended) {
            pool[currSound].play();
        }
        currSound = (currSound + 1) % size;
    };
}
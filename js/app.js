//LEVEL///////////////////////////////////////////////
var Level = function(allEnemies, rowImages, startPos, allBlocks, allCoins) {
    this.allEnemies = allEnemies[levelCount];
    this.rowImages = rowImages[levelCount];
    this.startPos = startPos[levelCount];
    this.allBlocks = allBlocks[levelCount];
    this.allCoins = allCoins[levelCount];
    this.blocks = [];
    this.water = [];
    this.exit = [];
    for (row = 0; row < this.rowImages.length; row++) {
        for (var col = 0; col < this.rowImages.length; col++) {
            if (this.rowImages[row][col] === 'images/boundary.png') {
                var arr = [];
                arr.push((col) * 32);
                arr.push((row) * 32);
                this.blocks.push(arr);
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

Level.prototype.gameover = function() {
    for (var i = 0; i < deleted.length; i++) {
        this.allCoins.push(deleted[i]);
    }
    deleted = [];
    level = new Level(allEnemies, rowImages, startPos, allBlocks, allCoins);

};

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

Level.prototype.levelEnd = function() {
    level.start.get();
    levelCount += 1;
    level = new Level(allEnemies, rowImages, startPos, allBlocks, allCoins);
    player.pos[0] = level.startPos[0];
    player.pos[1] = level.startPos[1];
    player.score = player.score + 100;
    alert("More levels coming soon!!");
};

Level.prototype.scoreboard = function() {
    ctx.font = "30px serif";
    ctx.fillText(("LIVES: " + player.lives + " SCORE: " +
        player.score + " LEVEL: " + (levelCount + 1)), 2, 26);
};

//BLOCKS/////////////////////////////////////////////
var Block = function(pos, speed, dir, rev, loop) {
    this.sprite = 'images/block.png';
    this.pos = pos;
    this.size = [32, 32];
    this.speed = speed;
    this.dir = dir;
    this.rev = rev;
    this.loop = loop;
};

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

function NearestMultiple(i, j) {
    i = Math.round(i);
    return Math.round(i / j) * j;
}

Block.prototype.render = function() {
    var x = Math.round(this.pos[0]);
    x = NearestMultiple(x, 32);
    var y = Math.round(this.pos[1]);
    y = NearestMultiple(y, 32);
    ctx.drawImage(Resources.get(this.sprite), x, y);
};

//ENEMIES/////////////////////////////////////////////
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
var restrictedList = [];

function isNotIn(key) {
    for (i = 0; i < restrictedList.length; i++) {
        if (restrictedList[i] === key) {
            return true;
        }
    }
}

var keyPress = {
    value: null
};
Player.prototype.handleInput = function(input) {
    switch (input) {
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
    checkBlocks(player.pos);
    if (isNotIn(input)) {
        delete keyPress.value;

    } else {
        keyPress.value = direction;
    }
};

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
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
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

function checkBlocks(pos) {
    for (var block = 0; block < level.blocks.length; block++) {
        if (pos[1] - 32 === level.blocks[block][1] &&
            pos[0] === level.blocks[block][0]) {
            restrictedList.push("up");
        } else if (pos[1] + 32 === level.blocks[block][1] &&
            pos[0] === level.blocks[block][0]) {
            restrictedList.push("down");
        } else if (pos[0] - 32 === level.blocks[block][0] &&
            pos[1] === level.blocks[block][1]) {
            restrictedList.push("left");
        } else if (pos[0] + 32 === level.blocks[block][0] &&
            pos[1] === level.blocks[block][1]) {
            restrictedList.push("right");
        }
        player.onBlock = false;
    }
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

var deleted = [];

function checkCollisions() {
    checkPlayerBounds();
    if (player.pos[0] === level.exit[0] &&
        player.pos[1] === level.exit[1]) {
        level.levelEnd();
    }
    for (var enemy = 0; enemy < level.allEnemies.length; enemy++) {
        var pos = level.allEnemies[enemy].pos;
        var size = level.allEnemies[enemy].size;
        if (boxCollides(pos, size, player.pos, player.size)) {
            level.loseLife();
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
                player.score = player.score + 20;
                var coin = level.allCoins.splice(i, 1);
                deleted.push(coin[0]);
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
var levelCount = 0;
var block1 = new Block([32, 608], 5, "horizontal", "f", [32, 480]);
var block2 = new Block([384, 576], 3, "horizontal", "b", [384, 512]);
var block3 = new Block([32, 480], 8, "horizontal", "b", [32, 640]);
var block4 = new Block([226, 320], 4, "horizontal", "f", [226, 608]);
var block5 = new Block([226, 288], 4, "horizontal", "f", [226, 608]);
var block6 = new Block([480, 256], 2, "horizontal", "f", [480, 608]);
var block7 = new Block([480, 224], 2, "horizontal", "f", [480, 608]);
var enemy1_1 = new Enemy([608, 480], 7, "horizontal");
var enemy1_2 = new Enemy([0, 384], 5, "horizontal", 'b', [0, 228]);
var enemy1_3 = new Enemy([128, 160], 3, "vertical", 'f', [160, 288]);
var enemy1_4 = new Enemy([224, 160], 5, "vertical", 'f', [160, 448]);
var enemy1_5 = new Enemy([256, 288], 7, "horizontal");
var enemy1_6 = new Enemy([448, 288], 7, "horizontal");
var enemy1_7 = new Enemy([256, 320], 7, "horizontal");
var enemy1_8 = new Enemy([608, 320], 7, "horizontal");
var enemy1_9 = new Enemy([608, 224], 7, "horizontal");
var enemy1_10 = new Enemy([480, 224], 7, "horizontal");
var enemy1_11 = new Enemy([448, 96], 4, "vertical", 'b', [96, 288]);
var enemy1_12 = new Enemy([384, 96], 2, "vertical", 'f', [96, 288]);
var enemy1_13 = new Enemy([0, 96], 10, "horizontal", 'f', [0, 640]);
var enemy1_14 = new Enemy([96, 32], 10, "horizontal", 'f', [0, 640]);
var enemy1_15 = new Enemy([320, 64], 10, "horizontal", 'f', [0, 640]);
var coins = []
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
    []
]);
var allBlocks = [
    [block1, block2, block3, block4, block5,
        block6, block7
    ],
    []
];
var allEnemies = [
    [enemy1_1, enemy1_9, enemy1_2, enemy1_3,
        enemy1_4, enemy1_5, enemy1_6, enemy1_7,
        enemy1_8, enemy1_10, enemy1_11, enemy1_12,
        enemy1_13, enemy1_14, enemy1_15
    ],
    []
];
var b = 'images/boundary.png';
var X = 'images/white.png';
var e = 'images/exit.png';
var w = 'images/water.png';
var rowImages = [
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
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, e, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, w, w, w, X, X, X, X],
        [X, X, X, X, w, w, w, X, X, X, X, X, X, w, w, w, X, X, X, X],
        [X, X, X, X, w, w, w, X, X, X, X, X, X, w, w, w, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, w, w, w, w, w, w, w, w, w, w, w, w, X, X, X, X],
        [X, X, X, X, X, w, w, w, w, w, w, w, w, w, w, X, X, X, X, X],
        [X, X, X, X, X, X, w, w, w, w, w, w, w, w, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, w, w, w, w, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
        [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X]
    ]
];
var startPos = [
    [576, 576],
    [32, 32]
];
var level = new Level(allEnemies, rowImages, startPos, allBlocks, allCoins);
var player = new Player([], [], 5, 0, 4);
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
                laser = new Audio("sounds/laser.wav");
                laser.volume = .12;
                laser.load();
                pool[i] = laser;
            }
        } else if (object == "explosion") {
            for (var i = 0; i < size; i++) {
                var explosion = new Audio("sounds/explosion.wav");
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
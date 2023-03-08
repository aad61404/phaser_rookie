var config = {
    type: Phaser.AUTO,//渲染器
    width: 800,//畫面尺寸
    height: 600,
    physics: { //後續再講
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: { // 默認的場景
        preload: preload,
        create: create,
        update: update
    }
};

// 後面要使用的全局變量
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload (){
    this.load.image('sky', './assets/image/sky.png');
    this.load.image('ground', './assets/image/platform.png');
    this.load.image('star', './assets/image/star.png');
    this.load.image('bomb', './assets/image/bomb.png');
    this.load.spritesheet('dude', './assets/image/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create (){
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  平台組包括地面和兩個我們可以跳上去的平台
    platforms = this.physics.add.staticGroup();

    //  這裡我們創建地面。
    //縮放它以適應遊戲的寬度(原始精靈的大小是400x32)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  現在讓我們創建一些壁架
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
//    platforms.create(200, 100, 'ground');//橫縱

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  收集一些恆星，總共12顆，沿著x軸平均間隔70個像素
    stars = this.physics.add.group({
        key: 'star',//圖片關鍵字
        repeat: 11,//自動創建一個子元素，再重複11次，這樣遊戲中就一共有了12個元素
        setXY: { x: 12, y: 0, stepX: 70 }//第一個子元素定位在(12,0)，後面的每個在x方向上間隔70
    });

    stars.children.iterate(function (child) {

        //  給每顆星星一個稍微不同的彈跳
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update (){
    if (gameOver){
        return;
    }

    if (cursors.left.isDown){
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectStar (player, star){
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb){
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
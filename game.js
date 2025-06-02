const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const effectDisplay = document.getElementById('effectDisplay');
const gameClearElement = document.getElementById('gameClear');
const clearScoreElement = document.getElementById('clearScore');
const restartButton = document.getElementById('restartButton');

// ゲーム状態
let gameRunning = true;
let score = 0;
let lives = 3;
let keys = {};
let currentBossIndex = 0;
let boss = null;

// ボス画像の読み込み
const bossImages = [];
const bossImagePaths = ['images/enemy1.jpg', 'images/enemy2.jpg'];

bossImagePaths.forEach((path, index) => {
    const img = new Image();
    img.src = path;
    img.onload = function() {
        console.log(`Boss image ${index + 1} loaded`);
    };
    bossImages.push(img);
});

// プレイヤー画像の読み込み
const playerImage = new Image();
playerImage.src = 'images/mikata.jpg';
playerImage.onload = function() {
    console.log('Player image loaded');
};

// プレイヤー
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 5,
    color: '#00ff00',
    shootCooldown: 0,
    shootSpeed: 5, // 連射速度（小さいほど速い）
    bulletPower: 10, // 弾の威力
    invincible: false, // 無敵状態
    invincibleTime: 0, // 無敵時間のカウンター
    maxInvincibleTime: 120 // 無敵時間（2秒 = 60fps × 2）
};

// 弾のリスト
let bullets = [];
let enemyBullets = [];

// 敵のリスト（ボスシステムに変更するため使用しない）
let enemies = [];

// パワーアップアイテムのリスト
let powerUps = [];

// エフェクトメッセージのリスト
let effectMessages = [];

// 星の背景
let stars = [];
for (let i = 0; i < 50; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 0.5
    });
}

// キー入力の処理
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// プレイヤーの更新
function updatePlayer() {
    // 無敵時間の更新
    if (player.invincible && player.invincibleTime > 0) {
        player.invincibleTime--;
        if (player.invincibleTime <= 0) {
            player.invincible = false;
        }
    }

    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // スペースキーで弾を発射（連射）
    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }
    
    if (keys[' '] && player.shootCooldown <= 0) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 10,
            color: '#ffff00'
        });
        player.shootCooldown = player.shootSpeed; // 連射速度
    }
}

// 弾の更新
function updateBullets() {
    // プレイヤーの弾
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > -bullet.height;
    });

    // 敵の弾
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        if (bullet.directionX) {
            bullet.x += bullet.directionX * bullet.speed;
        }
        return bullet.y < canvas.height && bullet.x > -bullet.width && bullet.x < canvas.width;
    });
}

// ボスの生成
function spawnBoss() {
    if (!boss && currentBossIndex < bossImages.length) {
        boss = {
            x: canvas.width / 2 - 40,
            y: 50,
            width: 80,
            height: 80,
            maxHealth: 100 + (currentBossIndex * 100), // 体力増加
            health: 100 + (currentBossIndex * 100),
            speed: 1 + (currentBossIndex * 0.5), // 移動速度増加
            moveDirection: 1,
            shootCooldown: 0,
            shootInterval: 60 - (currentBossIndex * 10), // 攻撃速度増加
            imageIndex: currentBossIndex
        };
    }
}

// ボスの更新
function updateBoss() {
    if (!boss) return;

    // 左右移動
    boss.x += boss.speed * boss.moveDirection;
    if (boss.x <= 0 || boss.x >= canvas.width - boss.width) {
        boss.moveDirection *= -1;
    }

    // ボスの弾発射
    boss.shootCooldown--;
    if (boss.shootCooldown <= 0) {
        // 3方向に弾を発射
        for (let i = -1; i <= 1; i++) {
            enemyBullets.push({
                x: boss.x + boss.width / 2 - 2,
                y: boss.y + boss.height,
                width: 6,
                height: 12,
                speed: 3,
                directionX: i * 0.5,
                color: '#ff00ff'
            });
        }
        boss.shootCooldown = boss.shootInterval || 60;
    }
}

// 当たり判定
function checkCollisions() {
    // プレイヤーの弾とボス
    if (boss) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (bullet.x < boss.x + boss.width &&
                bullet.x + bullet.width > boss.x &&
                bullet.y < boss.y + boss.height &&
                bullet.y + bullet.height > boss.y) {
                bullets.splice(i, 1);
                boss.health -= player.bulletPower;
                score += 10;

                // ボスを倒した
                if (boss.health <= 0) {
                    score += 1000 * (currentBossIndex + 1);
                    const dropX = boss.x + boss.width / 2;
                    const dropY = boss.y + boss.height / 2;
                    boss = null;
                    enemyBullets = []; // ボスの弾を全て削除
                    
                    // パワーアップアイテムをドロップ
                    spawnPowerUp(dropX, dropY);
                    
                    currentBossIndex++;
                    
                    // 全ボスを倒した
                    if (currentBossIndex >= bossImages.length) {
                        gameWin();
                    }
                    break; // ループを抜ける
                }
            }
        }
    }

    // 敵の弾とプレイヤー
    if (!player.invincible) {
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const bullet = enemyBullets[i];
            if (bullet.x < player.x + player.width &&
                bullet.x + bullet.width > player.x &&
                bullet.y < player.y + player.height &&
                bullet.y + bullet.height > player.y) {
                enemyBullets.splice(i, 1);
                takeDamage();
            }
        }
    }

    // ボスとプレイヤー
    if (boss && !player.invincible) {
        if (boss.x < player.x + player.width &&
            boss.x + boss.width > player.x &&
            boss.y < player.y + player.height &&
            boss.y + boss.height > player.y) {
            takeDamage();
        }
    }
}

// ダメージを受けた時の処理
function takeDamage() {
    lives--;
    player.invincible = true;
    player.invincibleTime = player.maxInvincibleTime;
    
    if (lives <= 0) {
        gameOver();
    }
}

// ゲームクリア
function gameWin() {
    gameRunning = false;
    clearScoreElement.textContent = score;
    gameClearElement.style.display = 'block';
}

// パワーアップアイテムの生成
function spawnPowerUp(x, y) {
    const types = ['speed', 'power', 'life'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUps.push({
        x: x - 15,
        y: y - 15,
        width: 30,
        height: 30,
        type: type,
        speed: 2,
        color: type === 'speed' ? '#00ffff' : type === 'power' ? '#ff00ff' : '#00ff00'
    });
}

// エフェクトメッセージを表示
function showEffectMessage(message, color) {
    effectMessages.push({
        text: message,
        x: canvas.width / 2,
        y: canvas.height / 2 - 50,
        opacity: 1,
        color: color
    });
}

// パワーアップアイテムの更新
function updatePowerUps() {
    powerUps = powerUps.filter(powerUp => {
        powerUp.y += powerUp.speed;
        
        // プレイヤーとの当たり判定
        if (powerUp.x < player.x + player.width &&
            powerUp.x + powerUp.width > player.x &&
            powerUp.y < player.y + player.height &&
            powerUp.y + powerUp.height > player.y) {
            
            // パワーアップ効果
            let message = '';
            let color = powerUp.color;
            
            switch(powerUp.type) {
                case 'speed':
                    player.shootSpeed = Math.max(2, player.shootSpeed - 1); // 連射速度アップ
                    message = '連射速度UP!';
                    break;
                case 'power':
                    player.bulletPower += 5; // 威力アップ
                    message = '攻撃力UP! +5';
                    break;
                case 'life':
                    lives = Math.min(5, lives + 1); // ライフ回復
                    message = 'ライフ回復!';
                    break;
            }
            
            showEffectMessage(message, color);
            score += 50;
            return false;
        }
        
        return powerUp.y < canvas.height;
    });
}

// エフェクトメッセージの更新
function updateEffectMessages() {
    effectMessages = effectMessages.filter(msg => {
        msg.opacity -= 0.02;
        msg.y -= 1;
        return msg.opacity > 0;
    });
}

// 背景の星を更新
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// 描画
function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 星を描画
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, 2, 2);
    });

    // プレイヤーを描画
    if (player.invincible) {
        // 無敵時間中は点滅エフェクト
        const blinkRate = 6; // 点滅速度
        const shouldDraw = Math.floor(player.invincibleTime / blinkRate) % 2 === 0;
        
        if (shouldDraw) {
            ctx.save();
            // 赤い半透明のオーバーレイ
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
            ctx.restore();
            
            if (playerImage.complete) {
                ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
            } else {
                ctx.fillStyle = player.color;
                ctx.fillRect(player.x, player.y, player.width, player.height);
            }
        }
    } else {
        // 通常時の描画
        if (playerImage.complete) {
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
    }

    // 弾を描画
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // 敵の弾を描画
    enemyBullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // ボスを描画
    if (boss) {
        if (bossImages[boss.imageIndex].complete) {
            ctx.drawImage(bossImages[boss.imageIndex], boss.x, boss.y, boss.width, boss.height);
        } else {
            // 画像が読み込まれていない場合は四角形で表示
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        }

        // ボスの体力バー
        const barWidth = 200;
        const barHeight = 10;
        const barX = (canvas.width - barWidth) / 2;
        const barY = 20;
        
        // 背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 体力
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, (boss.health / boss.maxHealth) * barWidth, barHeight);
        
        // 枠
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    // パワーアップアイテムを描画
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        
        // アイテムの種類を表示
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            powerUp.type === 'speed' ? 'S' : powerUp.type === 'power' ? 'P' : 'L',
            powerUp.x + powerUp.width / 2,
            powerUp.y + powerUp.height / 2 + 5
        );
    });

    // エフェクトメッセージを描画
    effectMessages.forEach(msg => {
        ctx.save();
        ctx.globalAlpha = msg.opacity;
        ctx.fillStyle = msg.color;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(msg.text, msg.x, msg.y);
        
        // 縁取り
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(msg.text, msg.x, msg.y);
        ctx.restore();
    });

    // スコアと残機を更新
    scoreElement.textContent = score;
    livesElement.textContent = lives;
}

// ゲームオーバー
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// ゲームリスタート
function restartGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - 80;
    player.shootSpeed = 5;
    player.bulletPower = 10;
    player.invincible = false;
    player.invincibleTime = 0;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    boss = null;
    currentBossIndex = 0;
    powerUps = [];
    effectMessages = [];
    gameOverElement.style.display = 'none';
    gameClearElement.style.display = 'none';
    gameLoop();
}

startButton.addEventListener('click', restartGame);
restartButton.addEventListener('click', restartGame);

// ゲームループ
function gameLoop() {
    if (!gameRunning) return;

    updateStars();
    updatePlayer();
    updateBullets();
    spawnBoss();
    updateBoss();
    updatePowerUps();
    updateEffectMessages();
    checkCollisions();
    draw();

    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();
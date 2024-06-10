class player{
    constructor(game){
        this.game = game;
        this.width = 140;
        this.height = 120;
        this.x = this.game.width * 0.5 - this.width *0.5;
        this.y = this.game.height - this.height;
        this.speed = 5;
        this.lives = 3;
        this.image = document.getElementById('player');
        this.frameX = 0;
        this.jets_image = document.getElementById('playerjets');
        this.jetsFrame = 1;
    }
    draw(context){
        //context.fillRect(this.x, this.y, this.width, this.height);
        if(this.game.keys.indexOf('1')>-1){
            this.frameX = 1;
            }
            else{
                this.frameX = 0;
            }
            context.drawImage(this.jets_image,this.jetsFrame * this.width,0,this.width,this.height ,this.x, this.y, this.width, this.height);

            context.drawImage(this.image,this.frameX * this.width,0,this.width,this.height ,this.x, this.y, this.width, this.height);
    }
    update(){
        if(this.game.keys.indexOf('ArrowLeft') > -1) {
            this.x -= this.speed;
            this.jetsFrame = 0;

        }
        else if(this.game.keys.indexOf('ArrowRight') > -1){ 
            this.x += this.speed;
            this.jetsFrame = 2;
        }else{
            this.jetsFrame = 1;
        }


        //horizontal boundaries
        if (this.x < -this.width*0.5) this.x = -this.width*0.5;
        else if(this.x> this.game.width - this.width *0.5) this.x =this.game.width - this.width*0.5;
        
    }
    shoot(){
        const projectile = this.game.getProjectile();
        if(projectile) projectile.start(this.x + this.width *0.5, this.y);
    }
    restart(){

        this.x = this.game.width * 0.5 - this.width *0.5;
        this.y = this.game.height - this.height;
        this.lives = 3;
    }

}
class projectile{
    constructor(){
        this.width = 3;
        this.height = 40;
        this.x = 0;
        this.y = 0;
        this.speed = 15;
        this.free = true;
    }
    draw(context){
        if(!this.free){
            context.save();
            context.fillStyle='gold';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.restore();
        }
    }
    update(){
        if(!this.free){
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    update(){
        if(!this.free){
            this.y -= this.speed;
            if(this.y < -this.height) this.reset();

        }
    }
    start(x,y){
        this.x = x - this.width *0.5;
        this.y = y;
        this.free = false;
    }
    reset(){
        this.free = true;
    }

}
class enemy{
    constructor(game , positionX, positionY){
        this.game = game;
        this.width = this.game.enemySize;
        this.height = this.game.enemySize;
        this.x = 0;
        this.y = 0;
        this.positionX = positionX;
        this.positionY = positionY;
        this.markedForDeletion = false;
    }
    draw(context){
        //context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.frameX*this.width, this.frameY* this.height,this.width, this.height, this.x, this.y, this.width, this.height);
    }
    update(x,y){
        this.x = x + this.positionX;
        this.y = y + this.positionY;
        // check collision
        this.game.projectilesPool.forEach( projectile =>{
            if(!projectile.free && this.game.checkCollision(this,projectile) && this.lives> 0){
                //this.markedForDeletion = true;
                this.hit(1);
                projectile.reset();
                //if(!this.game.gameOver) this.game.score++;
        }
        });

        if (this.lives < 1){
            if(this.game.spriteUpdate) this.frameX++;
            if(this.frameX > this.maxFrame){
                this.markedForDeletion = true;
                if(!this.game.gameOver) this.game.score+= this.maxLives;
            }
        }

        // check collision enemies - player

        if(this.game.checkCollision(this, this.game.player)&& this.lives>0){
            this.lives=0;
           //this.markedForDeletion = true;
           if(!this.game.gameover && this.game.score > 0){
            this.game.score--;
            this.game.player.lives--;}
            if(this.game.player.lives <1) this.game.gameOver = true;
        }
        
        // lose condition

        if(this.y + this.height > this.game.height){
            this.game.gameOver = true;
            this.markedForDeletion = true;
        }

    }
    hit(damage){
        this.lives -= damage;
    }
}

class SS_lvl1 extends enemy{
    constructor(game, positionX, positionY){
        super(game, positionX, positionY);
        this.image = document.getElementById("ss_lvl1");
        this.frameX = 0;
        this.maxFrame = 2;
        this.frameY = Math.floor(Math.random()*4);
        this.lives =2; //deciedes beetle lives
        this.maxLives = this.lives;
    }
}


class wave{
    constructor(game){
        this.game = game;
        this.width = this.game.columns * this.game.enemySize;
        this.height = this.game.rows * this.game.enemySize;
        this.x = this.game.width *0.5 - this.width*0.5;;
        this.y = -this.height;
        this.speedX = Math.random()< 0.5 ? -1:1;
        this.speedY = 0;
        this.enemies = [];
        this.nextWaveTrigger = false;
        this.create();
    }
    render(context){
        if(this.y < 0) this.y += 5;
        this.speedY = 0;
        //context.strokeRect(this.x, this.y, this.width, this.height);
        if(this.x<0 || this.x > this.game.width - this.width){
            this.speedX *= -1;
            this.speedY = this.game.enemySize;
        }
        this.x += this.speedX;
        this.y += this.speedY;
        this.enemies.forEach(enemy =>{
            enemy.update(this.x, this.y);
            enemy.draw(context);
        });
        this.enemies = this.enemies.filter(Object => !Object.markedForDeletion);
        

    }
    create(){
        for (let y = 0; y < this.game.rows; y++) {
            for(let x=0; x<this.game.columns; x++){
                let enemyX = x * this.game.enemySize;
                let enemyY = y * this.game.enemySize;
                this.enemies.push(new SS_lvl1(this.game, enemyX, enemyY));
            }

        }
    }

}

class Game{
    constructor(canvas){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.keys = [];
        this.player = new player(this);

        this.projectilesPool = [];
        this.numberOfProjectiles = 10;
        this.createProjectiles();
        //console.log(this.projectilesPool);
        this.fired = false;

        this.columns = 2;
        this.rows = 2;
        this.enemySize = 80;

        this.wave =[];
        this.wave.push(new wave(this));
        this.waveCount = 1;

        this.spriteUpdate = false;
        this.spriteTimer = 0;
        this.spriteInterval = 100;

        this.score = 0;
        this.gameOver = false;

        window.addEventListener('keydown', e => {
            if(e.key === '1' && !this.fired) this.player.shoot();
            this.fired = true;

            if(this.keys.indexOf(e.key)=== -1) this.keys.push(e.key);
            
            if((e.key === 'r'||e.key === 'R' ) && this.gameOver) this.restart();
            
    });

        window.addEventListener('keyup', e => {
            this.fired = false;
            const index = this.keys.indexOf(e.key);
            if(index> -1) this.keys.splice(index, 1);
            
    });

    
}
    render(context, deltaTime){
        if(this.spriteTimer> this.spriteInterval){
            this.spriteUpdate = true;
            this.spriteTimer = 0;
        }else{
            this.spriteUpdate = false;
            this.spriteTimer += deltaTime;
        }
        this.drawStatusText(context);
        this.projectilesPool.forEach(projectile => {
            projectile.update();
            projectile.draw(context);
        });
        this.player.draw(context);
        this.player.update();
        //this.projectilesPool.forEach(projectile => {
          //  projectile.update();
            //projectile.draw(context);
        //});
        this.wave.forEach(wave => {
            wave.render(context);
            if(wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver){
                this.newWave();
                this.waveCount++;
                wave.nextWaveTrigger = true;
                this.player.lives++;
            }
        });
    }

    createProjectiles(){
        for(let i=0; i<this.numberOfProjectiles; i++){
            this.projectilesPool.push(new projectile());
        }    
    }

    getProjectile(){
        for(let i=0; i<this.projectilesPool.length; i++){
            if(this.projectilesPool[i].free) return this.projectilesPool[i];
        }
    }
    // collision detection
    checkCollision(a,b){
        return(
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        )
    }
    drawStatusText(context){
        context.save();
        context.shadowOffsetX = 2;
        context.shadowOffsety = 2;
        context.shadowColor = 'black';
        context.fillText('Score : '+this.score ,20, 55);
        context.fillText('Wave : '+this.waveCount ,20, 95);
        for(let i=0; i< this.player.lives; i++){
            context.fillRect(20+10*i,105,5,20);
        }
        if(this.gameOver){
            context.textAlign = 'center';
            context.font = '100px Impact';
            context.fillText('GAME OVER!!!', this.width * 0.5, this.height * 0.5);

            context.font = '20px Impact';
            context.fillText('Press R to restart', this.width * 0.5, this.height * 0.6);
        }
        context.restore();
    }
    newWave(){
        if (Math.random()<0.5 && this.columns * this.enemySize< this.width * 0.8 ){
        this.columns++;}else if(this.rows * this.enemySize < this.height * 0.6){
        this.rows++;}
        this.wave.push(new wave(this));
    }
    restart(){
        this.player.restart();
        this.columns = 2;
        this.rows = 2;
        this.wave =[];
        this.wave.push(new wave(this));
        this.waveCount = 1;
        this.score = 0;
        this.gameOver = false;
    }

}

// attacker
window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 718;
    ctx.fillStyle= 'White';
    ctx.strokeStyle= 'White';
    ctx.lineWidth = 3;
    ctx.font = '30px Impact';
    const game = new Game(canvas);
    
    let lastTime = 0;
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx, deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0);

    // Show instructions for the first 10 seconds
    const instructions = document.getElementById('instructions');
    instructions.style.display = 'block';
    
    setTimeout(() => {
        instructions.style.display = 'none';
    }, 5000);
});
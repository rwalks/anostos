Alien = function(x,y) {

  this.counter = 0;
  this.type = "alien";
  this.position = {'x':x,'y':y};
  this.velocity = {'x':0,'y':0};
  this.targetObj;
  this.path = [];
  this.onGround = false;
  this.groundContact = {'left':false,'right':false,'up':false,'down':false};
  this.direction = true;

  this.inventory = new Inventory();
  this.action = false;
  this.dead = false;

  //class specific variables
  this.name = ["Unknown","Alien"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/8;
  this.maxV = config.gridInterval / 4;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};

  //class specific functions
  this.findTarget = function(humans){}
  this.interactTarget = function(terrain){}

  this.draw = function(camera,canvasContext){
    var cent = this.center();
    var x = (cent.x-camera.xOff)*config.xRatio;
    var y = (cent.y-camera.yOff)*config.yRatio;
    this.drawAlien(x,y,canvasContext,1);
    //this.drawPath(this.path,canvasContext,camera);
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    var scale = (xSize*0.4) / (this.size.x*config.xRatio);
    this.drawAlien(oX+(xSize*0.3),oY+(ySize*0.2),canvasBufferContext,scale);
  }

  this.drawAlien = function(x,y,buffer,scale){};

  this.classUpdate = function(){};

  this.center = function(){
    return {'x':this.position.x+(this.size.x*0.5),'y':this.position.y+(this.size.y*0.5)};
  }

  this.update = function(terrain,humans){
    var ret = false;
    this.counter += 1;
    if(this.counter > 100){ this.counter = 0; }

    if(this.currentHealth <= 0 && !this.dead){
      ret = this.die();
    }
    if(!this.dead){
      if(this.path.length){
        this.followPath(terrain);
      }
      if(this.targetObj){
        ret = this.interactTarget(terrain);
      }else{
        ret = this.findTarget(terrain,humans);
      }
      this.applyForces();
      this.terrainCollide(terrain.terrain);
      this.applyMove();
      this.checkBoundaries();
      this.classUpdate();
    }
    return ret;
  }

  this.applyMove = function(){
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  this.checkBoundaries = function(){
    var outside = false;

    if(this.position.x < 0){
      this.position.x = 1;
      outside = true;
    }else if(this.position.x > config.mapWidth){
      this.position.x = config.mapWidth;
      outside = true;
    }

    if(this.position.y < 0){
      //let them fly...
    }else if(this.position.y > config.mapHeight){
      this.position.y = config.mapHeight
      outside = true;
    }

    if(outside){
      if(this.targetObj){
        this.targetObj = false;
        this.path = [];
      }
    }
  }

  this.applyForces = function(){
    this.applyMaxVelocity();
    this.velocity.y += config.gravity;
    //friction
    this.velocity.x = this.velocity.x * 0.9;
  }

  this.applyMaxVelocity = function(){
    var veloMax = this.maxV / (Math.abs(this.velocity.x) + Math.abs(this.velocity.y));
    if(veloMax < 1){
      this.velocity.x = this.velocity.x * veloMax;
      this.velocity.y = this.velocity.y * veloMax;
    }
  }

  this.die = function(){
    this.dead = true;
    this.deathAction();
    return {'action':'die'};
  }

  this.deathAction = function(){};

  this.followPath = function(terrain){
    var nextNode = this.path[this.path.length-1];

    if(nextNode && this.validNode(nextNode,terrain)){
      //pop next node if close enough OR over it OR under it
      if((Math.abs(this.nodeDistance(nextNode,this.position)) < config.gridInterval/6)){
        this.path.pop();
        nextNode = this.path[this.path.length-1];
      }
      //left or right
      if(nextNode && nextNode[0] > this.position.x){
        var d = nextNode[0] - this.position.x;
        this.velocity.x += Math.min(this.moveAccel,d);
      }else if(nextNode && nextNode[0] < this.position.x){
        var d = nextNode[0] - this.position.x;
        this.velocity.x += Math.max(-this.moveAccel,d);
      }
      //top bottom
      if(nextNode && nextNode[1] < this.position.y){
        this.velocity.y += -this.moveAccel*1.2;
      }else if(nextNode && nextNode[1] > this.position.y){
        this.velocity.y += this.moveAccel*1.2;
      }
    }else{
      this.path = [];
    }
  }

  this.validNode = function(node,terrain){
    return true;
  }

  this.nodeDistance = function(node,pos){
    var x = pos.x - node[0];
    x = x*x;
    var y = pos.y - node[1];
    y = y*y;
    return Math.sqrt(x+y);
  }

  this.terrainCollide = function(terrain){
    var fX = this.position.x + this.velocity.x;
    var fY = this.position.y + this.velocity.y;
    var collide = false;
    this.groundContact = resetGroundContact();

    var rightX = fX + this.size.x;
    var rightY = fY + (this.size.y/2);
    rightX = rightX - (rightX % config.gridInterval);
    rightY = rightY - (rightY % config.gridInterval);
    if(terrain[rightX] && terrain[rightX][rightY] && terrain[rightX][rightY].collision()){
      this.velocity.x -= ((fX + this.size.x) - rightX);
      collide = true;
      this.groundContact.right = true;
    }
    var leftX = fX;
    var leftY = fY + (this.size.y/2);
    leftX = leftX - (leftX % config.gridInterval);
    leftY = leftY - (leftY % config.gridInterval);
    if(terrain[leftX] && terrain[leftX][leftY] && terrain[leftX][leftY].collision()){
      this.velocity.x += ((leftX+config.gridInterval) - fX);
      collide = true;
      this.groundContact.left = true;
    }
    var botX = fX + (this.size.x / 2);
    var botY = fY + this.size.y;
    botX = botX - (botX % config.gridInterval);
    botY = botY - (botY % config.gridInterval);
    if(terrain[botX] && terrain[botX][botY] && terrain[botX][botY].collision()){
      this.velocity.y -= ((fY+this.size.y) - botY);
      collide = true;
      this.groundContact.down = true;
    }
    var topX = fX + (this.size.x / 2);
    var topY = fY;
    topX = topX - (topX % config.gridInterval);
    topY = topY - (topY % config.gridInterval);
    if(terrain[topX] && terrain[topX][topY] && terrain[topX][topY].collision()){
      this.velocity.y += ((topY+config.gridInterval) - fY);
      collide = true;
      this.groundContact.up = true;
    }
    //diags
    var diags = [[0,0],[1,0],[1,1],[0,1]];
    for(var p in diags){
      var offset = diags[p];
      var x = fX + (this.size.x * offset[0]);
      var y = fY + (this.size.y * offset[1]);
      x = x - (x % config.gridInterval);
      y = y - (y % config.gridInterval);
      if(terrain[x] && terrain[x][y] && terrain[x][y].collision()){
        collide = true;
      }

    }

    if(collide){
      this.onGround = true;
    }else{
      this.onGround = false;
    }
  }

  var resetGroundContact = function(){
    return {'left':false,'right':false,'up':false,'down':false};
  }

  this.wound = function(damage){
    var dam = Math.min(damage,this.currentHealth);
    this.currentHealth -= dam;
  }

  this.pointWithin = function(x,y){
    return (x > this.position.x && x < (this.position.x + this.size.x) &&
            y > this.position.y && y < (this.position.y + this.size.y));
  }

  this.drawPath = function(path,canvasBufferContext,camera){
    for(p in path){
      var x = path[p][0];
      var y = path[p][1];
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,0,0,0.2)";
      canvasBufferContext.strokeStyle="rgba(250,0,0,0.5)";
      var originX = (x-camera.xOff)*config.xRatio;
      var originY = (y-camera.yOff)*config.yRatio;
      var lX = config.gridInterval*config.xRatio;
      var lY = config.gridInterval*config.yRatio;
      canvasBufferContext.rect(originX,originY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }


}


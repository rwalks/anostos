Alien = function(x,y) {

  this.counter = 0;
  this.type = "alien";
  this.position = {'x':x,'y':y};
  this.lastPosition = {'x':this.position.x,'y':this.position.y};
  this.velocity = {'x':0,'y':0};
  this.targetObj;
  this.path = [];
  this.onGround = false;
  this.groundContact = {'left':false,'right':false,'up':false,'down':false};
  this.direction = true;

  this.inventory = new Inventory();
  this.dead = false;
  this.stuck = false;
  this.stuckTolerance = config.gridInterval / 5;

  this.climber = false;
  this.digger = false;

  this.moving = false;

  //class specific variables
  this.name = ["Unknown","Alien"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.moveAccel = config.gridInterval/8;
  this.maxVelocity = config.gridInterval / 4;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.jump = {'x':1,'y':1};


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
      this.applyMaxVelocity();
      this.terrainCollide(terrain);
      this.applyMove();
      this.checkBoundaries();
      this.checkStuck();
      this.classUpdate();
    }
    return ret;
  }

  this.applyMove = function(){
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  this.checkStuck = function(){
    if(this.targetObj){
      var deviation = 0;
      for(var dir in this.position){
        deviation += Math.abs(this.position[dir] - this.lastPosition[dir]);
      }
      this.stuck = deviation < this.stuckTolerance;
      this.lastPosition.x = this.position.x;
      this.lastPosition.y = this.position.y;
    }else{
      this.stuck = false;
    }
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
    //gravity
    this.velocity.y += config.gravity;
  }

  this.applyMaxVelocity = function(){
    var veloMax = this.maxVelocity / (Math.abs(this.velocity.x) + Math.abs(this.velocity.y));
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

    if((Math.abs(this.nodeDistance(nextNode,this.position)) < config.gridInterval/6)){
      this.path.pop();
      nextNode = this.path[this.path.length-1];
    }
    if(nextNode && this.validNode(nextNode,terrain)){
      //pop next node if close enough OR over it OR under it
      //left or right
      var dX = nextNode[0] - this.position.x;
      if(nextNode[0] > this.position.x){
        this.velocity.x += Math.min(this.moveAccel,dX);
      }else if(nextNode[0] < this.position.x){
        this.velocity.x += Math.max(-this.moveAccel,dX);
      }
      //top bottom
      var dY = nextNode[1] - this.position.y;
      if(nextNode[1] < this.position.y){
        this.velocity.y += Math.max(-this.moveAccel,dY);
      }else if(nextNode[1] > this.position.y){
        this.velocity.y += Math.min(this.moveAccel,dY);
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
    var collide = false;
    this.groundContact = resetGroundContact();

    if(this.velocity.x){
      var posX = this.velocity.x > 0;
      var oX = this.position.x + (posX ? this.size.x : 0 );
      var vX = oX + this.velocity.x;
      var tX = vX - (vX % config.gridInterval);
      var tY = this.position.y - (this.position.y % config.gridInterval);
      var dX = 0;
      for(var y = tY; y < tY + this.size.y; y += config.gridInterval){
        var til = terrain.getTile(tX,y);
        if(til && til.collision()){
          var oTilX = tX + (posX ? 0 : config.gridInterval);
          var modX = vX - oTilX;
          dX = (Math.abs(modX) > Math.abs(dX)) ? modX : dX;
        }
      }
      if(dX){
        this.position.x -= dX;
        collide = true;
        if(posX){
          this.groundContact.right = true;
        }else{
          this.groundContact.left = true;
        }
      }
    }

    if(this.velocity.y){
      var posY = this.velocity.y > 0;
      var oY = this.position.y + (posY ? this.size.y : 0 );
      var vY = oY + this.velocity.y;
      var tY = vY - (vY % config.gridInterval);
      var tX = this.position.x - (this.position.x % config.gridInterval);
      var dY = 0;
      for(var x = tX; x < tX + this.size.x; x += config.gridInterval){
        var til = terrain.getTile(x,tY);
        if(til && til.collision()){
          var oTilY = tY + (posY ? 0 : config.gridInterval);
          var modY = vY - oTilY;
          dY = (Math.abs(modY) > Math.abs(dY)) ? modY : dY;
        }
      }
      if(dY){
        this.position.y -= dY;
        collide = true;
        if(posY){
          this.groundContact.down = true;
        }else{
          this.groundContact.up = true;
        }
      }
    }
    this.onGround = collide;
  }

  var resetGroundContact = function(){
    return {'left':false,'right':false,'up':false,'down':false};
  }

  this.wound = function(damage){
    var dam = Math.min(damage,this.currentHealth);
    this.currentHealth -= dam;
  }

  this.clearTerrain = function(terrainObj){
    var lX = this.position.x + this.size.x;
    var lY = this.position.y + this.size.y;
    for(var x = this.position.x; x < lX; x += config.gridInterval){
      for(var y = this.position.y; y < lY; y += config.gridInterval){
        var til = terrainObj.getTile(x,y);
        if(til){
          terrainObj.removeTile(til);
        }
      }
    }
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
      var fillRGB = "rgba(200,0,0,0.2)";
      if(p == 0){
        fillRGB = "rgba(0,200,0,0.8)";
      }else if(p == (path.length - 1)){
        fillRGB = "rgba(0,0,200,0.8)";
      }
      canvasBufferContext.fillStyle = fillRGB;
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


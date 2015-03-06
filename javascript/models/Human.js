Human = function(x,y,name) {

  var rdbaString;
  this.spaceSuit = true;
  this.type = "human";
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
  this.jump = {'x':1,'y':6};

  this.position = {'x':x,'y':y};
  this.velocity = {'x':0,'y':0};
  this.maxVelocity = config.gridInterval;
  this.walkAccel = config.gridInterval/2;
  this.count = 0;
  this.path = [];
  this.onGround = false;
  this.direction = true;
  this.distress = false;
  this.maxHealth = 100; this.currentHealth = 100;
  this.maxOxygen = 20; this.currentOxygen = 20;

  var oxygenConsumptionRate = 0.03;

  this.activeTool = false;
  this.weaponTheta = 0;
  this.weaponActive = false;

  this.climber = false;
  this.digger = false;
  this.digStrength = 5;

  this.weapon = new BasicBlaster(this);

  this.action = false;

  this.dead = false;

  this.actionButtons = ["select","delete","build"];

  this.name = name ? name : utils.nameGenerator();

  //suit color
  var r = Math.floor(Math.random()*250);
  var g = Math.floor(Math.random()*250);
  var b = Math.floor(Math.random()*250);
  this.fillColor = "rgba("+r+","+g+","+b+",0.9)";
  r = (r >= g && r >= b) ? 250 : 0;
  g = (g >= r && g >= b) ? 250 : 0;
  b = (b >= g && b >= r) ? 250 : 0;
  this.lineColor = "rgba("+r+","+g+","+b+",1.0)";

  this.update = function(terrain){
    this.count += 1;
    if(this.count > 100){ this.count = 0; }

    if(this.currentHealth <= 0 && !this.dead){
      this.dead = true;
      return {'action':'die'};
    }
    if(!this.dead){
      this.updateOxygen(terrain);
      this.updateMove();
      this.applyForces();
      //terrain detection
      this.terrainCollide(terrain);
      this.setDirection();
      this.applyMove();
      //update weapon
      if(this.weapon){
        this.weapon.update();
      }
      return this.interactTarget(terrain);
    }
  }

  this.updateMove = function(){};
  this.applyForces = function(){};
  this.interactTarget = function(terrain){};
  this.setDirection = function(){};

  this.applyMove = function(){
    //apply move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  this.updateOxygen = function(terrain){
    var room = terrain.inARoom(this.position.x,this.position.y,terrain.rooms);
    this.spaceSuit = !(room && room.currentOxygen > 0);
    if(this.count % 10 == 0){
      //check room + oxygen;
      if(this.currentOxygen > 0){
        //breathe
        this.currentOxygen -= oxygenConsumptionRate;
      }else{
        //hurt
        this.wound(1);
      }
      if(room){
        var oxygenReq = Math.min(this.maxOxygen - this.currentOxygen, oxygenConsumptionRate*6);
        if(room.currentOxygen > 0){
          var oxygenTransfer = Math.min(oxygenReq,room.currentOxygen);
          room.currentOxygen -= oxygenTransfer;
          this.currentOxygen += oxygenTransfer;
        }
      }
    }
  }

  this.digTile = function(tile){
    tile.currentHealth -= this.digStrength;
    return tile.currentHealth <= 0;
  }

  this.center = function(){
    return {'x':this.position.x+(this.size.x*0.5),'y':this.position.y+(this.size.y*0.5)};
  }

  this.followPath = function(){
    var nextNode = this.path[this.path.length-1];
    var straightPath = false;
    if(this.path.length > 1){
      if((this.position.x > nextNode[0] && this.position.x > this.path[this.path.length-2][0]) ||
         (this.position.x < nextNode[0] && this.position.x < this.path[this.path.length-2][0])){
          straightPath = true;
      }
    }
    if(nextNode){
      //pop next node if close enough OR over it OR under it
      if((Math.abs(nodeDistance(nextNode,this.position)) < config.gridInterval/6) ||
        (Math.abs(nextNode[0] - this.position.x) < config.gridInterval) &&
         (nextNode[1] > this.position.y) && !this.onGround && straightPath){
        this.path.pop();
        nextNode = this.path[this.path.length-1];
      }
      //left or right
      if(nextNode && nextNode[0] > this.position.x){
      var d = nextNode[0] - this.position.x;
        this.velocity.x = Math.min(this.walkAccel,d);
      }else if(nextNode && nextNode[0] < this.position.x){
      var d = nextNode[0] - this.position.x;
        this.velocity.x = Math.max(-this.walkAccel,d);
      }else{
        this.velocity.x = 0;
      }
      if(nextNode && nextNode[1] < this.position.y){
        this.velocity.y = -this.walkAccel * 0.7;
      }
    }
  }

  var nodeDistance = function(node,pos){
    var x = pos.x - node[0];
    x = x*x;
    var y = pos.y - node[1];
    y = y*y;
    return Math.sqrt(x+y);
  }

  this.terrainCollide = function(terrainObj){
    var terrain = terrainObj.terrain;
    var fX = this.position.x + this.velocity.x;
    var fY = this.position.y + this.velocity.y;
    this.onGround = false;
    var topX = fX + (this.size.x / 2);
    var topY = fY;
    topX = topX - (topX % config.gridInterval);
    topY = topY - (topY % config.gridInterval);
    if(terrain[topX] && terrain[topX][topY] && terrain[topX][topY].collision()){
      this.velocity.y += ((topY+config.gridInterval) - fY);
    }
    var botX = fX + (this.size.x / 2);
    var botY = fY + this.size.y;
    botX = botX - (botX % config.gridInterval);
    botY = botY - (botY % config.gridInterval);
    if(terrain[botX] && terrain[botX][botY] && terrain[botX][botY].collision()){
      this.velocity.y -= ((fY+this.size.y) - botY);
      this.onGround = true;
    }
    var rightX = fX + this.size.x;
    var rightY = fY + (this.size.y/2);
    rightX = rightX - (rightX % config.gridInterval);
    rightY = rightY - (rightY % config.gridInterval);
    if(terrain[rightX] && terrain[rightX][rightY] && terrain[rightX][rightY].collision()){
      this.velocity.x -= ((fX + this.size.x) - rightX);
    }
    var leftX = fX;
    var leftY = fY + (this.size.y/2);
    leftX = leftX - (leftX % config.gridInterval);
    leftY = leftY - (leftY % config.gridInterval);
    if(terrain[leftX] && terrain[leftX][leftY] && terrain[leftX][leftY].collision()){
      this.velocity.x += ((leftX+config.gridInterval) - fX);
    }
  }

  this.draw = function(camera,canvasContext){
    var x = (this.position.x-camera.xOff)*config.xRatio;
    var y = (this.position.y-camera.yOff)*config.yRatio;
    humanArt.drawHuman(x,y,canvasContext,this);
   // humanArt.drawPath(this.path,canvasContext,camera);
  }

  this.wound = function(damage){
    var dam = Math.min(damage,this.currentHealth);
    this.currentHealth -= dam;
  }

  this.pointWithin = function(x,y){
    return (x > this.position.x && x < (this.position.x + this.size.x) &&
            y > this.position.y && y < (this.position.y + this.size.y));
  }


  var hostileTarget = function(obj){
    return obj.type == 'alien';
  }

  var repairTarget = function(obj){
    return (obj.type == 'generator' || obj.type == 'container' ||
            obj.type == 'conveyor'  || obj.type == 'turret');
  }

  this.applyMaxVelocity = function(){
    var veloMax = this.maxVelocity / (Math.abs(this.velocity.x) + Math.abs(this.velocity.y));
    if(veloMax < 1){
      this.velocity.x = this.velocity.x * veloMax;
      this.velocity.y = this.velocity.y * veloMax;
    }
  }

  this.drawTargetPortrait = function(x,y,xSize,ySize,canvasBufferContext){
    humanArt.drawTargetPortrait(x,y,xSize,ySize,canvasBufferContext,this);
  }

  this.drawRosterPortrait = function(x,y,xSize,ySize,canvasBufferContext){
    humanArt.drawRosterPortrait(x,y,xSize,ySize,canvasBufferContext,this);
  }

}


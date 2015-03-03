Npc = function(x,y,name) {
  Human.call(this,x,y,name);

  var rdbaString;
  this.spaceSuit = true;
  this.type = "human";
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
  this.jump = {'x':1,'y':6};

  this.position = {'x':x,'y':y};
  this.velocity = {'x':0,'y':0};
  var maxSpeed = {'x':3,'y':10};
  var walkAccel = config.gridInterval/2;
  this.count = 0;
  this.targetObj;
  this.targetCoords = {};
  this.targetRange = false;
  this.path = [];
  this.onGround = false;
  this.direction = true;
  this.distress = false;
  this.maxHealth = 100; this.currentHealth = 100;
  this.maxOxygen = 20; this.currentOxygen = 20;
  var oxygenConsumptionRate = 0.03;

  this.activeTool = false;

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
    this.targetRange = false;

    if(this.currentHealth <= 0 && !this.dead){
      this.dead = true;
      return {'action':'die'};
    }
    if(!this.dead){
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
      //update weapon
      if(this.weapon){
        this.weapon.update();
      }
      //move path
      if(this.path.length){
        this.followPath();
      }
      //gravity
      this.velocity.y += config.gravity;
      //max speed
      this.velocity.x = (Math.abs(this.velocity.x) > maxSpeed.x) ? (this.velocity.x * (maxSpeed.x/Math.abs(this.velocity.x))) : this.velocity.x ;
      this.velocity.y = (Math.abs(this.velocity.y) > maxSpeed.y) ? (this.velocity.y * (maxSpeed.y/Math.abs(this.velocity.y))) : this.velocity.y ;
      //terrain detection
      this.terrainCollide(terrain);
      //friction
      this.velocity.x = this.velocity.x * (this.onGround ? 0.8 : 0.9);
      this.velocity.y = this.velocity.y * 0.9;
      if(this.targetObj && this.targetRange){
        this.direction = (this.targetObj.position.x > this.position.x);
      }else{
        if(this.velocity.x > 0){this.direction = true;}
        if(this.velocity.x < 0){this.direction = false;}
      }
      //apply move
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      if(this.targetObj){
        return this.interactTarget(terrain);
      }
    }
  }

  this.interactTarget = function(terrain){
    var ret = false;
    var targCoords = [this.targetObj.position.x+(this.targetObj.size.x/2),this.targetObj.position.y+(this.targetObj.size.y/2)];
    var range = config.gridInterval * 3;
    if(this.action == 'build'){
      range = config.gridInterval * 3;
    }else if(this.action == 'attack'){
      if(this.weapon){
        range = this.weapon.range;
      }
    }
    if(nodeDistance(targCoords,this.center()) < range){
      this.targetRange = true;
      switch(this.action){
        case 'build':
          ret = {'action':'build','obj':this.targetObj};
          this.dropTarget();
          break;
        case 'delete':
          var targ = terrain.getTile(this.targetObj.position.x,this.targetObj.position.y);
          if(targ && targ == this.targetObj){
            var dead = this.digTile(targ);
            if(dead){
              ret = {'action':'delete','obj':targ};
              this.dropTarget();
            }
          }else{
            this.dropTarget();
          }
          break;
        case 'attack':
          if(this.weapon){
            var ammoRet = this.weapon.fire();
            if(ammoRet){
              ret = {'action':'fire','obj':ammoRet};
            }
          }
          break;
        case 'repair':
          this.dropTarget();
          break;
        default:
          this.dropTarget();
          break;
      }
    }
    if(this.action == 'attack'){
      this.attackTarget(terrain);
    }
    return ret;
  }

  this.attackTarget = function(terrain){
    if(!this.targetObj || this.targetObj.dead){
      this.dropTarget();
      return false;
    }else{
      var enemyDeviation = utils.objectDistance({'position':this.targetCoords},this.targetObj);
      var range = this.weapon ? this.weapon.range : config.gridInterval*2;
      if(enemyDeviation > range){
        this.path = pathfinder.findObjPath(this.targetObj,terrain,this);
        if(this.path.length){
          this.targetCoords.x = this.path[0][0];
          this.targetCoords.y = this.path[0][1];
        }
      }
    }
  }

  this.digTile = function(tile){
    tile.currentHealth -= this.digStrength;
    return tile.currentHealth <= 0;
  }

  this.dropTarget = function(){
    this.path = [];
    this.targetObj = false;
    this.targetCoords = {};
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
        this.velocity.x = Math.min(walkAccel,d);
      }else if(nextNode && nextNode[0] < this.position.x){
      var d = nextNode[0] - this.position.x;
        this.velocity.x = Math.max(-walkAccel,d);
      }else{
        this.velocity.x = 0;
      }
      if(nextNode && nextNode[1] < this.position.y){
        this.velocity.y = -walkAccel * 0.7;
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
    var collide = false;
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
      collide = true;
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
    if(!collide){
      this.onGround = false;
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

  this.click = function(coords,terrain,action,obj){
    this.action = false;
    this.targetObj = false;
    this.targetCoords = {};
    if(!obj){
      coords = pathfinder.findValidSpace(coords,terrain,this.size);
      this.path = pathfinder.findPath(coords.x,coords.y,terrain,this);
    }else if(obj){
      this.targetCoords.x = obj.position.x;
      this.targetCoords.y = obj.position.y;
      this.path = pathfinder.findObjPath(obj,terrain,this);
      if(this.path.length && action == 'select'){
        //determine if attack or repair
        if(hostileTarget(obj)){
          action = 'attack';
        }else if(repairTarget(obj)){
          action = 'repair';
        }
      }
    }
    this.action = action;
    if(action && action != 'select'){
      this.activeTool = action;
    }
    this.targetObj = obj;
    return;
  }

  var hostileTarget = function(obj){
    return obj.type == 'alien';
  }

  var repairTarget = function(obj){
    return (obj.type == 'generator' || obj.type == 'container' ||
            obj.type == 'conveyor'  || obj.type == 'turret');
  }

  this.drawTargetPortrait = function(x,y,xSize,ySize,canvasBufferContext){
    humanArt.drawTargetPortrait(x,y,xSize,ySize,canvasBufferContext,this);
  }

  this.drawRosterPortrait = function(x,y,xSize,ySize,canvasBufferContext){
    humanArt.drawRosterPortrait(x,y,xSize,ySize,canvasBufferContext,this);
  }

}


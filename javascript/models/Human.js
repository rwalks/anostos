Human = function(x,y,name) {

  var counter = 0;
  var rdbaString;
  var spaceSuit = true;
  this.type = "human";
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};

  this.position = {'x':x,'y':y};
  this.velocity = {'x':0,'y':0};
  var maxSpeed = {'x':3,'y':10};
  var walkAccel = config.gridInterval/2;
  var count = 0;
  this.targetObj;
  this.lastTarget;
  this.path = [];
  this.onGround = false;
  this.direction = true;
  this.distress = false;
  this.maxHealth = 100; this.currentHealth = 100;
  this.maxOxygen = 20; this.currentOxygen = 20;
  var oxygenConsumptionRate = 0.03;

  this.inventory = new Inventory();
  this.action = false;
  this.interact = 'inventory';

  this.dead = false;

  this.actions = ["build","inventory","delete"];

  this.name = name ? name : config.nameGenerator();

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
    count += 1;
    if(count > 100){ count = 0; }

    if(this.currentHealth <= 0 && !this.dead){
      this.dead = true;
      return {'action':'die'};
    }
    if(!this.dead){
      var room = terrain.inARoom(this.position.x,this.position.y,terrain.rooms);
      spaceSuit = !(room && room.oxygen > 0);
      if(count % 10 == 0){
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
          if(room.oxygen > 0){
            var oxygenTransfer = Math.min(oxygenReq,room.oxygen);
            room.oxygen -= oxygenTransfer;
            this.currentOxygen += oxygenTransfer;
          }
        }
      }
      //move path
      this.followPath();
      //gravity
      this.velocity.y += config.gravity;
      //max speed
      this.velocity.x = (Math.abs(this.velocity.x) > maxSpeed.x) ? (this.velocity.x * (maxSpeed.x/Math.abs(this.velocity.x))) : this.velocity.x ;
      this.velocity.y = (Math.abs(this.velocity.y) > maxSpeed.y) ? (this.velocity.y * (maxSpeed.y/Math.abs(this.velocity.y))) : this.velocity.y ;
      //terrain detection
      this.terrainCollide(terrain.terrain);
      //friction
      this.velocity.x = this.velocity.x * (this.onGround ? 0.8 : 0.9);
      this.velocity.y = this.velocity.y * 0.9;
      if(this.velocity.x > 0){this.direction = true;}
      if(this.velocity.x < 0){this.direction = false;}
      //apply move
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      if(this.targetObj){
        var targCoords = [this.targetObj.position.x+(this.targetObj.size.x/2),this.targetObj.position.y+(this.targetObj.size.y/2)];
        if(this.action == 'build'){
          var range = config.gridInterval * 3;
        }else{
          var range = config.gridInterval * 3;
        }
        var center = {'x':this.position.x+(this.size.x/2),'y':this.position.y+(this.size.y/2)};
        if(nodeDistance(targCoords,center) < range){
          var ret;
          switch(this.action){
            case 'build':
              ret = {'action':'build','obj':this.targetObj};
              this.path = [];
              this.targetObj = false;
              break;
            case 'delete':
              var targ = terrain.getTile(this.targetObj.position.x,this.targetObj.position.y);
              if(targ && targ == this.targetObj){
                ret = {'action':'delete','obj':targ};
                this.path = [];
                this.targetObj = false;
              }
              break;
            default:
              if(this.targetObj.interact == 'inventory'){
                ret = {'action':'inventory','obj':this.targetObj};
                this.path = [];
                this.targetObj = false;
              }
              break;
          }
          return ret;
        }
      }
    }
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

  this.terrainCollide = function(terrain){
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
    var animate = Math.abs(this.velocity.x) > 0.1;
    drawHuman(this.position.x,this.position.y,canvasContext,camera,this.direction,animate,this.fillColor,this.lineColor);
    drawPath(this.path,canvasContext,camera);
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
    this.lastTarget = false;
    var terMap = terrain.terrain;
    if(!obj){
      coords = pathfinder.findValidSpace(coords,terMap,this.size);
      this.path = pathfinder.findPath(this.position.x,this.position.y,coords.x,coords.y,terMap,6,this.size,false,false);
    }else if(obj){
      //find spot adjacent to obj
      var oX = obj.position.x - (obj.position.x % config.gridInterval);
      var oY = obj.position.y - (obj.position.y % config.gridInterval);
      var minX = oX - this.size.x;
      var maxX = oX + obj.size.x + this.size.x;
      var minY = oY - this.size.y;
      var maxY = oY + obj.size.y + this.size.y;
      var found = false;
      for(var x = 0; x <= ((maxX-minX) / config.gridInterval); x++){
        for(var y = 0; y <= ((maxY-minY)/ config.gridInterval); y++){
          var tX = (this.position.x > obj.position.x) ? (minX + (x*config.gridInterval)) : (maxX - (x*config.gridInterval));
          var tY = (this.position.y < obj.position.y) ? (minY + (y*config.gridInterval)) : (maxY - (y*config.gridInterval));
          if(pathfinder.validSpace(tX,tY,terMap,this.size,false,false)){
            this.path = pathfinder.findPath(this.position.x,this.position.y,tX,tY,terMap,6,this.size,false,false);
            if(this.path.length > 0){
              found = true;
              break;
            }
          }
        }
        if(found){break;}
      }
    }
    if(this.path.length > 0){
      this.action = action;
      this.targetObj = obj;
      this.lastTarget = obj;
    }
    return;
  }

  var drawPath = function(path,canvasBufferContext,camera){
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
      var lY = 2*config.gridInterval*config.yRatio;
      canvasBufferContext.rect(originX,originY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  var skinRGB = "rgba(208,146,110,1.0)";
  var drawHuman = function(x,y,canvasBufferContext,camera,direction,animate,fillColor,lineColor){
    var xRatio = config.canvasWidth / config.cX;
    var yRatio = config.canvasHeight / config.cY;

    var lLeg = 0.5*config.gridInterval*yRatio;
    var rLeg = 0.5*config.gridInterval*yRatio;
    var lHand = ((x-camera.xOff)*xRatio)+(config.gridInterval*xRatio);
    var rHand = ((x-camera.xOff)*xRatio)+(config.gridInterval*xRatio/2);
    var helmX = ((x-camera.xOff)*xRatio)+(config.gridInterval*xRatio/3);
    var eyeX = ((x-camera.xOff)*xRatio)+(config.gridInterval*xRatio/2);
    if(!direction){
      helmX = ((x-camera.xOff)*xRatio)-(config.gridInterval*xRatio/80);
      eyeX = ((x-camera.xOff)*xRatio)+(config.gridInterval*xRatio/30);
      lHand = ((x-camera.xOff)*xRatio);
    }
    if(animate){
      var moveMod = direction ? 1.8 : 0.65;
      if((count % 20) >= 10){
       rLeg = (direction ? 0.3 : 0.5)*config.gridInterval*yRatio;
       lLeg = (direction ? 0.5 : 0.3)*config.gridInterval*yRatio;
       rHand = ((x-camera.xOff)*xRatio)+((config.gridInterval*xRatio/2)/moveMod);
      }else{
       rLeg = (direction ? 0.5 : 0.3)*config.gridInterval*yRatio;
       lLeg = (direction ? 0.3 : 0.5)*config.gridInterval*yRatio;
       lHand = ((x-camera.xOff)*xRatio)+(config.gridInterval*xRatio)/moveMod;
       if(!direction){
         lHand = ((x-camera.xOff)*xRatio+(config.gridInterval*xRatio/3)/moveMod);
       }
      }
    }
    var handRGB = spaceSuit ? "rgba(0,0,200,0.9)" : skinRGB;
    //lHand
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= handRGB;
    canvasBufferContext.fillStyle = handRGB;
    canvasBufferContext.arc(lHand,((y-camera.yOff)*yRatio)+(config.gridInterval*yRatio*1.2),(config.gridInterval*xRatio/6),1.5*Math.PI,0.5*Math.PI,!direction);
    canvasBufferContext.closePath();
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //body -> lLeg -> rLeg
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(xRatio)+"";
    canvasBufferContext.strokeStyle = lineColor;
    canvasBufferContext.fillStyle = fillColor;
    canvasBufferContext.rect((x-camera.xOff)*xRatio,(y-camera.yOff)*yRatio,config.gridInterval*xRatio,1.5*config.gridInterval*yRatio);
    canvasBufferContext.rect((x-camera.xOff)*xRatio,((y-camera.yOff)*yRatio)+(1.5*config.gridInterval*yRatio),config.gridInterval*xRatio/4,lLeg);
    canvasBufferContext.rect(((x-camera.xOff)*xRatio)+(config.gridInterval*xRatio/4)*3,((y-camera.yOff)*yRatio)+(1.5*config.gridInterval*yRatio),config.gridInterval*xRatio/4,rLeg);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //visor / face
    var faceRGB = spaceSuit ? "rgba(0,200,0,0.9)" : skinRGB;
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= spaceSuit ? "rgba(0,250,0,1.0)" : skinRGB;
    canvasBufferContext.fillStyle = faceRGB;
    canvasBufferContext.rect(helmX,((y-camera.yOff)*yRatio)+(config.gridInterval*yRatio/6),(config.gridInterval*xRatio)*(2/3),0.6*config.gridInterval*yRatio);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    if(!spaceSuit){
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = "rgba(0,0,0,0.9)";
      canvasBufferContext.rect(eyeX,((y-camera.yOff)*yRatio)+(config.gridInterval*yRatio/4),(config.gridInterval*xRatio)/6,0.2*config.gridInterval*yRatio);
      canvasBufferContext.rect(eyeX+(config.gridInterval*xRatio/3),((y-camera.yOff)*yRatio)+(config.gridInterval*yRatio/4),(config.gridInterval*xRatio)/6,0.2*config.gridInterval*yRatio);
      canvasBufferContext.fill();

    }
    //rHand
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= handRGB;
    canvasBufferContext.fillStyle = handRGB;
    canvasBufferContext.arc(rHand,((y-camera.yOff)*yRatio)+(config.gridInterval*yRatio*1.2),(config.gridInterval*xRatio/6),1.5*Math.PI,0.5*Math.PI,!direction);
    canvasBufferContext.closePath();
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
  }

  this.drawTargetPortrait = function(x,y,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.strokeStyle = this.lineColor;
    canvasBufferContext.fillStyle = this.fillColor;
    canvasBufferContext.rect(x+(xSize*0.1),y+(ySize*0.1),xSize*0.8,ySize*0.9);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //visor / face
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= skinRGB;
    canvasBufferContext.fillStyle = skinRGB;
    canvasBufferContext.rect(x+(xSize*0.8/3),y+(ySize*0.1)+(ySize/8),xSize*0.9*(2/3),ySize*0.9*0.6);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(0,0,0,0.9)";
    var eyeX = x+xSize/3;
    canvasBufferContext.rect(eyeX,y+(ySize/3.5),xSize/6,0.15*ySize);
    canvasBufferContext.rect(eyeX+(xSize/3),y+(ySize/3.5),xSize/6,0.15*ySize);
    canvasBufferContext.fill();
  }

  this.drawRosterPortrait = function(x,y,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.strokeStyle = this.lineColor;
    canvasBufferContext.fillStyle = this.fillColor;
    canvasBufferContext.rect(x+(xSize*0.05),y+(ySize*0.3),xSize*0.15,ySize*0.5);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //visor / face
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= "rgba(0,250,0,1.0)";
    canvasBufferContext.fillStyle= "rgba(0,200,0,0.9)";
    canvasBufferContext.rect(x+(xSize*0.09),y+(ySize*0.35),xSize*0.11,ySize*0.3);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
  }

}


Block = function(type,pos) {

  this.rType = type;
  var fName = '';
  var fillRGB;
  var strokeRGB;
  this.airtight = false;
  this.pathable = false;
  this.cost = {};
  this.maxHealth = 100; this.currentHealth = 100;
  switch(type){
    case 'soil':
      fName = 'Soil';
      fillRGB = "rgba(20,200,150,0.9)";
      strokeRGB="rgba(40,250,200,1.0)";
      this.cost.soil = 2;
      break;
    case 'metal':
      fName = 'Metal';
      fillRGB = "rgba(200,220,200,0.9)";
      strokeRGB="rgba(230,230,230,1.0)";
      this.airtight = true;
      this.cost.metal = 2;
      break;
  }

  this.name = [fName,"Block"];
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.position = pos ? pos : {'x':x,'y':y};

  this.center = function(){
    return {'x':this.position.x+(this.size.x*0.5),'y':this.position.y+(this.size.y*0.5)};
  }
  this.collision = function(){return true;}
  this.lastDrawn = -1;
  this.type = "block";
  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = fillRGB;
      canvasBufferContext.strokeStyle= strokeRGB;
      var originX = (this.position.x-camera.xOff)*config.xRatio;
      var originY = (this.position.y-camera.yOff)*config.yRatio;
      var lX = this.size.x*config.xRatio;
      var lY = this.size.y*config.yRatio;
      canvasBufferContext.rect(originX,originY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = fillRGB;
    canvasBufferContext.strokeStyle= strokeRGB;
    canvasBufferContext.rect(oX+(xSize*0.2),oY+(ySize*0.2),xSize*0.6,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.clone = function(pos){
    return new Block(this.rType,pos);
  }

  this.click = function(coords,terrain){
    return;
  }
}

Corpse = function(pos,inventory,cost){
  this.inventory = inventory ? inventory : new Inventory();
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.name = ["Dessicated","Remains"];
  this.position = pos ? pos : {'x':0,'y':0};
  this.cost = cost ? cost : {};
  this.maxVelocity = config.gridInterval / 3;

  var target = false;

  this.center = function(){
    return {'x':this.position.x+(this.size.x*0.5),'y':this.position.y+(this.size.y*0.5)};
  }
  this.type = "corpse";
  this.actions = [];

  this.update = function(terrain,humans){
    if(target){
      var d = config.objectDistance(target,this);
      if(d < config.pickUpRange){
        return true;
      }
      var fX = target.position.x - this.position.x;
      var fY = target.position.y - this.position.y;
      this.applyMaxVelocity(fX,fY);
    }else{
      //human pickup
      var minD = 999;
      for(var h in humans){
        var d = config.objectDistance(humans[h],this);
        if(d < config.lootRange){
          if(d < minD){
            minD = d;
            target = humans[h];
          }
        }
      }
      //grav
      var gravY = this.position.y + this.size.y + config.gravity;
      var tY = gravY - (gravY % config.gridInterval);
      var tX = this.position.x - (this.position.x % config.gridInterval);
      if(terrain.terrain[tX] && terrain.terrain[tX][tY]){
     //   this.position.y = tY - this.size.y;
      }else{
        this.position.y = gravY;
      }
    }
  }

  this.applyMaxVelocity = function(dX,dY){
    var veloMax = this.maxVelocity / (Math.abs(dX) + Math.abs(dY));
    if(veloMax < 1){
      dX = dX * veloMax;
      dY = dY * veloMax;
    }
    this.position.x += dX;
    this.position.y += dY;
  }

  this.draw = function(camera,canvasBufferContext,count){
    var x = (this.position.x-camera.xOff)*config.xRatio;
    var y = (this.position.y-camera.yOff)*config.yRatio;
    this.drawBlock(x,y,canvasBufferContext);
  }

  this.drawBlock = function(x,y,canvasBufferContext,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = this.size.x*config.xRatio*scale;
    var lY = this.size.y*config.yRatio*scale;
    var capRGB = "rgba(10,10,10,0.5)";
    canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = capRGB;
    canvasBufferContext.moveTo(oX,oY+lY*0.1);
    var points = [[lX*0.1,0],[lX*0.4,0],[lX*0.5,lY*0.1],[lX*0.6,0],[lX*0.9,0],[lX,lY*0.1],[lX,lY*0.4],[lX*0.9,lY*0.5],
                  [lX,lY*0.6],[lX,lY*0.9],[lX*0.9,lY],[lX*0.6,lY],
                  [lX*0.5,lY*0.9],[lX*0.4,lY],[lX*0.1,lY],[0,lY*0.9],
                  [0,lY*0.6],[lX*0.1,lY*0.5],[0,lY*0.4],[0,lY*0.1]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //topChamber
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    var dr = Math.floor(Math.random() * 50);
    var da = Math.floor(Math.random() * 0.1) + 0.9;
    var rgbaString = "rgba("+(220+dr)+","+(220+dr)+","+(220+dr)+","+da+")";
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.moveTo(oX+(lX*0.8),oY+(lY*0.5));
    var points = [[lX*0.2,lY*0.5],[lX*0.2,lY*0.3],[lX*0.5,lY*0.15],[lX*0.8,lY*0.3],[lX*0.8,lY*0.5]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    var scale = (xSize*0.4) / (this.size.x*config.xRatio);
    this.drawBlock(oX+(xSize*0.3),oY+(ySize*0.2),canvasBufferContext,scale);
  }

  this.click = function(coords,terrain){
    return;
  }

  this.pointWithin = function(x,y){
    return (x > this.position.x && x < (this.position.x + this.size.x) &&
            y > this.position.y && y < (this.position.y + this.size.y));
  }


}

Door = function(pos) {

  var fName = 'Hatch';
  this.airtight = true;
  var fillRGB = "rgba(40,200,50,0.9)";
  var strokeRGB="rgba(80,250,100,1.0)";

  this.name = [fName,""];
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
  this.position = pos ? pos : {'x':x,'y':y};

  this.maxHealth = 100; this.currentHealth = 100;

  this.center = function(){
    return {'x':this.position.x+(this.size.x*0.5),'y':this.position.y+(this.size.y*0.5)};
  }
  this.open = false;
  this.cost = {'metal': 4};

  this.collision = function(){
    return !this.open;
  }
  this.pathable = true;
  this.lastDrawn = -1;
  this.type = "door";

  this.update = function(humans){
    var closeHuman = false;
    for(h in humans){
      if(config.objectDistance(humans[h],this) <= config.gridInterval*1.1){
        closeHuman = true;
      }
    }
    this.open = closeHuman;
  }

  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = fillRGB;
      canvasBufferContext.strokeStyle= strokeRGB;
      var originX = (this.position.x-camera.xOff)*config.xRatio;
      var originY = (this.position.y-camera.yOff)*config.yRatio;
      var lX = this.size.x*config.xRatio;
      var lY = this.open ? this.size.y * 0.1 * config.yRatio : this.size.y*config.yRatio;
      canvasBufferContext.rect(originX+lX/3,originY,lX/3,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = fillRGB;
    canvasBufferContext.strokeStyle= strokeRGB;
    var lX = xSize*0.6;
    var lY = ySize*0.6;
    canvasBufferContext.rect((oX+lX/3)+(xSize*0.2),oY+(ySize*0.2),xSize*0.6/3,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.clone = function(pos){
    return new Door(pos);
  }

  this.click = function(coords,terrain){
    return;
  }
}

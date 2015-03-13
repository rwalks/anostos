Block = function(type,x,y) {
  Building.call(this,x,y);
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
      fillRGB = new Color(20,200,150,0.9);
      strokeRGB=new Color(40,250,200,1.0);
      this.cost.soil = 2;
      break;
    case 'metal':
      fName = 'Metal';
      fillRGB = new Color(200,220,200,0.9);
      strokeRGB=new Color(230,230,230,1.0);
      this.airtight = true;
      this.cost.metal = 2;
      break;
  }

  this.name.set(fName,"Block");

  this.collision = function(){return true;}

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    fillRGB.a = alpha;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = fillRGB.colorStr();
    canvasBufferContext.strokeStyle= strokeRGB.colorStr();
    var lX = this.size.x*config.xRatio*scl;
    var lY = this.size.y*config.yRatio*scl;
    canvasBufferContext.rect(x,y,lX,lY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.clone = function(x,y){
    return new Block(this.rType,x,y);
  }
}

Corpse = function(pos,inventory,cost){
  Tile.call(this,pos.x,pos.y);
  this.inventory = inventory ? inventory : new Inventory();
  this.name.set("Dessicated","Remains");
  this.cost = cost ? cost : {};
  this.maxVelocity = config.gridInterval / 3;
  this.lightRadius = 2;
  this.hasDrawn = false;

  var target = false;

  this.type = "corpse";

  this.update = function(terrain,humans){
    this.hasDrawn = false;
    if(target){
      var d = utils.objectDistance(target,this);
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
        var d = utils.objectDistance(humans[h],this);
        if(d < config.lootRange){
          if(d < minD){
            minD = d;
            target = humans[h];
          }
        }
      }
      //grav
      var gravY = this.position.y + this.size.y + config.gravity;
      var tY = utils.roundToGrid(gravY);
      var tX = utils.roundToGrid(this.position.x);
      if(terrain.getTile(tX,tY)){
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
    if(!this.hasDrawn){
      this.hasDrawn = true;
      var x = (this.position.x-camera.xOff)*config.xRatio;
      var y = (this.position.y-camera.yOff)*config.yRatio;
      this.drawBlock(x,y,canvasBufferContext);
    }
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
}

Door = function(x,y) {
  Building.call(this,x,y);

  this.airtight = true;
  this.name.set("AirLock","");
  this.size.y = 2*config.gridInterval;

  this.open = false;
  this.cost = {'metal': 4};

  this.collision = function(){
    return this.active && !this.open;
  }
  this.pathable = true;
  this.type = "door";

  var fillRGB = new Color(40,200,50,0.9);
  var strokeRGB = new Color(80,250,100,1.0);

  this.update = function(terrain){
    var closeHuman = false;
    if(this.active){
      var entities = terrain.getEntities(this.position.x,this.position.y) || [];
      entities = entities.concat(terrain.getEntities(this.position.x+config.gridInterval,this.position.y) || []);
      entities = entities.concat(terrain.getEntities(this.position.x-config.gridInterval,this.position.y) || []);
      for(var e = 0; e < entities.length; e++){
        var entity = entities[e];
        var humanType = (entity.type == 'human');
        if(humanType){
          closeHuman = true;
        }
      }
    }
    this.open = closeHuman;
  }

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    fillRGB.a = alpha;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = fillRGB.colorStr();
    canvasBufferContext.strokeStyle= strokeRGB.colorStr();
    var lX = this.size.x*config.xRatio*scl / 3;
    var lY = (this.open ? this.size.y * 0.1 * config.yRatio : this.size.y*config.yRatio) * scl;
    canvasBufferContext.rect(x+lX,y,lX,lY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.clone = function(x,y){
    return new Door(x,y);
  }
}

TerrainTile = function(x,y,type){
  Tile.call(this,x,y);
  this.size.x = 2*config.gridInterval;
  this.size.y = 2*config.gridInterval;

  this.pathable = false;
  var fillStyle; var strokeStyle;
  this.topLayer = false;
  this.plant = false;
  this.maxHealth = 100; this.currentHealth = 100;
  this.currentHealth -= (Math.random() * 20);
  switch(type){
    case "soil":
      this.name.set("Soil","");
      this.cost = {'soil': 8};
      fillStyle = new Color(20,200,150,1.0);
      strokeStyle = new Color(40,250,200,1.0);
      break;
    case "ore":
      this.name.set("Metal","Ore");
      this.cost = {'ore': 8};
      fillStyle = new Color(110,100,130,1.0);
      strokeStyle = new Color(210,200,230,1.0);
      break;
    case "rock":
      this.name.set("Rock","");
      this.cost = {'rock': 8};
      fillStyle = new Color(10,100,100,1.0);
      strokeStyle = new Color(20,150,150,1.0);
      break;
  }
  this.draw = function(camera,canvasBufferContext,count,terrain){
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      var cent = this.center();
      var lightX = utils.roundToGrid(cent.x);
      var lightY = utils.roundToGrid(cent.y);
      var light = terrain.getLight(lightX,lightY);
      light = light ? light[0] : 0;
      if(this.plant){
        this.plant.draw(camera,canvasBufferContext);
      }
      this.lastDrawn = count;
      var healthPercent = (this.currentHealth/this.maxHealth);
      var alpha = this.baseAlpha + (healthPercent*this.healthAlpha*light);
      fillStyle.a = alpha;
      strokeStyle.a = alpha;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = fillStyle.colorStr();
      canvasBufferContext.strokeStyle = strokeStyle.colorStr();
      var originX = (this.position.x-camera.xOff)*config.xRatio;
      var originY = (this.position.y-camera.yOff)*config.yRatio;
      var lX = this.size.x*config.xRatio;
      var lY = this.size.y*config.yRatio;
      canvasBufferContext.rect(originX,originY,lX,lY);
      if(!this.hidden){
        canvasBufferContext.fill();
      }
      canvasBufferContext.stroke();
      if(this.topLayer){
        canvasBufferContext.fillStyle = "rgba(100,0,100,"+alpha+")";
        canvasBufferContext.strokeStyle = "rgba(250,0,250,"+alpha+")";
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(originX,originY);
        var points = [[lX,0],[lX,lY*0.4],[lX*0.9,lY*0.2],[lX*0.8,lY*0.4],[lX*0.7,lY*0.2],[lX*0.6,lY*0.4],[lX*0.5,lY*0.2],[lX*0.4,lY*0.4],[lX*0.3,lY*0.2],[lX*0.2,lY*0.4],[lX*0.1,lY*0.2],[0,lY*0.4],[0,0]];
        for(var p = 0; p < points.length; p++){
          canvasBufferContext.lineTo(originX+points[p][0],originY+points[p][1]);
        }
        if(!this.hidden){
          canvasBufferContext.fill();
        }
        canvasBufferContext.stroke();
      }
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
    canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
    canvasBufferContext.rect(oX+(xSize*0.2),oY+(ySize*0.2),xSize*0.6,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }
}

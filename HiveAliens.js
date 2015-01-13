HiveWorker = function(x,y,hive) {
  Alien.call(this,x,y);
//generic alien vars
  this.name = ["Hive","Worker"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/6;
  this.maxV = config.gridInterval/4;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
//specific vars
  this.type = 'passive';
  this.hive = hive;

  this.lastHarvested;
  this.burrowStrength = 2;

  this.findTarget = function(terrain,humans){
    //search for source of metal within range: buildings or ore
    //else set random tile dest
    var oX = this.position.x - (this.position.x % config.gridInterval);
    var oY = this.position.y - (this.position.y % config.gridInterval);
    var range = config.gridInterval*8;
    var closestRange = range * 2;
    for(var x = oX-range; x < oX+range; x+=config.gridInterval){
      for(var y = oY-range; y < oY+range; y+=config.gridInterval){
        if(terrain.terrain[x] && terrain.terrain[x][y]){
          var obj = terrain.terrain[x][y];
          if(obj.cost['ore'] || obj.cost['metal']){
            var objCenter = obj.center();
            var objRange = this.nodeDistance([objCenter.x,objCenter.y],this.center());
            if(!this.targetObj || (objRange < closestRange)){
              this.targetObj = obj;
              closestRange = objRange;
            }
          }
        }
      }
    }
    if(!this.targetObj){
      //no metal, random dest
      var magRand = Math.floor(Math.random() * 10) * config.gridInterval;
      var xRand = Math.floor(Math.random()*(magRand*2))-magRand;
      var yRand = Math.floor(Math.random()*(magRand*2))-magRand;
      var rX = oX + xRand; rX = rX - (rX % config.gridInterval);
      var rY = oY + yRand; rY = rY - (rY % config.gridInterval);
      if(terrain.terrain[rX] && terrain.terrain[rY]){
        this.targetObj = terrain.terrain[rX][rY];
      }
    }

    this.path = this.targetObj ? pathfinder.findPath(this.position.x,this.position.y,this.targetObj.position.x,this.targetObj.position.y,terrain.terrain,2,this.size,true,true) : [];
  }

  this.interactTarget = function(terrain){
    var targCent = this.targetObj.center();
    var cent = this.center();
    var interactRange = (Math.max(this.size.x,this.size.y) / 2) + (Math.max(this.targetObj.size.x,this.targetObj.size.y) / 2) * 1.5;
    if(this.targetObj.type == 'spawn'){
    //home spawn
      if(this.nodeDistance([targCent.x,targCent.y],cent) <= interactRange){
        //deposit metal + ore
        this.targetObj.lastMetal = this.lastHarvested ? this.lastHarvested.position : false;
        var metalCount = this.inventory.itemCount('metal');
        var oreCount = this.inventory.itemCount('ore');
        if(oreCount + metalCount > 0){
          this.inventory.removeItem('ore',oreCount);
          this.inventory.removeItem('metal',metalCount);
          this.targetObj.inventory.addItem('ore',oreCount);
          this.targetObj.inventory.addItem('metal',metalCount);
          //full heal
          this.currentHealth = this.maxHealth;
        }
        //target dummy building at last metal spot
        this.targetObj = (this.hive && this.hive.lastMetal) ? new Building(this.hive.lastMetal) : false;
        this.path = this.targetObj ? pathfinder.findPath(this.position.x,this.position.y,this.hive.lastMetal.x,this.hive.lastMetal.y,terrain.terrain,2,this.size,true,false) : [];
        this.targetObj = this.path.length ? this.targetObj : false;
      }else{
      //possibly abandon mission
      }
    }else{
    //metal obj
      if(this.nodeDistance([targCent.x,targCent.y],cent) <= interactRange){
        if(terrain.terrain[this.targetObj.position.x] && terrain.terrain[this.targetObj.position.x][this.targetObj.position.y] &&
            this.targetObj.cost['metal'] || this.targetObj.cost['ore']){
          this.lastHarvested = this.targetObj;
          if(this.targetObj.cost['ore']){
            this.inventory.addItem('ore',2);
          }
          if(this.targetObj.cost['metal']){
            this.inventory.addItem('metal',1);
          }
          this.targetObj = this.hive ? this.hive : false;
          this.path = this.targetObj ? pathfinder.findPath(this.position.x,this.position.y,this.hive.position.x,this.hive.position.y,terrain.terrain,2,this.size,true,false) : [];
          return {'action':'delete','obj':this.lastHarvested};
        }else{
          this.targetObj = false;
          this.path = [];
        }
      }else{
        if(Math.abs(this.velocity.x) > Math.abs(this.velocity.y)){
          var nextX = (this.velocity.x > 0) ? (this.position.x+this.size.x) + this.velocity.x : this.position.x + this.velocity.x;
          var nextY = this.position.y;
        }else{
          var nextX = this.position.x;
          var nextY = (this.velocity.y > 0) ? (this.position.y+this.size.y) + this.velocity.y : this.position.y + this.velocity.y;
        }
        nextX = nextX - (nextX % config.gridInterval);
        nextY = nextY - (nextY % config.gridInterval);
        if(terrain.terrain[nextX] && terrain.terrain[nextX][nextY]){
          var til = terrain.terrain[nextX][nextY];
          if(til.cost['soil']){
            til.currentHealth -= this.burrowStrength;
            if(til.currentHealth <= 0){
              terrain.removeTile(til);
            }
          }else if(til.cost['metal'] || til.cost['ore']){
            this.targetObj = til;
            this.path = pathfinder.findPath(this.position.x,this.position.y,this.targetObj.position.x,this.targetObj.position.y,terrain.terrain,2,this.size,true,true);
          }else{
            this.targetObj = false;
          }
        }else if(Math.random() < 0.001){
          this.targetObj = false;
          this.path = [];
         // this.targetObj = this.hive ? this.hive : false;
         // this.path = this.targetObj ? pathfinder.findPath(this.position.x,this.position.y,this.hive.position.x,this.hive.position.y,terrain.terrain,2,this.size,true,false) : [];
        }
      }
    }
  }

  this.draw = function(camera,canvasBufferContext){
      var x = (this.position.x-camera.xOff)*config.xRatio;
      var y = (this.position.y-camera.yOff)*config.yRatio;
      var scale = 1;
      var oX = x;
      var oY = y;
      var lX = this.size.x*config.xRatio*scale;
      var lY = this.size.y*config.yRatio*scale;
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = "rgba(0,255,0,1.0)";
      canvasBufferContext.rect(oX,oY,lX,lY);
      canvasBufferContext.fill();
     // this.drawPath(this.path,canvasBufferContext,camera);
  }
  this.drawTargetPortrait = function(x,y,xSize,ySize,canvasBufferContext){}
}

HiveWarrior = function(x,y) {
  Alien.call(this,x,y);

  this.name = ["Hive","Hunter"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/2;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};

  this.type = 'aggressive';

  this.findTarget = function(humans){}
  this.interactTarget = function(terrain){}
  this.draw = function(camera,canvasContext){}
  this.drawTargetPortrait = function(x,y,xSize,ySize,canvasBufferContext){}

}

HiveNest = function(x,y) {
  Alien.call(this,x,y);
//alien vars
  this.name = ["Hive","Nest"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/2;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
//specific vars
  this.lastMetal;
  this.type = 'spawn';

  this.currentSpawn = 0;
  this.maxSpawn = 10;

  this.findTarget = function(humans){
    if(this.inventory.itemCount('metal') >= 1 && this.currentSpawn < this.maxSpawn){
      this.inventory.removeItem('metal',1);
      this.currentSpawn += 1;
      return {'action':'spawn','obj':new HiveWorker(this.position.x,this.position.y,this)};
    }else if(this.inventory.itemCount('ore') >= 4 && this.currentSpawn < this.maxSpawn){
      this.inventory.removeItem('ore',4);
      this.currentSpawn += 1;
      return {'action':'spawn','obj':new HiveWorker(this.position.x,this.position.y,this)};
    }
  }

  this.draw = function(camera,canvasBufferContext){
      var x = (this.position.x-camera.xOff)*config.xRatio;
      var y = (this.position.y-camera.yOff)*config.yRatio;
      var scale = 1;
      var oX = x;
      var oY = y;
      var lX = this.size.x*config.xRatio*scale;
      var lY = this.size.y*config.yRatio*scale;
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = "rgba(255,0,255,1.0)";
      canvasBufferContext.rect(oX,oY,lX,lY);
      canvasBufferContext.fill();
  }

  this.drawTargetPortrait = function(x,y,xSize,ySize,canvasBufferContext){}

}

HiveQueen = function(x,y) {
  Alien.call(this,x,y);

  this.name = ["Hive","Queen"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/2;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};

  this.findTarget = function(humans){}
  this.interactTarget = function(terrain){}
  this.draw = function(camera,canvasContext){}
  this.drawTargetPortrait = function(x,y,xSize,ySize,canvasBufferContext){}

}

HiveAlien = function(x,y) {
  Alien.call(this,x,y);

  this.name = ["Hive","Queen"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/2;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};

  this.findTarget = function(humans){}
  this.interactTarget = function(terrain){}
  this.draw = function(camera,canvasContext){}
  this.drawTargetPortrait = function(x,y,xSize,ySize,canvasBufferContext){}

}


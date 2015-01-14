HiveAlien = function(x,y,size,id,hive) {
  Alien.call(this,x,y);

  this.id = id ? id : 0;

  this.theta = 0;
  this.size = size ? size : this.size;
  this.hive = hive ? hive : false;
  this.xFlip = false;
  this.yFlip = false;

  var originalSize = {'x':this.size.x,'y':this.size.y};

  this.classUpdate = function(){
    this.setRotTransform();
  }

  this.setRotTransform = function(){
    var tolerance = config.gridInterval / 5;
    if(this.groundContact.down){
      this.theta = 0;
      this.xFlip = (this.velocity.x > tolerance) ? false : this.xFlip;
      this.xFlip = (this.velocity.x < -tolerance) ? true : this.xFlip;
      this.yFlip = false;
    }else if(this.groundContact.up){
      this.theta = Math.PI;
      this.xFlip = (this.velocity.x > tolerance) ? true : this.xFlip;
      this.xFlip = (this.velocity.x < -tolerance) ? false : this.xFlip;
      this.yFlip = false;
    }else if(this.groundContact.left){
      this.theta = Math.PI * 0.5;
      this.yFlip = (this.velocity.y > tolerance) ? true : this.yFlip;
      this.yFlip = (this.velocity.y < -tolerance) ? false : this.yFlip;
      this.xFlip = false;
    }else if(this.groundContact.right){
      this.theta = Math.PI * 1.5;
      this.yFlip = (this.velocity.y > tolerance) ? true : this.yFlip;
      this.yFlip = (this.velocity.y < -tolerance) ? false : this.yFlip;
      this.xFlip = false;
    }
  }

  this.pathHome = function(terrain){
    if(this.hive){
      this.path = pathfinder.findPath(this.position.x,this.position.y,this.hive.position.x,this.hive.position.y,terrain.terrain,2,this.size,true,false);
      this.targetObj = this.path.length ? this.hive : false;
      this.hive.reportPath(this.id,this.path.length);
    }
  }

  this.deathAction = function(){
    if(this.hive && this.id){
      this.hive.removeSpawn(this.id);
    }
  }

  this.validNode = function(node,terrain){
  //  var digger = (this.targetObj && this.targetObj.type != 'spawn');
  //  return pathfinder.validSpace(node[0],node[1],terrain.terrain,this.size,true,digger);
  return true;
  }

}


HiveWorker = function(x,y,hive,id) {
  var size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  //inherit hive alien
  HiveAlien.call(this,x,y,size,id,hive);
//generic alien vars
  this.name = ["Hive","Worker"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/6;
  this.maxV = config.gridInterval/4;
//specific vars
  this.type = 'passive';

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
      var magRand = Math.floor(Math.random() * 15) * config.gridInterval;
      var xRand = Math.floor(Math.random()*(magRand*2))-magRand;
      var yRand = Math.floor(Math.random()*(magRand*1.5))-(magRand*0.5);
      var rX = oX + xRand; rX = rX - (rX % config.gridInterval);
      var rY = oY + yRand; rY = rY - (rY % config.gridInterval);
      if(terrain.terrain[rX] && terrain.terrain[rX][rY]){
        if(!terrain.terrain[rX][rY].topLayer){
          this.targetObj = terrain.terrain[rX][rY];
        }
      }
    }

    this.path = this.targetObj ? pathfinder.findPath(this.position.x,this.position.y,this.targetObj.position.x,this.targetObj.position.y,terrain.terrain,2,this.size,true,true) : [];
  }

  this.interactTarget = function(terrain){
    var targCent = this.targetObj.center();
    var cent = this.center();
    var interactRange = (Math.max(this.size.x,this.size.y) / 2) + (Math.max(this.targetObj.size.x,this.targetObj.size.y) / 2) * 1.6;
    //if path lost, recheck

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
        if(!this.path.length){
          this.targetObj = false;
          this.path = [];
        }
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
          this.pathHome(terrain);
          return {'action':'delete','obj':this.lastHarvested};
        }else{
          this.targetObj = false;
          this.path = [];
        }
      }else{
        //eat dirt
        if(Math.abs(this.velocity.x) > Math.abs(this.velocity.y)){
          var nextX = (this.velocity.x > 0) ? (this.position.x+this.size.x) + this.velocity.x : this.position.x + this.velocity.x;
          var nextY = this.position.y;
        }else{
          var nextX = this.position.x;
          var nextY = (this.velocity.y > 0) ? (this.position.y+this.size.y) + this.velocity.y : this.position.y + this.velocity.y;
        }
        nextX = nextX - (nextX % config.gridInterval);
        nextY = nextY - (nextY % config.gridInterval);
        //damage all dirt tiles in desired position;
        var blockingTiles = [];
        for(var nx = nextX; nx < (nextX+this.size.x); nx += config.gridInterval){
          for(var ny = nextY; ny < (nextY+this.size.y); ny += config.gridInterval){
            if(terrain.terrain[nx] && terrain.terrain[nx][ny]){
              blockingTiles.push(terrain.terrain[nx][ny]);
            }
          }
        }
        var randAction = Math.random();
        if(blockingTiles.length){
          for(var t in blockingTiles){
            var til = blockingTiles[t];
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
          }
        }else if(randAction < 0.0005){
          this.pathHome(terrain);
        }else if(randAction < 0.001){
          this.targetObj = false;
          this.path = [];
        }
      }

      if(!this.path.length){
        this.targetObj = false;
        this.path = [];
      }
    }
  }

  this.drawAlien = function(x,y,canvasBufferContext,scale){
    alienArt.drawHiveWorker(x,y,this,canvasBufferContext,scale);
  }

}

HiveWarrior = function(x,y) {
  HiveAlien.call(this,x,y);

  this.name = ["Hive","Hunter"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/2;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};

  this.type = 'aggressive';

  this.findTarget = function(terrain,humans){}
  this.interactTarget = function(terrain){}
  this.draw = function(camera,canvasContext){}

}

HiveNest = function(x,y) {
  HiveAlien.call(this,x,y);
//alien vars
  this.name = ["Hive","Nest"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/2;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
//specific vars
  this.lastMetal;
  this.type = 'spawn';

  this.spawn = {};

  this.currentSpawn = 0;
  this.maxSpawn = 10;
  var nextSpawnId = 1;

  this.findTarget = function(terrain,humans){
    //spawn
    if(this.inventory.itemCount('metal') >= 1 && this.currentSpawn < this.maxSpawn){
      if(this.inventory.removeItem('metal',1)){
        return this.addSpawn('worker');
      }
    }else if(this.inventory.itemCount('ore') >= 4 && this.currentSpawn < this.maxSpawn){
      if(this.inventory.removeItem('ore',4)){
        return this.addSpawn('worker');
      }
    }
    //burrow if unpathable
    if(!this.pathable()){
      var oX = this.position.x;
      var oY = this.position.y + this.size.y;
      oX = oX - (oX % config.gridInterval);
      oY = oY - (oY % config.gridInterval);
      for(var x = oX; x < (oX + this.size.x); x += config.gridInterval){
        if(terrain.terrain[x] && terrain.terrain[x][oY]){
          terrain.removeTile(terrain.terrain[x][oY]);
        }
      }
      //reset pathable state to avoid china syndrome
      for(var s in this.spawn){
        this.spawn[s].pathable = true;
      }
    }
  }

  this.removeSpawn = function(id){
    if(this.spawn[id]){
      delete this.spawn[id];
      this.currentSpawn -= 1;
    }
  }

  this.addSpawn = function(spawnType){
    this.currentSpawn += 1;
    nextSpawnId += 1;
    var spObj;
    switch(spawnType){
      case 'worker':
        spObj = new HiveWorker(this.position.x,this.position.y,this,nextSpawnId);
        this.spawn[nextSpawnId] = {'type':spawnType,'pathable':true, 'obj':spObj};
        break;
    }
    if(spObj){
      return {'action':'spawn','obj': spObj};
    }
  }

  this.pathable = function(){
    var noPass = 0;
    var total = 0;
    for(var s in this.spawn){
      noPass += this.spawn[s].pathable ? 0 : 1;
      total += 1;
    }
    return (noPass < (total/2));
  }

  this.reportPath = function(id,success){
    if(this.spawn[id]){
      this.spawn[id].pathable = success ? true : false;
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

}

HiveQueen = function(x,y) {
  HiveAlien.call(this,x,y);

  this.name = ["Hive","Queen"];
  this.maxHealth = 100; this.currentHealth = 100;
  this.interact = '';
  this.moveAccel = config.gridInterval/2;
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};

  this.findTarget = function(humans){}
  this.interactTarget = function(terrain){}
  this.draw = function(camera,canvasContext){}

}



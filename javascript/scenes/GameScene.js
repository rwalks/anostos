var GameScene = function (strs,trn,shp,nam,bg,als){
  var heroName = nam;
  var sceneUtils = new SceneUtils(bg);
  var stars = strs ? strs : sceneUtils.generateStars();
  this.terrain = trn ? trn : new Terrain();
  var ship = shp;
  var camera = new Camera(5000,6500);
  var mousePos;
  var clockCycle = 0;
  var clockMax = 800;
  var camDX = 0;
  var camDY = 0;
  this.humans = [];
  this.aliens = als ? als : [];
  this.corpses = [];
  this.ammos = [];
  this.count = 0;

  this.player = new Player(ship.position.x,ship.position.y,heroName);

  var buildTarget;
  var focusTarget = this.player;
  var cameraTarget = this.player;

  var timeElapsed = 0;
  var gameOver = false;
  var gamePaused = false;
  var lastPaused = false;
  var messageIndex = 0;

  var gui = new Gui();
  this.uiMode = "select";

  this.inventory = new Inventory();

  this.initialSpawn = function(){
    //spawn player and starting npcs
    this.humans.push(this.player);
    for(var i=0;i<4;i++){
      var x = (Math.random()*(config.gridInterval*6))-(config.gridInterval*3) + ship.position.x;
      var y = ship.position.y;
      this.humans.push( new Npc(x,y) );
    }
    //starting resources
    this.inventory.addItem('metal',250);
  }

  this.keyPress = function(keyCode,keyDown){
    var playerInput = false;
    switch(keyCode){
      case 27:
        //escape
        if(keyDown){
          gamePaused = true;
        }else{
          if(lastPaused){
            gamePaused = false;
            lastPaused = false;
          }else{
            lastPaused = true;
          }
        }
        break;
      case 16:
        //shift
        playerInput = 'fire';
        break;
      case 17:
        //cntrl
        if(keyDown){
          this.focusNextHuman(true);
        }
        break;
      case 32:
        //spacebar - might not work in ie9?
        playerInput = 'jump';
        break;
      case 37:
        //left
        playerInput = 'left';
        break;
      case 39:
        //right
        playerInput = 'right';
        break;
      case 38:
        //up
        playerInput = 'up';
        break;
      case 40:
        //down
        playerInput = 'down';
        break;
    }
    if(playerInput){
      cameraTarget = this.player;
      this.player.setInput(playerInput,keyDown);
    }
  }

  this.update = function(mPos){
    if(!gamePaused){
      timeElapsed += 1;
      mousePos = mPos;
      if(cameraTarget){
        camera.focusOn(cameraTarget.position);
      }
      var ret = false;
      var regenBuildings = false;
      var update = false;
      var deletes = [];

      for (var a = this.ammos.length-1; a >= 0; a--){
        if(this.ammos[a].update(this.terrain)){
          this.ammos.splice(a,1);
        }
      }
      var entityTypes = ['humans','aliens'];
      for(var et = 0; et < entityTypes.length; et++){
        var entityType = entityTypes[et];
        var entityList = this[entityType];
        for (var e = entityList.length-1; e >= 0; e--){
          var entity = entityList[e];
          var oldPos = [entity.position.x,entity.position.y];
          var newPos = false;
          var updateMsg = entity.update(this.terrain);
          if(!entity.dead){
            newPos = [entity.position.x,entity.position.y];
          }
          this.terrain.updateEntityMap(entity,newPos,oldPos);
          update = this.handleEntityUpdate(entityType,updateMsg,e);
          regenBuildings = update || regenBuildings;
        }
      }
      for(var c = this.corpses.length-1; c >= 0; c--){
        var collect = this.corpses[c].update(this.terrain,this.humans);
        if(collect){
          this.loot(this.corpses[c]);
          this.corpses.splice(c,1);
        }
      }
      this.terrain.update(this.humans,this.inventory);
      var npcs = this.humans.slice(1);
      gui.update(focusTarget,npcs,buildTarget,this.uiMode,timeElapsed,this.terrain.resources);
      if(regenBuildings){
        this.terrain.regenBuildings();
      }
    }
    this.count = (this.count > 100) ? 0 : this.count + 1;
  }

  this.handleEntityUpdate = function(eType,update,eIndex){
    var ret = false;
    switch(eType){
      case 'aliens':
        ret = this.handleAlienUpdate(update,eIndex);
        break;
      case 'humans':
        ret = this.handleHumanUpdate(update,eIndex);
        break;
    }
    return ret;
  }

  this.handleHumanUpdate = function(ret,hIndex){
    var reg = false;
    if(ret){
      switch(ret.action){
        case 'delete':
          var obj = ret.obj;
          if(this.terrain.canDestroy(obj)){
            this.addCorpse(obj);
            reg = this.terrain.removeTile(obj);
          }
          break;
        case 'build':
          var obj = ret.obj;
          if(this.terrain.purchase(obj.cost) && this.terrain.isClear(obj)){
            reg = this.terrain.addTile(obj);
          }
          break;
        case 'fire':
          var ammoRet = ret.obj;
          for(var a = 0; a < ammoRet.length; a++){
            this.ammos.push(ammoRet[a]);
          }
          break;
        case 'die':
          this.addCorpse(this.humans[hIndex]);
          this.humans.splice(hIndex,1);
          if(this.humans.length < 1){
            messageIndex = 0;
            gameOver = timeElapsed;
          }
          break;
      }
    }
    return reg;
  }

  this.handleAlienUpdate = function(ret,aIndex){
    var reg = false;
    if(ret){
      switch(ret.action){
        case 'spawn':
          this.aliens.push(ret.obj);
          break;
        case 'delete':
          var obj = ret.obj;
          reg = this.terrain.removeTile(obj);
          break;
        case 'die':
          this.addCorpse(this.aliens[aIndex]);
          this.aliens.splice(aIndex,1);
          break;
      }
    }
    return reg;
  }

  this.loot = function(obj){
    var inv = obj.inventory ? obj.inventory.inv : false;
    if(inv){
      for(i in inv){
        var take = this.inventory.addItem(i,inv[i]);
      }
    }
    inv = obj.cost;
    if(inv){
      for(i in inv){
        this.inventory.addItem(i,Math.floor(inv[i]/2));
      }
    }
  }

  this.click = function(clickPos,rightClick){
    if(rightClick){
      if(this.uiMode != 'select'){
        this.uiMode = 'select';
      }else{
        cameraTarget = this.player;
        focusTarget = this.player;
      }
    }else{
      //left click
      var coords = clickToCoord(clickPos,false);
      var x = coords.x;
      var y = coords.y;
      var guiClick = gui.pointWithin(clickPos.x,clickPos.y);
      if(guiClick){
        var guiRet = gui.click(clickPos,guiClick);
        if(guiRet && guiRet.target){
          if(friendlyObj(guiRet.target)){
            cameraTarget = guiRet.target;
          }
          this.uiMode = "select";
          focusTarget = guiRet.target;
        }else if(guiRet && guiRet.buildTarget){
          buildTarget = guiRet.buildTarget;
        }else if(guiRet && guiRet.action){
          this.uiMode = (guiRet.action == this.uiMode) ? "select" : guiRet.action;
        }
      }else{
        switch(this.uiMode){
          case "select":
            var tCoords = clickToCoord(clickPos,true);
            var tX = tCoords.x;
            var tY = tCoords.y;
            var obj = this.terrain.getEntity(tX,tY);
            if(obj){
              if(!obj.pointWithin(x,y)){
                obj = false;
              }
            }
            if(!obj){
              obj = this.terrain.getTile(tX,tY);
            }
            focusTarget = obj ? obj : focusTarget;
            this.uiMode = "select";
            break;
          case "build":
            if(buildTarget){
              var coords = clickToCoord(clickPos,true);
              var obj = buildTarget.clone(coords);
              this.terrain.placeBuilding(obj);
            }
            break;
        }
      }
    }
  }

  var clickToCoord = function(pos,roundToGrid){
    var x = (pos.x/(config.canvasWidth / config.cX)) + camera.xOff;
    var y = (pos.y/(config.canvasHeight / config.cY)) + camera.yOff;
    if(roundToGrid){
      x = x - (x % config.gridInterval);
      y = y - (y % config.gridInterval);
    }
    return {'x':x,'y':y};
  }

  var friendlyObj = function(obj){
    var ret = false;
    if(obj.type == 'human'){
      ret = true;
    }
    return ret;
  }

  this.draw = function(canvasBufferContext){
    sceneUtils.drawStars(stars, camera, clockCycle, canvasBufferContext);
    sceneUtils.drawBG(camera,clockCycle,canvasBufferContext);
    if(sceneUtils.onScreen(ship,camera)){
      ship.draw(camera,canvasBufferContext);
    }
    this.terrain.draw(canvasBufferContext,camera,this.count);
    var objTypes = [this.aliens,this.corpses,this.humans,this.ammos];
    for(var typ = 0; typ < objTypes.length; typ ++){
      var objs = objTypes[typ];
      for (var o = 0; o < objs.length; o++){
        if(sceneUtils.onScreen(objs[o],camera)){
          objs[o].draw(camera,canvasBufferContext);
        }
      }
    }
    if(gamePaused){
      sceneUtils.drawPause(canvasBufferContext);
    }else{
      if(this.uiMode == "build" && buildTarget){
        var bPos = clickToCoord(mousePos,true);
        var obj = buildTarget.clone(bPos);
        var clear = this.terrain.isClear(obj,this.humans);
        drawBuildCursor(obj,canvasBufferContext,clear);
      }
      if(gameOver){
        this.drawText(gameOverMsg(gameOver),canvasBufferContext);
      }else{
        gui.draw(camera,canvasBufferContext);
      }
    }
  }

  this.focusNextHuman = function(advance){
    if(!focusTarget && this.humans.length){
      focusTarget = this.humans[0];
    }else if(focusTarget && focusTarget.type == 'human'){
      for(var h in this.humans){
        if(this.humans[h] == focusTarget){
          if(advance){
            var next = parseInt(h)+1;
            focusTarget = this.humans[next] ? this.humans[next] : this.humans[0];
          }else{
            focusTarget = (h-1 < 0) ? this.humans[this.humans.length-1] : this.humans[h-1];
          }
          break;
        }
      }
    }
  }

  this.addCorpse = function(corpse){
    if(corpse.inventory || corpse.cost){
      var lootBox = new Corpse(corpse.position,corpse.inventory,corpse.cost);
      this.corpses.push(lootBox);
    }
  }

  var drawBuildCursor = function(obj,canvasBufferContext,clear){
    if(clear){
      canvasBufferContext.fillStyle = "rgba(0,200,10,0.9)";
      canvasBufferContext.strokeStyle="rgba(0,250,20,1.0)";
    }else{
      canvasBufferContext.fillStyle = "rgba(200,0,10,0.9)";
      canvasBufferContext.strokeStyle="rgba(250,0,20,1.0)";
    }
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    var originX = (obj.position.x-camera.xOff)*config.xRatio;
    var originY = (obj.position.y-camera.yOff)*config.yRatio;
    var lX = obj.size.x*config.xRatio;
    var lY = obj.size.y*config.yRatio;
    canvasBufferContext.rect(originX,originY,lX,lY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.drawText = function(msg,canvasBufferContext){
    messageIndex += ((this.count % 5 == 0) && (messageIndex < (msg[0].length+msg[1].length))) ? 1 : 0;
    var x = config.canvasWidth / 14;
    var y = config.canvasHeight * 0.4;
    var fontSize = config.canvasWidth / (msg[0].length * 0.9) ;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.6)";
    canvasBufferContext.strokeStyle="rgba(200,200,200,0.8)";
    canvasBufferContext.rect(x-fontSize,y-fontSize,msg[0].length*0.63*fontSize,3*fontSize);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    canvasBufferContext.font = fontSize + 'px Courier New';
    canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
    if(messageIndex < msg[0].length){
      canvasBufferContext.fillText(msg[0].slice(0,messageIndex),x,y);
    }else{
      canvasBufferContext.fillText(msg[0],x,y);
      canvasBufferContext.fillText(msg[1].slice(0,messageIndex-msg[0].length),x,y+fontSize*1.2);
    }
  }

  var gameOverMsg = function(endTime){
    var totalSecs = Math.floor(endTime / config.fps);
    var minutes = Math.floor(totalSecs / 60);
    var seconds = totalSecs % 60;
    var timeString = (minutes > 9 ? minutes : "0" + minutes) + ":" + (seconds > 9 ? seconds : "0" + seconds);
    return ["All colonists eliminated. Justice: Served","You survived for " +timeString+"."];
  }

  this.initialSpawn();

}

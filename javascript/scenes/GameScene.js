var GameScene = function (strs,trn,shp,nam,bg,als){
  var heroName = nam;
  var sceneUtils = new SceneUtils();
  this.stars = strs ? strs : sceneUtils.generateStars();
  this.bgs = bg ? bg : [];
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
 //     this.humans.push( new Npc(x,y) );
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
        playerInput = 'crouch';
        break;
      case 65:
        //A
        this.player.equipTool('attack');
        break;
      case 83:
        //S
        this.player.equipTool('drill');
        break;
      case 68:
        //D
        this.player.equipTool('repair');
        break;
      case 70:
        //F
        if(keyDown){
          this.player.light = !this.player.light;
        }
        break;
      case 81:
        //Q
        if(keyDown){
         this.terrain.ambientLight = Math.max((this.terrain.ambientLight-0.1),0.01);
        }
        break;
      case 87:
        //W
        if(keyDown){
         this.terrain.ambientLight = Math.min((this.terrain.ambientLight+0.1),1);
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


//UPDATE FUNCTIONS
  this.update = function(mPos){
    if(!gamePaused){
      this.count += 1;
      timeElapsed += 1;
      mousePos = mPos;
      //delayed camera for motion feel
      if(cameraTarget){
        camera.focusOn(cameraTarget.position);
      }
      var ret = false;
      var regenBuildings = false;
      var update = false;
      var deletes = [];

      var newEntityMap = {};
      var entityTypes = ['humans','aliens','ammos','corpses'];
      for(var et = 0; et < entityTypes.length; et++){
        var entityType = entityTypes[et];
        var entityList = this[entityType];
        for (var e = entityList.length-1; e >= 0; e--){
          var entity = entityList[e];
          var updateMsg = entityType == 'corpses' ? entity.update(this.terrain,this.humans) : entity.update(this.terrain);
          if(!entity.dead){
            this.terrain.updateEntityMap(entity,newEntityMap);
            entity.updateLight(this.terrain,camera);
          }
          update = this.handleEntityUpdate(entityType,updateMsg,e);
          regenBuildings = update || regenBuildings;
        }
      }
      this.terrain.entityMap = newEntityMap;
      this.terrain.update(this.humans,this.inventory,this.count);
      var npcs = this.humans.slice(1);
      gui.update(focusTarget,npcs,buildTarget,this.uiMode,timeElapsed,this.terrain.resources,this.player);
      if(regenBuildings){
        this.terrain.regenBuildings();
      }
    }
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
      case 'ammos':
        ret = this.handleAmmoUpdate(update,eIndex);
        break;
      case 'corpses':
        if(update){
          this.loot(this.corpses[eIndex]);
          this.corpses.splice(eIndex,1);
        }
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
          reg = this.terrain.purchaseBuilding(buildTarget,coords);
          break;
        case 'repair':
          reg = ret.built;
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
          if(this.player.dead){
            messageIndex = 0;
            gameOver = timeElapsed;
          }
          break;
      }
    }
    return reg;
  }

  this.handleAmmoUpdate = function(ret,aIndex){
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
        case 'die':
          this.ammos.splice(aIndex,1);
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

///

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
      var guiRet = gui.click(clickPos);
      /*
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
            var obj = false;
            var objs = this.terrain.getEntities(tX,tY);
            if(objs){
              for(var oi = 0; oi < objs.length; oi++){
                var entity = objs[oi];
                if(entity.pointWithin(x,y)){
                  obj = entity;
                  break;
                }
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
              if(this.terrain.purchaseBuilding(buildTarget,coords)){
                this.terrain.regenBuildings();
              }
            }
            break;
        }
      }
      */
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

//DRAWING FUNCTIONS


//  this.camera = camera;
  this.draw = function(canvasHolder){
    var bgCon = canvasHolder.contexts[0];
    var terrainCon = canvasHolder.contexts[1];
    var entityCon = canvasHolder.contexts[2];
    var lightCon = canvasHolder.contexts[3];
    var guiCon = canvasHolder.contexts[4];

    sceneArt.drawStars(this.stars, camera, clockCycle, bgCon);
//    sceneArt.drawBG(camera,this.bgs,clockCycle,bgCon);
//    if(sceneUtils.onScreen(ship,camera)){
//      ship.draw(camera,entityCon);
//    }
//    this.terrain.draw(canvasBufferContext,camera);
//
    //draw tiles and entities
    for(var x=camera.xOff-(camera.xOff%config.gridInterval);x<camera.xOff+config.cX;x+=config.gridInterval){
      for(var y=(camera.yOff-(camera.yOff%config.gridInterval));y<camera.yOff+config.cY;y+=config.gridInterval){
        var til = this.terrain.getTile(x,y);
        if(til){
          til.draw(camera,terrainCon,this.terrain);
        }
        //draw entities
        var entities = this.terrain.getEntities(x,y);
        if(entities){
          for(var e = 0; e < entities.length; e++){
            entities[e].draw(camera,entityCon,this.terrain);
          }
        }
      }
    }
    //draw Light
    this.terrain.drawLights(camera,lightCon);

    if(gamePaused){
      sceneArt.drawPause(guiCon);
    }else{
      if(this.uiMode == "build" && buildTarget){
        var bPos = clickToCoord(mousePos,true);
        var clear = this.terrain.validBuild(buildTarget,bPos);
        sceneArt.drawBuildCursor(buildTarget,bPos,clear,camera,guiCon);
      }
      if(gameOver){
        var msg = gameOverMsg(gameOver);
        messageIndex += ((this.count % 3 == 0) && (messageIndex < (msg[0].length+msg[1].length))) ? 1 : 0;
        sceneArt.drawText(msg,messageIndex,guiCon);
      }else{
        gui.draw(camera,guiCon);
      }
    }
  }

//

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

  var gameOverMsg = function(endTime){
    var totalSecs = Math.floor(endTime / config.fps);
    var minutes = Math.floor(totalSecs / 60);
    var seconds = totalSecs % 60;
    var timeString = (minutes > 9 ? minutes : "0" + minutes) + ":" + (seconds > 9 ? seconds : "0" + seconds);
    return ["You have been eliminated. Justice: Served","You survived for " +timeString+"."];
  }

  this.initialSpawn();

}

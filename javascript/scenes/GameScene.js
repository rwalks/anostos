var GameScene = function (loader){
  var sceneUtils = new SceneUtils();
  this.stars = loader.stars || sceneUtils.generateStars();
  this.world = loader.world || new World();
  var camera = new Camera(5000,6500);
  var mousePos;
  var camDX = 0;
  var camDY = 0;
  this.humans = [];
  this.aliens = [];
  this.corpses = [];
  this.ammos = [];
  this.count = 0;

  var iX = config.mapWidth / 2;
  var iY = config.mapHeight * 0.55;
  this.player = new Player(iX,iY);

  var buildTarget;
  var focusTarget = this.player;
  camera.focusTarget(this.player);

  var timeElapsed = 0;
  var gameOver = false;
  var gamePaused = false;
  var lastPaused = false;
  var messageIndex = 0;

  var gui = new Gui(this.player);
  this.uiMode = "select";

  this.inventory = new Inventory();

  this.init = function(){
    //spawn player and starting npcs
    this.humans.push(this.player);
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
         this.world.ambientLight = Math.max((this.world.ambientLight-0.1),0.01);
        }
        break;
      case 87:
        //W
        if(keyDown){
         this.world.ambientLight = Math.min((this.world.ambientLight+0.1),1);
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
      camera.target = this.player;
      this.player.setInput(playerInput,keyDown);
    }
  }


//UPDATE FUNCTIONS
  this.update = function(mPos){
    if(!gamePaused){
      this.count += 1;
      timeElapsed += 1;
      mousePos = mPos;
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
          var updateMsg = entityType == 'corpses' ? entity.update(this.world,this.humans) : entity.update(this.world);
          if(!entity.dead){
            this.world.updateEntityMap(entity,newEntityMap);
            entity.updateLight(this.world,camera);
          }
          update = this.handleEntityUpdate(entityType,updateMsg,e);
          regenBuildings = update || regenBuildings;
        }
      }
      this.world.entityMap = newEntityMap;
      this.world.update(this.humans,this.inventory,this.count);
      var npcs = this.humans.slice(1);
      gui.update(focusTarget,npcs,buildTarget,this.uiMode,timeElapsed,this.world.resources,this.player);
      if(regenBuildings){
        this.world.regenBuildings();
      }
      camera.update();
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
          if(this.world.canDestroy(obj)){
            this.addCorpse(obj);
            reg = this.world.removeTile(obj);
          }
          break;
        case 'build':
          var obj = ret.obj;
          reg = this.world.purchaseBuilding(buildTarget,coords);
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
          if(this.world.canDestroy(obj)){
            this.addCorpse(obj);
            reg = this.world.removeTile(obj);
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
          reg = this.world.removeTile(obj);
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
        camera.target = this.player;
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
            var objs = this.world.getEntities(tX,tY);
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
              obj = this.world.getTile(tX,tY);
            }
            focusTarget = obj ? obj : focusTarget;
            this.uiMode = "select";
            break;
          case "build":
            if(buildTarget){
              var coords = clickToCoord(clickPos,true);
              if(this.world.purchaseBuilding(buildTarget,coords)){
                this.world.regenBuildings();
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

  this.draw = function(canvasHolder){
    var gameCon = canvasHolder.gameContext;
    var lightCon = canvasHolder.lightContext;
    //draw particles
    this.world.drawRooms(gameCon,camera);
    //draw tiles and entities
    var entDrawList = [];
    var starDrawList = [];
    var oX = utils.roundToGrid(camera.xOff)-config.terrainInterval;
    var oY = utils.roundToGrid(camera.yOff);
    for(var x=oX;x<=camera.xOff+config.cX+config.terrainInterval;x+=config.gridInterval){
      var minY = camera.yOff + config.cY;
      for(var y=oY;y<camera.yOff+config.cY;y+=config.gridInterval){
        var til = this.world.getTile(x,y);
        if(til){
          til.draw(camera,gameCon,this.world);
        }
        //draw entities
        var entities = this.world.getEntities(x,y);
        if(entities){
          entDrawList = entDrawList.concat(entities);
        }
        var plants = this.world.getPlants(x,y);
        if(plants){
          entDrawList = entDrawList.concat(plants);
        }
        var stars = this.world.getStars(x,y,camera);
        if(stars){
          starDrawList = starDrawList.concat(stars);
        }
      }
    }
    //particles
    this.world.drawParticles(camera,gameCon);
    //draw ents
    for(var e = 0; e < entDrawList.length; e++){
      entDrawList[e].draw(camera,gameCon,this.world);
    }
    //draw Light canvas
    this.world.drawLights(camera,lightCon);
    //project light canvas onto game canvas
    gameCon.save();
    gameCon.globalCompositeOperation = 'source-atop';
    gameCon.drawImage(canvasHolder.lightCanvas,0,0);
    gameCon.restore();
    //draw bg
    gameCon.save();
    gameCon.globalCompositeOperation = 'destination-over';
    this.world.drawBg(camera,gameCon);
  /*
    hArt = artHolder.getArt('hill2');
    hPos = new Vector(config.canvasWidth*0.6,config.canvasHeight*0.4);
    hArt.draw(hPos,gameCon,1);
    hArt = artHolder.getArt('hill3');
    hPos = new Vector(config.canvasWidth*0.1,config.canvasHeight*0.4);
    hArt.draw(hPos,gameCon,1);
 */
    this.world.drawStars(starDrawList,camera,gameCon);
    gameCon.restore();
    //
    if(gamePaused){
      sceneArt.drawPause(gameCon);
    }else{
      if(this.uiMode == "build" && buildTarget){
        var bPos = clickToCoord(mousePos,true);
        var clear = this.world.validBuild(buildTarget,bPos);
        sceneArt.drawBuildCursor(buildTarget,bPos,clear,camera,gameCon);
      }
      if(gameOver){
        var msg = gameOverMsg(gameOver);
        messageIndex += ((this.count % 3 == 0) && (messageIndex < (msg[0].length+msg[1].length))) ? 1 : 0;
        sceneArt.drawText(msg,messageIndex,gameCon);
      }else{
        gui.draw(camera,gameCon);
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

  this.init();

}

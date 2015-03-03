var GameScene = function (strs,trn,shp,nam,bg,als){
  var heroName = nam;
  var sceneUtils = new SceneUtils(bg);
  var stars = strs ? strs : sceneUtils.generateStars();
  var terrain = trn ? trn : new Terrain();
  var ship = shp;
  var camera = new Camera(5000,6500);
  camera.focusOn(ship.position);
  var mousePos;
  var clockCycle = 0;
  var clockMax = 800;
  var camDX = 0;
  var camDY = 0;
  var humans = [];
  var aliens = als ? als : [];
  var corpses = [];
  var ammos = [];
  this.count = 0;

  var focusTarget;
  var buildTarget;
  var followTarget = false;

  var timeElapsed = 0;
  var gameOver = false;
  var gamePaused = false;
  var lastPaused = false;
  var messageIndex = 0;

  var debugMode = false;
  var debugLock = false;

  for(var i=0;i<3;i++){
    var x = (Math.random()*(config.gridInterval*6))-(config.gridInterval*3) + ship.position.x;
    var y = ship.position.y;
    humans.push( new Human(x,y) );
  }

  this.player = new Player(ship.position.x,ship.position.y,heroName);
  //starting resources
  this.inventory = new Inventory();
  this.inventory.addItem('metal',250);

  var gui = new Gui();

  this.uiMode = "select";

  this.terrain = function(){return terrain;}


  this.keyPress = function(keyCode,keyDown){
    switch(keyCode){
      case 8:
        debugMode = !debugMode;
        break;
      case 27:
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
        if(keyDown){
          focusNextHuman(false);
        }
        break;
      case 17:
        //cntrl
        if(keyDown){
          focusNextHuman(true);
        }
        break;
      case 32:
        //spacebar - might not work in ie9?
        if(debugMode && keyDown){
          debugLock = false;
        }
        followTarget = keyDown;
        break;
      case 37:
        camera.setMove('left',keyDown);
        break;
      case 39:
        camera.setMove('right',keyDown);
        break;
      case 38:
        camera.setMove('up',keyDown);
        break;
      case 40:
        camera.setMove('down',keyDown);
        break;
    }
  }

  this.update = function(mPos){
    if(!gamePaused && !debugLock){
      timeElapsed += 1;
      mousePos = mPos;
      if(followTarget && focusTarget){
        camera.focusOn(focusTarget.position);
      }
      camera.update(mousePos);
      var ret = false;
      var regenBuildings = false;
      var update = false;
      var deletes = [];

      for (var a = ammos.length-1; a >= 0; a--){
        if(ammos[a].update(terrain,aliens)){
          ammos.splice(a,1);
        }
      }
      for (var h = humans.length-1; h >= 0; h--){
        ret = humans[h].update(terrain);
        update = this.handleHumanUpdate(ret,h);
        regenBuildings = update || regenBuildings;
      }
      for (var a = aliens.length-1; a >= 0; a--){
        ret = aliens[a].update(terrain,humans);
        update = this.handleAlienUpdate(ret,a);
        regenBuildings = update || regenBuildings;
      }
      for(var c = corpses.length-1; c >= 0; c--){
        var collect = corpses[c].update(terrain,humans);
        if(collect){
          this.loot(corpses[c]);
          corpses.splice(c,1);
        }
      }
      terrain.update(humans,this.inventory);
      gui.update(focusTarget,humans,buildTarget,this.uiMode,timeElapsed,terrain.resources);
      if(regenBuildings){
        terrain.regenBuildings();
      }
    }
    this.count = (this.count > 100) ? 0 : this.count + 1;
    debugLock = debugMode ? true : false;
  }

  this.handleHumanUpdate = function(ret,hIndex){
    var reg = false;
    if(ret){
      switch(ret.action){
        case 'delete':
          var obj = ret.obj;
          if(terrain.canDestroy(obj)){
            this.addCorpse(obj);
            reg = terrain.removeTile(obj);
          }
          break;
        case 'build':
          var obj = ret.obj;
          if(terrain.purchase(obj.cost) && terrain.isClear(obj)){
            reg = terrain.addTile(obj);
          }
          break;
        case 'fire':
          var ammoRet = ret.obj;
          for(var a = 0; a < ammoRet.length; a++){
            ammos.push(ammoRet[a]);
          }
          break;
        case 'die':
          this.addCorpse(humans[hIndex]);
          humans.splice(hIndex,1);
          if(humans.length < 1){
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
          aliens.push(ret.obj);
          break;
        case 'delete':
          var obj = ret.obj;
          reg = terrain.removeTile(obj);
          break;
        case 'die':
          this.addCorpse(aliens[aIndex]);
          aliens.splice(aIndex,1);
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
      if(this.uiMode == 'select' && focusTarget){
        var coords = clickToCoord(clickPos,false);
        var obj = false;
        var clickObjs = [aliens];
        for(var typ in clickObjs){
          var objArray = clickObjs[typ];
          for(var o in objArray){
            if(objArray[o].pointWithin(coords.x,coords.y)){
              obj = objArray[o];
              break;
            }
          }
          if(obj){break;}
        }
        coords = clickToCoord(clickPos,true);
        obj = !obj ? terrain.getTile(coords.x,coords.y) : obj;
        focusTarget.click(coords,terrain,'select',obj);
      }else{
        this.uiMode = 'select';
      }
    }else{
      //left click
      var targetFound = false;
      var coords = clickToCoord(clickPos,false);
      var x = coords.x;
      var y = coords.y;
      var guiClick = gui.pointWithin(clickPos.x,clickPos.y);
      if(guiClick){
        var guiRet = gui.click(clickPos,guiClick);
        if(guiRet && guiRet.target){
          if(guiRet.target == focusTarget){
            camera.focusOn(focusTarget.position);
          }else{
            this.uiMode = "select";
            focusTarget = guiRet.target;
          }
        }else if(guiRet && guiRet.buildTarget){
          buildTarget = guiRet.buildTarget;
        }else if(guiRet && guiRet.action){
          this.uiMode = (guiRet.action == this.uiMode) ? "select" : guiRet.action;
        }
      }else{
        switch(this.uiMode){
          case "select":
            var obj = false;
            var clickObjs = [humans,aliens,corpses];
            for(var typ in clickObjs){
              var objArray = clickObjs[typ];
              for(var o in objArray){
                if(objArray[o].pointWithin(x,y)){
                  obj = objArray[o];
                  focusTarget = obj;
                  break;
                }
              }
              if(obj){break;}
            }
            if(!obj){
              var coords = clickToCoord(clickPos,true);
              focusTarget = terrain.getTile(coords.x,coords.y);
            }
            this.uiMode = "select";
            break;
          case "build":
            if(buildTarget){
              var coords = clickToCoord(clickPos,true);
              var obj = buildTarget.clone(coords);
              if(terrain.isClear(obj,humans,corpses)){
                focusTarget.click(coords,terrain,'build',obj);
              }
            }
            break;
          case "delete":
            var coords = clickToCoord(clickPos,true);
            if(terrain.getTile(coords.x,coords.y)){
              focusTarget.click(coords,terrain,'delete',terrain.getTile(coords.x,coords.y));
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

  this.draw = function(canvasBufferContext){
    sceneUtils.drawStars(stars, camera, clockCycle, canvasBufferContext);
    sceneUtils.drawBG(camera,clockCycle,canvasBufferContext);
    if(sceneUtils.onScreen(ship,camera)){
      ship.draw(camera,canvasBufferContext);
    }
    terrain.draw(canvasBufferContext,camera,this.count);
    var objTypes = [aliens,corpses,humans,ammos];
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
        var clear = terrain.isClear(obj,humans);
        drawBuildCursor(obj,canvasBufferContext,clear);
      }else if(this.uiMode == "delete"){
        var bPos = clickToCoord(mousePos,true);
        if(terrain.getTile(bPos.x,bPos.y)){
          drawBuildCursor(terrain.getTile(bPos.x,bPos.y),canvasBufferContext,false);
        }
      }
      if(gameOver){
        this.drawText(gameOverMsg(gameOver),canvasBufferContext);
      }else{
        gui.draw(camera,canvasBufferContext);
      }
    }
  }

  var focusNextHuman = function(advance){
    if(!focusTarget && humans.length){
      focusTarget = humans[0];
    }else if(focusTarget && focusTarget.type == 'human'){
      for(var h in humans){
        if(humans[h] == focusTarget){
          if(advance){
            var next = parseInt(h)+1;
            focusTarget = humans[next] ? humans[next] : humans[0];
          }else{
            focusTarget = (h-1 < 0) ? humans[humans.length-1] : humans[h-1];
          }
          break;
        }
      }
    }
  }

  this.addCorpse = function(corpse){
    if(corpse.inventory || corpse.cost){
      var lootBox = new Corpse(corpse.position,corpse.inventory,corpse.cost);
      corpses.push(lootBox);
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

}

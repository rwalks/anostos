var GameScene = function (strs,trn,shp,nam,bg){
  var heroName = nam;
  var sceneUtils = new SceneUtils(bg);
  var stars = strs ? strs : sceneUtils.generateStars(10000);
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
  var resources= new Resources();
  this.count = 0;

  var focusTarget;
  var buildTarget;

  for(var i=0;i<3;i++){
    var x = (Math.random()*(config.gridInterval*6))-(config.gridInterval*3) + ship.position.x;
    //var y = ship.position.y;
    var y = 6000;
    var name = (i == 0) ? heroName : false;
    humans.push( new Human(x,y,name) );

  }

  var gui = new Gui();

  this.uiMode = "select";

  this.terrain = function(){return terrain;}

  this.keyPress = function(keyCode,keyDown){

  }

  this.update = function(mPos){
    mousePos = mPos;
    camera.update(mousePos);
    var regen = [];
    for (h in humans){
      var ret = humans[h].update(terrain);
      if(ret){
        switch(ret.action){
          case 'delete':
            var obj = ret.obj;
            regen = terrain.removeTile(obj);
            break;
          case 'build':
            var obj = ret.obj;
            if(terrain.isClear(obj,humans)){
              regen = terrain.addTile(obj);
            }
            break;
          case 'inventory':
            this.uiMode = 'trade';
            break;
        }
      }
    }
    terrain.update(humans);
    gui.update(focusTarget,humans,resources.getResources(),buildTarget,this.uiMode);
    for(r in regen){
      if(regen[r] == 'rooms'){
        terrain.regenBuildings();
      }
    }
    this.count = (this.count > 100) ? 0 : this.count + 1;
  }

  this.click = function(clickPos,rightClick){
    if(rightClick){
      if(this.uiMode == 'select' && focusTarget){
        var coords = clickToCoord(clickPos,true);
        var obj = false;
  //      for(h in humans){
  //        if(humans[h].pointWithin(coords.x,coords.y)){
  //          obj = humans[h];
  //        }
  //      }
        obj = !obj ? terrain.getTile(coords.x,coords.y) : obj;
        focusTarget.click(coords,terrain,'move',obj);
      }else{
        this.uiMode = 'select';
      }
    }else{
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
            for(h in humans){
              if(humans[h].pointWithin(x,y)){
                focusTarget = humans[h];
                targetFound = true;
              }
            }
            if(!targetFound){
              var coords = clickToCoord(clickPos,true);
              var x = coords.x;
              var y = coords.y;
              focusTarget = terrain.getTile(x,y);
            }
            this.uiMode = "select";
            break;
          case "build":
            if(buildTarget){
              var coords = clickToCoord(clickPos,true);
              var obj = buildTarget.clone(coords);
              if(terrain.isClear(obj,humans)){
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
    if(onScreen(ship)){
      ship.draw(camera,canvasBufferContext);
    }
    terrain.draw(canvasBufferContext,camera,this.count);
    for (h in humans){
      if(onScreen(humans[h])){
        humans[h].draw(camera,canvasBufferContext);
      }
    }
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
    gui.draw(camera,canvasBufferContext);
  }

  var onScreen = function(obj){
  return obj.position.x > camera.xOff && obj.position.x < camera.xOff + config.cX;
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

}

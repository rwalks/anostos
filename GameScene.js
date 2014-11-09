var GameScene = function (strs){
  var sceneUtils = new SceneUtils();
  var stars = strs ? strs : sceneUtils.generateStars(10000);
  var terrain = sceneUtils.generateTerrain();
  var camera = new Camera(5000,6500);
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

  for(var i=0;i<10;i++){
    var x = Math.random()*config.mapWidth;
    humans.push( new Human(x,6000) );
  }

  var gui = new Gui();

  this.uiMode = "select";

  this.terrain = function(){return terrain;}

  this.update = function(mPos){
    mousePos = mPos;
    camera.update(mousePos);
    for (h in humans){
      humans[h].update(terrain);
    }
    gui.update(focusTarget,humans,resources.getResources(),buildTarget,this.uiMode);
    this.count = (this.count > 100) ? 0 : this.count + 1;
  }

  this.click = function(clickPos,rightClick){
    if(rightClick){
      if(this.uiMode == 'select' && focusTarget){
        var coords = clickToCoord(clickPos,true);
        focusTarget.click(coords,terrain);
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
          if (guiRet.action == "build" || guiRet.action == "delete"){
            this.uiMode = (guiRet.action == this.uiMode) ? "select" : guiRet.action;
          }
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
              focusTarget = terrain[x][y];
            }
            this.uiMode = "select";
            break;
          case "build":
            if(buildTarget){
              var coords = clickToCoord(clickPos,true);
              var obj = buildTarget.clone(coords);
              if(tiles.isClear(obj,terrain,humans)){
                tiles.addTile(obj,terrain);
              }
            }
            break;
          case "delete":
            var coords = clickToCoord(clickPos,true);
            if(terrain[coords.x] && terrain[coords.x][coords.y]){
              tiles.removeTile(terrain[coords.x][coords.y],terrain);
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
    drawMap(canvasBufferContext,this.count);
    for (h in humans){
      humans[h].draw(camera,canvasBufferContext);
    }
    if(this.uiMode == "build" && buildTarget){
      var bPos = clickToCoord(mousePos,true);
      var obj = buildTarget.clone(bPos);
      var clear = tiles.isClear(obj,terrain,humans);
      drawBuildCursor(obj,canvasBufferContext,clear);
    }else if(this.uiMode == "delete"){
      var bPos = clickToCoord(mousePos,true);
      if(terrain[bPos.x] && terrain[bPos.x][bPos.y]){
        drawBuildCursor(terrain[bPos.x][bPos.y],canvasBufferContext,false);
      }
    }
    gui.draw(camera,canvasBufferContext);
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

  var drawMap = function(canvasBufferContext,count){
    if(terrain){
      for(var x=camera.xOff-(camera.xOff%config.gridInterval);x<camera.xOff+config.cX;x+=config.gridInterval){
        if(terrain[x]){
          for(var y=(camera.yOff-(camera.yOff%config.gridInterval));y<camera.yOff+config.cY;y+=config.gridInterval){
            if(terrain[x][y]){
              terrain[x][y].draw(camera,canvasBufferContext,count);
            }
          }
        }
      }
    }
  }

}

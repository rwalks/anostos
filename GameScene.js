var GameScene = function (strs){
  var sceneUtils = new SceneUtils();
  var stars = strs ? strs : sceneUtils.generateStars(10000);
  var terrain = sceneUtils.generateTerrain();
  var camera = new Camera(5000,6500);
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

  this.update = function(mousePos){
    camera.update(mousePos);
    for (h in humans){
      humans[h].update(terrain);
    }
    gui.update(focusTarget,humans,resources.getResources(),buildTarget);
    this.count = (this.count > 100) ? 0 : this.count + 1;
  }

  this.click = function(clickPos,rightClick){
    switch(this.uiMode){
      case "build":
        var coords = clickToCoord(clickPos,true);
        var x = coords.x;
        var y = coords.y;
        if(terrain[x][y]){
          tiles.removeTile(terrain[x][y],terrain);
        }else{
          var t = new tiles.TerrainTile(x,y);
          tiles.addTile(t,terrain);
        }
        break;
      case "select":
        if(rightClick){
          if(focusTarget){
            var coords = clickToCoord(clickPos,true);
            focusTarget.click(coords,terrain);
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
                focusTarget = guiRet.target;
              }
            }
            if(guiRet && guiRet.buildTarget){
              buildTarget = guiRet.buildTarget;
            }
          }else{
            for(h in humans){
              if(humans[h].pointWithin(x,y)){
                focusTarget = humans[h];
                targetFound = true;
              }
            }
            if(targetFound){break;}else{
              var coords = clickToCoord(clickPos,true);
              var x = coords.x;
              var y = coords.y;
              focusTarget = terrain[x][y];
            }
          }
        }
        break;
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
    gui.draw(camera,canvasBufferContext);
  }

  var drawMap = function(canvasBufferContext,count){
    if(terrain){
      for(var x=camera.xOff-(camera.xOff%config.terrainInterval);x<camera.xOff+config.cX;x+=config.terrainInterval){
        for(var y=(camera.yOff-(camera.yOff%config.terrainInterval));y<camera.yOff+config.cY;y+=config.terrainInterval){
          if(terrain[x]&&terrain[x][y]){
            terrain[x][y].draw(camera,canvasBufferContext,count);
          }
        }
      }
    }
  }

}

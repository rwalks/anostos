var LandingScene = function (strs){
  var sceneUtils = new SceneUtils();
  var stars = strs ? strs : sceneUtils.generateStars(10000);
  var terrain = sceneUtils.generateTerrain();
  var camera = new Camera(config.mapWidth/2,0);
  var mousePos;
  var clockCycle = 0;
  var clockMax = 800;
  this.count = 0;
  var ship = new Ship(config.mapWidth/2,0);

  this.terrain = function(){return terrain;}

  this.update = function(mPos){
    camera.focusOn(ship.position);
    ship.update(terrain);
    this.count = (this.count > 100) ? 0 : this.count + 1;
  }

  this.keyPress = function(keyCode,keyDown){
    switch(keyCode){
      case 37:
        ship.rotate(false,keyDown);
        break;
      case 39:
        ship.rotate(true,keyDown);
        break;
      case 38:
        ship.accelerate(keyDown);
        break;
    }

  }

  this.click = function(clickPos,rightClick){
    if(rightClick){
    }else{
    }
  }

  this.endScene = function(){
    document.GameRunner.endScene("landing");
  }

  this.draw = function(canvasBufferContext){
    sceneUtils.drawStars(stars, camera, clockCycle, canvasBufferContext);
    sceneUtils.drawBG(camera,clockCycle,canvasBufferContext);
    ship.draw(camera,canvasBufferContext);
    drawMap(canvasBufferContext,this.count);
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

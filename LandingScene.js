var LandingScene = function (strs){
  var sceneUtils = new SceneUtils();
  this.stars = strs ? strs : sceneUtils.generateStars(10000);
  this.terrain = sceneUtils.generateTerrain();
  var camera = new Camera(config.mapWidth/2,0);
  var mousePos;
  var clockCycle = 0;
  var clockMax = 800;
  this.count = 0;
  var ship = new Ship(config.mapWidth/2,0);
  this.printIndex = 0;
  var startMsg = ["Welcome to Anostos. Attempt landing using the arrow keys.", "We don't have much fuel.."];

  this.update = function(mPos){
    camera.focusOn(ship.position);
    ship.update(this.terrain);
    this.count = (this.count > 10000) ? 0 : this.count + 1;
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

  this.drawFuel = function(canvasBufferContext){
    var sx = config.canvasWidth / 6;
    var sy = config.canvasHeight / 30;
    var x = (config.canvasWidth / 2) - (sx/2);
    var y = 0;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(150,0,200,0.9)";
    canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
    canvasBufferContext.rect(x,y,sx,sy);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    var xBuf = Math.floor(config.xRatio) * 2;
    var yBuf = Math.floor(config.yRatio) * 2;
    var xIndex = x + xBuf;
    var yIndex = y + yBuf;
    //draw gauge
    var xSize = sx-(2*xBuf);
    var ySize = sy-(2*yBuf);
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(xIndex,yIndex,xSize,ySize);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();

    xSize = xSize * (ship.currentFuel / ship.maxFuel);
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,200,50,0.9)";
    canvasBufferContext.strokeStyle="rgba(20,250,75,1.0)";
    canvasBufferContext.rect(xIndex,yIndex,xSize,ySize);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.click = function(clickPos,rightClick){
    if(rightClick){
    }else{
      this.endScene();
    }
  }

  this.endScene = function(){
    document.GameRunner.endScene("landing");
  }

  this.draw = function(canvasBufferContext){
    sceneUtils.drawStars(this.stars, camera, clockCycle, canvasBufferContext);
    sceneUtils.drawBG(camera,clockCycle,canvasBufferContext);
    ship.draw(camera,canvasBufferContext);
    this.drawMap(canvasBufferContext,this.count);
    this.drawFuel(canvasBufferContext);
    if(this.count < 500){
      this.drawText(startMsg,canvasBufferContext);
    }
  }

  this.drawMap = function(canvasBufferContext,count){
    if(this.terrain){
      for(var x=camera.xOff-(camera.xOff%config.gridInterval);x<camera.xOff+config.cX;x+=config.gridInterval){
        if(this.terrain[x]){
          for(var y=(camera.yOff-(camera.yOff%config.gridInterval));y<camera.yOff+config.cY;y+=config.gridInterval){
            if(this.terrain[x][y]){
              this.terrain[x][y].draw(camera,canvasBufferContext,count);
            }
          }
        }
      }
    }
  }

  this.drawText = function(msg,canvasBufferContext){
    this.printIndex += ((this.count % 5 == 0) && (this.printIndex < (msg[0].length+msg[1].length))) ? 1 : 0;
    var x = config.canvasWidth / 14;
    var y = config.canvasHeight * 0.8;
    var fontSize = config.canvasWidth / (msg[0].length * 0.7) ;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.6)";
    canvasBufferContext.strokeStyle="rgba(200,200,200,0.8)";
    canvasBufferContext.rect(x-fontSize,y-fontSize,msg[0].length*0.63*fontSize,3*fontSize);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    canvasBufferContext.font = fontSize + 'px Courier New';
    canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
    if(this.printIndex < msg[0].length){
      canvasBufferContext.fillText(msg[0].slice(0,this.printIndex),x,y);
    }else{
      canvasBufferContext.fillText(msg[0],x,y);
      canvasBufferContext.fillText(msg[1].slice(0,this.printIndex-msg[0].length),x,y+fontSize*1.2);
    }
  }


}

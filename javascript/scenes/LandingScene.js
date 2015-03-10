var LandingScene = function (strs,nam,aud){
  this.heroName = nam;
  this.sceneUtils = new SceneUtils();
  this.stars = strs ? strs : this.sceneUtils.generateStars();
  this.terrain = this.sceneUtils.generateTerrain();
  var camera = new Camera(config.mapWidth/2,0);
  this.aliens = [];
  var mousePos;
  var clockCycle = 0;
  var clockMax = 800;
  this.count = 0;
  this.audio = aud;
  this.audio.play('landing1');
  this.ship = new Ship(config.mapWidth/2,6000,this.audio);
  var startMsg = ["Welcome to Anostos. Attempt landing using the arrow keys.", "We don't have much fuel.."];
  var startIndex = 0;
  var landIndex = 0;
  var gamePaused = false;
  var lastPaused = false;
  var debugMode = false;
  var debugLock = false;


  //add surface spawns
  for(var sp in this.terrain.surfaceSpawns){
    var spPos = this.terrain.surfaceSpawns[sp]
    var nest = new HiveNest(spPos.x,spPos.y-(config.gridInterval*6));
    nest.clearTerrain(this.terrain);
    nest.inventory.addItem('metal',1);
    this.aliens.push(nest);
  }

  this.update = function(mPos){
    if(!gamePaused && !debugLock){
      camera.focusOn(this.ship.position);
      this.ship.update(this.terrain);
      if(this.ship.altitude < 3000){
        this.audio.play("landing2");
      }
      this.count += 1;
    }
    debugLock = debugMode ? true : false;
  }

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
      case 37:
        this.ship.rotate(false,keyDown);
        break;
      case 39:
        this.ship.rotate(true,keyDown);
        break;
      case 38:
        this.ship.accelerate(keyDown);
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

    xSize = xSize * (this.ship.currentFuel / this.ship.maxFuel);
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,200,50,0.9)";
    canvasBufferContext.strokeStyle="rgba(20,250,75,1.0)";
    canvasBufferContext.rect(xIndex,yIndex,xSize,ySize);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.drawAltitude = function(canvasBufferContext){
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

    xSize = xSize * (this.ship.currentFuel / this.ship.maxFuel);
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
      if(this.ship.destroyed){
        this.endScene(false);
      }else if(true){
    //  }else if(this.ship.landed){
        this.endScene(true);
      }
    }
  }

  this.endScene = function(landed){
    this.audio.stop('landing1');
    this.audio.stop('landing2');
    if(landed){
      document.GameRunner.endScene("landing");
    }else{
      document.GameRunner.endScene("dead");
    }
  }

  this.draw = function(canvasBufferContext){
    sceneArt.drawStars(this.stars, camera, clockCycle, canvasBufferContext);
    sceneArt.drawBG(camera,this.sceneUtils.bgs,clockCycle,canvasBufferContext);
    this.ship.draw(camera,canvasBufferContext);
    this.terrain.draw(canvasBufferContext,camera,this.count);

    var objTypes = [this.aliens];
    for(var typ in objTypes){
      var objs = objTypes[typ];
      for (o in objs){
        if(this.sceneUtils.onScreen(objs[o],camera)){
          objs[o].draw(camera,canvasBufferContext);
        }
      }
    }

    if(gamePaused){
      sceneArt.drawPause(canvasBufferContext);
    }else{
      this.drawFuel(canvasBufferContext);
      if(this.count < 500){
        startIndex = this.drawText(startMsg,canvasBufferContext,startIndex);
      }else if(this.ship.destroyed){
        landIndex = this.drawText(crashMsg,canvasBufferContext,landIndex);
      }else if(this.ship.landed){
        landIndex = this.drawText(landedMsg(this.ship),canvasBufferContext,landIndex);
      }
    }
  }

  this.drawText = function(msg,canvasBufferContext,index){
    index += ((this.count % 5 == 0) && (index < (msg[0].length+msg[1].length))) ? 1 : 0;
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
    if(index < msg[0].length){
      canvasBufferContext.fillText(msg[0].slice(0,index),x,y);
    }else{
      canvasBufferContext.fillText(msg[0],x,y);
      canvasBufferContext.fillText(msg[1].slice(0,index-msg[0].length),x,y+fontSize*1.2);
    }
    return index;
  }

  var landedMsg = function(ship){
    var msg;
    if(ship.damaged){
      msg = "Ship landed. Ship systems damaged. Resources reduced. Click to establish base.";
    }else{
      msg = "Ship landed. Ship systems nominal. Click to establish base.";
    }
    return [msg,"Justice: Pending..."];

  }

  var deadMsg = function(){
    var num = Math.floor(Math.random() * 999999);
    return ["Penal Expedition "+num+" Status: Destroyed on landing. Cause: Pilot error.","Justice: Served."]
  }
  var crashMsg = deadMsg();

}

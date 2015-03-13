Gui = function() {

  this.target; this.roster; this.resources;
  this.rosterOffset = 0;

  this.uiMode;

  this.buildTarget;
  this.buildTab = "construction";
  this.buildOffset = 0;

  this.inventoryOffset = 0;

  var timeElapsed;
  var resourceStats;

  this.buildings = {
  "construction":[new Block('soil'),new Block('metal'),new Door()],
  "power":[new ChemicalBattery(),new SolarPanel()],
  "oxygen":[new OxygenTank(),new AirVent(),new OxygenCondenser()],
  "earth":[new DryStorage(),new ConveyorTube(),new SmeltingChamber()],
  "water":[],
  "other":[]
  };

  this.position = function(type){
    var pos = {};
    switch(type){
      case "resourcesLeft":
        pos.x = (config.canvasWidth / 3) - (config.canvasWidth/13.9);
        pos.y = config.canvasHeight * (5/6);
        break;
      case "resourcesRight":
        pos.x = config.canvasWidth * 2/3;
        pos.y = config.canvasHeight * (5/6);
        break;
      case "timer":
        pos.x = config.canvasWidth * 0.025;
        pos.y = config.canvasHeight * 0.1;
        break;
      case "target":
        pos.x = config.canvasWidth / 3;
        pos.y = config.canvasHeight * (5/6);
        break;
      case "build":
        pos.x = config.canvasWidth*0.1;
        pos.y = config.canvasHeight * 0.1;
        break;
      case "roster":
        pos.x = config.canvasWidth * (7/8);
        pos.y = config.canvasHeight * 0.1;
        break;
      case "inventory":
        pos.x = config.canvasWidth *0.1;
        pos.y = config.canvasHeight * 0.1;
        break;
      case "player":
        pos.x = config.canvasWidth * 0.425;
        pos.y = config.canvasHeight * 0.0;
        break;
    }
    return pos;
  }

  this.size = function(type){
    var size = {};
    switch(type){
      case "resources":
        size.x = config.canvasWidth / 14;
        size.y = config.canvasHeight / 6;
        break;
      case "timer":
        size.x = config.canvasWidth / 14;
        size.y = config.canvasHeight / 6 / 4;
        break;
      case "target":
        size.x = config.canvasWidth / 3;
        size.y = config.canvasHeight / 6;
        break;
      case "build":
        size.x = config.canvasWidth / 6;
        size.y = config.canvasHeight * 0.6;
        break;
      case "inventory":
        size.x = config.canvasWidth / 6;
        size.y = config.canvasHeight * 0.6;
        break;
      case "roster":
        size.x = config.canvasWidth / 8;
        size.y = config.canvasHeight * 0.6;
        break;
      case "player":
        size.x = config.canvasWidth * 0.15;
        size.y = config.canvasHeight * 0.1;
        break;
    }
    return size;
  }

  this.click = function(clickPos, target){
    if(target == "roster"){
      var y = clickPos.y - this.position('roster').y;
      var ySize = this.size('roster').y;
      if(y <= ySize/16){
        this.rosterOffset -= (this.rosterOffset > 0) ? 1 : 0;
      }else if(y > ySize/16 && y <= ySize*(15/16)){
        var rosIn = Math.floor(8*((y - ySize/16) / (ySize * (14/16))));
        return {'target':this.roster[rosIn+this.rosterOffset]};
      }else{
        this.rosterOffset += (this.roster.slice(this.rosterOffset).length > 8) ? 1 : 0;
      }
    }else if(target == "build"){
      var x = clickPos.x - this.position('build').x;
      var y = clickPos.y - this.position('build').y;
      var xSize = this.size('build').x;
      var ySize = this.size('build').y;
      var xBuf = Math.floor(config.xRatio) * 2;
      var tabY = ySize/10;
      var tArrowY = tabY + (ySize / 16);
      var objY = ySize - (ySize / 16);
      if(y <= tabY){
        //tabs
        var tX = Math.floor(6*((x - (2*xBuf)) / (xSize - (2*xBuf))));
        if(tX >= 0){
          this.buildTab = Object.keys(this.buildings)[tX];
          this.buildOffset = 0;
        }
      }else if(y <= tArrowY){
        this.buildOffset -= (this.buildOffset > 0) ? 1 : 0;
      }else if(y <= objY){
        var bIn = Math.floor(6*((y - tArrowY) / (objY - tArrowY)));
        return {'buildTarget':this.buildings[this.buildTab][bIn+this.buildOffset].clone()};
      }else{
        this.buildOffset += (this.buildings[this.buildTab].slice(this.buildOffset).length > 6) ? 1 : 0;
      }
    }else if(target == "inventory" && this.target && this.target.inventory){
      var x = clickPos.x - this.position('inventory').x;
      var y = clickPos.y - this.position('inventory').y;
      var xSize = this.size('inventory').x;
      var ySize = this.size('inventory').y;
      var xBuf = Math.floor(config.xRatio) * 2;
      var tabY = ySize/10;
      var tArrowY = tabY + (ySize / 16);
      var objY = ySize - (ySize / 16);
      if(y <= tabY){
        //tabs
        var tX = Math.floor(6*((x - (2*xBuf)) / (xSize - (2*xBuf))));
        if(tX >= 0){
          this.inventoryOffset = 0;
        }
      }else if(y <= tArrowY){
        this.inventoryOffset -= (this.inventoryOffset > 0) ? 1 : 0;
      }else if(y <= objY){
        //clicking on an inventory square
        var invIndex = Math.floor(6*((y - tArrowY) / (objY - tArrowY))) + this.inventoryOffset;
        var resource = Object.keys(this.target.inventory.inv)[invIndex];
        if(resource){
          if(x >= xSize * 0.7 && x < xSize * 0.85){
            //delete
            this.target.inventory.removeItem(resource,1);
          }else if(x >= xSize * 0.85 && x < xSize){
            //trade
            var tradeY = ((objY-tArrowY)/6);
            if(y < tArrowY+(tradeY*invIndex)+(tradeY/2)){
              //trade 1
            }else{
              //trade all
            }
          }
        }
      }else{
        this.inventoryOffset += (Object.keys(this.target.inventory.inv).length > 6) ? 1 : 0;
      }
    }else if(target == "target"){
      if(this.target && this.target.actionButtons){
        var x = clickPos.x - this.position('target').x;
        var xSize = this.size('target').x;
        if(x > xSize - (xSize * 0.21)){
          var y = clickPos.y - this.position('target').y;
          var ySize = this.size('target').y;
          var yBuf = Math.floor(config.xRatio) * 2;
          var aY = Math.floor(4*((y - (2*yBuf)) / (ySize - (2*yBuf))));
          if(aY >= 0){
            return {'action':this.target.actionButtons[aY]};
          }
        }
      }
    }
  }

  this.update = function(target,humans,buildTarget,uiMode,deltaT,rStats,player){
    this.target = target;
    this.roster = humans;
    this.buildTarget = buildTarget;
    this.uiMode = uiMode;
    this.player = player;
    timeElapsed = deltaT;
    resourceStats = rStats;
  }


  this.pointWithin = function(x,y){
    if (x > this.position('target').x && x < (this.position('target').x + this.size('target').x) &&
        y > this.position('target').y && y < (this.position('target').y + this.size('target').y)){
          return "target";
        }
    else if (x > this.position('roster').x && x < (this.position('roster').x + this.size('roster').x) &&
        y > this.position('roster').y && y < (this.position('roster').y + this.size('roster').y)){
          return "roster";
        }
    else if ( this.uiMode == 'build' &&
        x > this.position('build').x && x < (this.position('build').x + this.size('build').x) &&
        y > this.position('build').y && y < (this.position('build').y + this.size('build').y)){
          return "build";
        }
    else if ( (this.uiMode == 'inventory') &&
        x > this.position('inventory').x && x < (this.position('inventory').x + this.size('inventory').x) &&
        y > this.position('inventory').y && y < (this.position('inventory').y + this.size('inventory').y)){
          return "inventory"
        };
    return false;
  }


  this.draw = function(camera,canvasBufferContext){
    if(this.uiMode == 'build'){
     // this.drawGrid(camera,canvasBufferContext);
      this.drawBuild(this.size("build"),this.position("build"),canvasBufferContext);
    }else if(this.uiMode == 'inventory'){
      this.drawInventory(canvasBufferContext);
    };
    this.drawResources(canvasBufferContext);
    this.drawTarget(this.size("target"),this.position("target"),canvasBufferContext);
    this.drawRoster(this.size("roster"),this.position("roster"),canvasBufferContext);
    this.drawTimer(this.size("timer"),this.position("timer"),canvasBufferContext);
    this.drawPlayer(this.size("player"),this.position("player"),canvasBufferContext);
  }

  this.drawTimer = function(size,pos,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(150,0,200,0.9)";
    canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
    canvasBufferContext.rect(pos.x,pos.y,size.x,size.y);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    var xBuf = Math.floor(config.xRatio) * 2;
    var yBuf = Math.floor(config.yRatio) * 2;
    var xIndex = pos.x + xBuf;
    var yIndex = pos.y + yBuf;
    var xSize = size.x-(2*xBuf);
    var ySize = size.y-(2*yBuf);
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(xIndex,yIndex,xSize,ySize);
    canvasBufferContext.fill();
    if(timeElapsed){
      var totalSecs = Math.floor(timeElapsed / config.fps);
      var minutes = Math.floor(totalSecs / 60);
      var seconds = totalSecs % 60;
      var secondString = seconds > 9 ? seconds : "0"+seconds;
      var minuteString = (minutes > 9 ? minutes : "0"+minutes) + ":";

      var fontSize = Math.min(config.xRatio * 10, config.yRatio*10);
      var x = pos.x + (size.x * 0.16);
      var y = pos.y + (size.y * 0.65);
      canvasBufferContext.font = fontSize + 'px Courier';
      canvasBufferContext.fillStyle = "rgba(100,190,250,0.8)";
      canvasBufferContext.fillText(minuteString,x,y);
      x = pos.x + (size.x * 0.55);
      canvasBufferContext.fillText(secondString,x,y);
    }

  }

  this.drawPlayer = function(size,pos,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(150,0,200,0.9)";
    canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
    canvasBufferContext.rect(pos.x,pos.y,size.x,size.y);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    var xBuf = Math.floor(config.xRatio) * 2;
    var yBuf = Math.floor(config.yRatio) * 2;
    var xIndex = pos.x + xBuf;
    var yIndex = pos.y + yBuf;
    var xSize = size.x-(2*xBuf);
    var ySize = size.y-(2*yBuf);
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(xIndex,yIndex,xSize,ySize);
    canvasBufferContext.fill();
    //draw portrait
    var xSize = size.x * 0.5;
    var ySize = size.y-(2*yBuf);
    var pX = pos.x + (size.x / 4);
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
    canvasBufferContext.rect(pX,0,xSize,size.y);
    canvasBufferContext.stroke();
    if(this.player){
      this.player.drawTargetPortrait(pX,0,xSize,ySize,canvasBufferContext);
    }
  }

  this.drawGrid = function(camera,canvasBufferContext){
    canvasBufferContext.strokeStyle = "rgba(0,200,250,1.0)";
    var x = - camera.xOff % config.gridInterval;
    for(x;x<config.canvasWidth;x+=config.gridInterval*config.xRatio){
      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(x,0);
      canvasBufferContext.lineTo(x,config.canvasHeight);
      canvasBufferContext.stroke();
    }
    var y = - camera.yOff % config.gridInterval;
    for(y;y<config.canvasHeight;y+=config.gridInterval*config.yRatio){
      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(0,y);
      canvasBufferContext.lineTo(config.canvasWidth,y);
      canvasBufferContext.stroke();
    }
  }

  var resourceStrings = {'power':'Power','soil':'Soil','ore':'Ore','metal':'Metal',
                         'bio':'Biomass','xeno':'Xenomat','rad':'Rad Ore','fissile':'Fissile'};

  var resourceColors = {'power':'rgba(250,250,0,','soil':'rgba(20,200,250,','ore':'rgba(110,100,130,','metal':'rgba(150,140,170,',
                         'bio':'rgba(0,250,0,','xeno':'rgba(150,250,0,','rad':'rgba(250,100,0,','fissile':'rgba(200,10,150,'};

  this.drawResources = function(canvasBufferContext){
    var sides = ['resourcesLeft','resourcesRight'];
    var resourceTypes = [['power','soil','ore','metal'],['bio','xeno','rad','fissile']];
    for(var s = 0; s < sides.length; s++){
      var size = this.size('resources');
      var pos = this.position(sides[s]);
      //draw background
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(0,0,0,0.7)";
      canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
      canvasBufferContext.rect(pos.x,pos.y,size.x,size.y);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //resources
      var types = resourceTypes[s];
      var xBuf = Math.floor(config.xRatio) * 2;
      var yBuf = Math.floor(config.yRatio) * 2;
      var xIndex = pos.x + xBuf;
      var yIndex = pos.y + yBuf;
      var xSize = size.x-(2*xBuf);
      var ySize = (size.y - (yBuf * 2)) / types.length;
      for(var rT = 0; rT < types.length; rT++){
        var rColor = resourceColors[types[rT]];
        canvasBufferContext.beginPath();
        canvasBufferContext.lineWidth = Math.floor(config.xRatio)+"";
        canvasBufferContext.fillStyle = rColor + "0.5)";
        canvasBufferContext.strokeStyle = rColor + "0.9)";
        canvasBufferContext.rect(xIndex,yIndex,xSize,ySize);
        canvasBufferContext.stroke();
        canvasBufferContext.fill();
        if(resourceStats){
          var stats = resourceStats[types[rT]];
          var percentFull = Math.min(stats.current / stats.max, 1);
          var powerString = resourceStrings[types[rT]];
          var fontSize = Math.min(config.xRatio * 7, config.yRatio*7);
          var x = xIndex + (xBuf*2);
          var y = yIndex + fontSize + yBuf;
          //fill percentage
          canvasBufferContext.beginPath();
          canvasBufferContext.fillStyle = rColor + "0.8)";
          var xS = xSize * percentFull;
          canvasBufferContext.rect(xIndex,yIndex,xS,ySize);
          canvasBufferContext.fill();
          //text
          canvasBufferContext.font = fontSize + 'px Courier';
          var textFill = "rgba(0,0,0,1.0)";
          if(stats.current < 1){
            textFill = "rgba(100,190,250,0.8)";
          }else if(percentFull >= 1){
            textFill = "rgba(250,0,0,0.8)";
          }
          canvasBufferContext.fillStyle = textFill;
          canvasBufferContext.fillText(powerString,x,y);
        }
        yIndex += ySize;
      }
    }
  }

  this.drawTarget = function(size,pos,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(150,0,200,0.9)";
    canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
    canvasBufferContext.rect(pos.x,pos.y,size.x,size.y);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    var xBuf = Math.floor(config.xRatio) * 2;
    var yBuf = Math.floor(config.yRatio) * 2;
    var xIndex = pos.x + xBuf;
    var yIndex = pos.y + yBuf;
    //draw portrait
    var xSize = size.x*0.3;
    var ySize = size.y-(2*yBuf);
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(xIndex,yIndex,xSize,ySize);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    if(this.target){
      this.target.drawTargetPortrait(xIndex,yIndex,xSize,ySize,canvasBufferContext);
    }
    //draw stats
    xIndex += (xSize + (xBuf *1.5));
    xSize = xSize * 1.8;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(xIndex,yIndex,xSize,ySize);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    if(this.target){
      var fontSize = size.y / 10;
      canvasBufferContext.font = fontSize + 'px Courier';
      canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
      var yText = yIndex + fontSize + yBuf;
      canvasBufferContext.fillText(this.target.name.first+" "+this.target.name.last,xIndex+xBuf,yText);
      yText += fontSize + yBuf;
      canvasBufferContext.fillText("Position: "+Math.floor(this.target.position.x)+", "+Math.floor(this.target.position.y),xIndex+xBuf,yText);
      yText += fontSize + yBuf;
      if(this.target.genInput && this.target.genOutput){
        var inputString = [];
        for(i in this.target.genInput){
          inputString.push(i + ' '+this.target.genInput[i]);
        }
        inputString = inputString.join(",");
        canvasBufferContext.fillText("Input: "+inputString,xIndex+xBuf,yText);
        yText += fontSize + yBuf;
        var outputString = [];
        for(i in this.target.genOutput){
          outputString.push(i + '-'+this.target.genOutput[i]);
        }
        outputString = outputString.join(",");
        canvasBufferContext.fillText("Output: "+outputString,xIndex+xBuf,yText);
        yText += fontSize + yBuf;
      }
      if(this.target.powerReq){
        canvasBufferContext.fillText("Power: "+this.target.powerReq,xIndex+xBuf,yText);
        yText += fontSize + yBuf;
      }
    }
    //draw action buttons
    xIndex += (xSize + (xBuf *1.5));
    xSize = xSize * 0.21;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(xIndex,yIndex,xSize,ySize);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    var aX = xIndex + xBuf;
    var aY = yIndex + yBuf;
    var aXSize = xSize - (2*xBuf);
    var aYSize = ((ySize) / 4) - (2*yBuf);
    var lineWidth = Math.min(config.xRatio,config.yRatio);
    var buttonSize = Math.min(aXSize,aYSize);
    if(this.target && this.target.actionButtons){
      for(i in this.target.actionButtons){
        var cX = aX + (aXSize / 2);
        var cY = aY + (aYSize / 2);
        canvasBufferContext.lineWidth = lineWidth;
        canvasBufferContext.beginPath();
        var aRed = (this.target.actionButtons[i] == this.uiMode) ? 200 : 0;
        canvasBufferContext.fillStyle = "rgba("+aRed+",50,100,0.9)";
        canvasBufferContext.strokeStyle="rgba("+aRed+",50,175,1.0)";
        canvasBufferContext.rect(aX,aY,aXSize,aYSize);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        switch(this.target.actionButtons[i]){
          case "build":
            canvasBufferContext.fillStyle = "rgba(250,250,250,0.9)";
            canvasBufferContext.strokeStyle="rgba(250,250,250,1.0)";
            canvasBufferContext.beginPath();
            canvasBufferContext.moveTo(cX + (buttonSize * -0.3), cY + (buttonSize * 0.3));
            canvasBufferContext.lineTo(cX + (buttonSize * -0.2), cY + (buttonSize * 0.3));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.1), cY + (buttonSize * 0.0));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.3), cY + (buttonSize * 0.0));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.3), cY + (buttonSize * -0.2));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.2), cY + (buttonSize * -0.1));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.1), cY + (buttonSize * -0.2));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.2), cY + (buttonSize * -0.3));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.0), cY + (buttonSize * -0.3));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.0), cY + (buttonSize * -0.1));
            canvasBufferContext.lineTo(cX + (buttonSize * -0.3), cY + (buttonSize * 0.2));
            canvasBufferContext.lineTo(cX + (buttonSize * -0.3), cY + (buttonSize * 0.3));
            canvasBufferContext.fill();
            canvasBufferContext.stroke();
            break;
          case "inventory":
            canvasBufferContext.fillStyle = "rgba(250,250,250,0.9)";
            canvasBufferContext.strokeStyle="rgba(250,250,250,1.0)";
            //crates
            canvasBufferContext.beginPath();
            canvasBufferContext.rect(cX + (buttonSize * -0.1), cY + (buttonSize * -0.3),buttonSize*0.2,buttonSize*0.2);
            canvasBufferContext.fill();
            canvasBufferContext.stroke();
            canvasBufferContext.beginPath();
            canvasBufferContext.rect(cX + (buttonSize * -0.3), cY + (buttonSize * 0.1),buttonSize*0.2,buttonSize*0.2);
            canvasBufferContext.fill();
            canvasBufferContext.stroke();
            canvasBufferContext.beginPath();
            canvasBufferContext.rect(cX + (buttonSize * 0.1), cY + (buttonSize * 0.1),buttonSize*0.2,buttonSize*0.2);
            canvasBufferContext.fill();
            canvasBufferContext.stroke();
            //sides
            canvasBufferContext.beginPath();
            canvasBufferContext.rect(cX + (buttonSize * -0.4), cY + (buttonSize * -0.4),buttonSize*0.03,buttonSize*0.8);
            canvasBufferContext.fill();
            canvasBufferContext.stroke();
            canvasBufferContext.beginPath();
            canvasBufferContext.rect(cX + (buttonSize * -0.4), cY + (buttonSize * 0.4),buttonSize*0.8,buttonSize*0.03);
            canvasBufferContext.fill();
            canvasBufferContext.stroke();
            canvasBufferContext.beginPath();
            canvasBufferContext.rect(cX + (buttonSize * 0.4), cY + (buttonSize * -0.4),buttonSize*0.03,buttonSize*0.83);
            canvasBufferContext.fill();
            canvasBufferContext.stroke();
            break;
          case "delete":
            canvasBufferContext.strokeStyle="rgba(250,250,250,1.0)";
            canvasBufferContext.beginPath();
            canvasBufferContext.moveTo(cX + (buttonSize * -0.2), cY + (buttonSize * 0.2));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.2), cY + (buttonSize * -0.2));
            canvasBufferContext.stroke();
            canvasBufferContext.beginPath();
            canvasBufferContext.moveTo(cX + (buttonSize * -0.2), cY + (buttonSize * -0.2));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.2), cY + (buttonSize * 0.2));
            canvasBufferContext.stroke();

            canvasBufferContext.lineWidth = lineWidth;
            canvasBufferContext.beginPath();
            canvasBufferContext.rect(cX + (buttonSize * -0.3), cY + (buttonSize * -0.3),buttonSize*0.6,buttonSize*0.6);
            canvasBufferContext.stroke();
            break;
          case "select":
            canvasBufferContext.strokeStyle="rgba(250,250,250,1.0)";
            canvasBufferContext.beginPath();
            canvasBufferContext.moveTo(cX + (buttonSize * -0.3), cY + (buttonSize * 0.0));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.3), cY + (buttonSize * 0.0));
            canvasBufferContext.stroke();
            canvasBufferContext.beginPath();
            canvasBufferContext.moveTo(cX + (buttonSize * 0.0), cY + (buttonSize * -0.3));
            canvasBufferContext.lineTo(cX + (buttonSize * 0.0), cY + (buttonSize * 0.3));
            canvasBufferContext.stroke();

            canvasBufferContext.lineWidth = lineWidth;
            canvasBufferContext.beginPath();
            var circRad = buttonSize * 0.2;
            canvasBufferContext.arc(cX,cY,circRad,0,2*Math.PI,false);
            canvasBufferContext.stroke();
            break;
        }
        aY += aYSize + (2*yBuf);
      }
    }
  }

  this.drawRoster = function(size,pos,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(150,0,200,0.9)";
    canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
    canvasBufferContext.rect(pos.x,pos.y,size.x,size.y);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    var xBuf = Math.floor(config.xRatio) * 2;
    var yBuf = Math.floor(config.yRatio) * 2;
    var x = pos.x + xBuf;
    var y = pos.y + yBuf;
    var xSize = size.x - (2*xBuf);
    var yArrow = (size.y / 16) - (2*yBuf);
    var ySize = ((size.y - ((yArrow + 2*yBuf)*2)) / 8) - (yBuf*2);
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.6)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(x,y,xSize,yArrow);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //arrow
    canvasBufferContext.beginPath();
    var aRed = (this.rosterOffset > 0) ? 200 : 100;
    canvasBufferContext.fillStyle = "rgba("+aRed+",0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba("+aRed+",0,75,1.0)";
    canvasBufferContext.moveTo(x+(xSize*0.4),y+yArrow-yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.5),y+yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.6),y+yArrow-yBuf);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    y += yArrow + (2*yBuf);
    for(var i = 0;i<8;i++){
      var plr = this.roster[i+this.rosterOffset];
      var aRed = (this.target && plr == this.target) ? 100 : 20;
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = "rgba("+aRed+",0,50,0.9)";
      canvasBufferContext.strokeStyle="rgba("+aRed+",0,75,1.0)";
      canvasBufferContext.rect(x,y,xSize,ySize);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      if(plr){
        plr.drawRosterPortrait(x,y,xSize,ySize,canvasBufferContext);
        var fontSize = ySize / 4;
        canvasBufferContext.font = fontSize + 'px Courier';
        canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
        canvasBufferContext.fillText(plr.name.first[0]+"."+plr.name.last,x+(xSize/4),y+fontSize+yBuf);
        //health bar
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = "rgba(50,0,20,0.6)";
        canvasBufferContext.strokeStyle="rgba(250,0,20,1.0)";
        canvasBufferContext.rect(x+(xSize/4),y+(ySize*0.4),xSize/2,ySize/6);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = "rgba(200,0,50,0.6)";
        canvasBufferContext.rect(x+(xSize/4),y+(ySize*0.4),xSize/2*(plr.currentHealth/plr.maxHealth),ySize/6);
        canvasBufferContext.fill();
        //oxygen bar
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = "rgba(50,50,50,0.6)";
        canvasBufferContext.strokeStyle="rgba(250,250,250,1.0)";
        canvasBufferContext.rect(x+(xSize/4),y+(ySize*0.6),xSize/2,ySize/6);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
        canvasBufferContext.rect(x+(xSize/4),y+(ySize*0.6),xSize/2*(plr.currentOxygen/plr.maxOxygen),ySize/6);
        canvasBufferContext.fill();
      }
      y += ySize + (2*yBuf);
    }
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.6)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(x,y,xSize,yArrow);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //arrow
    canvasBufferContext.beginPath();
    var aRed = (this.roster.slice(this.rosterOffset).length > 8) ? 200 : 100;
    canvasBufferContext.fillStyle = "rgba("+aRed+",0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba("+aRed+",0,75,1.0)";
    canvasBufferContext.moveTo(x+(xSize*0.4),y+yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.5),y+yArrow-yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.6),y+yBuf);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.drawBuild = function(size,pos,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(150,0,200,0.9)";
    canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
    canvasBufferContext.rect(pos.x,pos.y,size.x,size.y);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    var xBuf = Math.floor(config.xRatio) * 2;
    var yBuf = Math.floor(config.yRatio) * 2;
    var x = pos.x + xBuf;
    var y = pos.y + yBuf;
    var xSize = size.x - (2*xBuf);
    var yArrow = (size.y / 16) - (2*yBuf);
    var yTab = (size.y / 10) - (2*yBuf);
    var ySize = ((size.y - (yArrow*2) - yTab - (yBuf*6))/6)-(2*yBuf);
    //tabs
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.6)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(x,y,xSize,yTab);
    canvasBufferContext.fill();
    var bX = x+xBuf;
    var bXInt = xSize / Object.keys(this.buildings).length;
    for(b in this.buildings){
      var currentTab = (b == this.buildTab);
       switch(b){
        case "power":
          drawPower(canvasBufferContext,bX,y+yBuf,bXInt-(2*xBuf),yTab-(2*yBuf),currentTab);
          break;
        case "oxygen":
          canvasBufferContext.fillStyle = "rgba(250,250,250,0.9)";
          drawPower(canvasBufferContext,bX,y+yBuf,bXInt-(2*xBuf),yTab-(2*yBuf),currentTab);
          break;
        case "water":
          canvasBufferContext.fillStyle = "rgba(0,0,250,0.9)";
          drawPower(canvasBufferContext,bX,y+yBuf,bXInt-(2*xBuf),yTab-(2*yBuf),currentTab);
          break;
        case "earth":
          canvasBufferContext.fillStyle = "rgba(20,250,100,0.9)";
          drawPower(canvasBufferContext,bX,y+yBuf,bXInt-(2*xBuf),yTab-(2*yBuf),currentTab);
          break;
        case "construction":
          canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
          drawPower(canvasBufferContext,bX,y+yBuf,bXInt-(2*xBuf),yTab-(2*yBuf),currentTab);
          break;
        case "other":
          canvasBufferContext.fillStyle = "rgba(250,50,50,0.9)";
          drawPower(canvasBufferContext,bX,y+yBuf,bXInt-(2*xBuf),yTab-(2*yBuf),currentTab);
          break;
       }
       bX += bXInt;
    }
   canvasBufferContext.stroke();
    y += yTab + (2*yBuf);
    //arrow
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.6)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(x,y,xSize,yArrow);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    canvasBufferContext.beginPath();
    var aRed = (this.buildOffset > 0) ? 200 : 100;
    canvasBufferContext.fillStyle = "rgba("+aRed+",0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba("+aRed+",0,75,1.0)";
    canvasBufferContext.moveTo(x+(xSize*0.4),y+yArrow-yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.5),y+yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.6),y+yArrow-yBuf);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    y += yArrow + (2*yBuf);
    //objs
    for(var i = 0;i<6;i++){
      var build = this.buildings[this.buildTab][i+this.buildOffset];
      var canAfford = true;
      var costString = "";
      if(build){
        var costKeys = Object.keys(build.cost);
        for(var cInd = 0; cInd < costKeys.length; cInd ++){
          var reso = costKeys[cInd];
          costString += reso + ": " + build.cost[reso]+" ";
          var rQuant = resourceStats[reso] ? resourceStats[reso].current : 0;
          if(rQuant < build.cost[reso]){
            canAfford = false;
          }
        }
      }
      canvasBufferContext.beginPath();
      if(!canAfford){
        canvasBufferContext.fillStyle = "rgba(100,0,50,0.9)";
        canvasBufferContext.strokeStyle="rgba(100,0,75,1.0)";
      }else if(this.buildTarget && build == this.buildTarget){
        canvasBufferContext.fillStyle = "rgba(20,0,120,0.9)";
        canvasBufferContext.strokeStyle="rgba(20,0,150,1.0)";
      }else{
        canvasBufferContext.fillStyle = "rgba(20,0,50,0.9)";
        canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
      }
      canvasBufferContext.rect(x,y,xSize,ySize);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      if(build){
        build.drawTargetPortrait(x,y,xSize/4,ySize,canvasBufferContext);
        var fontSize = ySize / 4;
        //name
        canvasBufferContext.font = fontSize + 'px Courier';
        canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
        canvasBufferContext.fillText(build.name.first+" "+build.name.last,x+(xSize/4),y+fontSize+yBuf);
        //cost
        canvasBufferContext.font = fontSize*0.75 + 'px Courier';
        canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
        canvasBufferContext.fillText(costString,x+(xSize/4),y+ySize*0.5);
      }
      y += ySize + (2*yBuf);
    }
    //arrow
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.6)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(x,y,xSize,yArrow);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    canvasBufferContext.beginPath();
    var aRed = (this.buildings[this.buildTab].slice(this.buildOffset).length > 6) ? 200 : 100;
    canvasBufferContext.fillStyle = "rgba("+aRed+",0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba("+aRed+",0,75,1.0)";
    canvasBufferContext.moveTo(x+(xSize*0.4),y+yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.5),y+yArrow-yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.6),y+yBuf);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();

  }

  this.drawInventory = function(canvasBufferContext){
    var size = this.size('inventory');
    var pos = this.position('inventory');
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(150,0,200,0.9)";
    canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
    canvasBufferContext.rect(pos.x,pos.y,size.x,size.y);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    var xBuf = Math.floor(config.xRatio) * 2;
    var yBuf = Math.floor(config.yRatio) * 2;
    var x = pos.x + xBuf;
    var y = pos.y + yBuf;
    var xSize = size.x - (2*xBuf);
    var yArrow = (size.y / 16) - (2*yBuf);
    var yTab = (size.y / 10) - (2*yBuf);
    var ySize = ((size.y - (yArrow*2) - yTab - (yBuf*6))/6)-(2*yBuf);
    //tabs
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.6)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(x,y,xSize,yTab);
    canvasBufferContext.fill();
   canvasBufferContext.stroke();
    y += yTab + (2*yBuf);
    //arrow
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.6)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(x,y,xSize,yArrow);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    canvasBufferContext.beginPath();
    var aRed = (this.inventoryOffset > 0) ? 200 : 100;
    canvasBufferContext.fillStyle = "rgba("+aRed+",0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba("+aRed+",0,75,1.0)";
    canvasBufferContext.moveTo(x+(xSize*0.4),y+yArrow-yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.5),y+yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.6),y+yArrow-yBuf);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    y += yArrow + (2*yBuf);
    //objs
    for(var i = 0;i<6;i++){
      var invKey = Object.keys(this.target.inventory.inv)[i];
      var invCount = this.target.inventory.inv[invKey];
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = "rgba(20,0,50,0.9)";
      canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
      canvasBufferContext.rect(x,y,xSize,ySize);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      if(invCount){
    //    invItem.drawTargetPortrait(x,y,xSize/4,ySize,canvasBufferContext);
        var fontSize = ySize / 4;
        canvasBufferContext.font = fontSize + 'px Courier';
        canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
        canvasBufferContext.fillText(invKey,x+(xSize/4),y+fontSize+yBuf);
//count
        var fontSize = ySize / 4;
        canvasBufferContext.font = fontSize + 'px Courier';
        canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
        canvasBufferContext.fillText(invCount,x+(xSize/2),y+fontSize+yBuf);

        //draw delete
        //
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = "rgba(20,50,100,0.9)";
        canvasBufferContext.strokeStyle="rgba(20,50,175,1.0)";
        canvasBufferContext.rect(x+(xSize*0.7),y,xSize*0.15,ySize);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();

        canvasBufferContext.strokeStyle="rgba(250,250,250,1.0)";
        canvasBufferContext.fillStyle="rgba(250,250,250,1.0)";
        canvasBufferContext.lineWidth=xBuf;
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(x + (xSize * 0.72), y + (ySize * 0.3));
        canvasBufferContext.lineTo(x + (xSize * 0.83), y + (ySize * 0.7));
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(x + (xSize * 0.83), y + (ySize * 0.3));
        canvasBufferContext.lineTo(x + (xSize * 0.72), y + (ySize * 0.7));
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        //draw trade arrow
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = "rgba(0,50,100,0.9)";
        canvasBufferContext.strokeStyle="rgba(0,50,175,1.0)";
        canvasBufferContext.rect(x+(xSize*0.85),y,xSize*0.15,ySize/2);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();

        var tAlpha = ("trade" == this.uiMode) ? 1 : 0.5;
        var aRed = ("trade" == this.uiMode) ? 250 : 20;
        canvasBufferContext.strokeStyle="rgba("+aRed+","+aRed+","+aRed+","+tAlpha+")";
        canvasBufferContext.fillStyle="rgba("+aRed+","+aRed+","+aRed+","+tAlpha+")";
        canvasBufferContext.lineWidth=xBuf;
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(x + (xSize * 0.86), y + (ySize * 0.25));
        canvasBufferContext.lineTo(x + (xSize * 0.99), y + (ySize * 0.25));
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(x + (xSize * 0.99), y + (ySize * 0.25));
        canvasBufferContext.lineTo(x + (xSize * 0.93), y + (ySize * 0.15));
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(x + (xSize * 0.99), y + (ySize * 0.25));
        canvasBufferContext.lineTo(x + (xSize * 0.93), y + (ySize * 0.35));
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        //draw trade ALL
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = "rgba(0,50,100,0.9)";
        canvasBufferContext.strokeStyle="rgba(0,50,175,1.0)";
        canvasBufferContext.rect(x+(xSize*0.85),y+ySize*0.5,xSize*0.15,ySize/2);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();

        var tAlpha = ("trade" == this.uiMode) ? 1 : 0.5;
        var aRed = ("trade" == this.uiMode) ? 250 : 20;
        canvasBufferContext.strokeStyle="rgba("+aRed+","+aRed+","+aRed+","+tAlpha+")";
        canvasBufferContext.fillStyle="rgba("+aRed+","+aRed+","+aRed+","+tAlpha+")";
        canvasBufferContext.lineWidth=xBuf;
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(x + (xSize * 0.87), y + (ySize * 0.65));
        canvasBufferContext.lineTo(x + (xSize * 0.87), y + (ySize * 0.85));
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(x + (xSize * 0.87), y + (ySize * 0.75));
        canvasBufferContext.lineTo(x + (xSize * 0.99), y + (ySize * 0.75));
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(x + (xSize * 0.99), y + (ySize * 0.75));
        canvasBufferContext.lineTo(x + (xSize * 0.93), y + (ySize * 0.65));
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        canvasBufferContext.beginPath();
        canvasBufferContext.moveTo(x + (xSize * 0.99), y + (ySize * 0.75));
        canvasBufferContext.lineTo(x + (xSize * 0.93), y + (ySize * 0.85));
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
      }
      y += ySize + (2*yBuf);
    }
    //arrow
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(20,0,50,0.6)";
    canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
    canvasBufferContext.rect(x,y,xSize,yArrow);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    canvasBufferContext.beginPath();
    var aRed = (this.target && this.target.inventory && (Object.keys(this.target.inventory.inv).slice(this.inventoryOffset).length > 6)) ? 200 : 100;
    canvasBufferContext.fillStyle = "rgba("+aRed+",0,50,0.9)";
    canvasBufferContext.strokeStyle="rgba("+aRed+",0,75,1.0)";
    canvasBufferContext.moveTo(x+(xSize*0.4),y+yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.5),y+yArrow-yBuf);
    canvasBufferContext.lineTo(x+(xSize*0.6),y+yBuf);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();

  }

  var drawPower = function(canvasBufferContext,x,y,xS,yS,selected){
    var aRed = (selected) ? 200 : 0;
    canvasBufferContext.fillStyle = "rgba("+aRed+",50,100,0.9)";
    canvasBufferContext.strokeStyle="rgba("+aRed+",50,175,1.0)";
    canvasBufferContext.beginPath();
    canvasBufferContext.rect(x,y,xS,yS);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    // canvasBufferContext.fillStyle = "rgba(250,250,0,0.5)";

  }
}


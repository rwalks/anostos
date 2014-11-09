Gui = function() {

  this.target; this.roster; this.resources;
  this.rosterOffset = 0;

  this.uiMode;

  this.buildTarget;
  this.buildTab = "construction";
  this.buildOffset = 0;

  this.buildings = {
  "construction":[new Block('soil'),new Block('metal')],
  "power":[new StorageBuild('power'),new GeneratorBuild('solar'),new GeneratorBuild('power')],
  "oxygen":[new StorageBuild('oxygen'),new GeneratorBuild('oxygen'),new ConveyorBuild('vent')],
  "water":[new StorageBuild('water'),new GeneratorBuild('water'),new ConveyorBuild('pipe')],
  "earth":[new StorageBuild('dry'),new GeneratorBuild('metal'),new ConveyorBuild('dry')],
  "other":[]
  };

  this.position = function(type){
    var pos = {};
    switch(type){
      case "resources":
        pos.x = (config.canvasWidth / 2.5) - (config.canvasWidth/13.9);
        pos.y = config.canvasHeight * (5/6);
        break;
      case "target":
        pos.x = config.canvasWidth / 2.5;
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
    }
    return pos;
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
        return {'buildTarget':this.buildings[this.buildTab][bIn+this.buildOffset]};
      }else{
        this.buildOffset += (this.buildings[this.buildTab].slice(this.buildOffset).length > 6) ? 1 : 0;
      }
    }else if(target == "target"){
      if(this.target && this.target.actions){
        var x = clickPos.x - this.position('target').x;
        var xSize = this.size('target').x;
        if(x > xSize - (xSize * 0.21)){
          var y = clickPos.y - this.position('target').y;
          var ySize = this.size('target').y;
          var yBuf = Math.floor(config.xRatio) * 2;
          var aY = Math.floor(4*((y - (2*yBuf)) / (ySize - (2*yBuf))));
          if(aY >= 0){
            return {'action':this.target.actions[aY]};
          }
        }
      }
    }
  }

  this.update = function(target,humans,resources,buildTarget,uiMode){
    this.target = target;
    this.roster = humans;
    this.resources = resources;
    this.buildTarget = buildTarget;
    this.uiMode = uiMode;
  }

  this.size = function(type){
    var size = {};
    switch(type){
      case "resources":
        size.x = config.canvasWidth / 14;
        size.y = config.canvasHeight / 6;
        break;
      case "target":
        size.x = config.canvasWidth / 3;
        size.y = config.canvasHeight / 6;
        break;
      case "build":
        size.x = config.canvasWidth / 6;
        size.y = config.canvasHeight * 0.6;
        break;
      case "roster":
        size.x = config.canvasWidth / 8;
        size.y = config.canvasHeight * 0.6;
        break;
    }
    return size;
  }

  this.pointWithin = function(x,y){
    if (x > this.position('target').x && x < (this.position('target').x + this.size('target').x) &&
        y > this.position('target').y && y < (this.position('target').y + this.size('target').y)){
          return "target"
        }
    else if (x > this.position('roster').x && x < (this.position('roster').x + this.size('roster').x) &&
        y > this.position('roster').y && y < (this.position('roster').y + this.size('roster').y)){
          return "roster"
        }
    else if ( this.uiMode == 'build' &&
        x > this.position('build').x && x < (this.position('build').x + this.size('build').x) &&
        y > this.position('build').y && y < (this.position('build').y + this.size('build').y)){
          return "build"
        };
    return false;
  }


  this.draw = function(camera,canvasBufferContext){
    if(this.uiMode == 'build'){
     // this.drawGrid(camera,canvasBufferContext);
      this.drawBuild(this.size("build"),this.position("build"),canvasBufferContext);
    }
    this.drawResources(this.size("resources"),this.position("resources"),canvasBufferContext);
    this.drawTarget(this.size("target"),this.position("target"),canvasBufferContext);
    this.drawRoster(this.size("roster"),this.position("roster"),canvasBufferContext);
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

  this.drawResources = function(size,pos,canvasBufferContext){
    //draw
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(150,0,200,0.9)";
    canvasBufferContext.strokeStyle="rgba(200,0,250,1.0)";
    canvasBufferContext.rect(pos.x,pos.y,size.x,size.y);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //resources
    var xBuf = Math.floor(config.xRatio) * 2;
    var yBuf = Math.floor(config.yRatio) * 2;
    if(this.resources){
      var x = pos.x + xBuf;
      var y = pos.y + yBuf;
      var xSize = size.x - (xBuf*2);
      var ySize = (size.y/Object.keys(this.resources).length) - (2*yBuf);
      for(r in this.resources){
        canvasBufferContext.beginPath();
        canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
        canvasBufferContext.fillStyle = "rgba(20,0,50,0.9)";
        canvasBufferContext.strokeStyle="rgba(20,0,75,1.0)";
        canvasBufferContext.rect(x,y,xSize,ySize);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        //draw icon
        switch(r){
          case "power":
            canvasBufferContext.beginPath();
            canvasBufferContext.fillStyle = "rgba(250,250,0,0.9)";
            canvasBufferContext.rect(x+xBuf,y+yBuf,xSize/8,ySize-(2*yBuf));
            canvasBufferContext.fill();
            break;
          case "oxygen":
            canvasBufferContext.beginPath();
            canvasBufferContext.fillStyle = "rgba(250,250,250,0.9)";
            canvasBufferContext.rect(x+xBuf,y+yBuf,xSize/8,ySize-(2*yBuf));
            canvasBufferContext.fill();
            break;
          case "water":
            canvasBufferContext.beginPath();
            canvasBufferContext.fillStyle = "rgba(0,0,250,0.9)";
            canvasBufferContext.rect(x+xBuf,y+yBuf,xSize/8,ySize-(2*yBuf));
            canvasBufferContext.fill();
            break;
          case "soil":
            canvasBufferContext.beginPath();
            canvasBufferContext.fillStyle = "rgba(20,250,100,0.9)";
            canvasBufferContext.rect(x+xBuf,y+yBuf,xSize/8,ySize-(2*yBuf));
            canvasBufferContext.fill();
            break;
          case "metal":
            canvasBufferContext.beginPath();
            canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
            canvasBufferContext.rect(x+xBuf,y+yBuf,xSize/8,ySize-(2*yBuf));
            canvasBufferContext.fill();
            break;
        }
        var rString = this.resources[r][0]+"/"+this.resources[r][1];
        var fontSize = xSize / rString.length;
        canvasBufferContext.font = fontSize + 'px Courier';
        canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
        canvasBufferContext.fillText(this.resources[r][0]+"/"+this.resources[r][1],x+(xBuf*6),y+fontSize);

        y += ySize + (2*yBuf);
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
      canvasBufferContext.fillText(this.target.name[0]+" "+this.target.name[1],xIndex+xBuf,yIndex+fontSize+yBuf);
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
    if(this.target && this.target.actions){
      for(i in this.target.actions){
        canvasBufferContext.beginPath();
        canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
        var aRed = (this.target.actions[i] == this.uiMode) ? 200 : 0;
        canvasBufferContext.fillStyle = "rgba("+aRed+",50,100,0.9)";
        canvasBufferContext.strokeStyle="rgba("+aRed+",50,175,1.0)";
        canvasBufferContext.rect(aX,aY,aXSize,aYSize);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        switch(this.target.actions[i]){
          case "build":
            canvasBufferContext.fillStyle = "rgba(250,250,250,0.9)";
            canvasBufferContext.strokeStyle="rgba(250,250,250,1.0)";
            canvasBufferContext.beginPath();
            canvasBufferContext.moveTo(aX + (aXSize * 0.2), aY + (aYSize * 0.8));
            canvasBufferContext.lineTo(aX + (aXSize * 0.3), aY + (aYSize * 0.8));
            canvasBufferContext.lineTo(aX + (aXSize * 0.6), aY + (aYSize * 0.5));
            canvasBufferContext.lineTo(aX + (aXSize * 0.8), aY + (aYSize * 0.5));
            canvasBufferContext.lineTo(aX + (aXSize * 0.8), aY + (aYSize * 0.3));
            canvasBufferContext.lineTo(aX + (aXSize * 0.7), aY + (aYSize * 0.4));
            canvasBufferContext.lineTo(aX + (aXSize * 0.6), aY + (aYSize * 0.3));
            canvasBufferContext.lineTo(aX + (aXSize * 0.7), aY + (aYSize * 0.2));
            canvasBufferContext.lineTo(aX + (aXSize * 0.5), aY + (aYSize * 0.2));
            canvasBufferContext.lineTo(aX + (aXSize * 0.5), aY + (aYSize * 0.4));
            canvasBufferContext.lineTo(aX + (aXSize * 0.2), aY + (aYSize * 0.7));
            canvasBufferContext.fill();
            canvasBufferContext.stroke();
            break;
          case "delete":
            canvasBufferContext.strokeStyle="rgba(250,250,250,1.0)";
            canvasBufferContext.lineWidth=xBuf;
            canvasBufferContext.beginPath();
            canvasBufferContext.moveTo(aX + (aXSize * 0.2), aY + (aYSize * 0.8));
            canvasBufferContext.lineTo(aX + (aXSize * 0.8), aY + (aYSize * 0.2));
            canvasBufferContext.stroke();
            canvasBufferContext.beginPath();
            canvasBufferContext.moveTo(aX + (aXSize * 0.2), aY + (aYSize * 0.2));
            canvasBufferContext.lineTo(aX + (aXSize * 0.8), aY + (aYSize * 0.8));
            canvasBufferContext.stroke();
            break;
          case "upgrade":
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
        canvasBufferContext.fillText(plr.name[0][0]+"."+plr.name[1],x+(xSize/4),y+fontSize+yBuf);
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
      var aRed = (this.buildTarget && build == this.buildTarget) ? 100 : 20;
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = "rgba("+aRed+",0,50,0.9)";
      canvasBufferContext.strokeStyle="rgba("+aRed+",0,75,1.0)";
      canvasBufferContext.rect(x,y,xSize,ySize);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      if(build){
        build.drawTargetPortrait(x,y,xSize/4,ySize,canvasBufferContext);
        var fontSize = ySize / 4;
        canvasBufferContext.font = fontSize + 'px Courier';
        canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
        canvasBufferContext.fillText(build.name[0]+" "+build.name[1],x+(xSize/4),y+fontSize+yBuf);
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


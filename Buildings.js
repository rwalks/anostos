StorageBuild = function(type,pos) {
  var fName = '';
  var lName = '';
  switch(type){
    case 'power':
      fName = 'Chemical';
      lName = 'Battery';
      break;
    case 'water':
      fName = 'Water';
      lName = 'Cistern';
      break;
    case 'oxygen':
      fName = 'Oxygen';
      lName = 'Tank';
      break;
    case 'dry':
      fName = 'Dry';
      lName = 'Storage';
      break;
  }
  this.name = [fName,lName];
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.position = pos ? pos : {'x':x,'y':y};
  this.collision = true;
  this.lastDrawn = -1;
  this.type = "block";
  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
      canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
      var originX = (this.position.x-camera.xOff)*config.xRatio;
      var originY = (this.position.y-camera.yOff)*config.yRatio;
      var lX = this.size.x*config.xRatio;
      var lY = this.size.y*config.yRatio;
      canvasBufferContext.rect(originX,originY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
    canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
    canvasBufferContext.rect(oX+(xSize*0.2),oY+(ySize*0.2),xSize*0.6,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.click = function(coords,terrain){
    return;
  }
  this.rType = type;
  this.clone = function(pos){
    return new StorageBuild(this.rType,pos);
  }
}

ConveyorBuild = function(type,pos) {
  var fName = '';
  switch(type){
    case 'vent':
      fName = 'Air';
      lName = 'Vent';
      break;
    case 'pipe':
      fName = 'Water';
      lName = 'Pipe';
      break;
    case 'dry':
      fName = 'Conveyor';
      lName = 'Tube';
      break;
  }
  this.name = [fName,lName];
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.position = pos ? pos : {'x':x,'y':y};
  this.collision = true;
  this.lastDrawn = -1;
  this.type = "block";
  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
      canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
      var originX = (this.position.x-camera.xOff)*config.xRatio;
      var originY = (this.position.y-camera.yOff)*config.yRatio;
      var lX = this.size.x*config.xRatio;
      var lY = this.size.y*config.yRatio;
      canvasBufferContext.rect(originX,originY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
    canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
    canvasBufferContext.rect(oX+(xSize*0.2),oY+(ySize*0.2),xSize*0.6,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.click = function(coords,terrain){
    return;
  }
  this.rType = type;
  this.clone = function(pos){
    return new ConveyorBuild(this.rType,pos);
  }
}

GeneratorBuild = function(type,pos) {
  var fName = '';
  switch(type){
     case 'power':
      fName = 'Nuclear';
      lName = 'Generator';
      break;
    case 'water':
      fName = 'Soil';
      lName = 'Evaporator';
      break;
    case 'oxygen':
      fName = 'Water';
      lName = 'Splitter';
      break;
    case 'metal':
      fName = 'Smelting';
      lName = 'Chamber';
      break;
    case 'solar':
      fName = 'Solar';
      lName = 'Panel';
  }
  this.name = [fName,lName];
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.position = pos ? pos : {'x':0,'y':0};
  this.collision = true;
  this.lastDrawn = -1;
  this.type = "block";
  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
      canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
      var originX = (this.position.x-camera.xOff)*config.xRatio;
      var originY = (this.position.y-camera.yOff)*config.yRatio;
      var lX = this.size.x*config.xRatio;
      var lY = this.size.y*config.yRatio;
      canvasBufferContext.rect(originX,originY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
    canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
    canvasBufferContext.rect(oX+(xSize*0.2),oY+(ySize*0.2),xSize*0.6,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.click = function(coords,terrain){
    return;
  }
  this.rType = type;
  this.clone = function(pos){
    return new GeneratorBuild(this.rType,pos);
  }
}

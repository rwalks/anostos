Block = function(type,pos) {

  this.rType = type;
  var fName = '';
  var fillRGB;
  var strokeRGB;
  this.airtight = false;
  this.pathable = false;
  this.cost = {};
  switch(type){
    case 'soil':
      fName = 'Soil';
      fillRGB = "rgba(20,200,150,0.9)";
      strokeRGB="rgba(40,250,200,1.0)";
      this.cost.soil = 2;
      break;
    case 'metal':
      fName = 'Metal';
      fillRGB = "rgba(200,220,200,0.9)";
      strokeRGB="rgba(230,230,230,1.0)";
      this.airtight = true;
      this.cost.metal = 2;
      break;
  }

  this.name = [fName,"Block"];
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.position = pos ? pos : {'x':x,'y':y};
  this.collision = function(){return true;}
  this.lastDrawn = -1;
  this.type = "block";
  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = fillRGB;
      canvasBufferContext.strokeStyle= strokeRGB;
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
    canvasBufferContext.fillStyle = fillRGB;
    canvasBufferContext.strokeStyle= strokeRGB;
    canvasBufferContext.rect(oX+(xSize*0.2),oY+(ySize*0.2),xSize*0.6,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.clone = function(pos){
    return new Block(this.rType,pos);
  }

  this.click = function(coords,terrain){
    return;
  }
}

Door = function(pos) {

  var fName = 'Hatch';
  this.airtight = true;
  var fillRGB = "rgba(40,200,50,0.9)";
  var strokeRGB="rgba(80,250,100,1.0)";

  this.name = [fName,""];
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
  this.position = pos ? pos : {'x':x,'y':y};
  this.open = false;
  this.cost = {'metal': 4};

  this.collision = function(){
    return !this.open;
  }
  this.pathable = true;
  this.lastDrawn = -1;
  this.type = "door";

  this.update = function(humans){
    var closeHuman = false;
    for(h in humans){
      if(config.distance(humans[h],this) <= config.gridInterval*1.1){
        closeHuman = true;
      }
    }
    this.open = closeHuman;
  }

  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = fillRGB;
      canvasBufferContext.strokeStyle= strokeRGB;
      var originX = (this.position.x-camera.xOff)*config.xRatio;
      var originY = (this.position.y-camera.yOff)*config.yRatio;
      var lX = this.size.x*config.xRatio;
      var lY = this.open ? this.size.y * 0.1 * config.yRatio : this.size.y*config.yRatio;
      canvasBufferContext.rect(originX+lX/3,originY,lX/3,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = fillRGB;
    canvasBufferContext.strokeStyle= strokeRGB;
    var lX = xSize*0.6;
    var lY = ySize*0.6;
    canvasBufferContext.rect((oX+lX/3)+(xSize*0.2),oY+(ySize*0.2),xSize*0.6/3,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.clone = function(pos){
    return new Door(pos);
  }

  this.click = function(coords,terrain){
    return;
  }
}

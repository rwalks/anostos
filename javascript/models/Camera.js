var Camera = function (x,y){
  this.xOff = x ? x : config.mapWidth / 2;
  this.yOff = y ? y : config.mapHeight / 2;

  velocity = {x:0,y:0};
  scrollRate = 6;
  scrollMax = 12;

  this.setMove = function(dir,keyDown){
    switch(dir){
      case 'up':
        velocity.y = keyDown ? (Math.max(velocity.y-scrollRate,-scrollMax)) : (velocity.y < 0 ? 0 : velocity.y);
        break;
      case 'down':
        velocity.y = keyDown ? (Math.min(velocity.y+scrollRate,scrollMax)) : (velocity.y > 0 ? 0 : velocity.y);
        break;
      case 'left':
        velocity.x = keyDown ? (Math.max(velocity.x-scrollRate,-scrollMax)) : (velocity.x < 0 ? 0 : velocity.x);
        break;
      case 'right':
        velocity.x = keyDown ? (Math.min(velocity.x+scrollRate,scrollMax)) : (velocity.x > 0 ? 0 : velocity.x);
        break;
    }
  }

  this.move = function(x,y){
    if((this.xOff + x)>0 && (this.xOff+x)<(config.mapWidth-config.cX)){this.xOff += x;}
    if((this.yOff + y)>0 && (this.yOff+y)<(config.mapHeight-config.cY)){this.yOff += y;}
  }

  this.offCamera = function(pos,buffer){
    buffer = buffer || config.gridInterval;
    return (pos.x < (this.xOff-buffer) || pos.x > (this.xOff+config.cX+buffer) ||
        pos.y < (this.yOff-buffer) || pos.y > (this.yOff+config.cY+buffer));
  }

  this.focusOn = function(position){
    this.xOff = position.x-(config.cX/2);
    this.yOff = position.y-(config.cY/2);
    if( this.xOff < 0){
      this.xOff = 0;
    }else if(this.xOff > (config.mapWidth - config.cX)){
      this.xOff = (config.mapWidth - config.cX);
    }
    if( this.yOff < 0){
      this.yOff = 0;
    }else if(this.yOff > (config.mapHeight - config.cY)){
      this.yOff = (config.mapHeight - config.cY);
    }
  }

  this.update = function(mousePos){
    var dX = 0;
    var dY = 0;
    if(mousePos){
      if(mousePos.x < (config.canvasWidth / 20)){ dX -= config.cameraMoveRate; }
      if(mousePos.x > config.canvasWidth - (config.canvasWidth / 20)){ dX += config.cameraMoveRate; }
      if(mousePos.y < (config.canvasHeight / 20)){ dY -= config.cameraMoveRate; }
      if(mousePos.y > config.canvasHeight - (config.canvasHeight / 20)){ dY += config.cameraMoveRate; }
      this.move(dX,dY);
    }
    this.move(velocity.x,velocity.y);
    return (dX != 0 || dY != 0);
  }
}

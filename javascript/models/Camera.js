var Camera = function (x,y){
  this.target;
  this.focus = new Vector(0,0);
  this.buffer = new Vector(0,0);

  this.xOff = x ? x : config.mapWidth / 2;
  this.yOff = y ? y : config.mapHeight / 2;

  //speed
  var fastV = 70;
  var bufferV = 0.1;

  this.onCamera = function(pos,buffer){
    buffer = buffer || config.gridInterval;
    return !(pos.x < (this.xOff-buffer) || pos.x > (this.xOff+config.cX+buffer) ||
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

  this.update = function(){
    if(this.target){
      var groundDistance = Math.abs(config.groundLevel-this.target.position.y);
      var bufferOffset = config.cY / 4;
      var bufferTarget = 1-Math.min((groundDistance / bufferOffset),1);
      this.buffer.y += Math.min(Math.abs(bufferTarget - this.buffer.y),bufferV) * (bufferTarget >= this.buffer.y ? 1 : -1);

      var coords = ['x','y'];
      for(var i=0;i<coords.length;i++){
        var dir = coords[i];
        var origin = this.target.position[dir] + (this.target.size[dir]/2);
        origin += i ? -(bufferOffset * this.buffer[dir]) : 0;
        var d = origin - this.focus[dir];
        var absD = Math.abs(d) || 1;
        var delta = 0;
        if(absD > (config.cY/2)){
          var perc = Math.max((absD/fastV),1);
          delta = d / perc;
        }else{
          delta = d;
        }
        this.focus[dir] += delta;
      }
      this.focusOn(this.focus);
    }
  }

  this.focusTarget = function(obj){
    this.target = obj;
    this.focus.x = obj.position.x;
    this.focus.y = obj.position.y;
    this.focusOn(obj.position);
  }
}

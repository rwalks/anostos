Plant = function(x,y){
  Tile.call(this,x,y);

  this.pathable = true;
  this.collision = function(){return false;}

  this.animOffset = Math.floor(Math.random() * 20);

  this.draw = function(camera,buffCon,terrain){
    if(terrain.count > this.lastDrawn){
      this.lastDrawn = terrain.count;
      var drawPos = utils.realCoords(this.position,camera);
      var art = artHolder.getArt(this.artStr);
      var count = terrain.count + this.animOffset;
      art.draw(drawPos,buffCon,1,count);
      return true;
    }
    return false;
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,buffCon){
  }
}

Tree = function(x,y){
  Plant.call(this,x,y);
  this.size.x = 1*config.gridInterval;
  this.size.y = 4*config.gridInterval;
  this.position.y -= this.size.y;
  this.name.set("Lumo","Tree");
  this.artStr = "treePlant";
}

TreeArt = function() {
  AnimatedCachedArt.call(this);

  this.frameCount = 10;
  this.size = new Vector(1*config.gridInterval,4*config.gridInterval);
  this.speed = 0.2;

  this.drawFrame = function(frameP){
    var lX = this.canvas.width;
    var lY = this.canvas.height / this.frameCount;
    var oX = 0;
    var oY = this.canvas.height * frameP;

    var aOff = (lY / 2) * frameP;
    var y = oY + aOff;
    lY = lY - aOff;
    this.context.fillStyle = "rgba(250,250,0,1)";
    this.context.beginPath();
    this.context.rect(oX,y,lX,lY);
    this.context.fill();
  }

  this.drawTree = function(x,y,angle,level,camera,buffCon){
  	if (level != 0){
      var x2 = x + (Math.cos(angle * (Math.PI / 180)) * level * height);
      var y2 = y + (Math.sin(angle * (Math.PI / 180)) * level * height);

      var ox = (x-camera.xOff)*config.xRatio;
      var oy = (y-camera.yOff)*config.yRatio;
      var ox2 = (x2-camera.xOff)*config.xRatio;
      var oy2 = (y2-camera.yOff)*config.yRatio;

      buffCon.moveTo(ox,oy);
      buffCon.lineTo(ox2,oy2);

      var dAngle = angleChange + swayMod;
      this.drawTree(x2, y2, angle - dAngle, level - 1, camera, buffCon);
      dAngle = angleChange - swayMod;
      this.drawTree(x2, y2, angle + dAngle, level - 1, camera, buffCon);
	  }
  }


}


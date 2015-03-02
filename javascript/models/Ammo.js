Ammo = function(orig,dest){
  this.lifeSpan;
  this.origin = orig;
  this.dest = dest;
  this.position = utils.clonePos(orig);
  this.maxVelocity = 1;
  this.damage = 1;

  this.draw = function(camera,canvasContext){
    var x = (this.position.x-camera.xOff)*config.xRatio;
    var y = (this.position.y-camera.yOff)*config.yRatio;
    this.drawAmmo(x,y,canvasContext);
  }

  this.drawAmmo = function(x,y,buffer){};

  this.update = function(terrain,aliens){
    //update position
    var dX = this.dest.x - this.origin.x;
    var dY = this.dest.y - this.origin.y;
    var veloMax = this.maxVelocity / (Math.abs(dX) + Math.abs(dY));
    if(veloMax < 1){
      dX = dX * veloMax;
      dY = dY * veloMax;
    }
    this.position.x += dX;
    this.position.y += dY;
    //check collisions
    var tX = utils.roundToGrid(this.position.x);
    var tY = utils.roundToGrid(this.position.y);
    if(terrain.getTile(tX,tY)){
      return true;
    }
    for(var a = 0; a < aliens.length; a++){
      if(aliens[a].pointWithin(this.position.x,this.position.y)){
        aliens[a].wound(this.damage);
        return true;
      }
    }
  }

}

BlastAmmo = function(orig,dest){
  Ammo.call(this,orig,dest);

  this.drawAmmo = function(x,y,buffer){
    ammoArt.drawBlastAmmo(x,y,buffer);
  }

  this.damage = 10;
  this.maxVelocity = 10;

}

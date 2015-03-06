Ammo = function(orig,theta){
  this.lifeSpan;
  this.velocity = {};
  this.position = orig;
  this.maxVelocity = 1;
  this.damage = 1;

  var initVX = this.direction ? 1 : -1;
  var velo = utils.rotate(initVX,0,theta);
  this.velocity.x = velo[0];
  this.velocity.y = velo[1];


  this.draw = function(camera,canvasContext){
    var x = (this.position.x-camera.xOff)*config.xRatio;
    var y = (this.position.y-camera.yOff)*config.yRatio;
    this.drawAmmo(x,y,canvasContext);
  }

  this.drawAmmo = function(x,y,buffer){};

  this.update = function(terrain){
    //update position
    this.position.x += this.velocity.x * this.maxVelocity;
    this.position.y += this.velocity.y * this.maxVelocity;
    //check collisions
    var tX = utils.roundToGrid(this.position.x);
    var tY = utils.roundToGrid(this.position.y);
    var tile = terrain.getTile(tX,tY);
    if(tile){
      //TODO wound building
      return true;
    }
    var entity = terrain.getEntity(tX,tY);
    if(entity){
      if(entity.pointWithin(this.position.x,this.position.y)){
        entity.wound(this.damage);
        return true;
      }
    }
  }

}

BlastAmmo = function(orig,theta){
  Ammo.call(this,orig,theta);

  this.drawAmmo = function(x,y,buffer){
    ammoArt.drawBlastAmmo(x,y,buffer);
  }

  this.damage = 10;
  this.maxVelocity = 10;

}

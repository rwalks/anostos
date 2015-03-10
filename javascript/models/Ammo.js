Ammo = function(orig,theta,ownTyp){
  this.type = 'ammo';
  this.age = 0;
  this.maxAge = 10;
  this.velocity = {};
  this.position = orig;
  this.maxVelocity = 1;
  this.entityDamage = 1;
  this.tileDamage = 1;
  this.ownerType = ownTyp;

  var velo = utils.rotate(1,0,theta);
  this.velocity.x = velo[0];
  this.velocity.y = velo[1];


  this.draw = function(camera,canvasContext){
    var x = (this.position.x-camera.xOff)*config.xRatio;
    var y = (this.position.y-camera.yOff)*config.yRatio;
    this.drawAmmo(x,y,canvasContext);
  }

  this.drawAmmo = function(x,y,buffer){};

  this.update = function(terrain){
    this.age += 1;
    if(this.age > this.maxAge){
      return {'action':'die'};
    }
    //update position
    this.position.x += this.velocity.x * this.maxVelocity;
    this.position.y += this.velocity.y * this.maxVelocity;
    //bounds
    if(utils.outOfBounds(this.position)){
      return {'action':'die'};
    }
    //check collisions
    var tX = utils.roundToGrid(this.position.x);
    var tY = utils.roundToGrid(this.position.y);
    var tile = terrain.getTile(tX,tY);
    if(tile){
      if(tile.wound(this.tileDamage)){
        return {'action':'delete','obj':tile};
      }else{
        return {'action':'die'};
      }
    }
    var entities = terrain.getEntities(tX,tY);
    if(entities){
      for(var ei = 0; ei < entities.length; ei++){
        var entity = entities[ei];
        var friendly = (entity.type == this.ownerType);
        if(!friendly && entity.pointWithin(this.position.x,this.position.y)){
          entity.wound(this.entityDamage);
          return {'action':'die'};
        }
      }
    }
  }
}

BlastAmmo = function(orig,theta,ownTyp){
  Ammo.call(this,orig,theta,ownTyp);

  this.drawAmmo = function(x,y,buffer){
    ammoArt.drawBlastAmmo(x,y,buffer);
  }

  this.entityDamage = 20;
  this.tileDamage = 5;
  this.maxVelocity = 6;
  this.maxAge = 25;

}

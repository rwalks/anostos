Ammo = function(orig,theta,ownTyp){
  this.type = 'ammo';
  this.age = 0;
  this.maxAge = 10;
  this.velocity = {};
  this.size = new Vector(config.gridInterval,config.gridInterval);
  this.position = orig;
  this.maxVelocity = 1;
  this.entityDamage = 1;
  this.tileDamage = 1;
  this.ownerType = ownTyp;
  this.hasDrawn = false;

  var velo = utils.rotate(1,0,theta);
  this.velocity.x = velo[0];
  this.velocity.y = velo[1];
  this.light = true;
  this.lightRadius = 4;


  this.draw = function(camera,canvasContext){
    if(!this.hasDrawn){
      this.hasDrawn = true;
      var x = (this.position.x-camera.xOff)*config.xRatio;
      var y = (this.position.y-camera.yOff)*config.yRatio;
      this.drawAmmo(x,y,canvasContext);
    }
  }

  this.drawAmmo = function(x,y,buffer){};

  this.center = function(){
    return {'x':this.position.x,'y':this.position.y};
  }

  this.update = function(terrain){
    this.hasDrawn = false;
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
        var friendly = (entity.type == this.ownerType || entity.type == 'ammo' || entity.type == 'corpse');
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

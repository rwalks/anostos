Ammo = function(orig,theta,ownTyp){
  this.type = 'ammo';
  this.age = 0;
  this.maxAge = 10;
  this.size = new Vector(config.gridInterval,config.gridInterval);
  this.position = orig;
  this.entityDamage = 1;
  this.tileDamage = 1;
  this.ownerType = ownTyp;
  this.hasDrawn = false;

  this.theta = theta;
  this.maxVelocity = 1;
  this.velocity;

  this.scout = false;
  this.light = true;
  this.lightRadius = 5;
  this.lightColor = new Color(0,25,200,0.5);

  this.draw = function(camera,canvasContext){
    if(!this.hasDrawn){
      this.hasDrawn = true;
      var x = (this.position.x-camera.xOff)*config.xRatio;
      var y = (this.position.y-camera.yOff)*config.yRatio;
      this.drawAmmo(x,y,canvasContext);
    }
  }

  this.updateLight = function(terrain,camera){
    terrain.updateLightMap(this.position,this.lightRadius,this.lightColor);
  }

  this.drawAmmo = function(x,y,buffer){};

  this.center = function(){
    return {'x':this.position.x,'y':this.position.y};
  }

  this.applyMove = function(){
    if(!this.velocity){
      var orientation = utils.rotate(1,0,theta);
      orientation[0] = orientation[0] * this.maxVelocity;
      orientation[1] = orientation[1] * this.maxVelocity;
      this.velocity = new Vector(orientation[0],orientation[1]);
    }
    //apply move
    this.position.x = Math.round(this.position.x + this.velocity.x);
    this.position.y = Math.round(this.position.y + this.velocity.y);
  }

  this.update = function(terrain){
    this.hasDrawn = false;
    this.age += 1;
    if(this.age > this.maxAge){
      return this.die(terrain);
    }
    this.applyMove();
    //bounds
    if(utils.outOfBounds(this.position)){
      return this.die(terrain);
    }
    //check collisions
    var tX = utils.roundToGrid(this.position.x);
    var tY = utils.roundToGrid(this.position.y);
    var tile = terrain.getTile(tX,tY);
    if(tile){
      if(tile.wound(this.tileDamage)){
        this.die(terrain);
        return {'action':'delete','obj':tile};
      }else{
        return this.die(terrain);
      }
    }
    var entities = terrain.getEntities(tX,tY);
    if(entities){
      for(var ei = 0; ei < entities.length; ei++){
        var entity = entities[ei];
        var friendly = (entity.type == this.ownerType || entity.type == 'ammo' || entity.type == 'corpse');
        if(!friendly && entity.pointWithin(this.position.x,this.position.y)){
          entity.wound(this.entityDamage);
          return this.die(terrain);
        }
      }
    }
  }

  this.die = function(terrain){
    this.deathExplosion(terrain);
    return {'action':'die'};
  }

  this.deathExplosion = function(terrain){};

}

BlastAmmo = function(orig,theta,ownTyp){
  Ammo.call(this,orig,theta,ownTyp);

  this.drawAmmo = function(x,y,buffer){
    ammoArt.drawBlastAmmo(x,y,buffer);
  }

  this.entityDamage = 20;
  this.tileDamage = 5;
  this.maxVelocity = 7;
  this.maxAge = 60;
  this.lightRadius = 3;
  this.lightColor = new Color(0,25,255,0.2);

  this.deathExplosion = function(terrain){
    var color = this.lightColor.clone();
    color.a = 0.5;
    //jet spray
    var sprays = 15;
    var sprayMid = Math.floor(sprays/2);

    var theta = 0;
    var dTheta = Math.PI * 2 / sprays;
    for(var b = 0; b < sprays; b++){
      var rand = Math.random();
      var maxV = 1 + (5*rand);
      //find velo
      var t = (rand * dTheta) + theta;
      var point = utils.rotate(0,-1,t);
      theta += dTheta;
      var vX = point[0] * maxV;
      var vY = point[1] * maxV;
      var v = new Vector(vX,vY);
      //radius
      var rad = 0.3;
      var duration = 5 + Math.random() * 10;
      //
      terrain.addParticle(new PlasmaParticle(this.position.clone(),v,duration,rad,'plasma'));
    }
    terrain.updateLightMap(this.position,4,this.lightColor);
  };

}

Particle = function(orig,velo,duration,rad,color){
  this.maxDuration = duration;
  this.duration = duration;
  this.position = orig;
  this.velocity = velo;

  this.drawRadius = rad;
  this.lightRadius = rad;
  this.lightColor = color;
  this.strokeStyle = this.lightColor.clone();
  this.strokeStyle.darken(0.5);

  this.draw = function(camera,buffCon,terrain){
    //update lightMap
    terrain.updateLightMap(this.position,this.lightRadius,this.lightColor);
    //draw
    this.drawParticle(camera,buffCon);
    //class update
    this.update(terrain);
    //apply forces
    this.applyForces();
    //reduce duration
    this.duration -= 1;
    return this.duration > 0;
  }

  this.drawParticle = function(camera,buffCon){
    //draw basic circular particle
    //TODO move to art
    var x = (this.position.x-camera.xOff)*config.xRatio;
    var y = (this.position.y-camera.yOff)*config.yRatio;
    var r = this.drawRadius * config.gridInterval * config.minRatio;
    buffCon.fillStyle = this.lightColor.colorStr();
    buffCon.lineWidth = config.xRatio / 3;
    buffCon.beginPath();
    buffCon.arc(x,y,r,0,2*Math.PI,false);
    buffCon.fill();
  }

  this.applyForces = function(){
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  this.update = function(terrain){};

}

ExhaustParticle = function(orig,velo,duration,rad,color){
  Particle.call(this,orig,velo,duration,rad,color);
  this.lightColor.a = 0.8;
  var smoke = false;

  this.update = function(terrain){
    var terPos = utils.roundVector(this.position);
    if(!smoke && terrain.getTile(terPos.x,terPos.y)){
      this.velocity.y = -0.5;
      this.setSmoke(12);
    }else if(smoke){
      this.lightRadius = this.lightRadius * (this.lightRadius < 0.2 ? 1.5 : 1.2);
    }else if(this.lightRadius < 0.075){
      this.setSmoke(3);
    }else if(this.duration / this.maxDuration < 0.8){
      this.lightRadius = this.lightRadius * (0.1 + (0.9*(this.duration/this.maxDuration)));
    }
    this.lightColor.a = this.lightColor.a * 0.8;
    this.drawRadius = this.lightRadius;
  }

  this.applyForces = function(){
    if(smoke){
      this.position.y += config.gravity/2;
    }
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  this.setSmoke = function(dur){
    this.lightColor.randomize('smoke');
    this.lightColor.a = 0.6;
    if(!smoke){
      this.duration = dur || 5;
      smoke = true;
    }
  }
}

PlasmaParticle = function(orig,velo,duration,rad,colorType){
  var color = new Color();
  color.randomize(colorType);
  Particle.call(this,orig,velo,duration,rad,color);
  this.lightRadius = this.lightRadius * 5;

  this.update = function(terrain){
    this.drawRadius = this.drawRadius * 0.9;
    this.lightRadius = this.lightRadius * 0.8;
    if(this.duration % 2 == 0){
      this.lightColor.randomize(colorType);
    }
  }

  this.applyForces = function(){
    this.velocity.y += config.gravity/2;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

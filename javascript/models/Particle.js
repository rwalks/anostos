Particle = function(orig,velo,duration,rad,color){
  this.maxDuration = duration;
  this.duration = duration;
  this.position = orig;
  this.velocity = velo;
  this.lit = true;

  this.drawRadius = rad;
  this.lightRadius = rad * 1.5;
  this.color = color;

  this.draw = function(camera,buffCon,terrain){
    //update lightMap
    if(this.lit){
      terrain.updateLightMap(this.position,this.lightRadius,this.color);
    }
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
    buffCon.fillStyle = this.color.colorStr();
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
  var smoke = false;
  var deltaR = 0.5;

  this.update = function(terrain){
    var terPos = utils.roundVector(this.position);
    if(!smoke && terrain.getTile(terPos.x,terPos.y)){
      this.velocity.y = -this.velocity.y;
      this.setSmoke();
      this.drawRadius = 0.2 + (Math.random() * 0.3);
    }else if(smoke){
      this.velocity.x = this.velocity.x * 0.5;
      this.velocity.y = this.velocity.y * 0.5;
      this.drawRadius = this.drawRadius * (1+deltaR);
      deltaR = deltaR * ((this.drawRadius < 2) ? 0.8 : 0.4);
      this.color.a = this.color.a * 0.8;
    }else if(this.drawRadius < 0.1){
      this.setSmoke();
    }else if(this.duration / this.maxDuration < 0.8){
      this.drawRadius = this.drawRadius * (0.1 + (0.9*(this.duration/this.maxDuration)));
    }
    this.lightRadius = this.drawRadius;
  }

  this.setSmoke = function(dur){
    this.velocity.y += config.gravity;
    this.lit = false;
    this.color.randomize('smoke');
    if(!smoke){
      this.duration = 10 + (Math.random()*20);
      smoke = true;
    }
  }
}

PlasmaParticle = function(orig,velo,duration,rad,colorType){
  var color = new Color();
  color.randomize(colorType);
  Particle.call(this,orig,velo,duration,rad,color);

  this.lightRadius = this.lightRadius * 10;
  var colorType = colorType;
  var alpha = 0.6;

  this.update = function(terrain){
    this.drawRadius = this.drawRadius * 0.9;
    this.lightRadius = Math.max(this.lightRadius * 0.8, this.drawRadius);
    this.color.randomize(colorType);
    this.color.a = alpha;
    alpha = alpha * 0.9;
  }

  this.applyForces = function(){
    this.velocity.y += config.gravity/2;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

SparkParticle = function(orig,velo,duration,rad,colorType){
  var color = new Color();
  color.randomize(colorType);
  Particle.call(this,orig,velo,duration,rad,color);

  this.lightRadius = this.lightRadius * 10;
  var colorType = colorType;
  var alpha = 0.6;

  this.update = function(terrain){
    this.drawRadius = this.drawRadius * 0.9;
    this.lightRadius = Math.max(this.lightRadius * 0.8, this.drawRadius);
    this.color.randomize(colorType);
    this.color.a = alpha;
    alpha = alpha * 0.9;
  }

  this.applyForces = function(){
    this.velocity.y += config.gravity/2;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

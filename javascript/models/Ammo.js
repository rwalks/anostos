Ammo = function(orig,dest){
  this.lifeSpan;
  this.origin = orig;
  this.destination = dest;
  this.velocity = {'x':0,'y':0};
  this.position = orig;
  this.speed;

  this.draw = function(x,y,canvasBufferContext){
  }

  this.update = function(){
  }

}

BlasterAmmo = function(pos){
  Ammo.call(this);

  this.damage = 10;
  this.speed = 20;

}

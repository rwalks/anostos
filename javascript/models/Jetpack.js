JetPack = function(owner){
  this.owner = owner;
  this.toggle = false;
  this.active = 0;
  this.accel = config.gridInterval * 0.1;
  this.energyCost = 0.3;

  this.update = function(){
    if(this.toggle){
      if(this.owner.currentEnergy >= this.energyCost){
        this.owner.currentEnergy -= this.energyCost;
        this.active = 1;
      }
    }
    if(this.active){
      this.owner.velocity.y -= (this.accel * this.active);
      this.active -= 0.1;
      this.active = this.active > 0.001 ? this.active : 0;
    }
  }

  this.updateLight = function(terrain){
    if(this.active){
      var jX = this.owner.position.x + (this.owner.size.x * (this.owner.direction ? -0.05 : 1.05));
      var jY = this.owner.position.y + (this.owner.size.y * 5/6);
      var farPos = new Vector(jX,jY);
      var nearPos = farPos.clone();
      nearPos.x += this.owner.size.x * (this.owner.direction ? 0.6 : -0.6);
      var color = new Color(0,0,0,1);
      var maxVX = 3;
      var maxVY = 1;
      var duration = 15;
      //jet spray
      var sprays = 7;
      var sprayMid = Math.floor(sprays/2);

      var theta = Math.PI - ((Math.PI/18)*(sprays/2));
      for(var b = 0; b < sprays; b++){
        var rand = Math.random();
        var dMod = Math.abs(sprayMid - b);
        //find velo
        var t = (rand * Math.PI/18) + theta;
        var point = utils.rotate(0,-1,t);
        theta += (Math.PI/18);
        var vX = point[0] * maxVX;
        vX += this.owner.velocity.x/2;
        var vY = point[1] * (maxVY + Math.random());
        vY += this.owner.velocity.y;
        var v = new Vector(vX,vY);
        //color
        color.randomize('fire');
        //radius
        var rad = 0.3 - (0.28*(dMod/sprayMid));
        //duration
        var d = duration * Math.max(0.2,(sprayMid-dMod)/sprayMid);
        //
        terrain.addParticle(new ExhaustParticle(farPos.clone(),v,d,rad,color.clone()));
        terrain.addParticle(new ExhaustParticle(nearPos.clone(),v,d,rad,color.clone()));
      }
      var r = 4 + Math.random() * 1;
      color.randomize('fire');
      terrain.updateLightMap(farPos,r,color);
    }
  }
}

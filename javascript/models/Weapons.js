Weapon = function(owner){
  Tool.call(this,owner);
  this.type = 'attack';
  this.energyCost = 3;

  this.typeActivate = function(orig,terrain){
    var theta = this.owner.toolTheta;
    theta = this.owner.direction ? theta : Math.PI - theta;
    var ammoRet = this.spawnAmmo(orig,theta);
    return {'action':'fire','obj':ammoRet};
  }

  this.spawnAmmo = function(orig,theta){
  }
}

BasicBlaster = function(owner){
  Weapon.call(this,owner);

  this.name.set("Basic","Blaster");
  this.range = config.gridInterval * 20;
  this.actionOffset.x = config.gridInterval * 0.9;
  this.actionOffset.y = config.gridInterval * -0.2;
  this.energyCost = 2;
  this.cooldownCost = 8;

  this.drawTool = function(x,y,buffer,camera,alpha){
    weaponArt.drawBlaster(x,y,buffer,this.owner,alpha);
  }

  this.spawnAmmo = function(orig,theta){
    var spread = Math.PI/6;
    var ammos = [];
    var o = new Vector(orig.x,orig.y);
    var a = new BlastAmmo(o,theta,this.owner.type);
    ammos.push(a);
    /*
    for(var t = theta-spread;t<=theta+spread;t+=spread){
      var a = new BlastAmmo(o,t,this.owner.type);
      ammos.push(a);
    }
    */
    return ammos;
  }

  this.clone = function(owner){
    return new BasicBlaster(owner);
  }
}

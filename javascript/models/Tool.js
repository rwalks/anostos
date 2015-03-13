Tool = function(owner){
  this.owner = owner;
  this.name = new Name("Unknown","Tool");
  this.cooldownTimer = 0;
  this.cooldownCost;
  this.range = config.gridInterval;
  this.actionOffset = new Vector(0,0);
  this.type;

  this.draw = function(x,y,canvasContext,camera,alpha){
    this.drawTool(x,y,canvasContext,camera,alpha);
  }

  this.drawTool = function(x,y,buffer,camera,alpha){};

  this.activate = function(terrain){
    var ret = false;
    var origin = this.owner.center();
    if(!this.cooldownTimer){
      var theta = this.owner.toolTheta;
      this.cooldownTimer += this.cooldownCost;
      var theta = this.owner.toolTheta;
      //find point of action
      var poA = utils.rotate(this.actionOffset.x,this.actionOffset.y,theta);
      origin.x += poA[0] * (this.owner.direction ? 1 : -1);
      origin.y += poA[1];
      theta = this.owner.direction ? theta : Math.PI - theta;
      ret = this.typeActivate(origin,theta,terrain);
    }
    return ret;
  }

  this.update = function(){
    if(this.cooldownTimer > 0){
      this.cooldownTimer -= 1;
    }
    this.typeUpdate();
  }
  this.typeUpdate = function(){};
}

RepairTool = function(owner){
  Tool.call(this,owner);
  this.type = 'repair';
  this.tileRepair = 10;
  this.entityDamage = 10;
  this.repairBeam;

  this.typeActivate = function(origin,theta,terrain){
    this.repairBeam = false;
    var tX = utils.roundToGrid(origin.x);
    var tY = utils.roundToGrid(origin.y);
    var entities = terrain.getEntities(tX,tY);
    if(entities){
      for(var ei = 0; ei < entities.length; ei++){
        var entity = entities[ei];
        var friendly = (entity.type == this.owner.type);
        if(!friendly && entity.pointWithin(origin.x,origin.y)){
          entity.wound(this.entityDamage);
        }
      }
    }
    var range = 1*config.gridInterval;
    for(var x = tX-range; x <= tX+range; x += config.gridInterval){
      for(var y = tY-range; y <= tY+range; y += config.gridInterval){
        var tile = terrain.getTile(x,y);
        if(tile){
          var rep = tile.repair(this.tileRepair);
          if(rep){
            this.repairBeam = tile.center();
            var built = (rep == 'built');
            return {'action':'repair','built':built};
          }
        }
      }
    }
  }
}

Wrench = function(owner){
  RepairTool.call(this,owner);

  this.name.set("Repair","Wrench");
  this.cooldownCost = 10;
  this.range = config.gridInterval * 2;
  this.actionOffset.x = config.gridInterval * 0.9;
  this.actionOffset.y = config.gridInterval * -0.2;
  this.animationDir = -1;
  this.animationFrame = 0;
  this.animationLength = 20;

  this.typeUpdate = function(){
    if(this.owner.toolActive){
      this.animationDir = this.animationDir || 1;
    }else{
      this.repairBeam = false;
      if(this.animationFrame == (this.animationLength/2)){
        this.animationDir = 0;
      }
    }
    if(this.animationDir){
      if(this.animationFrame == 0 || this.animationFrame == this.animationLength){
        this.animationDir = -1 * this.animationDir;
      }
      this.animationFrame += this.animationDir;
    }
  };

  this.drawTool = function(x,y,buffer,camera,alpha){
    weaponArt.drawWrench(x,y,buffer,this,camera,alpha);
  }

  this.clone = function(owner){
    return new Wrench(owner);
  }
}

DrillTool = function(owner){
  Tool.call(this,owner);
  this.type = 'delete';
  this.entityDamage;
  this.tileDamage;

  this.typeActivate = function(origin,theta,terrain){
    var tX = utils.roundToGrid(origin.x);
    var tY = utils.roundToGrid(origin.y);
    var entities = terrain.getEntities(tX,tY);
    if(entities){
      for(var ei = 0; ei < entities.length; ei++){
        var entity = entities[ei];
        var friendly = (entity.type == this.owner.type || entity.type == 'corpse');
        if(!friendly && entity.pointWithin(origin.x,origin.y)){
          entity.wound(this.entityDamage);
        }
      }
    }
    var tile = terrain.getTile(tX,tY);
    if(tile && tile.wound(this.tileDamage)){
      return {'action':'delete','obj':tile};
    }
  }
}

PlasmaTorch = function(owner){
  DrillTool.call(this,owner);
  this.entityDamage = 20;
  this.tileDamage = 30;

  this.name.set("Plasma","Torch");
  this.cooldownCost = 10;
  this.range = config.gridInterval * 2;
  this.actionOffset.x = config.gridInterval * 1.5;
  this.actionOffset.y = config.gridInterval * -0.2;

  this.drawTool = function(x,y,buffer,camera,alpha){
    weaponArt.drawPlasmaTorch(x,y,buffer,this.owner,alpha);
  }

  this.clone = function(owner){
    return new PlasmaTorch(owner);
  }
}

Tool = function(owner){
  this.owner = owner;
  this.name = new Name("Unknown","Tool");
  this.cooldownTimer = 0;
  this.cooldownCost;
  this.range = config.gridInterval;
  this.actionOffset = new Vector(0,0);
  this.type;
  this.energyCost = 1;

  this.draw = function(x,y,canvasContext,camera,alpha){
    this.drawTool(x,y,canvasContext,camera,alpha);
  }

  this.drawTool = function(x,y,buffer,camera,alpha){};

  this.pointOfAction = function(){
    var origin = this.owner.center();
    var theta = this.owner.toolTheta || 0;
    var dir = this.owner.direction ? 1 : -1;
    var poA = utils.rotate(this.actionOffset.x,this.actionOffset.y,theta);
    origin.x += poA[0] * dir;
    origin.y += poA[1];
    return origin;
  }

  this.activate = function(terrain){
    var ret = false;
    var enoughEnergy = (owner.currentEnergy >= this.energyCost);
    if(!this.cooldownTimer && enoughEnergy){
      owner.currentEnergy -= this.energyCost;
      this.cooldownTimer += this.cooldownCost;
      //find point of action
      var origin = this.pointOfAction();
      ret = this.typeActivate(origin,terrain);
    }
    return ret;
  }

  this.update = function(terrain){
    if(this.cooldownTimer > 0){
      this.cooldownTimer -= 1;
    }
    this.typeUpdate(terrain);
  }
  this.typeUpdate = function(terrain){};
  this.updateLight = function(terrain){};
}

RepairTool = function(owner){
  Tool.call(this,owner);
  this.type = 'repair';
  this.tileRepair = 10;
  this.entityDamage = 10;
  this.repairBeam;

  this.typeActivate = function(origin,terrain){
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

  this.typeUpdate = function(terrain){
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
  this.contact = false;

  this.typeActivate = function(origin,terrain){
    var tX = utils.roundToGrid(origin.x);
    var tY = utils.roundToGrid(origin.y);
    var entities = terrain.getEntities(tX,tY);
    if(entities){
      for(var ei = 0; ei < entities.length; ei++){
        var entity = entities[ei];
        var friendly = (entity.type == this.owner.type || entity.type == 'corpse');
        if(!friendly && entity.pointWithin(origin.x,origin.y)){
          entity.wound(this.entityDamage);
          this.contact = true;
        }
      }
    }
    var tile = terrain.getTile(tX,tY);
    if(tile){
      this.contact = true;
      if(tile.wound(this.tileDamage)){
        return {'action':'delete','obj':tile};
      }
    }
  }
}

PlasmaTorch = function(owner){
  DrillTool.call(this,owner);
  this.entityDamage = 20;
  this.tileDamage = 30;
  this.energyCost = 1.5;

  this.name.set("Plasma","Torch");
  this.cooldownCost = 10;
  this.range = config.gridInterval * 2;
  this.actionOffset.x = config.gridInterval * 1.3;
  this.actionOffset.y = config.gridInterval * -0.2;

  this.drawTool = function(x,y,buffer,camera,alpha){
    weaponArt.drawPlasmaTorch(x,y,buffer,this.owner,alpha);
  }

  this.updateLight = function(terrain){
    var lColor = new Color()
    var rand = Math.random();
    if(this.owner.toolActive){
      lColor.randomize('spark');
      var orig = this.pointOfAction();
      var lRad = (rand > 0.9) ? 1 : (3 + rand);
      if(this.contact){
        //spawn particles
        this.contactEffects(orig,terrain);
      }
    }else{
      lColor.randomize('fire');
      var orig = this.pointOfAction();
      orig.x += config.gridInterval * (this.owner.direction ? -0.4 : 0.4);
      var lRad = 0.2 + (rand*0.3);
      lColor.a = 0.8;
    }
    this.cuttingEffects(orig,terrain);
    terrain.updateLightMap(orig,lRad,lColor);
    this.contact = false;
  }

  this.cuttingEffects = function(orig,terrain){
    orig = orig.clone();
    var sprays = 1;
    if(this.owner.toolActive){
      sprays = 5;
      orig.x += config.gridInterval * 0.55 * (this.owner.direction ? -1 : 1);
    }else{
      orig.x += config.gridInterval * 0.2 * (this.owner.direction ? -1 : 1);
    }
    orig.y += config.gridInterval * 0.1;
    var theta = 0;
    var maxV = 0;
    var rad = 0.15;
    for(var b = 0; b < sprays; b++){
      var t = this.owner.toolTheta;
      var point = utils.rotate(maxV,0,t);
      point[0] = point[0] * (this.owner.direction ? 1 : -1);
      var v = new Vector(0,0);
      //radius
      var duration = 1;
      //
      var color = new Color();
      color.randomize('spark');
      color.a = 0.8;
      terrain.addParticle(new StreamParticle(orig.clone(),v,duration,rad,color));
      orig.x += config.gridInterval*rad*(this.owner.direction ? 1 : -1);
      rad = rad * 0.8;
    }
  }

  this.contactEffects = function(orig,terrain){
    //jet spray
    var sprays = 16;
    var sprayMid = Math.floor(sprays/2);

    var theta = 0;
    var dTheta = Math.PI * 2 / sprays;
    for(var b = 0; b < sprays; b++){
      var rand = Math.random();
      var maxV = 1 + (1*rand);
      //find velo
      var t = (rand * dTheta) + theta;
      var point = utils.rotate(0,-1,t);
      theta += dTheta;
      var vX = point[0] * maxV;
      var vY = point[1] * maxV;
      var v = new Vector(vX,vY);
      //radius
      var rad = Math.random() * 0.4;
      var duration = 10 + Math.random() * 5;
      //
      terrain.addParticle(new PlasmaParticle(orig.clone(),v,duration,rad,'spark'));
    }
  };

  this.clone = function(owner){
    return new PlasmaTorch(owner);
  }
}

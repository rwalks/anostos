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
    if(!this.cooldownTimer){
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
  this.actionOffset.x = config.gridInterval * 1.3;
  this.actionOffset.y = config.gridInterval * -0.2;

  this.drawTool = function(x,y,buffer,camera,alpha){
    weaponArt.drawPlasmaTorch(x,y,buffer,this.owner,alpha);
  }

  this.updateLight = function(terrain){
    if(this.owner.toolActive){
      var orig = this.pointOfAction();
      var lRad = 2;
      var rand = Math.random();
      var r; var g; var b; var a;
      if(rand > 0.9){
        r = 255; g = 255; b = 255;
        a = 0.2;
        lRad = 20;
      }else if(rand > 0.8){
        r = 255; g = 255; b = 255;
        a = 0.2;
        lRad = 5;
      }else if(rand > 0.333){
        r = 255; g = 50; b = 0;
        a = 0.6;
        lRad = 3;
      }else{
        r = 255; g = 255; b = 0;
        a = 0.9;
      }
      lColor = new Color(r,g,b,a);
      terrain.updateLightMap(orig,lRad,lColor);
    }
  }

  this.clone = function(owner){
    return new PlasmaTorch(owner);
  }
}

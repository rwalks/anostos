Building = function(x,y){
  Tile.call(this,x,y);

  this.resourceAffinity;
  this.name.set("Unknown","Building");
  this.pathable = true;
  this.type = "building";
  this.storageCapacity = 0;
  this.currentOxygen = 0;
  this.rooms = [];
  this.containers = [];
  this.resourceConnections = {};
  this.built = false;
  this.active = false;
  this.baseAlpha = 0.2;
  this.healthAlpha = 0.7;

  this.collision = function(){return false;}

  this.draw = function(camera,canvasBufferContext,count,terrain){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      var x = (this.position.x-camera.xOff)*config.xRatio;
      var y = (this.position.y-camera.yOff)*config.yRatio;
      var cent = this.center();
      var lightX = utils.roundToGrid(cent.x);
      var lightY = utils.roundToGrid(cent.y);
      var light = terrain.getLight(lightX,lightY);
      light = light ? light[0] : 0;
      var alpha = this.baseAlpha + (this.healthPercent()*this.healthAlpha*light);
      this.drawBlock(x,y,alpha,canvasBufferContext,1);
      this.drawStatus(x,y,count,canvasBufferContext);
    }
  }

  this.drawStatus = function(x,y,count,canvasBufferContext){
    if(!this.built || (this.healthPercent() < (2/3))){
      bArt.drawHealthIcon(x,y,count,this,canvasBufferContext);
    }
  }

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    var scale = (xSize*0.4) / (this.size.x*config.xRatio);
    this.drawBlock(oX+(xSize*0.3),oY+(ySize*0.2),1.0,canvasBufferContext,scale);
  }

  this.healthPercent = function(){return this.currentHealth / this.maxHealth;}

  this.clone = function(x,y){
    return new Building(x,y);
  }

  this.updateGenerator = function(resources){
    if(this.built){
      //attempt reaction
      var react = true;
      var inputResources = Object.keys(this.genInput);
      for(var ir = 0; ir < inputResources.length; ir ++){
        var inputResource = inputResources[ir];

        var connectedResource = (inputResource == 'power') || this.resourceConnections[inputResource];
        var requiredResources = resources[inputResource] && (resources[inputResource].current >= this.genInput[inputResource]);
        if(!(connectedResource && requiredResources)){
          react = false;
        }
      }
      this.active = react;
      if(react){
        var outputResources = Object.keys(this.genOutput);
        var outputPath = false;
        for(var or = 0; or < outputResources.length; or ++){
          var outputResource = outputResources[or];
          var outputAmount = this.genOutput[outputResource];
          if(outputResource == 'oxygen'){
            //push oxygen to rooms and containers
            var oxDests = [this.rooms,this.containers];
            for(var ti = 0; ti < oxDests.length; ti++){
              var destObjs = oxDests[ti];
              for(var ri = 0; ri < destObjs.length; ri++){
                var obj = destObjs[ri];
                var drain = obj.addOxygen(outputAmount);
                if(drain){
                  outputPath = true;
                  outputAmount -= drain;
                }
              }
            }
          }else{
            var resource = resources[outputResource];
            resource.current += outputAmount;
            resource.current = Math.min(resource.current,resource.max);
            outputPath = true;
          }
        }
        if(outputPath){
          for(var ir = 0; ir < inputResources.length; ir ++){
            var inputResource = inputResources[ir];
            resources[inputResource].current -= this.genInput[inputResource];
          }
        }
      }
    }
  }

  this.relatedAffinity = function(affinity){
    var ret = false;
    if(affinity == this.resourceAffinity){
      ret = true;
    }else if(this.type == 'generator'){
      var resTypes = [affinity];
      if(affinity == 'dry'){
        resTypes = ['soil','ore','metal'];
      }
      for(var di = 0; di < resTypes.length; di++){
        var res = resTypes[di];
        if(this.genInput[res] || this.genOutput[res]){
          ret = true;
        }
      }
    }
    return ret;
  }

  this.addOxygen = function(amount){
    var defecit = this.storageCapacity - this.currentOxygen;
    var drain = Math.min(amount,defecit);
    this.currentOxygen += drain;
    return drain;
  }

  this.removeOxygen = function(amount){
    var drain = Math.min(amount,this.currentOxygen);
    this.currentOxygen -= drain;
    return drain;
  }

}

ChemicalBattery = function(x,y){
  Building.call(this,x,y);

  this.type = "container";
  this.name.set('Chemical','Battery');
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
  this.cost = {'metal':8};
  this.resourceAffinity = 'power';
  this.storageCapacity = 250;

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawChemicalBattery(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new ChemicalBattery(x,y);
  }
}

WaterCistern = function(x,y){
  Building.call(this,x,y);

  this.type = "container";

  this.name.set('Water','Cistern');
  this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
  this.cost = {'metal':8};
  this.resourceAffinity = 'water';
  this.storageCapacity = 250;

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawWaterCistern(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new WaterCistern(x,y);
  }
}

OxygenTank = function(x,y){
  Building.call(this,x,y);

  this.type = "container";

  this.name.set('Oxygen','Tank');
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
  this.cost = {'metal':8};
  this.resourceAffinity = 'oxygen';
  this.storageCapacity = 250;

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawOxygenTank(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new OxygenTank(x,y);
  }
}

DryStorage = function(x,y){
  Building.call(this,x,y);

  this.type = "container";

  this.name.set('Dry','Storage');
  this.cost = {'metal':8};
  this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
  this.resourceAffinity = 'dry';
  this.storageCapacity = 250;

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawDryStorage(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new DryStorage(x,y);
  }
}

AirVent = function(x,y){
  Building.call(this,x,y);

  this.type = "conveyor";

  this.name.set('Air','Vent');
  this.cost = {'metal':4};
  this.resourceAffinity = 'oxygen';

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawAirVent(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new AirVent(x,y);
  }
}

WaterPipe = function(x,y){
  Building.call(this,x,y);

  this.type = "conveyor";

  this.name.set('Water','Pipe');
  this.cost = {'metal':4};
  this.resourceAffinity = 'water';

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawWaterPipe(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new WaterPipe(x,y);
  }
}

ConveyorTube = function(x,y){
  Building.call(this,x,y);

  this.type = "conveyor";

  this.name.set('Conveyor','Tube');
  this.cost = {'metal':4};
  this.resourceAffinity = 'dry';

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawConveyorTube(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new ConveyorTube(x,y);
  }
}

SoilEvaporator = function(x,y){
  Building.call(this,x,y);

  this.type = "generator";

  this.name.set('Soil','Evaporator');
  this.size = {'x':4*config.gridInterval,'y':2*config.gridInterval};
  this.cost = {'metal':16};
  this.resourceAffinity = 'oxygen';
  this.genInput = {'soil':10,'power':5};
  this.genOutput = {'oxygen':1};


  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawSoilEvaporator(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new SoilEvaporator(x,y);
  }
}

OxygenCondenser = function(x,y){
  Building.call(this,x,y);

  this.type = "generator";

  this.name.set('O2','Condenser');
  this.size = {'x':2*config.gridInterval,'y':5*config.gridInterval};
  this.cost = {'metal':50};
  this.resourceAffinity = 'oxygen';
  this.genInput = {'power':3};
  this.genOutput = {'oxygen':0.25};


  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawOxygenCondenser(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new OxygenCondenser(x,y);
  }
}

SmeltingChamber = function(x,y){
  Building.call(this,x,y);

  this.type = "generator";

  this.name.set('Smelting','Chamber');
  this.cost = {'metal':16};
  this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
  this.resourceAffinity = 'dry';
  this.genInput = {'ore':10,'power':1};
  this.genOutput = {'metal':5};


  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawSmeltingChamber(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new SmeltingChamber(x,y);
  }
}

SolarPanel = function(x,y){
  Building.call(this,x,y);

  this.type = "generator";

  this.name.set('Solar','Panel');
  this.cost = {'metal':10};
  this.size = {'x':3*config.gridInterval,'y':1*config.gridInterval};
  this.resourceAffinity = 'power';

  this.genInput = {};
  this.genOutput = {'power':1};


  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    bArt.drawSolarPanel(x,y,alpha,canvasBufferContext,this,scl);
  }

  this.clone = function(x,y){
    return new SolarPanel(x,y);
  }
}

Building = function(pos){
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.interact = false;
  this.inventory = new Inventory();
  this.cost = {};
  this.actions = [];
  this.resourceAffinity;
  this.name = ["Unknown","Building"];
  this.position = pos ? pos : {'x':0,'y':0};
  this.collision = function(){return false;}
  this.pathable = true;
  this.lastDrawn = -1;
  this.type = "tile";
  this.storageCapacity = 0;
  this.currentOxygen = 0;
  this.rooms = [];
  this.containers = [];
  this.resourceConnections = {};

  this.maxHealth = 100; this.currentHealth = 100;

  this.center = function(){
    return {'x':this.position.x+(this.size.x*0.5),'y':this.position.y+(this.size.y*0.5)};
  }

  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      var x = (this.position.x-camera.xOff)*config.xRatio;
      var y = (this.position.y-camera.yOff)*config.yRatio;
      this.drawBlock(x,y,canvasBufferContext);
    }
  }

  this.drawBlock = function(x,y,canvasBufferContext,scl){
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    var scale = (xSize*0.4) / (this.size.x*config.xRatio);
    this.drawBlock(oX+(xSize*0.3),oY+(ySize*0.2),canvasBufferContext,scale);
  }

  this.click = function(coords,terrain){
    return;
  }
  this.clone = function(pos){
    return new Building(pos);
  }

  this.updateGenerator = function(resources){
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

ChemicalBattery = function(pos){
  Building.call(this,pos);

  this.type = "container";
  this.name = ['Chemical','Battery'];
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
  this.cost = {'metal':8};
  this.actions = [];
  this.resourceAffinity = 'power';
  this.storageCapacity = 250;

  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawChemicalBattery(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new ChemicalBattery(pos);
  }
}

WaterCistern = function(pos){
  Building.call(this,pos);

  this.type = "container";

  this.name = ['Water','Cistern'];
  this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
  this.interact = 'inventory';
  this.cost = {'metal':8};
  this.inventory.allowedResources = ['water'];
  this.resourceAffinity = 'water';
  this.storageCapacity = 250;

  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawWaterCistern(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new WaterCistern(pos);
  }
}

OxygenTank = function(pos){
  Building.call(this,pos);

  this.type = "container";

  this.name = ['Oxygen','Tank'];
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
  this.interact = 'inventory';
  this.cost = {'metal':8};
  this.inventory.allowedResources = ['oxygen'];
  this.resourceAffinity = 'oxygen';
  this.storageCapacity = 250;

  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawOxygenTank(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new OxygenTank(pos);
  }
}

DryStorage = function(pos){
  Building.call(this,pos);

  this.type = "container";

  this.name = ['Dry','Storage'];
  this.interact = 'inventory';
  this.cost = {'metal':8};
  this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
  this.inventory.allowedResources = ['soil','metal','ore'];
  this.resourceAffinity = 'dry';
  this.storageCapacity = 250;

  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawDryStorage(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new DryStorage(pos);
  }
}

AirVent = function(pos){
  Building.call(this,pos);

  this.type = "conveyor";

  this.name = ['Air','Vent'];
  this.cost = {'metal':4};
  this.resourceAffinity = 'oxygen';

  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawAirVent(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new AirVent(pos);
  }
}

WaterPipe = function(pos){
  Building.call(this,pos);

  this.type = "conveyor";

  this.name = ['Water','Pipe'];
  this.cost = {'metal':4};
  this.resourceAffinity = 'water';

  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawWaterPipe(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new WaterPipe(pos);
  }
}

ConveyorTube = function(pos){
  Building.call(this,pos);

  this.type = "conveyor";

  this.name = ['Conveyor','Tube'];
  this.cost = {'metal':4};
  this.resourceAffinity = 'dry';

  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawConveyorTube(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new ConveyorTube(pos);
  }
}

SoilEvaporator = function(pos){
  Building.call(this,pos);

  this.type = "generator";

  this.name = ['Soil','Evaporator'];
  this.size = {'x':4*config.gridInterval,'y':2*config.gridInterval};
  this.cost = {'metal':16};
  this.resourceAffinity = 'oxygen';
  this.inventory.allowedResources = ['oxygen','soil'];
  this.genInput = {'soil':10,'power':5};
  this.genOutput = {'oxygen':1};


  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawSoilEvaporator(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new SoilEvaporator(pos);
  }
}

OxygenCondenser = function(pos){
  Building.call(this,pos);

  this.type = "generator";

  this.name = ['O2','Condenser'];
  this.size = {'x':2*config.gridInterval,'y':5*config.gridInterval};
  this.cost = {'metal':50};
  this.resourceAffinity = 'oxygen';
  this.inventory.allowedResources = ['water','oxygen'];
  this.genInput = {'power':5};
  this.genOutput = {'oxygen':0.1};


  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawOxygenCondenser(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new OxygenCondenser(pos);
  }
}

SmeltingChamber = function(pos){
  Building.call(this,pos);

  this.type = "generator";

  this.name = ['Smelting','Chamber'];
  this.cost = {'metal':16};
  this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
  this.resourceAffinity = 'dry';
  this.inventory.allowedResources = ['oxygen','ore','metal'];
  this.genInput = {'ore':10,'power':1};
  this.genOutput = {'metal':5};


  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawSmeltingChamber(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new SmeltingChamber(pos);
  }
}

SolarPanel = function(pos){
  Building.call(this,pos);

  this.type = "generator";

  this.name = ['Solar','Panel'];
  fName = 'Solar';
  lName = 'Panel';
  this.cost = {'metal':10};
  this.size = {'x':3*config.gridInterval,'y':1*config.gridInterval};
  this.resourceAffinity = 'power';

  this.genInput = {};
  this.genOutput = {'power':1};


  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawSolarPanel(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new SolarPanel(pos);
  }
}

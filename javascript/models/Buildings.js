Building = function(pos){
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.interact = false;
  this.inventory = new Inventory();
  this.cost = {};
  this.actions = [];
  this.resourceAffinities = [];
  this.name = ["Unknown","Building"];
  this.position = pos ? pos : {'x':0,'y':0};
  this.collision = function(){return false;}
  this.pathable = true;
  this.lastDrawn = -1;
  this.type = "tile";

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

}

ChemicalBattery = function(pos){
  Building.call(this,pos);

  this.type = "container";
  this.name = ['Chemical','Battery'];
  this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
  this.cost = {'metal':8};
  this.actions = [];
  this.resourceAffinities = ['power'];
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
  this.resourceAffinities = ['water'];
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
  this.resourceAffinities = ['oxygen'];
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
  this.resourceAffinities = ['dry'];
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
  this.resourceAffinities = ['oxygen'];

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
  this.resourceAffinities = ['water'];

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
  this.resourceAffinities = ['dry'];

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
  this.resourceAffinities = ['oxygen','dry'];
  this.inventory.allowedResources = ['oxygen','soil'];
  this.genInput = {'soil':10};
  this.genOutput = {'oxygen':1};
  this.powerReq = 5;

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
  this.resourceAffinities = ['water','oxygen'];
  this.inventory.allowedResources = ['water','oxygen'];
  this.genInput = {};
  this.genOutput = {'oxygen':0.1};
  this.powerReq = 5;

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
  this.resourceAffinities = ['dry','oxygen'];
  this.inventory.allowedResources = ['oxygen','ore','metal'];
  this.genInput = {'ore':10,'oxygen':10};
  this.genOutput = {'metal':5};
  this.powerReq = 1;

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
  this.resourceAffinities = ['power'];
  this.powerYield = 1;
  this.solar = true;

  this.drawBlock = function(x,y,canvasBufferContext,scl){
    bArt.drawSolarPanel(x,y,canvasBufferContext,this.size,scl);
  }

  this.clone = function(pos){
    return new SolarPanel(pos);
  }
}

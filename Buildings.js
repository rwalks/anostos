StorageBuild = function(type,pos) {
  var fName = '';
  var lName = '';
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.interact = false;
  this.inventory = new Inventory();
  this.cost = {};
  this.actions = ["inventory"];
  switch(type){
    case 'power':
      fName = 'Chemical';
      lName = 'Battery';
      this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
      this.cost = {'metal':8};
      this.actions = [];
      this.resourceAffinities = ['power'];
      this.powerCapacity = 250;
      break;
    case 'water':
      fName = 'Water';
      lName = 'Cistern';
      this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
      this.interact = 'inventory';
      this.cost = {'metal':8};
      this.inventory.allowedResources = ['water'];
      this.resourceAffinities = ['water'];
      break;
    case 'oxygen':
      fName = 'Oxygen';
      lName = 'Tank';
      this.size = {'x':1*config.gridInterval,'y':2*config.gridInterval};
      this.interact = 'inventory';
      this.cost = {'metal':8};
      this.inventory.allowedResources = ['oxygen'];
      this.resourceAffinities = ['oxygen'];
      break;
    case 'dry':
      fName = 'Dry';
      lName = 'Storage';
      this.interact = 'inventory';
      this.cost = {'metal':8};
      this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
      this.inventory.allowedResources = ['soil','metal','ore'];
      this.resourceAffinities = ['dry'];
      break;
  }
  this.name = [fName,lName];
  this.position = pos ? pos : {'x':x,'y':y};
  this.collision = function(){return false;}
  this.pathable = true;
  this.lastDrawn = -1;
  this.type = "container";
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
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = this.size.x*config.xRatio*scale;
    var lY = this.size.y*config.yRatio*scale;
    if(type == 'power'){
      //energybarz
      for(var ex=oX+(lX*0.1);ex<oX+(lX*0.8);ex+=lX*0.2){
        var dr = Math.floor(Math.random() * 50);
        var dg = Math.floor(Math.random() * 50);
        var db = Math.floor(Math.random() * 50);
        var da = Math.floor(Math.random() * 0.1) + 0.9;
        var rgbaString = "rgba("+(200+dr)+","+(200+dg)+","+(80+db)+","+da+")";
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = rgbaString;
        canvasBufferContext.rect(ex,oY+lY*0.1,lX*0.2,lY*0.8);
        canvasBufferContext.fill();

      }
      var capRGB = "rgba(180,180,190,1.0)";
      //topcap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = capRGB;
      canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
      canvasBufferContext.moveTo(oX,oY);
      var points = [[lX,0],[lX,lY*0.1],[lX*0.9,lY*0.15],[lX/2,lY*0.25],[lX*0.1,lY*0.15],[0,lY*0.1],[0,0]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //bottomCap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.moveTo(oX+lX,oY+lY);
      var points = [[lX,lY*0.9],[lX*0.9,lY*0.85],[lX*0.5,lY*0.75],[lX*0.1,lY*0.85],[0,lY*0.9],[0,lY],[lX,lY]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();

    }else if(type == 'oxygen'){
      var capRGB = "rgba(180,180,190,1.0)";
      //topcap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = capRGB;
      canvasBufferContext.strokeStyle= "rgba(100,100,100,1.0)";
      canvasBufferContext.moveTo(oX+lX*0.4,oY);
      var points = [[lX*0.4,lY*0.05],[0,lY*0.15],[0,lY*0.85],[lX*0.4,lY*0.95],[lX*0.4,lY],[lX*0.6,lY],[lX*0.6,lY*0.95],[lX,lY*0.85],[lX,lY*0.15],[lX*0.6,lY*0.05],[lX*0.6,0],[lX*0.4,0]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //energybarz
      for(var ey=oY+(lY*0.25);ey<oY+(lY*0.6);ey+=lY*0.3){
        var dr = Math.floor(Math.random() * 30);
        var da = Math.floor(Math.random() * 0.1) + 0.9;
        var rgbaString = "rgba("+(230+dr)+","+(230+dr)+","+(230+dr)+","+da+")";
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = rgbaString;
        canvasBufferContext.rect(oX,ey,lX,lY*0.2);
        canvasBufferContext.fill();

      }
    }else if(type == 'water'){
      //energybarz
      var points = [[lX*0.3,lY*0.1],[lX*0.1,lY*0.3],[lX*0.3,lY*0.6],[lX*0.6,lY*0.3]];
      for(p in points){
        var db = Math.floor(Math.random() * 50);
        var da = Math.floor(Math.random() * 0.1) + 0.9;
        var rgbaString = "rgba(0,0,"+(200+db)+","+da+")";
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = rgbaString;
        var sX; var sY;
        if(p == 0 || p == 2){
          sX = lX * 0.4;
          sY = lY * 0.3;
        }else{
          sX = lX * 0.3;
          sY = lY * 0.4;
        }
        canvasBufferContext.rect(oX+points[p][0],oY+points[p][1],sX,sY);
        canvasBufferContext.fill();

      }
      var capRGB = "rgba(180,180,190,1.0)";
      //topcap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = capRGB;
      canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
      canvasBufferContext.moveTo(oX+lX*0.2,oY);
      var points = [[lX*0.3,0],[lX*0.3,lY*0.2],[lX*0.5,lY*0.4],[lX*0.7,lY*0.2],[lX*0.7,0],[lX*0.8,0],[lX*0.8,lY*0.1],[lX*0.9,lY*0.2],[lX,lY*0.2],[lX,lY*0.3],[lX*0.8,lY*0.3],[lX*0.6,lY*0.5],[lX*0.8,lY*0.7],[lX,lY*0.7],[lX,lY*0.8],[lX*0.9,lY*0.8],[lX*0.8,lY*0.9],[lX*0.8,lY],[lX*0.7,lY],[lX*0.7,lY*0.8],[lX*0.5,lY*0.6],[lX*0.3,lY*0.8],[lX*0.3,lY],[lX*0.2,lY],[lX*0.2,lY*0.9],[lX*0.1,lY*0.8],[0,lY*0.8],[0,lY*0.7],[lX*0.2,lY*0.7],[lX*0.4,lY*0.5],[lX*0.2,lY*0.3],[0,lY*0.3],[0,lY*0.2],[lX*0.1,lY*0.2],[lX*0.2,lY*0.1],[lX*0.2,0]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }else if(type == 'dry'){
      //topcap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle= "rgba(200,50,70,1.0)";
      canvasBufferContext.strokeStyle= "rgba(200,150,100,1.0)";
      canvasBufferContext.moveTo(oX,oY);
      var points = [
        [lX*0.1,0],[lX*0.15,lY*-0.05],[lX*0.35,lY*-0.05],[lX*0.4,0],[lX*0.6,0],[lX*0.65,lY*-0.05],[lX*0.85,lY*-0.05],[lX*0.9,0],[lX,0],
        [lX,lY*0.1],[lX*1.05,lY*0.15],[lX*1.05,lY*0.35],[lX,lY*0.4],[lX,lY*0.6],[lX*1.05,lY*0.65],[lX*1.05,lY*0.85],[lX,lY*0.9],[lX,lY],
        [lX*0.9,lY],[lX*0.85,lY*0.95],[lX*0.65,lY*0.95],[lX*0.6,lY],[lX*0.4,lY],[lX*0.35,lY*0.95],[lX*0.15,lY*0.95],[lX*0.1,lY],[0,lY],
        [0,lY*0.9],[lX*0.05,lY*0.85],[lX*0.05,lY*0.65],[0,lY*0.6],[0,lY*0.4],[lX*0.05,lY*0.35],[lX*0.05,lY*0.15],[0,lY*0.1],[0,0]
          ];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //energybarz
      var ey = oY + lY*0.1;
      var sx = lX*0.1;
      var sy = lY*0.8;
      for(var ex=oX+(lX*0.2);ex<oX+(lX*0.9);ex+=lX*0.2){
        var dr = Math.floor(Math.random() * 30);
        var da = Math.floor(Math.random() * 0.1) + 0.9;
        var rgbaString = "rgba("+(100+dr)+","+(40+dr)+","+dr+","+da+")";
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = rgbaString;
        canvasBufferContext.rect(ex,ey,sx,sy);
        canvasBufferContext.fill();

      }
    }else{
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
      canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
      canvasBufferContext.rect(oX,oY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    var scale = (xSize*0.4) / (this.size.x*config.xRatio);
    this.drawBlock(oX+(xSize*0.3),oY+(ySize*0.2),canvasBufferContext,scale);
  }

  this.click = function(coords,terrain){
    return;
  }
  this.rType = type;
  this.clone = function(pos){
    return new StorageBuild(this.rType,pos);
  }
}

ConveyorBuild = function(type,pos) {
  var fName = '';
  this.pathable = true;
  this.airtight = false;
  switch(type){
    case 'vent':
      fName = 'Air';
      lName = 'Vent';
      this.airtight = true;
      this.cost = {'metal':4};
      this.resourceAffinities = ['oxygen'];
      break;
    case 'pipe':
      fName = 'Water';
      lName = 'Pipe';
      this.cost = {'metal':4};
      this.resourceAffinities = ['water'];
      break;
    case 'dry':
      fName = 'Conveyor';
      lName = 'Tube';
      this.cost = {'metal':4};
      this.resourceAffinities = ['dry'];
      break;
  }
  this.name = [fName,lName];
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.position = pos ? pos : {'x':x,'y':y};
  this.collision = function(){return false;}
  this.lastDrawn = -1;
  this.type = "conveyor";

  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
    }
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
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = this.size.x*config.xRatio*scale;
    var lY = this.size.y*config.yRatio*scale;
    if(type == 'pipe'){
      var capRGB = "rgba(180,180,190,1.0)";
      canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
      //pipes
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.rect(oX+lX*0.4,oY,lX*0.2,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.rect(oX,oY+lY*0.4,lX,lY*0.2);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //topcap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = capRGB;
      canvasBufferContext.moveTo(oX+lX*0.5,oY+lY*0.1);
      var points = [[lX*0.9,lY*0.5],[lX*0.5,lY*0.9],[lX*0.1,lY*0.5],[lX*0.5,lY*0.1]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //energybarz
      var db = Math.floor(Math.random() * 50);
      var da = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba(0,0,"+(200+db)+","+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(oX+lX*0.5,oY+lY*0.3);
      var points = [[lX*0.7,lY*0.5],[lX*0.5,lY*0.7],[lX*0.3,lY*0.5],[lX*0.5,lY*0.3]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();

    }else if(type == 'vent'){
      var capRGB = "rgba(180,180,190,1.0)";
      canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
      //topcap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = capRGB;
      canvasBufferContext.moveTo(oX+lX*0.3,oY);
      var points = [[lX*0.7,0],[lX*0.7,lY*0.1],[lX*0.9,lY*0.3],[lX,lY*0.3],[lX,lY*0.7],[lX*0.9,lY*0.7],[lX*0.7,lY*0.9],[lX*0.7,lY],[lX*0.3,lY],[lX*0.3,lY*0.9],[lX*0.1,lY*0.7],[0,lY*0.7],[0,lY*0.3],[lX*0.1,lY*0.3],[lX*0.3,lY*0.1],[lX*0.3,0]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //energybarz
      for(dy=oY+(lY*0.3);dy<oY+(lY*0.7);dy+=lY*0.3){
        var db = Math.floor(Math.random() * 50);
        var da = Math.floor(Math.random() * 0.1) + 0.9;
        var rgbaString = "rgba("+(200+db)+","+(200+db)+","+(200+db)+","+da+")";
        canvasBufferContext.fillStyle = rgbaString;
        canvasBufferContext.beginPath();
        canvasBufferContext.rect(oX+(lX*0.2),dy,lX*0.6,lY*0.1);
        canvasBufferContext.fill();
      }
    }else if(type == 'dry'){
      //topcap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle= "rgba(130,100,100,1.0)";
      canvasBufferContext.strokeStyle= "rgba(200,150,100,1.0)";
      canvasBufferContext.moveTo(oX,oY+(lY*0.2));
      var points = [[lX*0.3,lY*-0.1],[lX*0.7,lY*-0.1],[lX*1.1,lY*0.3],[lX*1.1,lY*0.7],[lX*0.8,lY],[lX*0.7,lY*0.9],[lX*0.3,lY*0.9],[lX*0.2,lY],[0,lY*0.8],[lX*0.1,lY*0.7],[lX*0.1,lY*0.3],[0,lY*0.2]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //energybarz

      var ey = oY + lY*0.2;
      var sx = lX*0.2;
      var sy = lY*0.6;
      for(var ex=oX+(lX*0.3);ex<oX+(lX*0.7);ex+=lX*0.3){
        var dr = Math.floor(Math.random() * 30);
        var da = Math.floor(Math.random() * 0.1) + 0.9;
        var rgbaString = "rgba("+(100+dr)+","+(40+dr)+","+dr+","+da+")";
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = rgbaString;
        canvasBufferContext.rect(ex,ey,sx,sy);
        canvasBufferContext.fill();

      }
    }else{
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
      canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
      canvasBufferContext.rect(oX,oY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    var scale = (xSize*0.4) / (this.size.x*config.xRatio);
    this.drawBlock(oX+(xSize*0.3),oY+(ySize*0.2),canvasBufferContext,scale);
  }

  this.click = function(coords,terrain){
    return;
  }
  this.rType = type;
  this.clone = function(pos){
    return new ConveyorBuild(this.rType,pos);
  }
}

GeneratorBuild = function(type,pos) {
  var fName = '';
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.inventory = new Inventory();
  this.interact = false;
  switch(type){
     case 'power':
      fName = 'Nuclear';
      lName = 'Generator';
      break;
    case 'soil':
      fName = 'Soil';
      lName = 'Evaporator';
      this.size = {'x':4*config.gridInterval,'y':2*config.gridInterval};
      this.cost = {'metal':16};
      this.resourceAffinities = ['oxygen','dry'];
      this.inventory.allowedResources = ['oxygen','soil'];
      this.genInput = {'soil':10};
      this.genOutput = {'oxygen':1};
      this.powerReq = 2;
      break;
    case 'oxygen':
      fName = 'Atmospheric';
      lName = 'O2 Condensor';
      this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
      this.cost = {'metal':16};
      this.resourceAffinities = ['water','oxygen'];
      this.inventory.allowedResources = ['water','oxygen'];
      this.genInput = {'water':10};
      this.genOutput = {'oxygen':15};
      this.powerReq = 1;
      break;
    case 'metal':
      fName = 'Smelting';
      lName = 'Chamber';
      this.cost = {'metal':16};
      this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
      this.resourceAffinities = ['dry','oxygen'];
      this.inventory.allowedResources = ['oxygen','ore','metal'];
      this.genInput = {'ore':10,'oxygen':10};
      this.genOutput = {'metal':5};
      this.powerReq = 1;
      break;
    case 'solar':
      fName = 'Solar';
      lName = 'Panel';
      this.cost = {'metal':10};
      this.size = {'x':3*config.gridInterval,'y':1*config.gridInterval};
      this.resourceAffinities = ['power'];
      this.powerYield = 1;
      this.solar = true;
  }
  this.name = [fName,lName];
  this.position = pos ? pos : {'x':0,'y':0};
  this.collision = function(){return false;}
  this.pathable = true;
  this.lastDrawn = -1;
  this.type = "generator";

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
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = this.size.x*config.xRatio*scale;
    var lY = this.size.y*config.yRatio*scale;
    if(type == 'solar'){
      //energybarz
      for(var ex=oX;ex<oX+lX*0.9;ex+=lX*0.2){
        var dr = Math.floor(Math.random() * 30);
        var rgbaString = "rgba("+(100+dr)+","+(100+dr)+","+(200+dr)+",0.9)";
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = rgbaString;
        canvasBufferContext.rect(ex,oY+lY*0.2,lX*0.2,lY*0.4);
        canvasBufferContext.fill();
      }
      var baseRGB = "rgba(180,180,190,1.0)";
      //base
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = baseRGB;
      canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
      canvasBufferContext.moveTo(oX+lX*0.35,oY+lY);
      var points = [[lX*0.65,lY],[lX*0.65,lY*0.8],[lX*0.55,lY*0.8],[lX*0.55,lY*0.6],[lX*0.45,lY*0.6],[lX*0.45,lY*0.8],[lX*0.35,lY*0.8],[lX*0.35,lY]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }else if(type == 'oxygen'){
      var capRGB = "rgba(180,180,190,1.0)";
      canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
      //topcap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = capRGB;
      canvasBufferContext.moveTo(oX,oY+lY*0.1);
      var points = [[lX*0.1,0],[lX*0.4,0],[lX*0.5,lY*0.1],[lX*0.6,0],[lX*0.9,0],[lX,lY*0.1],[lX,lY*0.4],[lX*0.9,lY*0.5],
                    [lX,lY*0.6],[lX,lY*0.9],[lX*0.9,lY],[lX*0.6,lY],
                    [lX*0.5,lY*0.9],[lX*0.4,lY],[lX*0.1,lY],[0,lY*0.9],
                    [0,lY*0.6],[lX*0.1,lY*0.5],[0,lY*0.4],[0,lY*0.1]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //topChamber
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      var dr = Math.floor(Math.random() * 50);
      var da = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba("+(220+dr)+","+(220+dr)+","+(220+dr)+","+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.moveTo(oX+(lX*0.8),oY+(lY*0.5));
      var points = [[lX*0.2,lY*0.5],[lX*0.2,lY*0.3],[lX*0.5,lY*0.15],[lX*0.8,lY*0.3],[lX*0.8,lY*0.5]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //bottomChamber
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      var db = Math.floor(Math.random() * 50);
      var da = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba("+20+","+20+","+(200+db)+","+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.moveTo(oX+(lX*0.8),oY+(lY*0.5));
      var points = [[lX*0.2,lY*0.5],[lX*0.2,lY*0.7],[lX*0.5,lY*0.85],[lX*0.8,lY*0.7],[lX*0.8,lY*0.5]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //energybarz
      var dr = Math.floor(Math.random() * 50);
      var dg = Math.floor(Math.random() * 50);
      var da = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba("+(200+dr)+","+(200+dg)+","+10+","+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.beginPath();
      canvasBufferContext.rect(oX+(lX*0.4),oY+(lY*0.4),lX*0.2,lY*0.2);
      canvasBufferContext.fill();

    }else if(type == 'water'){
      var capRGB = "rgba(180,180,190,1.0)";
      canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
      //topcap
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = capRGB;
      canvasBufferContext.moveTo(oX,oY);
      var points = [[lX,0],[lX*0.9,lY*0.2],[lX*0.9,lY*0.8],[lX,lY*0.9],[lX,lY],[0,lY],[0,lY*0.9],[lX*0.1,lY*0.8],
                    [lX*0.1,lY*0.2],[0,0]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //water
      var db = Math.floor(Math.random() * 150);
      var da = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba("+20+","+20+","+(100+db)+","+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.beginPath();
      canvasBufferContext.rect(oX+(lX*0.2),oY+(lY*0.2),lX*0.6,lY*0.2);
      canvasBufferContext.fill();
      //soil
      var rgbaString = "rgba(20,200,150,0.9)";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.beginPath();
      canvasBufferContext.rect(oX+(lX*0.2),oY+(lY*0.4),lX*0.6,lY*0.4);
      canvasBufferContext.fill();
      //red
      var dr = Math.floor(Math.random() * 50);
      var dg = Math.floor(Math.random() * 50);
      var da = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba("+(200+dr)+","+(200+dg)+","+20+","+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.beginPath();
      canvasBufferContext.rect(oX+(lX*0.4),oY+(lY*0.2),lX*0.2,lY*0.6);
      canvasBufferContext.fill();
      var rgbaString = "rgba(100,100,100,0.9)";
      canvasBufferContext.fillStyle = rgbaString;
      for(var dx=0;dx<=lX*0.80;dx+=lX*0.80){
        for(var dy=lY*0.2;dy<=lY*0.7;dy+=lY*0.5){
          canvasBufferContext.beginPath();
          canvasBufferContext.rect(oX+dx,oY+dy,lX*0.2,lY*0.1);
          canvasBufferContext.fill();
        }
      }
    }else if(type == 'metal'){
      //topcap
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle= "rgba(10,5,7,1.0)";
      canvasBufferContext.strokeStyle= "rgba(200,150,100,1.0)";
      canvasBufferContext.moveTo(oX,oY+(lY*0.05));
      var points = [
        [lX*0.05,0],[lX*0.95,0],[lX,lY*0.05],[lX,lY*0.95],[lX*0.95,lY],[lX*0.05,lY],[0,lY*0.95],[0,lY*0.05]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //boilerdoor
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle= "rgba(100,100,100,0.6)";
      canvasBufferContext.strokeStyle= "rgba(50,50,50,1.0)";
      canvasBufferContext.moveTo(oX+(lX*0.05),oY+(lY*0.3));
      var points = [
        [lX*0.3,lY*0.05],[lX*0.7,lY*0.05],[lX*0.95,lY*0.3],[lX*0.95,lY*0.6],[lX*0.7,lY*0.85],[lX*0.3,lY*0.85],[lX*0.05,lY*0.6],[lX*0.05,lY*0.6]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //energybarz
      canvasBufferContext.beginPath();
      var dr = Math.floor(Math.random() * 80);
      var da = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba("+(170+dr)+",0,0,"+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.moveTo(oX+(lX*0.15),oY+(lY*0.35));
      var points = [
        [lX*0.3,lY*0.15],[lX*0.3,lY*0.75],[lX*0.15,lY*0.55],[lX*0.15,lY*0.35]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      canvasBufferContext.beginPath();
      var dr = Math.floor(Math.random() * 80);
      var da = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba("+(170+dr)+",0,0,"+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.moveTo(oX+(lX*0.85),oY+(lY*0.35));
      var points = [
        [lX*0.7,lY*0.15],[lX*0.7,lY*0.75],[lX*0.85,lY*0.55],[lX*0.85,lY*0.35]];
      for(p in points){
        canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
      }
      canvasBufferContext.fill();
      var ey = oY + lY*0.15;
      var sx = lX*0.125;
      var sy = lY*0.6;
      for(var ex=oX+(lX*0.35);ex<oX+(lX*0.6);ex+=lX*0.175){
        var dr = Math.floor(Math.random() * 80);
        var da = Math.floor(Math.random() * 0.1) + 0.9;
        var rgbaString = "rgba("+(170+dr)+",0,0,"+da+")";
        canvasBufferContext.beginPath();
        canvasBufferContext.fillStyle = rgbaString;
        canvasBufferContext.rect(ex,ey,sx,sy);
        canvasBufferContext.fill();

      }
    }else{
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
      canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
      canvasBufferContext.rect(oX,oY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    var scale = (xSize*0.4) / (this.size.x*config.xRatio);
    this.drawBlock(oX+(xSize*0.3),oY+(ySize*0.2),canvasBufferContext,scale);
  }

  this.click = function(coords,terrain){
    return;
  }
  this.rType = type;
  this.clone = function(pos){
    return new GeneratorBuild(this.rType,pos);
  }
}

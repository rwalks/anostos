Corpse = function(pos,inventory,cost){
  Tile.call(this,pos.x,pos.y);
  this.inventory = inventory ? inventory : new Inventory();
  this.name.set("Dessicated","Remains");
  this.cost = cost ? cost : {};
  this.maxVelocity = config.gridInterval / 2;
  this.lightRadius = 2;
  this.hasDrawn = false;

  var target = false;

  this.type = "corpse";

  this.update = function(terrain,humans){
    this.hasDrawn = false;
    if(target){
      var d = utils.objectDistance(target,this);
      if(d < config.pickUpRange){
        return true;
      }
      var fX = target.position.x - this.position.x;
      var fY = target.position.y - this.position.y;
      this.applyMaxVelocity(fX,fY);
    }else{
      //human pickup
      var minD = 999;
      for(var h in humans){
        var d = utils.objectDistance(humans[h],this);
        if(d < config.lootRange){
          if(d < minD){
            minD = d;
            target = humans[h];
          }
        }
      }
      //grav
      var gravY = this.position.y + this.size.y + config.gravity;
      var tY = utils.roundToGrid(gravY);
      var tX = utils.roundToGrid(this.position.x);
      if(terrain.getTile(tX,tY)){
     //   this.position.y = tY - this.size.y;
      }else{
        this.position.y = gravY;
      }
    }
  }

  this.applyMaxVelocity = function(dX,dY){
    var veloMax = this.maxVelocity / (Math.abs(dX) + Math.abs(dY));
    if(veloMax < 1){
      dX = dX * veloMax;
      dY = dY * veloMax;
    }
    this.position.x += dX;
    this.position.y += dY;
  }

  this.draw = function(camera,canvasBufferContext,terrain){
    if(!this.hasDrawn){
      this.hasDrawn = true;
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
    var capRGB = "rgba(10,10,10,0.5)";
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
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    var scale = (xSize*0.4) / (this.size.x*config.xRatio);
    this.drawBlock(oX+(xSize*0.3),oY+(ySize*0.2),canvasBufferContext,scale);
  }
}

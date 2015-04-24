StaticGuiArt = function(){
  CachedArt.call(this);

  this.drawCanvas = function(){
    this.drawElement();
  };

  this.drawElement = function(){};

  this.drawBorder = function(size,pos){
    this.context.save();
    var buffer = config.minRatio;
    this.context.lineWidth = buffer;
    //outer border
    this.context.strokeStyle="rgba(200,0,250,1.0)";
    this.context.beginPath();
    this.context.rect(pos.x,pos.y,size.x,size.y);
    this.context.stroke();
    //inner border + fill
    this.context.fillStyle = "rgba(20,0,50,1.0)";
    this.context.strokeStyle="rgba(76,0,112,1.0)";
    this.context.beginPath();
    this.context.rect(pos.x+buffer,pos.y+buffer,size.x-(2*buffer),size.y-(2*buffer));
    this.context.fill();
    this.context.stroke();
    this.context.restore();
  };
}

PlayerGuiArt = function(){
  StaticGuiArt.call(this);
  this.size = new Vector(config.cX * 0.24,config.cY * 0.13);
  var gaugeCapGeo = [[0,0],[0.3,0.22],[0.74,0.22],[1,0.67],[1,1],[0.74,0.72],[0.3,0.72],[0.03,1],[0.04,0.78],[0.17,0.44],[0,0.22]];
  var energyCapGeo = [[1,0.2],[0.71,0.13],[0.62,0.4],[0.24,0.2],[0.14,0],[0,0],[0.12,0.27],[0.62,0.67],[0.71,1],[0.95,0.93],[0.85,0.8],[0.85,0.35]];

  this.drawElement = function(){
    var sX = this.canvas.width;
    var sY = this.canvas.height;
    var boxSize = new Vector(sX*(4/6), sY*(3/4));
    var boxPos = new Vector((sX-boxSize.x)/2, 0);

    var buffer = config.minRatio;
    this.context.lineWidth = buffer;
    //
    //gaugeBrackets
    var gaugeSize = new Vector((sX / 6),(sY / 5));
    var energySize = new Vector((sX / 6),(sY / 5));
    var firstPoint;
    var origin = new Vector(0,0);
    var mod = new Vector(1,1);
    //energy glass
    var plX = energySize.x * 2.5;
    var pX = (sX/2) - (plX/2);
    var pY = boxSize.y*1.06;
    this.context.save();
    this.context.strokeStyle= "rgba(250,250,250,0.8)";
    this.context.lineWidth = 0.1;
    for(var p = 0; p < 3; p++){
      var plY = energySize.y * (p == 1 ? 0.26 : 0.22);
      this.context.fillStyle= (p == 1) ? "rgba(80,80,80,0.5)" : "rgba(50,50,50,0.3)";
      this.context.beginPath();
      this.context.rect(pX,pY,plX,plY);
      this.context.stroke();
      this.context.fill();
      pY += plY;
    }
    this.context.restore();
    //mirror image
    this.context.fillStyle="rgba(50,50,50,1)";
    this.context.strokeStyle = "rgba(150,170,150,1)";
    for(var xFlip = -1; xFlip <= 1; xFlip += 2){
      origin.x = (sX/2) + (xFlip*(boxSize.x/2));
      //draw glass panes
      pY = sY * 0.14;
      plY = sY * 0.48;
      pX = origin.x + (xFlip * 0.1 * gaugeSize.x);
      this.context.save();
      this.context.strokeStyle= "rgba(250,250,250,0.8)";
      this.context.lineWidth = 0.1;
      for(var p = 0; p < 3; p++){
        plX = xFlip * gaugeSize.x * (p == 1 ? 0.4 : 0.2);
        this.context.fillStyle= (p == 1) ? "rgba(80,80,80,0.5)" : "rgba(50,50,50,0.3)";
        this.context.beginPath();
        this.context.rect(pX,pY,plX,plY);
        this.context.stroke();
        this.context.fill();
        pX += plX;
      }
      this.context.restore();
      //draw health bar holders
      for(var yFlip = -1; yFlip <= 1; yFlip += 2){
        mod.x = xFlip;
        mod.y = yFlip;
        origin.y = (yFlip < 0) ? boxSize.y : 0;
        this.drawGeo(gaugeCapGeo,origin,gaugeSize,this.context,true,true,mod);
      }
      //draw energy bar holders
      origin.y = boxSize.y;
      mod.x = -xFlip;
      mod.y = 1;
      this.drawGeo(energyCapGeo,origin,energySize,this.context,true,true,mod);
    }
    var orig = new Vector(sX/2,sY/1.3);
    var layers = 10;
    var rad = sX / 3;
    this.context.save();
    this.context.globalCompositeOperation = 'source-atop';
    //purps
    this.context.fillStyle = "rgba(250,250,0,0.15)";
    sceneArt.drawGradCircle(orig,layers,rad,this.context);
    //health
    this.context.fillStyle = "rgba(250,100,100,0.2)";
    orig.x = sX * 0.08;
    orig.y = sY * 0.375;
    rad = config.minRatio * 16.25;
    sceneArt.drawGradCircle(orig,layers,rad,this.context);
    //o2
    this.context.fillStyle = "rgba(250,250,250,0.2)";
    orig.x = sX * 0.92;
    sceneArt.drawGradCircle(orig,layers,rad,this.context);
    this.context.restore();

    //energy
    var lX = (sX / 2);
    var lY = (sY / 6);
    var oX = (sX / 4);
    var oY = (sY * 1.1);
    this.context.strokeStyle= "rgba(250,250,0,1)";
    this.context.beginPath();
    this.context.rect(oX,oY,lX,lY);
    this.context.stroke();
    //borders
    var s = new Vector(boxSize.x/4,boxSize.y);
    var p = new Vector(boxPos.x,0);
    //borders left buttons
    this.drawBorder(s,p);
    //borders right buttons
    p.x = boxPos.x + (boxSize.x * 3/4);
    this.drawBorder(s,p);
    //borders portrait
    p.x = boxPos.x + (boxSize.x * 1/4);
    s.x = boxSize.x/2;
    this.drawBorder(s,p,this.context);
  }

}



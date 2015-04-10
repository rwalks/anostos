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

GaugeGuiArt = function(){
  Art.call(this);

  var healthGeo = [];
  var oxGeo = [];
  var waterReverse = false;
  this.bubbles = [];

  var wGauges = [healthGeo,oxGeo];
  var points = 10;
  for(var g = 0; g < wGauges.length; g++){
    for(var i = 0; i < points; i++){
      var s = i ? 0 : 0.5;
      s = (i == points-1) ? -0.5 : s;
      wGauges[g].push(new WaterPoint(s));
    }
  }

  this.drawGauges = function(healthP,oxP,energyP,buffCon){
    var gauges = [[healthGeo,healthP],[oxGeo,oxP]];
    var oY = config.cY * 0.08;
    var oX = config.cX * 0.4;
    var lX = config.cX * 0.03;
    var lY = config.cY * -0.06;
    var size = new Vector(lX*config.xRatio,lY*config.yRatio);
    var color = new Color(250,0,0,0.5);
    for(var g = 0; g < gauges.length; g++){
      var orig = new Vector((oX-(lX/2))*config.xRatio,oY*config.yRatio);
      var waterPoints = gauges[g][0];
      var pY = gauges[g][1];
      var geo = [[1,0]];
      if(waterReverse){
        geo.unshift([0,0]);
      }else{
        geo.push([0,0]);
      }
      var dX = 1 / (waterPoints.length-1);
      var dY = 0.1;
      //fluid sim lol
      var last = 0;
      for(var w = 0; w < waterPoints.length;w++){
        var wI = waterReverse ? (waterPoints.length-1)-w : w ;
        var current = waterPoints[wI];
        last = current.update(last);
        var x = wI*dX;
        var y = pY + (current.state*dY);
        geo.push([x,y]);
      }
      var strokeColor = color.clone();
      strokeColor.a = 0.9;
      buffCon.fillStyle = color.colorStr();
      buffCon.strokeStyle = strokeColor.colorStr();
      this.drawGeo(geo,orig,size,buffCon,true,true);
      //add bubbles
      if(Math.random() > 0.8){
        this.bubbles.push(new Bubble(oX,oY,lX/2,!g));
      }
      //next vars
      oX = config.cX - oX;
      color = new Color(250,250,250,0.5);
    }
    waterReverse = !waterReverse;
    //draw electric
    var eX = config.cX / 2;
    var elX = config.cX * 0.048;
    var barlY = config.cY * 0.02 * config.yRatio;
    var y = config.cY * 0.103 * config.yRatio;
    buffCon.fillStyle = "rgba(250,250,0,0.2)";
    for(var xFlip = -1; xFlip <= 1; xFlip += 2){
      var x = (eX + (xFlip * elX * energyP)) * config.xRatio;
      var barlX = elX * 0.05 * xFlip * config.xRatio;
      buffCon.beginPath();
      buffCon.rect(x,y,barlX,barlY);
     // this.context.stroke();
      buffCon.fill();
    }
    //draw bubbles
    var goodBubs = [];
    buffCon.save();
    buffCon.lineWidth = config.minRatio * 3;
    for(var b = 0; b < this.bubbles.length; b++){
      var minY = oY + (lY * (this.bubbles[b].health ? healthP : oxP));
      if(this.bubbles[b].draw(minY,buffCon)){
        goodBubs.push(this.bubbles[b]);
      }
    }
    buffCon.restore();
    this.bubbles = goodBubs;
  }
}

Bubble = function(x,y,lat,health){
  var origX = x;
  this.position = new Vector(x,y);
  this.radius = 0.2* Math.random();
  this.health = health;
  if(this.health){
    this.color = new Color(250,0,0,0.2);
  }else{
    this.color = new Color(250,250,250,0.2);
  }
  var maxV = 0.2;
  var moveRight = Math.random() > 0.5;
  var lateral = (lat*0.2) + (Math.random() * lat*0.8);

  this.draw = function(minY,buffCon){
    var x = this.position.x*config.xRatio;
    var y = this.position.y*config.yRatio;
    var r = this.radius * config.gridInterval * config.minRatio;
    buffCon.fillStyle = this.color.colorStr();
    buffCon.beginPath();
    buffCon.arc(x,y,r,0,2*Math.PI,false);
    buffCon.fill();
    this.position.x += maxV * 0.5 * (moveRight ? 1 : -1);
    if(Math.abs(this.position.x-origX) > lateral || Math.random() > 0.9){
      moveRight = !moveRight;
    }
    this.position.y -= maxV;
    return this.position.y > minY;
  }
}

WaterPoint = function(state){
  this.state = state || 0;
  this.velocity = 0;
  var gravity = 0.005;
  var elasticity = -0.005;

  this.update = function(force){
    this.velocity += force;
    if(this.state < 0){
      this.velocity += gravity;
    }else if(this.state > 0){
      this.velocity += elasticity;
    }
    this.velocity = this.velocity * 0.99;
    this.velocity = utils.clamp(this.velocity,-2,2);
    this.state += this.velocity;
    this.state = utils.clamp(this.state,-1,1);
    return Math.abs(this.state)*2*(this.state > 0 ? gravity : elasticity);
  }
}

PlayerGuiArt = function(){
  StaticGuiArt.call(this);
  this.size = new Vector(config.cX * 0.24,config.cY * 0.13);
  var gaugeCapGeo = [[0,0],[0.3,0.22],[0.74,0.22],[1,0.67],[1,1],[0.74,0.72],[0.3,0.72],[0.03,1],[0.04,0.78],[0.17,0.44],[0,0.22]];
  var energyCapGeo = [[1,0.2],[0.71,0.13],[0.62,0.4],[0.24,0.2],[0.14,0],[0,0],[0.12,0.27],[0.62,0.67],[0.71,1],[1,0.93],[0.76,0.87],[0.76,0.27]];

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
    this.context.fillStyle = "rgba(250,0,0,0.2)";
    orig.x = sX * 0.08;
    orig.y = sY * 0.37;
    rad = config.minRatio * 16;
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



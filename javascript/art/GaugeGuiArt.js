GaugeGuiArt = function(){
  Art.call(this);

  var healthGeo = [];
  var oxGeo = [];
  var powerGeo = [];
  this.waterReverse = false;
  this.bubbles = [];

  var oY = config.cY * 0.08;
  var oX = config.cX * 0.4;
  var lX = config.cX * 0.03;
  var lY = config.cY * -0.06;

  var wGauges = [powerGeo,healthGeo,oxGeo];
  for(var g = 0; g < wGauges.length; g++){
    //power gauge longer
    var elec = !g;
    var points = g ? 10 : 20;
    for(var i = 0; i < points; i++){
      var s = Math.random() - 0.5;
      wGauges[g].push(new WaterPoint(s,elec));
    }
  }

  this.drawGauges = function(healthP,oxP,energyP,buffCon){
    //health + ox gauge
    this.drawSideGauges(buffCon,healthP,oxP);
    this.drawBubbles(buffCon,healthP,oxP);
    //energy gauge
    this.drawPowerGauge(buffCon,energyP);
    //back and forth water effect
    this.waterReverse = !this.waterReverse;
  }

  this.drawSideGauges = function(buffCon,healthP,oxP){
    var gauges = [[healthGeo,healthP],[oxGeo,oxP]];
    var size = new Vector(lX*config.xRatio,lY*config.yRatio);
    var color = new Color(250,0,0,0.5);
    for(var g = 0; g < gauges.length; g++){
      var orig = new Vector((oX-(lX/2))*config.xRatio,oY*config.yRatio);
      var waterPoints = gauges[g][0];
      var pY = gauges[g][1];
      var geo = [[1,0]];
      if(this.waterReverse){
        geo.unshift([0,0]);
      }else{
        geo.push([0,0]);
      }
      var dX = 1 / (waterPoints.length-1);
      var dY = 0.1;
      //fluid sim lol
      var last = 0;
      for(var w = 0; w < waterPoints.length;w++){
        var wI = this.waterReverse ? (waterPoints.length-1)-w : w ;
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
  }

  this.drawPowerGauge = function(buffCon,energyP){
    //draw electric
    var eX = config.cX / 2;
    var elX = config.cX * 0.048;
    var eRad = elX*energyP;
    var barlY = config.cY * 0.02 * config.yRatio;
    var dY = barlY / 2;
    var rY = config.cY * 0.103 * config.yRatio;
    //draw electic
    var reverse = this.waterReverse ? -1 : 1;
    var iLength = Math.ceil(powerGeo.length * energyP);
    iLength = powerGeo.length;
    var rInterval = ((eRad * 2) / (iLength-1)) * reverse * config.xRatio;
    var rX = (eX - (eRad * reverse)) * config.xRatio;
    var last = 0;
    buffCon.strokeStyle = "rgba(250,250,250,1)";
    buffCon.beginPath();
    for(var li = 0; li < iLength; li++){
      var wI = this.waterReverse ? (iLength-1)-li : li;
      var current = powerGeo[wI];
      last = current.update(last);
      var y = rY + dY + (current.state*dY);
      if(!li){
        buffCon.moveTo(rX,y);
      }else{
        buffCon.lineTo(rX,y);
      }
      rX += rInterval;
    }
    buffCon.stroke();
    //draw caps
    var x = (eX-eRad) * config.xRatio;
    var barlX = eRad*2*config.xRatio;
    buffCon.fillStyle = "rgba(250,250,0,0.3)";
    buffCon.beginPath();
    buffCon.moveTo(x+(barlX*0.1),rY);
    buffCon.lineTo(x+(barlX*0.9),rY);
    buffCon.lineTo(x+(barlX*0.98),rY+(dY*0.3));
    buffCon.lineTo(x+barlX,rY+dY);
    buffCon.lineTo(x+(barlX*0.98),rY+(dY*1.7));
    buffCon.lineTo(x+(barlX*0.9),rY+barlY);
    buffCon.lineTo(x+(barlX*0.1),rY+barlY);
    buffCon.lineTo(x+(barlX*0.02),rY+(dY*1.7));
    buffCon.lineTo(x,rY+dY);
    buffCon.lineTo(x+(barlX*0.02),rY+(dY*0.3));
    buffCon.lineTo(x+(barlX*0.1),rY);
    buffCon.fill();
  }

  this.drawBubbles = function(buffCon,healthP,oxP){
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

WaterPoint = function(state,electric){
  this.state = state || 0;
  this.velocity = 0;
  var maxFlow = electric ? 0.05 : 0.1;
  var maxTrans = electric ? 0.4 : 0.01;
  var damper = electric ? 1 : 4;

  this.update = function(force){
    this.velocity = (-this.state / damper) +force+ (this.velocity * 0.9);
    //
    this.state += utils.clamp(this.velocity,-maxFlow,maxFlow);
    this.state = utils.clamp(this.state,-1,1);
    return utils.clamp(-this.state,-maxTrans,maxTrans);

  }
}

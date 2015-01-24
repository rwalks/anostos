ShipArt = function() {

  var hullColors = ["rgba(0,100,200,0.8)","rgba(0,150,250,1.0)"];
  var engineColors = ["rgba(100,100,150,0.8)","rgba(150,150,200,1.0)"];
  var gearColors = ["rgba(50,50,50,0.8)","rgba(100,100,100,1.0)"];
  var shipColors = {'hull':hullColors,'leftEngine':engineColors,'rightEngine':engineColors,'leftGear':gearColors,'rightGear':gearColors};

  var exhaustMap = {};

  var exhausts = [];
  var alternator = true;

  this.drawExhaust = function(camera,ship,lX,lY,canvasBufferContext){
    var position = ship.position;
    var theta = ship.theta;
    var engineActive = ship.engineActive;
    var coolDown = ship.coolDown;
    var active = engineActive || coolDown > 0;

    var oY = 0.4*lY;
    var minY = 0.6 * lY
    var oX = -1.2*lX;
    var count = 0;
    var yOffset = 0;
    var trailWidth = lX/10;
    var drawLeft = true;
    var firstPoint;
    var dY; var randMod;

    this.drawExhausts(camera,canvasBufferContext);
    this.addExhausts(active,ship,lX,lY);
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    for(var x=oX;x<1.2*lX;x+=trailWidth){
      randMod = 0;
      if(engineActive){
        //burning
        yOffset += (count <= 2) ? lY*0.5 : -lY*0.5;
        randMod = yOffset + (Math.random()*lY*0.1)-lY*0.1;
        exhaustMap[x] = randMod;
      }else if (active){
        //cooling
        randMod = exhaustMap[x];
      }
      dY = minY + (randMod * coolDown);
      canvasBufferContext.beginPath();
      var r = Math.floor(Math.random() * 250);
      var g = (r > 200 && Math.random() > 0.8) ? r/2 : 20;
      var a = Math.floor(Math.random() * 0.2) + 0.8;
      var rgbaString = "rgba("+r+","+g+","+0+","+a+")";
      canvasBufferContext.fillStyle = rgbaString;
      var geometry = [[x,oY],[x+trailWidth,oY],[x+trailWidth,dY],[x,dY]];
      for(i in geometry){
        var points = rotate(geometry[i][0],geometry[i][1],theta);
        var eX = (position.x+points[0]-camera.xOff)*config.xRatio;
        var eY = (position.y+points[1]-camera.yOff)*config.yRatio;
        if(i == 0){
          canvasBufferContext.moveTo(eX,eY);
          firstPoint = [eX,eY];
        }else{
          canvasBufferContext.lineTo(eX,eY);
        }
      }
      canvasBufferContext.lineTo(firstPoint[0],firstPoint[1]);
      canvasBufferContext.fill();
      if(drawLeft && count == 4){
        count = 0;
        x = 0.6*lX;
        yOffset = 0;
        drawLeft = false;
      }else{
        count += 1;
      }
    }
  }

  this.drawExhausts = function(camera,canvasBufferContext){
    for(var e in exhausts){
      var exh = exhausts[e];
      if(exh.duration > 0){
        var eX = (exh.x - camera.xOff) * config.xRatio;
        var eY = (exh.y - camera.yOff) * config.yRatio;
        var rad = exh.getRadius();

        var fRGB = exh.color ? "rgba(200,0,200,0.6)" : "rgba(200,200,200,0.6)";
        var sRGB = exh.color ? "rgba(250,0,250,0.6)" : "rgba(250,250,250,0.8)";

        canvasBufferContext.fillStyle = fRGB;
        canvasBufferContext.strokeStyle= sRGB;
        canvasBufferContext.beginPath();
        canvasBufferContext.arc(eX,eY,rad,0,2*Math.PI,false);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();

        exh.duration -= 1;
      }else{
        exhausts.splice(e,1);
      }
    }
  }

  this.drawShip = function(camera,ship,canvasBufferContext){
    var position = ship.position;
    var theta = ship.theta;
    var shipGeometry = ship.shipGeometry;

    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    for(var part in shipGeometry){
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = shipColors[part][0];
      canvasBufferContext.strokeStyle = shipColors[part][1];
      var firstPoint = false;
      var geo = shipGeometry[part];
      for(var i in geo){
        if(geo[i]){
          var points = rotate(geo[i][0],geo[i][1],theta);
          var x = (position.x+points[0]-camera.xOff)*config.xRatio;
          var y = (position.y+points[1]-camera.yOff)*config.yRatio;
          if(i == 0){
            canvasBufferContext.moveTo(x,y);
            firstPoint = [x,y];
          }else{
            canvasBufferContext.lineTo(x,y);
          }
        }
      }
      if(firstPoint){
        canvasBufferContext.lineTo(firstPoint[0],firstPoint[1]);
      }
      canvasBufferContext.stroke();
      canvasBufferContext.fill();
    }
    //draw window
    var rad = config.gridInterval/2 * config.xRatio;
    var windows = [[0,-rad],[0,rad/2]];
    windows = [];
    for(i in windows){
      var points = rotate(windows[i][0],windows[i][1],theta);
      var x = (position.x+points[0]-camera.xOff)*config.xRatio;
      var y = (position.y+points[1]-camera.yOff)*config.yRatio;
      canvasBufferContext.fillStyle = "rgba(0,0,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(50,50,250,0.8)";
      canvasBufferContext.beginPath();
      canvasBufferContext.arc(x,y,rad,0,2*Math.PI,false);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.addExhausts = function(active,ship,lX,lY){
    var position = ship.position;
    var theta = ship.theta;
    alternator = !alternator;
    var smokeRadius = config.gridInterval * 0.5;
    if(true){
      //addExhaust fumes
      var smokeProb = active ? 0.6 : 0.9;
      var exhaustPoints = [[-1.05*lX,0.6*lY],[0.95*lX,0.6*lY]];
      for(var i in exhaustPoints){
        if(Math.random() > smokeProb){
          var ePoints = rotate(exhaustPoints[i][0],exhaustPoints[i][1],theta);
          var eX = ePoints[0] + position.x;
          var eY = ePoints[1] + position.y;
          exhausts.push(new ExhaustCloud(eX,eY));
        }
      }
    }
  }

  var rotate = function(x,y,theta){
    var rx = (x*Math.cos(theta))-(y*Math.sin(theta));
    var ry = (x*Math.sin(theta))+(y*Math.cos(theta));
    return [rx,ry];
  }

}


ExhaustCloud = function(x,y,size,duration,signal){
  this.x = x;
  this.y = y;
  var maxDuration = duration ? duration : 150;
  this.duration = maxDuration;
  var radius = size ? size : config.gridInterval*1.2;
  this.color = signal;

  this.getRadius = function(){return radius * (this.duration / maxDuration);}
}

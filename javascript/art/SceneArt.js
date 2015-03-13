SceneArt = function() {

  this.bgColors = [[20,10,100],[40,20,150],[100,50,200]];
  var xColor = {
    'b': Math.floor(Math.random() * 250),
    'bMod':(Math.random() * 6)-3
  };

  this.drawBuildCursor = function(obj,coords,clear,camera,canvasBufferContext){
    if(clear){
      canvasBufferContext.fillStyle = "rgba(0,200,10,0.9)";
      canvasBufferContext.strokeStyle="rgba(0,250,20,1.0)";
    }else{
      canvasBufferContext.fillStyle = "rgba(200,0,10,0.9)";
      canvasBufferContext.strokeStyle="rgba(250,0,20,1.0)";
    }
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    var originX = (coords.x-camera.xOff)*config.xRatio;
    var originY = (coords.y-camera.yOff)*config.yRatio;
    var lX = obj.size.x*config.xRatio;
    var lY = obj.size.y*config.yRatio;
    canvasBufferContext.rect(originX,originY,lX,lY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.drawText = function(msg,mIndex,canvasBufferContext){
    var x = config.canvasWidth / 14;
    var y = config.canvasHeight * 0.4;
    var fontSize = config.canvasWidth / (msg[0].length * 0.9) ;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.6)";
    canvasBufferContext.strokeStyle="rgba(200,200,200,0.8)";
    canvasBufferContext.rect(x-fontSize,y-fontSize,msg[0].length*0.63*fontSize,3*fontSize);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    canvasBufferContext.font = fontSize + 'px Courier New';
    canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
    if(mIndex < msg[0].length){
      canvasBufferContext.fillText(msg[0].slice(0,mIndex),x,y);
    }else{
      canvasBufferContext.fillText(msg[0],x,y);
      canvasBufferContext.fillText(msg[1].slice(0,mIndex-msg[0].length),x,y+fontSize*1.2);
    }
  }

  this.drawBG = function(camera,bgs,clockCycle,canvasBufferContext){
    var bgInt = 4 * config.gridInterval;
    var xRatio = config.canvasWidth / config.cX;
    var yRatio = config.canvasHeight / config.cY;
    var parallax = 4;
    var camX;
    var camY = camera.yOff;
    for(var b = 0; b < bgs.length; b++){
      camX = camera.xOff / parallax;
      var bg = bgs[b];
      var bgC = this.bgColors[b];
      canvasBufferContext.fillStyle = "rgba("+bgC[0]+","+bgC[1]+","+bgC[2]+",0.5)";
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth="2";
      canvasBufferContext.strokeStyle="rgba(0,250,0,1.0)";
      canvasBufferContext.moveTo(0,config.canvasHeight+1);
      for(x = camX-(camX % bgInt); x <= camX+config.cX+bgInt; x += bgInt){
        canvasBufferContext.lineTo((x-camX)*xRatio,(bg[x]-camY)*yRatio);
      }
      canvasBufferContext.lineTo(config.canvasWidth,config.canvasHeight+1);
      canvasBufferContext.closePath();
      canvasBufferContext.stroke();
      canvasBufferContext.fill();
      bgInt = ((b == 2) ? 2 : 4) * config.gridInterval;
      parallax = parallax / 2;
    }
    this.drawAtmosphere(camera,canvasBufferContext);
  }

  this.drawAtmosphere = function(camera,canvasBufferContext){
    var camY = camera.yOff;
    canvasBufferContext.beginPath();
    var density = Math.pow(Math.E,(-(config.mapHeight*1.5) + camY)/config.mapHeight);
    density = (density > 0.6) ? 0.6 : density;
    var grd=canvasBufferContext.createLinearGradient(0,config.canvasHeight,0,0);
    grd.addColorStop(0,'rgba(20,75,20,'+density+')');
    grd.addColorStop(1,'rgba(0,'+(150*density).toFixed(0)+',0,'+(density-0.01).toFixed(2)+')');
    canvasBufferContext.fillStyle=grd;
    canvasBufferContext.rect(0,0,config.canvasWidth,config.canvasHeight);
    canvasBufferContext.fill();
  }

  this.drawStars = function(stars,camera,clockCycle,canvasBufferContext){
    var xKeys = Object.keys(stars);
    for(var x = 0; x < xKeys.length; x++){
      if(clockCycle % 2 == 0){
        var r = Math.floor(Math.random() * 250);
        var g = Math.floor(Math.random() * 250);
        var b = Math.floor(Math.random() * 250);
        var a = Math.floor(Math.random() * 0.1) + 0.9;
        var rgbaString = "rgba("+r+","+g+","+b+","+a+")";
      }
      var xKey = xKeys[x];
      var yKeys = Object.keys(stars[xKey]);
      for(var y = 0; y < yKeys.length; y++){
        var yKey = yKeys[y];
        var star = stars[xKey][yKey];
        if(clockCycle % 2 == 0){
          star[0] = rgbaString;
        }
        canvasBufferContext.fillStyle = star[0];
        var size = config.canvasWidth / 125;
        canvasBufferContext.font = star[1]*size +"px Courier";
        canvasBufferContext.fillText("*",xKey*config.xRatio,yKey*config.yRatio);
      }
    }
  }

  this.drawPause = function(canvasBufferContext){
    //dark mask
    canvasBufferContext.fillStyle = "rgba(0,0,0,0.5)";
    canvasBufferContext.beginPath();
    canvasBufferContext.rect(0,0,config.canvasWidth,config.canvasHeight);
    canvasBufferContext.fill();
    //flashing text
    var dr = Math.floor(Math.random() * 150);
    var dg = Math.floor(Math.random() * 150);
    var db = Math.floor(Math.random() * 150);
    var da = Math.floor(Math.random() * 0.2) + 0.8;
    var rgbStr = "rgba("+(100+dr)+","+(100+dg)+","+(100+db)+","+da+")";
    canvasBufferContext.fillStyle = rgbStr;
    var fontSize = Math.min(config.xRatio * 10, config.yRatio*10);
    canvasBufferContext.font = fontSize+"px Courier";
    canvasBufferContext.fillText("SIMULATION SUSPENDED",config.canvasWidth*0.45,config.canvasHeight*0.45);
    canvasBufferContext.fillText("ESC TO RESUME",config.canvasWidth*0.48,config.canvasHeight*0.52);
  }

  this.drawPlanet = function(x,y,size,canvasBufferContext){
    xColor.b += xColor.bMod;  if(xColor.b > 250 || xColor.b < 0){xColor.bMod = xColor.bMod * -1;}
    rgbaString = "rgba(0,50,"+Math.floor(xColor.b)+",1.0)";

    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.beginPath();
    canvasBufferContext.arc(x,y,size,0,Math.PI*2,false);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
  }

  this.drawAmbientLight = function(light,canvasBufferContext){
    //dark mask
    canvasBufferContext.fillStyle = "rgba(0,0,0,0.8)";
    canvasBufferContext.beginPath();
    canvasBufferContext.rect(0,0,config.canvasWidth,config.canvasHeight);
    canvasBufferContext.fill();
  }

  this.drawLight = function(x,y,camera,canvasBufferContext,alpha){
    var oX = (x - camera.xOff) * config.xRatio;
    var oY = (y - camera.yOff) * config.yRatio;
    var lX = config.gridInterval * config.xRatio;
    var lY = config.gridInterval * config.yRatio;
    var fillColor = alpha ? "rgba(255,255,255,"+(alpha/4)+")" : "rgba(0,0,0,0.8)";
    canvasBufferContext.fillStyle = fillColor;
    canvasBufferContext.beginPath();
    canvasBufferContext.rect(oX,oY,lX,lY);
    canvasBufferContext.fill();
  }

  this.drawHitBoxes = function(boxes,camera,canvasBufferContext){
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.strokeStyle="rgba(250,0,0,0.9)";
    canvasBufferContext.fillStyle="rgba(250,0,0,0.9)";
    for(var b = 0; b < boxes.length; b++){
      var box = boxes[b];
      var firstPoint = false;
      canvasBufferContext.beginPath();
      for(var p = 0; p < box.points.length; p++){
        var point = box.points[p];
        var x = (point.x-camera.xOff)*config.xRatio;
        var y = (point.y-camera.yOff)*config.yRatio;
        if(i == 0){
          canvasBufferContext.moveTo(x,y);
          firstPoint = [x,y];
        }else{
          canvasBufferContext.lineTo(x,y);
        }
      }
      if(firstPoint){
        canvasBufferContext.lineTo(firstPoint[0],firstPoint[1]);
      }
      canvasBufferContext.stroke();
      canvasBufferContext.fill();
    }
  }

}


var SceneUtils = function (bg){
  this.bgs = bg ? bg : [{},{},{}];
  var bgColors = [[20,10,100],[40,20,150],[100,50,200]];

  this.generateTerrain = function(){
    var terrainInterval = config.terrainInterval;
    var tMap = {};
    var mid = config.mapHeight*0.7;
    var last = mid;
    for(var x=0;x<=config.mapWidth;x+=terrainInterval){
      tMap[x] = {};
      var dY = Math.random();
      if(dY < 0.3){
        if(dY < 0.05){
          dY = (Math.random()*(terrainInterval*10))-(terrainInterval*5);
        }else if(dY<0.1){
          dY = (Math.random()*(terrainInterval*20))-(terrainInterval*10);
        }else{
          dY = (Math.random()*(terrainInterval*4))-(terrainInterval*2);
        }
      }else{
         dY = (Math.random()*(terrainInterval*2))-(terrainInterval*1);
         //dY = 0;
      }
      var yMin = last + dY;
      for(var y=config.mapHeight;y>=yMin;y-=terrainInterval){
         var tile = new tiles.TerrainTile(x,y,'soil');
         if(y < yMin+terrainInterval){
           tile.topLayer = true;
           if(Math.random() < 0.1){
             tile.plant = new Plant(tile.position);
           }
         }
         tiles.addTile(tile,tMap,false);
      }
      if(x % (config.gridInterval * 4) == 0){
        this.bgs[0][x] = yMin - ((Math.random() * 50) + 200);
        this.bgs[1][x] = yMin - ((Math.random() * 50) + 100);
      }
      if(x % (config.gridInterval * 2) == 0){
        this.bgs[2][x] = yMin - 50;
      }
      last = yMin;
    }

    generateOre(tMap);
    return tMap;
  }

  var generateOre = function(tMap){
    for(var i = 0; i < 1000; i ++){
      var x = Math.floor(Math.random() * (config.mapWidth/config.terrainInterval)) * config.terrainInterval;
      var y = (config.mapHeight/2) + (Math.floor(Math.random() * (config.mapHeight/2/config.terrainInterval)) * config.terrainInterval);
      if(tMap[x] && tMap[x][y]){
        var oreVeinLength = Math.random() * 10;
        for(var z = 0; z < oreVeinLength; z++){
          var tile = new tiles.TerrainTile(x,y,'ore');
          tiles.addTile(tile,tMap);
          if(Math.random() > 0.5){
            x += (Math.random() > 0.5) ? config.terrainInterval : -config.terrainInterval;
          }else{
            y += (Math.random() > 0.5) ? config.terrainInterval : -config.terrainInterval;
          }
        }
      }
    }
  }

  this.drawBG = function(camera,clockCycle,canvasBufferContext){
    var bgInt = 4 * config.gridInterval;
    var xRatio = config.canvasWidth / config.cX;
    var yRatio = config.canvasHeight / config.cY;
    var parallax = 4;
    for(b in this.bgs){
      var camX = camera.xOff / parallax;
      var camY = camera.yOff;
      var bg = this.bgs[b];
      var bgC = bgColors[b];
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
      //atmo
      if(b == 0){
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
      bgInt = ((b == 2) ? 2 : 4) * config.gridInterval;
      parallax = parallax / 2;
    }
  }


  this.generateStars = function(c){
    var ret = {};
    var count = c ? c : 10000;
    for(i=0; i<count; i++){
      var x = Math.floor(Math.random() * config.mapWidth);
      var y = Math.floor(Math.random() * config.mapHeight);
      if(!ret[x]){ ret[x] = {};}
      var fontSize = Math.random();
      ret[x][y] = ["",fontSize];
    }
    return ret;
  }

  this.drawStars = function(stars,camera,clockCycle,canvasBufferContext){
    var parallax = 10;
    for(x in stars){
      if((x > camera.xOff/parallax)&&(x < ((camera.xOff/parallax) + config.cX))){
        if(clockCycle % 2 == 0){
          var r = Math.floor(Math.random() * 250);
          var g = Math.floor(Math.random() * 250);
          var b = Math.floor(Math.random() * 250);
          var a = Math.floor(Math.random() * 0.1) + 0.9;
          var rgbaString = "rgba("+r+","+g+","+b+","+a+")";
        }
        for(y in stars[x]){
          if((y > camera.yOff/parallax) && (y < (camera.yOff/parallax) + config.cY)){
            if(clockCycle % 2 == 0){
              stars[x][y][0] = rgbaString;
            }
            canvasBufferContext.fillStyle = stars[x][y][0];
            var size = config.canvasWidth / 125;
            canvasBufferContext.font = stars[x][y][1]*size +"px Courier";
            canvasBufferContext.fillText("*",(x-(camera.xOff/parallax))*config.xRatio,(y-(camera.yOff/parallax))*config.yRatio);
          }
        }
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

  var rdbaString;
  var xColor = {
    'b': Math.floor(Math.random() * 250),
    'bMod':(Math.random() * 6)-3
  };
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


}

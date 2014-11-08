var SceneUtils = function (){
  var bgs = [{},{},{}];
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
        }else{
          dY = (Math.random()*(terrainInterval*2))-(terrainInterval*1);
        }
      }else{
         // dY = (Math.random()*(terrainInterval*2))-(terrainInterval*1);
         dY = 0;
      }
      var yMin = last + dY;
      for(var y=config.mapHeight;y>=yMin;y-=terrainInterval){
         var tile = new tiles.TerrainTile(x,y);
         tiles.addTile(tile,tMap,false);
      }
      if(x % (config.gridInterval * 4) == 0){
        bgs[0][x] = yMin - ((Math.random() * 50) + 200);
        bgs[1][x] = yMin - ((Math.random() * 50) + 100);
      }
      if(x % (config.gridInterval * 2) == 0){
        bgs[2][x] = yMin - 50;
      }
      last = yMin;
    }
    return tMap;
  }

  this.drawBG = function(camera,clockCycle,canvasBufferContext){
    var bgInt = 4 * config.gridInterval;
    var xRatio = config.canvasWidth / config.cX;
    var yRatio = config.canvasHeight / config.cY;
    var parallax = 4;
    for(b in bgs){
      var camX = camera.xOff / parallax;
      var camY = camera.yOff;
      var bg = bgs[b];
      var bgC = bgColors[b];
      canvasBufferContext.fillStyle = "rgba("+bgC[0]+","+bgC[1]+","+bgC[2]+",1.0)";
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
      if((x > camera.xOff/parallax)&&(x < ((camera.xOff/parallax) + config.canvasWidth))){
        if(clockCycle % 2 == 0){
          var r = Math.floor(Math.random() * 250);
          var g = Math.floor(Math.random() * 250);
          var b = Math.floor(Math.random() * 250);
          var a = Math.floor(Math.random() * 0.1) + 0.9;
          var rgbaString = "rgba("+r+","+g+","+b+","+a+")";
        }
        for(y in stars[x]){
          if((y > camera.yOff/parallax) && (y < (camera.yOff/parallax) + config.canvasHeight)){
            if(clockCycle % 2 == 0){
              stars[x][y][0] = rgbaString;
            }
            canvasBufferContext.fillStyle = stars[x][y][0];
            var size = config.canvasWidth / 125;
            canvasBufferContext.font = stars[x][y][1]*size +"px Courier";
            canvasBufferContext.fillText("*",x-camera.xOff/parallax,y-camera.yOff/parallax);
          }
        }
      }
    }
  }

}

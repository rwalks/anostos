WeaponArt = function() {

  var blasterGeo = [
      [0.0, 0.4],
      [0.2, 0.4],
      [0.3, 0.0],
      [0.4, 0.0],
      [0.4, 0.4],
      [0.5, 0.4],
      [0.5, 0.0],
      [0.6, 0.0],
      [0.6,-0.2],
      [0.8,-0.6],
      [0.2,-0.6],
      [0.1,-0.4]
    ];
  this.drawBlaster = function(x,y,buffCon,owner){
    var lX = config.gridInterval * config.xRatio;
    var lY = config.gridInterval * config.yRatio;
    //draw emission
    //
    var emGeo = [
       [0.6,-0.2],
       [1 ,-0.2],
       [1 ,-0.6],
       [0.8,-0.6]
      ];
    var geometries = [emGeo,blasterGeo];
    var r = Math.random() > 0.8 ? r : 0;
    var g = Math.floor(200 + (Math.random() * 50));
    var b = 0;
    var rgbStr = "rgba("+g+","+g+","+b+",0.9)";
    buffCon.fillStyle = rgbStr;
    var firstPoint;
    for(var g = 0; g < geometries.length; g++){
      var geometry = geometries[g];
      buffCon.beginPath();
      for(var i = 0; i < geometry.length; i++){
        var points = utils.rotate(geometry[i][0],geometry[i][1],owner.toolTheta);
        points[0] = points[0]*(owner.direction ? 1 : -1);
        var eX = x+(points[0]*lX);
        var eY = y+(points[1]*lY);
        if(i == 0){
          buffCon.moveTo(eX,eY);
          firstPoint = [eX,eY];
        }else{
          buffCon.lineTo(eX,eY);
        }
      }
      buffCon.lineTo(firstPoint[0],firstPoint[1]);
      buffCon.fill();
      if(g == 0){
        //style for second geo
        buffCon.fillStyle = "rgba(50,50,50,1.0)";
        buffCon.strokeStyle="rgba(200,200,250,1.0)";
        buffCon.lineWidth=config.xRatio/4;
      }else{
        buffCon.stroke();
      }
    }
  }

  this.drawWrench = function(x,y,canvasBufferContext,owner){
    var lX = (owner.size.x * 1.5) * config.xRatio;
    var lY = (owner.size.y / 1.5) * config.yRatio;
    var firstPoint;
    var geometry = [
      [0   , 0.2],
      [0.1 , 0.2],
      [0.4 ,-0.1],
      [0.5 ,-0.1],
      [0.6 ,-0.2],
      [0.55,-0.25],
      [0.45,-0.2],
      [0.4,-0.2],
      [0.4,-0.3],
      [0.45,-0.35],
      [0.4,-0.4],
      [0.3,-0.3],
      [0.3,-0.2],
      [0.0, 0.1]
      ];

    canvasBufferContext.fillStyle = "rgba(50,50,50,0.9)";
    canvasBufferContext.strokeStyle="rgba(200,200,250,1.0)";
    canvasBufferContext.lineWidth=config.xRatio/2;
    canvasBufferContext.beginPath();
    for(var i = 0; i < geometry.length; i++){
      var pointX = geometry[i][0]*(owner.direction ? 1 : -1);
      var eX = x+(pointX*lX);
      var eY = y+(geometry[i][1]*lY);
      if(i == 0){
        canvasBufferContext.moveTo(eX,eY);
        firstPoint = [eX,eY];
      }else{
        canvasBufferContext.lineTo(eX,eY);
      }
    }
    canvasBufferContext.lineTo(firstPoint[0],firstPoint[1]);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }


  var plasmaTorchGeo = [
      [0.0, 0.4],
      [0.2, 0.4],
      [0.3, 0.0],
      [0.4, 0.0],
      [0.4, 0.4],
      [0.5, 0.4],
      [0.5, 0.0],
      [0.6, 0.0],
      [0.6,-0.2],
      [0.8,-0.6],
      [0.2,-0.6],
      [0.1,-0.4]
    ];
  this.drawPlasmaTorch = function(x,y,canvasBufferContext,owner){
    var active = owner.toolActive;
    var lX = config.gridInterval * config.xRatio;
    var lY = config.gridInterval * config.yRatio;
    //draw emission
    //
    var fX = active ? 1.4 : 0.9;
    var emGeo = [
       [0.6,-0.2],
       [fX ,-0.4],
       [0.8,-0.6]
      ];
    var geometries = [emGeo,plasmaTorchGeo];
    var r = Math.floor(200 + (Math.random() * 50));
    var g = Math.random() > 0.8 ? r : 0;
    var b = 0;
    var rgbStr = "rgba("+r+","+g+","+b+",0.9)";
    canvasBufferContext.fillStyle = rgbStr;
    var firstPoint;
    for(var g = 0; g < geometries.length; g++){
      var geometry = geometries[g];
      canvasBufferContext.beginPath();
      for(var i = 0; i < geometry.length; i++){
        var points = utils.rotate(geometry[i][0],geometry[i][1],owner.toolTheta);
        points[0] = points[0]*(owner.direction ? 1 : -1);
        var eX = x+(points[0]*lX);
        var eY = y+(points[1]*lY);
        if(i == 0){
          canvasBufferContext.moveTo(eX,eY);
          firstPoint = [eX,eY];
        }else{
          canvasBufferContext.lineTo(eX,eY);
        }
      }
      canvasBufferContext.lineTo(firstPoint[0],firstPoint[1]);
      canvasBufferContext.fill();
      if(g == 0){
        //style for second geo
        canvasBufferContext.fillStyle = "rgba(50,50,50,1.0)";
        canvasBufferContext.strokeStyle="rgba(200,200,250,1.0)";
        canvasBufferContext.lineWidth=config.xRatio/4;
      }else{
        canvasBufferContext.stroke();
      }
    }
  }

}


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
  this.drawBlaster = function(x,y,buffCon,owner,alpha){
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
    var rgbStr = "rgba("+g+","+g+","+b+","+alpha+")";
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
        buffCon.fillStyle = "rgba(50,50,50,"+alpha+")";
        buffCon.strokeStyle="rgba(200,200,250,"+alpha+")";
        buffCon.lineWidth=config.xRatio/4;
      }else{
        buffCon.stroke();
      }
    }
  }

  this.drawWrench = function(x,y,canvasBufferContext,tool,camera,alpha){
    //draw heal beam
    if(tool.owner.toolActive && tool.repairBeam){
      var dX = (tool.repairBeam.x-camera.xOff) * config.xRatio;
      var dY = (tool.repairBeam.y-camera.yOff) * config.yRatio;
      canvasBufferContext.strokeStyle="rgba(0,250,0,"+alpha+")";
      canvasBufferContext.lineWidth=config.xRatio*3;
      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(x,y);
      canvasBufferContext.lineTo(dX,dY);
      canvasBufferContext.stroke();
    }
    //draw wrench
    var animTheta = ((tool.animationFrame - 10) / 10) * (Math.PI / 4);
    var theta = tool.owner.toolTheta + animTheta;
    var lX = (tool.owner.size.x * 1.5) * config.xRatio;
    var lY = (tool.owner.size.y / 1.5) * config.yRatio;
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

    canvasBufferContext.fillStyle = "rgba(50,50,50,"+alpha+")";
    canvasBufferContext.strokeStyle="rgba(200,200,250,"+alpha+")";
    canvasBufferContext.lineWidth=config.xRatio/2;
    canvasBufferContext.beginPath();
    for(var i = 0; i < geometry.length; i++){
      var points = utils.rotate(geometry[i][0],geometry[i][1],theta);
      points[0] = points[0]*(tool.owner.direction ? 1 : -1);
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
  this.drawPlasmaTorch = function(x,y,canvasBufferContext,owner,alpha){
    var active = owner.toolActive;
    var lX = config.gridInterval * config.xRatio;
    var lY = config.gridInterval * config.yRatio;
    //draw emission
    //
    var fX =  1 + (active ? 0.2 + (Math.random() *  0.3) : -0.1);
    var fY = -0.3 + (active ? -0.1 + (Math.random() * -0.1) : -0.1);
    var emGeo = [
       [0.6,-0.2],
       [fX ,fY],
       [0.8,-0.6]
      ];
    var geometries = [emGeo,plasmaTorchGeo];
    var r = Math.floor(200 + (Math.random() * 50));
    var g = Math.random() > 0.8 ? r : 0;
    var b = 0;
    var rgbStr = "rgba("+r+","+g+","+b+","+alpha+")";
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
        canvasBufferContext.fillStyle = "rgba(50,50,50,"+alpha+")";
        canvasBufferContext.strokeStyle="rgba(200,200,250,"+alpha+")";
        canvasBufferContext.lineWidth=config.xRatio/4;
      }else{
        canvasBufferContext.stroke();
      }
    }
  }

}


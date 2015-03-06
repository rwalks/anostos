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
        var points = utils.rotate(geometry[i][0],geometry[i][1],owner.weaponTheta);
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

}


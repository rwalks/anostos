AlienArt = function() {

  this.drawHiveWorker = function(ox,oy,obj,canvasBufferContext,scale){

      var size = obj.size;
      var theta = obj.theta;
      var scale = scale ? scale : 1;
      var xFlip = obj.xFlip ? -1 : 1;
      var yFlip = obj.yFlip ? -1 : 1;
      var lX = size.x*config.xRatio*scale;
      var lY = size.y*config.yRatio*scale;

      var geometry = [[-lX,-lY*0.5],[lX,-lY*0.5],[lX,lY*0.5],[-lX,lY*0.5]];

      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(0,200,0,0.6)";
      canvasBufferContext.strokeStyle="rgba(0,250,0,0.8)";
      var firstPoint = false;
      for(i in geometry){
        var points = rotate(geometry[i][0],geometry[i][1],theta);
        var x = (ox+(points[0] * xFlip));
        var y = (oy+(points[1] * yFlip));
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

      var geometry = [[lX/2,-lY*0.5],[lX,-lY*0.5],[lX,0],[lX/2,0]];
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,0,0,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,0,0,0.8)";
      var firstPoint = false;
      for(i in geometry){
        var points = rotate(geometry[i][0],geometry[i][1],theta);
        var x = (ox+(points[0] * xFlip));
        var y = (oy+(points[1] * yFlip));
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

  var rotate = function(x,y,theta){
    var rx = (x*Math.cos(theta))-(y*Math.sin(theta));
    var ry = (x*Math.sin(theta))+(y*Math.cos(theta));
    return [rx,ry];
  }

}


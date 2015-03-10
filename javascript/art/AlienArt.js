AlienArt = function() {

  this.drawHiveNest = function(ox,oy,obj,canvasBufferContext,scale,counter){
    var size = obj.size;
    var scale = scale ? scale : 1;
    var lX = size.x*config.xRatio*scale;
    var lY = size.y*config.yRatio*scale;
    var healthPercent = obj.currentHealth / obj.maxHealth;
    var redShift = Math.floor(55 * healthPercent);
    var r = 255 - redShift;
    var g = 4 * redShift;
    var a = 0.8 * healthPercent;
    var bugFill = new Color(r,g,20,a);

    var geometry = [[-0.5,0.5],[-0.45,0.3],[-0.4,0.2],[-0.32,-0.125],[-0.3,0.1],
                   [-0.2,-0.05],[-0.3,-0.2],[-0.2,-0.35],[-0.15,-0.19],[-0.075,-0.075],
                   [0,-0.25],[-0.15,-0.45],[0,-0.5],[0.18,-0.3],[0.2,-0.1],
                   [0.15,-0.025],[0.3,-0.075],[0.38,-0.18],[0.45,0],[0.1,0.1],
                   [0.2,0.13],[0.35,0.075],[0.3,0.15],[0.45,0.44],[0.48,0.4],[0.5,0.5]];
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = bugFill.colorStr();
    canvasBufferContext.strokeStyle="rgba(250,200,25,1)";
    var firstPoint = false;
    for(i in geometry){
      var x = ox+(geometry[i][0] * lX);
      var y = oy+(geometry[i][1] * lY);
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

    var eyes = [[0.1,-0.275,0.05],[-0.25,0.25,0.1],[0.15,0.3,0.15],[0,-0.05,0.03]];
    for(var e = 0; e < eyes.length; e++){
      var eyePos = eyes[e];
      var eyeSize = Math.min(lX*eyePos[2],lY*eyePos[2]);
      var x = ox + (eyePos[0] * lX);
      var y = oy + (eyePos[1] * lY);
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = "rgba(0,0,50,0.8)";
      canvasBufferContext.arc(x,y,eyeSize,0,2*Math.PI,obj.xFlip);
      canvasBufferContext.closePath();
      canvasBufferContext.fill();
    }
  }

  this.drawHiveWorker = function(ox,oy,obj,canvasBufferContext,scale,counter){
    var size = obj.size;
    var theta = obj.theta;
    var scale = scale ? scale : 1;
    var xFlip = obj.xFlip ? -1 : 1;
    var lX = size.x*config.xRatio*scale;
    var lY = size.y*config.yRatio*scale;
    var healthPercent = obj.currentHealth / obj.maxHealth;
    var redShift = Math.floor(55 * healthPercent);
    var r = 255 - redShift;
    var g = 4 * redShift;
    var a = 0.8 * healthPercent;
    var bugFill = new Color(r,g,20,a);

    //draw back eye
    var eyePos = [lX*0.35*xFlip,-lY*0.4];
    eyePos = rotate(eyePos[0],eyePos[1],theta);
    var eyeSize = Math.min(lX*0.2,lY*0.3);
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(0,0,50,0.6)";
    canvasBufferContext.arc(ox+eyePos[0],oy+eyePos[1],eyeSize,0,2*Math.PI,obj.xFlip);
    canvasBufferContext.closePath();
    canvasBufferContext.fill();

    var bodyGeo = [[lX*0.6,lY*0.1],[lX*0.55,lY*0.2],[0,lY*0.4],[-lX*0.6,lY*0.35],[-lX,lY*0.1],
                   [-lX*0.7,-lY*0.3],[0,-lY*0.5]];
    var headGeo = [[lX*0.4,-lY*0.3],[lX,-lY*0.1],[lX*0.7,lY*0.3],[lX*0.7,lY*0.2],[lX*0.2,lY*0.05]];

    if(obj.biting){
      headTheta = (Math.sin((counter % obj.biteLength) / 5) * (Math.PI/6)) - (xFlip * (Math.PI/6));
      headTheta = headTheta * xFlip;
      for(var p in headGeo){
        headGeo[p] = rotate(headGeo[p][0],headGeo[p][1],headTheta);
      }
    }
    var geometry = bodyGeo.concat(headGeo);

    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = bugFill.colorStr();
    canvasBufferContext.strokeStyle="rgba(250,200,25,1)";
    var firstPoint = false;
    for(i in geometry){
      geometry[i][0] = geometry[i][0] * xFlip;
      var points = rotate(geometry[i][0],geometry[i][1],theta);
      var x = ox+points[0];
      var y = oy+points[1];
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

    //draw front eye
    var eyePos = [lX*0.1*xFlip,-lY*0.275];
    eyePos = rotate(eyePos[0],eyePos[1],theta);
    var eyeSize = Math.min(lX*0.25,lY*0.35);
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(0,0,50,0.8)";
    canvasBufferContext.arc(ox+eyePos[0],oy+eyePos[1],eyeSize,0,2*Math.PI,obj.xFlip);
    canvasBufferContext.closePath();
    canvasBufferContext.fill();

    //draw frontlegs
    canvasBufferContext.strokeStyle="rgba(0,0,100,0.8)";
    var legOrigins = [[-lX*0.4,lY*0.1],[-lX*0.2,lY*0.1],[0,lY*0.1]];
    var legDests = [[-lX*0.4,lY*0.5],[-lX*0.2,lY*0.5],[0,lY*0.5]];
    var legAnimationOffset = 0;
    if(obj.moving){
      legAnimationOffset = (Math.sin((counter % obj.biteLength) / 5) * lX*0.4) - lX*0.05;
    }
    for(var i in legOrigins){
      legOrigins[i][0] = legOrigins[i][0] * xFlip;
      var srcPt = rotate(legOrigins[i][0],legOrigins[i][1],theta);
      //animate here
      legDests[i][0] += legAnimationOffset;
      legDests[i][0] = legDests[i][0] * xFlip;
      var destPt = rotate(legDests[i][0],legDests[i][1],theta);
      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(ox+srcPt[0],oy+srcPt[1]);
      canvasBufferContext.lineTo(ox+destPt[0],oy+destPt[1]);
      canvasBufferContext.stroke();
    }

    //draw antenna
    canvasBufferContext.strokeStyle="rgba(0,0,100,0.8)";
    var ants = [[[-lX*0.2,-lY*0.45],[-lX*0.05,-lY*0.7],[lX*0.25,-lY*0.85]],[[0,-lY*0.5],[lX*0.25,-lY*0.7],[lX*0.7,-lY*0.85]]];
    var antAnimationOffset = (Math.sin(counter / 10) * lY*0.2) - lY*0.1;
    for(var i in ants){
      var geo = ants[i];
      canvasBufferContext.beginPath();
      for(var p in geo){
        if(p != 0){
          geo[p][1] += antAnimationOffset;
        }
        geo[p][0] = geo[p][0] * xFlip;
        var pt = rotate(geo[p][0],geo[p][1],theta);
        if(p == 0){
          canvasBufferContext.moveTo(ox+pt[0],oy+pt[1]);
        }else{
          canvasBufferContext.lineTo(ox+pt[0],oy+pt[1]);
        }
      }
      canvasBufferContext.stroke();
    }
  }

  var rotate = function(x,y,theta){
    var rx = (x*Math.cos(theta))-(y*Math.sin(theta));
    var ry = (x*Math.sin(theta))+(y*Math.cos(theta));
    return [rx,ry];
  }

}


HumanArt = function(){

  var skinRGB = "rgba(208,146,110,1.0)";

  this.drawHuman = function(x,y,canvasBufferContext,human){

    var active = human.targetObj && human.targetRange;
    var animate = Math.abs(human.velocity.x) > 0.1;

    var lLeg = 0.5*config.gridInterval*config.yRatio;
    var rLeg = 0.5*config.gridInterval*config.yRatio;
    var lHandX = x+(config.gridInterval*config.xRatio);
    var rHandX = x+(config.gridInterval*config.xRatio/2);
    var helmX = x+(config.gridInterval*config.xRatio/3);
    var eyeX =  x+(config.gridInterval*config.xRatio/2);
    var handY = y+(config.gridInterval*config.yRatio*1.2);
    if(!human.direction){
      helmX = x-(config.gridInterval*config.xRatio/80);
      eyeX =  x+(config.gridInterval*config.xRatio/30);
      lHandX = x;
    }
    if(animate || active){
      var moveMod = human.direction ? 1.8 : 0.65;
      if((human.count % 20) >= 10){
       rLeg = (human.direction ? 0.3 : 0.5)*config.gridInterval*config.yRatio;
       lLeg = (human.direction ? 0.5 : 0.3)*config.gridInterval*config.yRatio;
       rHandX = x+(config.gridInterval*config.xRatio/2)/moveMod;
      }else{
       rLeg = (human.direction ? 0.5 : 0.3)*config.gridInterval*config.yRatio;
       lLeg = (human.direction ? 0.3 : 0.5)*config.gridInterval*config.yRatio;
       lHandX = x+(config.gridInterval*config.xRatio)/moveMod;
       if(!human.direction){
         lHandX = x+(config.gridInterval*config.xRatio/3)/moveMod;
       }
      }
    }

    var handRGB = human.spaceSuit ? "rgba(0,0,200,0.9)" : skinRGB;
    //lHand
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= handRGB;
    canvasBufferContext.fillStyle = handRGB;
    canvasBufferContext.arc(lHandX,handY,(config.gridInterval*config.xRatio/6),1.5*Math.PI,0.5*Math.PI,!human.direction);
    canvasBufferContext.closePath();
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //body -> lLeg -> rLeg
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.strokeStyle = human.lineColor;
    canvasBufferContext.fillStyle = human.fillColor;
    canvasBufferContext.rect(x,y,config.gridInterval*config.xRatio,1.5*config.gridInterval*config.yRatio);
    canvasBufferContext.rect(x,y+(1.5*config.gridInterval*config.yRatio),config.gridInterval*config.xRatio/4,lLeg);
    canvasBufferContext.rect(x+(config.gridInterval*config.xRatio/4)*3,y+(1.5*config.gridInterval*config.yRatio),config.gridInterval*config.xRatio/4,rLeg);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //visor / face
    var faceRGB = human.spaceSuit ? "rgba(0,200,0,0.9)" : skinRGB;
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= human.spaceSuit ? "rgba(0,250,0,1.0)" : skinRGB;
    canvasBufferContext.fillStyle = faceRGB;
    canvasBufferContext.rect(helmX,y+(config.gridInterval*config.yRatio/6),(config.gridInterval*config.xRatio)*(2/3),0.6*config.gridInterval*config.yRatio);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    if(!human.spaceSuit){
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = "rgba(0,0,0,0.9)";
      canvasBufferContext.rect(eyeX,y+(config.gridInterval*config.yRatio/4),(config.gridInterval*config.xRatio)/6,0.2*config.gridInterval*config.yRatio);
      canvasBufferContext.rect(eyeX+(config.gridInterval*config.xRatio/3),y+(config.gridInterval*config.yRatio/4),(config.gridInterval*config.xRatio)/6,0.2*config.gridInterval*config.yRatio);
      canvasBufferContext.fill();
    }
    //weapon under right hand
    this.drawWeapon(rHandX,handY,canvasBufferContext,human);
    //rHand
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= handRGB;
    canvasBufferContext.fillStyle = handRGB;
    canvasBufferContext.arc(rHandX,handY,(config.gridInterval*config.xRatio/6),1.5*Math.PI,0.5*Math.PI,!human.direction);
    canvasBufferContext.closePath();
    canvasBufferContext.stroke();
    canvasBufferContext.fill();

  }

  this.drawWeapon = function(x,y,canvasBufferContext,human){
    switch(human.action){
      case 'attack':
        if(human.weapon){
          human.weapon.draw(x,y,canvasBufferContext,human);
        }
        break;
      case 'build':
        this.drawWrench(x,y,canvasBufferContext,human);
        break;
      case 'repair':
        this.drawWrench(x,y,canvasBufferContext,human);
        break;
      case 'delete':
        this.drawMiningLaser(x,y,canvasBufferContext,human);
        break;
    }
  }

  this.drawWrench = function(x,y,canvasBufferContext,human){
    var lX = (human.size.x * 1.5) * config.xRatio;
    var lY = (human.size.y / 1.5) * config.yRatio;
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
      var pointX = geometry[i][0]*(human.direction ? 1 : -1);
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


  var miningLaserGeo = [
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
  this.drawMiningLaser = function(x,y,canvasBufferContext,human){
    var active = human.targetObj && human.targetRange;
    var lX = (human.size.x * 1.2) * config.xRatio;
    var lY = (human.size.y / 2.5) * config.yRatio;
    //draw emission
    //
    var fX = active ? 1.4 : 0.9;
    var emGeo = [
       [0.6,-0.2],
       [fX ,-0.4],
       [0.8,-0.6]
      ];
    var geometries = [emGeo,miningLaserGeo];
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
        var pointX = geometry[i][0]*(human.direction ? 1 : -1);
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

  this.drawPath = function(path,canvasBufferContext,camera){
    for(var p = 0;p<path.length;p++){
      var x = path[p][0];
      var y = path[p][1];
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,0,0,0.2)";
      canvasBufferContext.strokeStyle="rgba(250,0,0,0.5)";
      var originX = (x-camera.xOff)*config.xRatio;
      var originY = (y-camera.yOff)*config.yRatio;
      var lX = config.gridInterval*config.xRatio;
      var lY = 2*config.gridInterval*config.yRatio;
      canvasBufferContext.rect(originX,originY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(x,y,xSize,ySize,canvasBufferContext,human){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.strokeStyle = human.lineColor;
    canvasBufferContext.fillStyle = human.fillColor;
    canvasBufferContext.rect(x+(xSize*0.1),y+(ySize*0.1),xSize*0.8,ySize*0.9);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //visor / face
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= skinRGB;
    canvasBufferContext.fillStyle = skinRGB;
    canvasBufferContext.rect(x+(xSize*0.8/3),y+(ySize*0.1)+(ySize/8),xSize*0.9*(2/3),ySize*0.9*0.6);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba(0,0,0,0.9)";
    var eyeX = x+xSize/3;
    canvasBufferContext.rect(eyeX,y+(ySize/3.5),xSize/6,0.15*ySize);
    canvasBufferContext.rect(eyeX+(xSize/3),y+(ySize/3.5),xSize/6,0.15*ySize);
    canvasBufferContext.fill();
  }

  this.drawRosterPortrait = function(x,y,xSize,ySize,canvasBufferContext,human){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.strokeStyle = human.lineColor;
    canvasBufferContext.fillStyle = human.fillColor;
    canvasBufferContext.rect(x+(xSize*0.05),y+(ySize*0.3),xSize*0.15,ySize*0.5);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //visor / face
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= "rgba(0,250,0,1.0)";
    canvasBufferContext.fillStyle= "rgba(0,200,0,0.9)";
    canvasBufferContext.rect(x+(xSize*0.09),y+(ySize*0.35),xSize*0.11,ySize*0.3);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
  }



}

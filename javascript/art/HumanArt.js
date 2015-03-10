HumanArt = function(){

  var skinRGB = "rgba(208,146,110,1.0)";

  this.drawHuman = function(x,y,canvasBufferContext,human){
    var active = human.targetObj && human.targetRange;
    var animate = Math.abs(human.velocity.x) > 0.1;
    var crouchMod = human.crouching ? human.crouchOffset : 0;
    y += (crouchMod * config.yRatio);

  //animation variables
    //legs
    var lLeg = new Vector(x,y+(1.5*config.gridInterval*config.yRatio));
    var lLegSize = new Vector(config.gridInterval*config.xRatio/4,0.5*config.gridInterval*config.yRatio);
    var rLeg = new Vector(x+(config.gridInterval*config.xRatio/4)*3,y+(1.5*config.gridInterval*config.yRatio));
    var rLegSize = new Vector(config.gridInterval*config.xRatio/4,0.5*config.gridInterval*config.yRatio);
    //hands
    var lHandX = x+(config.gridInterval*config.xRatio);
    var rHandX = x+(config.gridInterval*config.xRatio/2);
    var handY = y+(config.gridInterval*config.yRatio*1.2);
    //body
    var helmX = x+(config.gridInterval*config.xRatio/3);
    var eyeX = x+(config.gridInterval*config.xRatio/2);
    var torsoLength = 1.5*config.gridInterval*config.yRatio;
    if(!human.direction){
      helmX = x-(config.gridInterval*config.xRatio/80);
      eyeX =  x+(config.gridInterval*config.xRatio/30);
      lHandX = x;
    }
    if(crouchMod){
      var crouchLegY = (config.gridInterval * 0.2 * config.yRatio);
      torsoLength -= crouchLegY;
      if(human.direction){
        rLeg.x = rLeg.x + (config.gridInterval * 0.1 * config.xRatio);
        rLeg.y -= (crouchMod * config.yRatio);
        lLeg.x = lLeg.x - (config.gridInterval * 0.25 * config.xRatio);
        lLeg.y -= crouchLegY;
        lLegSize.x = (lLegSize.y / config.yRatio) * config.xRatio;
        lLegSize.y = (rLegSize.x / config.xRatio) * config.yRatio;
      }else{
        lLeg.x = lLeg.x - (config.gridInterval * 0.1 * config.xRatio);
        lLeg.y -= (crouchMod * config.yRatio);
        rLeg.x = rLeg.x - (config.gridInterval * 0.1 * config.xRatio);
        rLeg.y -= crouchLegY;
        rLegSize.x = (rLegSize.y / config.yRatio) * config.xRatio;
        rLegSize.y = (lLegSize.x / config.xRatio) * config.yRatio;
      }
    }else if(animate || active){
      var moveMod = human.direction ? 1.8 : 0.65;
      if((human.count % 20) >= 10){
       rLegSize.y = (human.direction ? 0.3 : 0.5)*config.gridInterval*config.yRatio;
       lLegSize.y = (human.direction ? 0.5 : 0.3)*config.gridInterval*config.yRatio;
       rHandX = x+(config.gridInterval*config.xRatio/2)/moveMod;
      }else{
       rLegSize.y = (human.direction ? 0.5 : 0.3)*config.gridInterval*config.yRatio;
       lLegSize.y = (human.direction ? 0.3 : 0.5)*config.gridInterval*config.yRatio;
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
    canvasBufferContext.rect(x,y,config.gridInterval*config.xRatio,torsoLength);
    canvasBufferContext.rect(lLeg.x,lLeg.y,lLegSize.x,lLegSize.y);
    canvasBufferContext.rect(rLeg.x,rLeg.y,rLegSize.x,rLegSize.y);
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
    if(human.currentTool){
      human.currentTool.draw(x,y,canvasBufferContext);
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

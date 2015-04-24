LoadingArt = function() {

  this.drawShip = function(pos,camera,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
    canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
    var oX = (pos.x-camera.xOff)*config.xRatio;
    var oY = (pos.y-camera.yOff)*config.yRatio;
    var lX = config.canvasWidth / 1.5;
    var lY = config.canvasHeight / 4;
    canvasBufferContext.rect(oX,oY,lX,lY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //trail
    var trailHeight = oY + lY;
    for(y=oY;y<trailHeight;y+=(lY/12)){
      canvasBufferContext.beginPath();
      var r = Math.floor(Math.random() * 250);
      var g = Math.floor(Math.random() * 250);
      var b = Math.floor(Math.random() * 250);
      var a = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba("+0+","+g+","+250+","+a+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.rect(0,y,oX,lY/12);
      canvasBufferContext.fill();
    }
    //engine
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
    canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
    var y = oY * 0.98;
    var eX = lX /8;
    var eY = lY * 1.1;
    canvasBufferContext.rect(oX,y,eX,eY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
    canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
    var y = oY + lY * 0.2;
    var eX = lX * 0.7;
    var eY = lY * 0.6;
    canvasBufferContext.rect(oX,y,eX,eY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //nose
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
    canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
    var x = oX+lX;
    canvasBufferContext.moveTo(x,oY);
    canvasBufferContext.bezierCurveTo(x+lX/3,oY,x+lX/3,oY+lY,x,oY+lY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
    canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
    var x = oX+lX;
    var y = oY + lY * 0.2;
    canvasBufferContext.moveTo(x,y);
    canvasBufferContext.bezierCurveTo(x+lX/3,y,x+lX/3,y+lY*0.6,x,y+lY*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
    canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
    var x = oX+lX*0.3;
    var y = oY+lY;
    canvasBufferContext.moveTo(x,y);
    canvasBufferContext.bezierCurveTo(x,y+lY/10,oX+lX,y+lY/2,oX+lX,y);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
    canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
    var x = oX+lX*0.7;
    var y = oY + lY * 0.2;
    canvasBufferContext.moveTo(x,y);
    canvasBufferContext.bezierCurveTo(x+lX/3,y,x+lX/3,y+lY*0.6,x,y+lY*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //cockpit
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.9)";
    canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
    var x = oX + lX * 0.3
    var y = oY - lY * 0.3
    canvasBufferContext.rect(x,y,lX*0.2,lY*0.3);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //lights
    for(i=0;i<10;i++){
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,20,0.7)";
      canvasBufferContext.strokeStyle="rgba(250,250,25,0.9)";
      var x = oX + lX * (0.3 + (i*0.02))
      var y = oY - lY * 0.28;
      var eX = lX * 0.01;
      var eY = lY * 0.05;
      canvasBufferContext.rect(x,y,eX,eY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
    for(i=0;i<42;i++){
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,20,0.7)";
      canvasBufferContext.strokeStyle="rgba(250,250,25,0.9)";
      var x = oX + lX * (0.15 + (i*0.02))
      var y = oY + lY * 0.05;
      var eX = lX * 0.01;
      var eY = lY * 0.05;
      canvasBufferContext.rect(x,y,eX,eY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
    for(i=0;i<42;i++){
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,20,0.7)";
      canvasBufferContext.strokeStyle="rgba(250,250,25,0.9)";
      var x = oX + lX * (0.15 + (i*0.02))
      var y = oY + lY * 0.9;
      var eX = lX * 0.01;
      var eY = lY * 0.05;
      canvasBufferContext.rect(x,y,eX,eY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  var rdbaString;
  var xColor = {
    'r': Math.floor(Math.random() * 250),
    'g': Math.floor(Math.random() * 250),
    'b': Math.floor(Math.random() * 250),
    'rMod':(Math.random() * 6)-3,
    'gMod':(Math.random() * 6)-3,
    'bMod':(Math.random() * 6)-3
  };

  this.drawLoading = function(canvasBufferContext){
    xColor.r += xColor.rMod;  if(xColor.r > 250 || xColor.r < 0){xColor.rMod = xColor.rMod * -1;}
    xColor.g += xColor.gMod;  if(xColor.g > 250 || xColor.g < 0){xColor.gMod = xColor.gMod * -1;}
    xColor.b += xColor.bMod;  if(xColor.b > 250 || xColor.b < 0){xColor.bMod = xColor.bMod * -1;}
    rgbaString = "rgba("+Math.floor(xColor.r)+","+Math.floor(xColor.g)+","+Math.floor(xColor.b)+",1.0)";

    var x = config.canvasWidth * 0.4;
    var y=  config.canvasHeight * 0.5
    var fontSize = config.canvasWidth / 50;
    canvasBufferContext.font = fontSize + 'px Courier';
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.fillText("LOADING..",x,y);
  }

  this.drawCredit = function(canvasBufferContext){
    xColor.r += xColor.rMod;  if(xColor.r > 250 || xColor.r < 0){xColor.rMod = xColor.rMod * -1;}
    xColor.g += xColor.gMod;  if(xColor.g > 250 || xColor.g < 0){xColor.gMod = xColor.gMod * -1;}
    xColor.b += xColor.bMod;  if(xColor.b > 250 || xColor.b < 0){xColor.bMod = xColor.bMod * -1;}
    rgbaString = "rgba("+Math.floor(xColor.r)+","+Math.floor(xColor.g)+","+Math.floor(xColor.b)+",1.0)";

    var x = config.canvasWidth * 0.2;
    var y = config.canvasHeight * 0.3;
    var fontSize = config.canvasWidth / 80;
    canvasBufferContext.font = fontSize + 'px Courier';
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.fillText("    /^\\   /^\\\\    //====\\  //====\\  //====\\  //====\\  //====\\",x,y);
    canvasBufferContext.fillText("   // || // ||   //    // //    // //    // //    // //    //",x,fontSize+y);
    canvasBufferContext.fillText("  //  ||//  ||  //___ // //____// //   _// //    // //    //",x,fontSize*2+y);
    canvasBufferContext.fillText(" //   //    || //    // // ||    //   //||//    // //    //",x,fontSize*3+y);
    canvasBufferContext.fillText("//          ||//    // //  ||    \\\\__// ||\\\\___// //____//",x,fontSize*4+y);
    canvasBufferContext.font = "italic "+fontSize + 'px Courier';

    canvasBufferContext.fillText("Presents:",x*2.5,fontSize*6+y);
  }

  var scaleM = 0;
  var water = 0;
  this.drawHuman = function(canvasBufferContext){
      //sleep chamber
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var x = config.canvasWidth * 0.3;
      var y = config.canvasHeight * 0.3;
      var lX = config.canvasWidth * 0.5;
      var lY = config.canvasHeight - y;
      canvasBufferContext.moveTo(x-scaleM,y+lY);
      canvasBufferContext.lineTo(x-scaleM,y-scaleM+lY*0.3);
      canvasBufferContext.lineTo(x-scaleM+lX*0.2,y-scaleM);
      canvasBufferContext.lineTo(x+scaleM+lX*0.8,y-scaleM);
      canvasBufferContext.lineTo(x+lX+scaleM,y-scaleM+lY*0.3);
      canvasBufferContext.lineTo(x+lX+scaleM,y+lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //text
      var fontSize = lX / 80 + scaleM/10;
      canvasBufferContext.font = fontSize + 'px Courier';
      canvasBufferContext.fillStyle = "rgba(40,40,40,0.9)";
      canvasBufferContext.fillText("PENAL HYPERSLEEP CHAMBER 03",x+lX/2.4-scaleM*0.8,y+lY/10-scaleM);
      //inner window
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var x = config.canvasWidth * 0.4;
      var y = config.canvasHeight * 0.4;
      var lX = config.canvasWidth * 0.3;
      var lY = config.canvasHeight *0.2;
      canvasBufferContext.moveTo(x-scaleM,y+lY+scaleM);
      canvasBufferContext.lineTo(x-scaleM,y-scaleM+lY*0.3);
      canvasBufferContext.lineTo(x-scaleM+lX*0.2,y-scaleM);
      canvasBufferContext.lineTo(x+scaleM+lX*0.8,y-scaleM);
      canvasBufferContext.lineTo(x+lX+scaleM,y-scaleM+lY*0.3);
      canvasBufferContext.lineTo(x+lX+scaleM,y+lY+scaleM);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //detail lines
      canvasBufferContext.strokeStyle="rgba(150,150,150,0.8)";
      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(config.canvasWidth*0.3-scaleM+(config.canvasWidth*0.5)*0.2,config.canvasHeight*0.3-scaleM);
      canvasBufferContext.lineTo(config.canvasWidth*0.4-scaleM+(config.canvasWidth*0.3)*0.2,config.canvasHeight*0.4-scaleM);
      canvasBufferContext.stroke();
      //
      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(config.canvasWidth*0.3+scaleM+(config.canvasWidth*0.5)*0.8,config.canvasHeight*0.3-scaleM);
      canvasBufferContext.lineTo(config.canvasWidth*0.4+scaleM+(config.canvasWidth*0.3)*0.8,config.canvasHeight*0.4-scaleM);
      canvasBufferContext.stroke();
      //
      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(config.canvasWidth*0.4-scaleM,config.canvasHeight);
      canvasBufferContext.lineTo(config.canvasWidth*0.4-scaleM,config.canvasHeight*0.4+lY+scaleM);
      canvasBufferContext.stroke();
      //
      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(x+lX+scaleM,config.canvasHeight);
      canvasBufferContext.lineTo(x+lX+scaleM,config.canvasHeight*0.4+lY+scaleM);
      canvasBufferContext.stroke();

      //person
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(0,200,0,0.6)";
    canvasBufferContext.strokeStyle="rgba(0,250,0,0.8)";
    canvasBufferContext.rect(x-scaleM+(lX*0.2),y-scaleM+(lY*0.1),lX*0.6+(2*scaleM),lY*0.9+(2*scaleM));
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //visor / face
    var skinRGB = "rgba(208,146,110,1.0)";
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= skinRGB;
    canvasBufferContext.fillStyle = skinRGB;
    canvasBufferContext.rect(x-scaleM+(lX*0.3),y-scaleM+(lY*0.1)+(lY/8),lX*0.4+(2*scaleM),lY*0.9*0.6+(2*scaleM));
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    canvasBufferContext.beginPath();
    canvasBufferContext.strokeStyle= "rgba(150,80,40,1.0)";
    canvasBufferContext.fillStyle= "rgba(150,80,40,1.0)";
    canvasBufferContext.rect(x+(lX*0.5)-scaleM/4,y+(lY*0.7)+scaleM/3,lX*0.1+(scaleM),lY*0.03);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    //eyes
    var eyeX = x+lX*0.4;
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = (sceneTimer > humanDuration * 0.82) ? "rgba(0,0,0,0.9)" : skinRGB;
    canvasBufferContext.strokeStyle= "rgba(180,110,70,1.0)";
    canvasBufferContext.rect(eyeX-scaleM/2,y-scaleM/2+(lY/3),lX/12+(scaleM/2.5),0.15*lY+(scaleM/3));
    canvasBufferContext.rect(eyeX+scaleM/2+(lX/8),y-scaleM/2+(lY/3),lX/12+(scaleM/2.5),0.15*lY+scaleM/3);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    if(sceneTimer > humanDuration * 0.82){
      if(sceneTimer > humanDuration * 0.9){
        sceneArt.drawPlanet(eyeX-scaleM/3.2+lX*0.05,y-scaleM/3+(lY/2),lX/250+(scaleM/7),canvasBufferContext);
        sceneArt.drawPlanet(eyeX+scaleM/1.5+lX*0.18,y-scaleM/3+(lY/2),lX/250+(scaleM/7),canvasBufferContext);
      }
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = "rgba(0,0,0,0.6)";
      canvasBufferContext.strokeStyle= "rgba(180,110,70,1.0)";
      canvasBufferContext.rect(eyeX-scaleM/2,y-scaleM/2+(lY/3),lX/12+(scaleM/2.5),0.15*lY+(scaleM/3));
      canvasBufferContext.rect(eyeX+scaleM/2+(lX/8),y-scaleM/2+(lY/3),lX/12+(scaleM/2.5),0.15*lY+scaleM/3);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }

      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(170,80,40,0.8)";
      var cx = x+lX*0.4;
      var cy = y+lY/2;
      canvasBufferContext.moveTo(cx-scaleM/2,cy+scaleM/2);
      canvasBufferContext.bezierCurveTo(cx-scaleM/1.5-lX/20,cy,cx-scaleM/1.5-lX/20,cy+lY/4+scaleM/2,cx-scaleM/2,cy+lY/4+scaleM/2);
      canvasBufferContext.fill();
      //button
      if(sceneTimer > humanDuration * 0.2){
        water += 2;

      }
      var x = (config.canvasWidth * 0.45) - (scaleM/1.5);
      var y = (config.canvasHeight * 0.8) + scaleM*1.5;
      var size = (config.canvasWidth / 80) + (scaleM/10);
      var rgbaString = (water > 0) ? "rgba(0,250,0,0.6)" : "rgba(250,0,0,0.6)";
      canvasBufferContext.strokeStyle=rgbaString;
      canvasBufferContext.fillStyle=rgbaString;
      canvasBufferContext.beginPath();
      canvasBufferContext.arc(x,y,size,0,Math.PI*2,false);
      canvasBufferContext.stroke();
      canvasBufferContext.fill();
      //goo
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(0,50,200,0.4)";
      canvasBufferContext.strokeStyle="rgba(0,100,250,0.8)";
      var x = config.canvasWidth * 0.4;
      var y = config.canvasHeight * 0.4;
      var lX = config.canvasWidth * 0.3;
      var lY = config.canvasHeight *0.2;
      var topY = y-scaleM + water;
      var midY = y-scaleM+lY*0.3;
      var botY = y+lY+scaleM+1;
      topY = (topY > botY) ? botY : topY;
      if(topY >= midY){
        midY = topY;
      }
      canvasBufferContext.moveTo(x-scaleM,botY);
      canvasBufferContext.lineTo(x-scaleM,midY);
      canvasBufferContext.lineTo(x-scaleM+lX*0.2,topY);
      canvasBufferContext.lineTo(x+scaleM+lX*0.8,topY);
      canvasBufferContext.lineTo(x+lX+scaleM,midY);
      canvasBufferContext.lineTo(x+lX+scaleM,botY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      scaleM += 0.5;
  }


}


var LoadingScene = function (){
  var sceneUtils = new SceneUtils();
  var stars = sceneUtils.generateStars(10000);
  var camera = new Camera();
  var camWander = 5;
  var clockCycle = 0;
  var clockMax = 800;
  var camDX = 0;
  var camDY = 0;

  //animation variables
  var smallShip;
  var sceneTimer = 0;
  var shipPos = {'x':-5*config.gridInterval*config.xRatio,'y':config.cY};
  camera.focusOn(shipPos);
  var shipMode = false;
  var shipDuration = 800;
  var shipMsg;
  var titleMode = false;
  var printIndex = 0;

  var humanMode = false;
  var humanDuration = 800;
  var humanMsg;

  var loadingMode = true;

  var creditMode = false;
  var creditDuration = 200;


  var title = new Title();
  var aud = new Audio("deep_space.ogg");
  aud.load();

  this.keyPress = function(keyCode,keyDown){

  }

  var timer;
  this.update = function(mousePos){
    if(loadingMode){
      if(aud.readyState == 4){
        loadingMode = false;
        creditMode = true;
        aud.play();
      }
    }else if(creditMode){
      sceneTimer += 1;
      if(sceneTimer > creditDuration){
        sceneTimer = 0;
        creditMode = false;
        shipMode = true;
      }
    }else if(titleMode){
      if(clockCycle <= 0){
        camDX = (Math.random() * camWander * 2) - camWander;
        camDY = (Math.random() * camWander * 2) - camWander;
        clockCycle = clockMax;
      }else{
        clockCycle--;
      }
      camera.move(camDX,camDY);
    }else if(shipMode){
      shipPos.x += 5.75;
      shipPos.y = config.cY + Math.sin(shipPos.x % 800)/4;
      sceneTimer += 1;
      camera.move(5,0);
      if(sceneTimer > shipDuration / 2){
        if(!smallShip){
          smallShip = new Ship(shipPos.x,shipPos.y);
        }
        smallShip.update({});
      }
      if(sceneTimer > shipDuration){
        sceneTimer = 0;
        shipMode = false;
        humanMode = true;
        printIndex = 0;
        camera.focusOn({'x':0,'y':0});
      }
    }else if(humanMode){
      sceneTimer += 1;
      if(sceneTimer > humanDuration){
        humanMode = false;
        titleMode = true;
      }

    }
  }

  this.click = function(clickPos,rightMouse){
    if(loadingMode){

    }else if(titleMode){
      document.GameRunner.endScene("start");
    }else{
      titleMode = true;
      shipMode = false;
      humanMode = false;
      creditMode = false;
    }
  }


  this.drawText = function(msg,canvasBufferContext){
    printIndex += ((sceneTimer % 5 == 0) && (printIndex < (msg[0].length+msg[1].length))) ? 1 : 0;
    var x = config.canvasWidth / 14;
    var y = config.canvasHeight * 0.8;
    var fontSize = config.canvasWidth / (msg[0].length * 0.7) ;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(100,100,100,0.6)";
    canvasBufferContext.strokeStyle="rgba(200,200,200,0.8)";
    canvasBufferContext.rect(x-fontSize,y-fontSize,msg[0].length*0.63*fontSize,3*fontSize);
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
    canvasBufferContext.font = fontSize + 'px Courier New';
    canvasBufferContext.fillStyle = "rgba(50,250,200,0.9)";
    if(printIndex < msg[0].length){
      canvasBufferContext.fillText(msg[0].slice(0,printIndex),x,y);
    }else{
      canvasBufferContext.fillText(msg[0],x,y);
      canvasBufferContext.fillText(msg[1].slice(0,printIndex-msg[0].length),x,y+fontSize*1.2);
    }
  }

  this.draw = function(canvasBufferContext){
    if(loadingMode){
      sceneUtils.drawStars(stars, camera, clockCycle, canvasBufferContext);
      drawLoading(canvasBufferContext);
    }else if(creditMode){
      sceneUtils.drawStars(stars, camera, clockCycle, canvasBufferContext);
      drawCredit(canvasBufferContext);
    }else if(titleMode){
      sceneUtils.drawStars(stars, camera, clockCycle, canvasBufferContext);
      sceneUtils.drawPlanet(config.canvasWidth/1.845,config.canvasHeight/2.18,150,canvasBufferContext);
      title.draw(canvasBufferContext);
    }
    else if(shipMode){
      sceneUtils.drawStars(stars, camera, clockCycle, canvasBufferContext);
      if(smallShip){
        smallShip.draw(camera,canvasBufferContext);
      }
      drawShip(shipPos,camera,canvasBufferContext);
      this.drawText(shipMsg,canvasBufferContext);
    }
    else if(humanMode){
      this.drawHuman(canvasBufferContext);
      this.drawText(humanMsg,canvasBufferContext);
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

  var drawLoading = function(canvasBufferContext){
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

  var drawCredit = function(canvasBufferContext){
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
        sceneUtils.drawPlanet(eyeX-scaleM/3.2+lX*0.05,y-scaleM/3+(lY/2),lX/250+(scaleM/7),canvasBufferContext);
        sceneUtils.drawPlanet(eyeX+scaleM/1.5+lX*0.18,y-scaleM/3+(lY/2),lX/250+(scaleM/7),canvasBufferContext);
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


      scaleM += 0.5;
  }

  var drawShip = function(pos,camera,canvasBufferContext){
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var oX = (pos.x-camera.xOff)*config.xRatio;
      var oY = (pos.y-camera.yOff)*config.yRatio;
      var lX = 10*config.gridInterval*config.xRatio;
      var lY = 2*config.gridInterval*config.yRatio;
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
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var y = oY * 0.98;
      var eX = 2*config.gridInterval*config.xRatio;
      var eY = 2*config.gridInterval*config.yRatio * 1.4;
      canvasBufferContext.rect(oX,y,eX,eY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
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
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var x = oX+lX;
      canvasBufferContext.moveTo(x,oY);
      canvasBufferContext.bezierCurveTo(x+lX/3,oY,x+lX/3,oY+lY,x,oY+lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var x = oX+lX;
      var y = oY + lY * 0.2;
      canvasBufferContext.moveTo(x,y);
      canvasBufferContext.bezierCurveTo(x+lX/3,y,x+lX/3,y+lY*0.6,x,y+lY*0.6);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var x = oX+lX*0.3;
      var y = oY+lY;
      canvasBufferContext.moveTo(x,y);
      canvasBufferContext.bezierCurveTo(x,y+lY/10,oX+lX,y+lY/2,oX+lX,y);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var x = oX+lX*0.7;
      var y = oY + lY * 0.2;
      canvasBufferContext.moveTo(x,y);
      canvasBufferContext.bezierCurveTo(x+lX/3,y,x+lX/3,y+lY*0.6,x,y+lY*0.6);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(50,50,50,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var x = oX+lX*0.2;
      var y = oY;
      canvasBufferContext.moveTo(x,y);
      canvasBufferContext.bezierCurveTo(x,y-lY/3,x+lX/3,y-lY/2,x+lX/2,y);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
      //
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var x = oX + lX * 0.4
      var y = oY + lY * 0.3
 //     canvasBufferContext.rect(x,y,lX*0.6,lY*0.4);
 //     canvasBufferContext.fill();
 //     canvasBufferContext.stroke();
      //cockpit
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      var x = oX + lX * 0.3
      var y = oY - lY * 0.3
      canvasBufferContext.rect(x,y,lX*0.2,lY*0.3);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();

  }

  var shipMessage = function(){
    var yr = Math.floor(Math.random() * 8000);
    var jobs = ["Doctor","lawyer","Warlord","Cadet","physicist","engineer","aristocrat",
                "trade baron","SpaceLord","writer","boxer","pop artist","spiritual leader",
                "rap artist","professional baller","cosmonaut","disgruntled professor"];
    var job = jobs[Math.floor(Math.random()*jobs.length)];
    var name = config.nameGenerator();
    var crimes = ["Space Crime","Corporate Heresy","Unorthodox Methodologies","Space Piracy",
                  "Lunar Exploitation","SpaceTime Disruption","Spacewar Crimes","Neutron Embezzlement",
                  "SpaceDrug Smuggling","Interstellar Rebellion","Misuse of Antimatter",
                  "Planetary Bombardment","Destruction of Government Property",
                  "Grandtheft Starship","SpaceHooliganism","Stellar Mismanagement"];
    var crime = crimes[Math.floor(Math.random()*crimes.length)];
    return ["In the year "+yr+", "+job+" "+name[0]+" "+name[1]+" was convicted of "+crime+".","The sentence: Colonization of a brutal outer world."];
  }
  var shipMsg = shipMessage();

  var humanMessage = function(){
    var yrs = Math.floor(Math.random() * 1000);
    return ["Underequipped and undermanned, colonization was a death sentence. Now, after ",yrs+" years of hypersleep, the barren planet approaches. Welcome to..."];
  }
  humanMsg = humanMessage();


}

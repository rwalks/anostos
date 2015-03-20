var LoadingScene = function (){
  var sceneUtils = new SceneUtils();
  var stars = sceneUtils.generateStars();
  var camera = new Camera();
  var camWander = 5;
  var clockCycle = 0;
  var clockMax = 800;
  var camDX = 0;
  var camDY = 0;

  //animation variables
  var loadingArt = new LoadingArt();
  var smallShip;
  var sceneTimer = 0;
  var shipPos = {'x':-config.canvasWidth/3};
  shipPos.y = config.cY/4 + Math.sin(shipPos.x % 800)/2;
  camera.focusOn({'x':0,'y':0});
  var shipMode = false;
  var shipDuration = 1000;
  var shipMsg;
  var planetR = config.canvasWidth / 20;
  var drawPlanet = false;
  var titleMode = false;
  var printIndex = 0;

  var humanMode = false;
  var humanDuration = 800;
  var humanMsg;

  var loadingMode = true;

  var creditMode = false;
  var creditDuration = 200;


  var title = new Title();
  this.audio = new AudioLoader();
  this.audio.load();

  this.keyPress = function(keyCode,keyDown){

  }

  var timer;
  this.update = function(mousePos){
    if(loadingMode){
      if(this.audio.ready()){
        loadingMode = false;
        creditMode = true;
        this.audio.play("introMusic");
      }
    }else if(creditMode){
      sceneTimer += 1;
      if(sceneTimer > creditDuration){
        sceneTimer = 0;
        creditMode = false;
    //    shipMode = true;
        titleMode = true;
        this.audio.play("spookyPlanet");
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
      if(sceneTimer == 0){
        this.audio.play("introShip");
      }
      shipPos.x += 6.5;
      shipPos.y = config.cY/4 + Math.sin(shipPos.x % 800)/2;
      sceneTimer += 1;
      camera.move(5,0);
      if(sceneTimer > shipDuration * 0.5){
        if(drawPlanet == false){
          this.audio.play("spookyPlanet");
        }
        drawPlanet = true;
        planetR += 1;
      }
      if(sceneTimer > shipDuration * 0.8){
        drawPlanet = false;
        if(!smallShip){
          smallShip = new Ship(shipPos.x*1.1,shipPos.y*1.3,this.audio);
          smallShip.theta = 2.5;
          smallShip.accelerate(true);
        }
        shipPos.y =  Math.sin(shipPos.x % 800)/4;
        smallShip.update({});
        camera.focusOn(smallShip.position);
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
        this.audio.play("spookyPlanet");
      }

    }
  }

  this.click = function(clickPos,rightMouse){
    if(loadingMode){

    }else if(titleMode){
      this.audio.stop("introMusic");
      document.GameRunner.endScene("start");
    }else{
      titleMode = true;
      shipMode = false;
      humanMode = false;
      creditMode = false;
    }
  }

  this.draw = function(canvasHolder){
    canvasHolder.clearContext(0);
    var canvasBufferContext = canvasHolder.contexts[0];
    if(loadingMode){
      sceneArt.drawStars(stars, camera, clockCycle, canvasBufferContext);
      loadingArt.drawLoading(canvasBufferContext);
    }else if(creditMode){
      sceneArt.drawStars(stars, camera, clockCycle, canvasBufferContext);
      loadingArt.drawCredit(canvasBufferContext);
    }else if(titleMode){
      sceneArt.drawStars(stars, camera, clockCycle, canvasBufferContext);
      sceneArt.drawPlanet(config.canvasWidth/1.845,config.canvasHeight/2.18,150,canvasBufferContext);
      title.draw(canvasBufferContext);
    }else if(shipMode){
      sceneArt.drawStars(stars, camera, clockCycle, canvasBufferContext);
      if(smallShip){
        smallShip.draw(camera,canvasBufferContext);
        loadingArt.drawShip(shipPos,camera,canvasBufferContext);
      }else if(drawPlanet){
        sceneArt.drawPlanet(config.canvasWidth/1.845,config.canvasHeight/2.18,planetR,canvasBufferContext);
      }else{
        loadingArt.drawShip(shipPos,camera,canvasBufferContext);
      }
      this.drawText(shipMsg,canvasBufferContext);
    }
    else if(humanMode){
      loadingArt.drawHuman(canvasBufferContext);
      this.drawText(humanMsg,canvasBufferContext);
    }

  }

  this.drawText = function(msg,canvasBufferContext){
    if((sceneTimer % 3 == 0) && (printIndex < (msg[0].length+msg[1].length))){
      this.audio.play('message',true);
      printIndex += 1;
    }

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

  var shipMessage = function(name){
    var yr = Math.floor(Math.random() * 8000);
    var jobs = ["Doctor","lawyer","Warlord","Cadet","physicist","engineer","aristocrat",
                "trade baron","SpaceLord","writer","boxer","pop artist","spiritual leader",
                "rap artist","professional baller","cosmonaut","disgruntled professor"];
    var job = jobs[Math.floor(Math.random()*jobs.length)];
    var crimes = ["Space Crime","Corporate Heresy","Unorthodox Methodologies","Space Piracy",
                  "Lunar Exploitation","SpaceTime Disruption","Spacewar Crimes","Neutron Embezzlement",
                  "SpaceDrug Smuggling","Interstellar Rebellion","Misuse of Antimatter",
                  "Planetary Bombardment","Destruction of Government Property",
                  "Grandtheft Starship","SpaceHooliganism","Stellar Mismanagement"];
    var crime = crimes[Math.floor(Math.random()*crimes.length)];
    return ["In the year "+yr+", "+job+" "+name.first+" "+name.last+" was convicted of "+crime+".","The sentence: Colonization of a brutal outer world."];
  }

  this.heroName = utils.nameGenerator();
  var shipMsg = shipMessage(this.heroName);

  var humanMessage = function(){
    var yrs = Math.floor(Math.random() * 1000);
    return ["Underequipped and undermanned, colonization was a death sentence. Now, after ",yrs+" years of hypersleep, the barren planet approaches. Welcome to..."];
  }
  humanMsg = humanMessage();


}

var LoadingScene = function (){
  var sceneUtils = new SceneUtils();
  var stars = sceneUtils.generateStars(10000);
  var camera = new Camera();
  var camWander = 5;
  var clockCycle = 0;
  var clockMax = 800;
  var camDX = 0;
  var camDY = 0;

  var title = new Title();
  var aud = new Audio("deep_spaceRadio.ogg");
  aud.load();
  //aud.play();

  this.update = function(mousePos){
    if(clockCycle <= 0){
      camDX = (Math.random() * camWander * 2) - camWander;
      camDY = (Math.random() * camWander * 2) - camWander;
      clockCycle = clockMax;
    }else{
      clockCycle--;
    }
    //if(!camera.update(mousePos)){
      camera.move(camDX,camDY);
   // }
  }

  this.click = function(clickPos,rightMouse){
    document.GameRunner.endScene("start");
  }

  this.draw = function(canvasBufferContext){
    sceneUtils.drawStars(stars, camera, clockCycle, canvasBufferContext);
    title.draw(canvasBufferContext);
  }

}

function GameRunner() {
  var _canvas;
  var _scene;
  var mousePos;
  this.loaded = true;
  this.sceneLock = false;

  var canvasHolder = new CanvasHolder();

  this.scene = function(){return _scene;}
  this.Run = function () {
    if (this.initialize()) {
      _scene = new LoadingScene();
      setInterval(function() {document.GameRunner.tick()}, 1000 / config.fps);
    }
  }

  this.initialize = function() {
    _canvas = document.getElementById('canvas');
    canvasHolder.load(_canvas,1);
    artHolder.init();
    updateSizes();
    bindControls();
    return true;
  }

  function bindControls () {
    document.onkeyup = function (e) {
      localEvent(e,true);
      return false;
    };
    document.onkeydown = function (e) {
      var noDefault = (e.keyCode == 8 || e.keyCode == 32);
      localEvent(e,noDefault);
      if(noDefault){
        return false;
      }
    };
    document.onclick = function (e) {
      localEvent(e,true);
      return false;
    };
    document.oncontextmenu = function (e) {
      localEvent(e,true);
      return false;
    };
    _canvas.addEventListener('mousemove', function(evt) {
      mousePos = getMousePos(evt);
    }, false);
    window.onresize = function() {
        updateSizes();
    };
  }

  var updateSizes = function() {
    var windowSize = getWindowSize();
    windowSize.x -= 15;
    windowSize.y -= 20;
    config.updateRatios(windowSize);
    canvasHolder.updateSizes();
    artHolder.updateSizes();
  };

  var getWindowSize = function() {
    return new Vector(window.innerWidth,window.innerHeight);
  };


  var localEvent = function(e,preventDefault) {
    if (e != null){
      if(preventDefault){
        e.preventDefault();
        e.stopPropagation();
      }
      switch(e.type) {
        case 'contextmenu':
        case 'click':
          if (e.target.id == 'canvas'){
            mousePos = getPosition(e);
            var rightMouse = (e.button == 2);
            _scene.click(mousePos, rightMouse);
          }
          break;
        case 'keydown':
          _scene.keyPress(e.keyCode,true);
          break;
        case 'keyup':
          _scene.keyPress(e.keyCode,false);
          break;
      }
    }
  }

  this.tick = function(){
    if (_scene){
      if(!this.sceneLock){
        this.sceneLock = true;
        _scene.update(mousePos);
        this.draw();
        this.sceneLock = false;
      }
    }
  }

  var getMousePos = function(evt) {
    var rect = _canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  this.endScene = function(type){
    this.loaded = false;
    switch(type){
      case 'dead':
        _scene = new LoadingScene();
        break;
      case 'start':
        _scene = new GameScene(_scene);
        break;
    }
    this.loaded = true;
  }

  this.draw = function(){
    if(this.loaded){
      canvasHolder.clearAll();
      //draw scene
      _scene.draw(canvasHolder);
    }
  }

  function getPosition(e) {
    var offset = new Vector(0,0);
    var currentElement = e.target;
    do{
      offset.x += currentElement.offsetLeft - currentElement.scrollLeft;
      offset.y += currentElement.offsetTop - currentElement.scrollTop;
    }while(currentElement = currentElement.offsetParent);

    var x = e.pageX - offset.x;
    var y = e.pageY - offset.y;
    return new Vector(x,y);
  };
}

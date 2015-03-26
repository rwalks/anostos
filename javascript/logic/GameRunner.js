function GameRunner() {

    var _canvas;
    var _canvasContext;
    var _scene;
    var mousePos;
    this.loaded = true;

    var canvasHolder = new CanvasHolder(5);

    this.scene = function(){return _scene;}
    this.Run = function () {
      if (this.initialize()) {
        _scene = new LoadingScene();
        setInterval(function() {document.GameRunner.tick()}, 1000 / config.fps);
      }
    }

    this.initialize = function() {
      _canvas = document.getElementById('canvas');
      _canvasContext = _canvas.getContext('2d');
      canvasHolder.init();
      updateSizes();
      bindControls();
      return true;
    }

    function bindControls () {
      $(document).bind('keyup', function (e) {
        LocalEvent(e,true);
        return false;
      });
      $(document).bind('keydown', function (e) {
        var noDefault = (e.keyCode == 8 || e.keyCode == 32);
        LocalEvent(e,noDefault);
        if(noDefault){
          return false;
        }
      });
      $(document).bind('click', function (e) {
        LocalEvent(e,true);
        return false;
      });
      $(document).bind('contextmenu', function (e) {
        LocalEvent(e,true);
        return false;
      });
      _canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(evt);
      }, false);
      $(window).on('resize', function() {
          updateSizes();
      });
    }

    var updateSizes = function() {
      var windowSize = getWindowSize();
      windowSize.x -= 15;
      windowSize.y -= 20;
      config.updateRatios(windowSize);
      _canvas.width = config.canvasWidth;
      _canvas.height = config.canvasHeight;
      canvasHolder.updateSizes();
      artHolder.updateSizes();
    };

    var getWindowSize = function() {
      return {
        y: window.innerHeight,
        x:  window.innerWidth
      };
    };


    function LocalEvent(e,preventDefault) {
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
        _scene.update(mousePos);
        this.draw();
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
          _scene = new LandingScene(_scene.stars,_scene.heroName,_scene.audio);
          this.endScene('landing');
          return;
          break;
        case 'landing':
          _scene = new GameScene(_scene.stars,_scene.terrain,_scene.ship,_scene.heroName,_scene.sceneUtils.bgs,_scene.aliens);
          break;
      }
      this.loaded = true;
    }

    this.prepBuffers = function(){
      //clear main
      _canvasContext.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
      //clear layers
      for(var c = 0; c < canvasHolder.length; c++){
        if(c != 3){
        canvasHolder.clearContext(c);
        }
      }
    }

    this.draw = function(){
      if(this.loaded){
        this.prepBuffers();
        //draw scene
        _scene.draw(canvasHolder);
        //draw buffers on screen
        canvasHolder.drawAll(_canvasContext);
      }
    }


    function getPosition(e) {
      var targ;
      if (!e)
        e = window.event;
      if (e.target)
        targ = e.target;
      else if (e.srcElement)
        targ = e.srcElement;
      if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;
    // jQuery normalizes the pageX and pageY
    // pageX,Y are the mouse positions relative to the document
    // offset() returns the position of the element relative to the document
      var x = e.pageX - $(targ).offset().left;
      var y = e.pageY - $(targ).offset().top;
      return {"x": x, "y": y};
    };
}

function CanvasHolder(num){
  this.length = num;
  this.canvases = [];
  this.contexts = [];

  this.init = function(){
    for(var c = 0; c < this.length; c++){
      var can = document.createElement('canvas');
      this.canvases.push(can);
      this.contexts.push(can.getContext('2d'));
    }
  }

  this.updateSizes = function(){
    var w = config.canvasWidth;
    var h = config.canvasHeight;
    for(var c = 0; c < this.length; c++){
      this.canvases[c].width = w;
      this.canvases[c].height = h;
    }
  }

  this.clearContext = function(id){
    if(this.contexts[id]){
      var sX = this.canvases[id].width;
      var sY = this.canvases[id].height;
      this.contexts[id].clearRect(0, 0, sX, sY);
    }
  }

  this.drawAll = function(target){
    //compose scene
    this.contexts[1].drawImage(this.canvases[2],0,0);
    //draw lights
    this.contexts[1].save();
    this.contexts[1].globalCompositeOperation = 'source-atop';
    this.contexts[1].drawImage(this.canvases[3],0,0);
    this.contexts[1].restore();
    //draw bg
    target.drawImage(this.canvases[0],0,0);
    //draw terrain + entities
    target.drawImage(this.canvases[1],0,0);
    //draw gui
    target.drawImage(this.canvases[4],0,0);
  }
}

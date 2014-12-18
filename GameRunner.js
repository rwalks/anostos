function GameRunner() {

    var _canvas;
    var _canvasContext;
    var _canvasBuffer;
    var _canvasBufferContext;
    var _scene;
    var mousePos;

    this.scene = function(){return _scene;}
    this.Run = function () {
      if (this.initialize()) {
        _scene = new LoadingScene();
        setInterval(function() {document.GameRunner.tick()}, 1000 / 40);
        loadContent();
      }
    }

    this.initialize = function () {
      _canvas = document.getElementById('canvas');
      if (_canvas && _canvas.getContext) {
        _canvasContext = _canvas.getContext('2d');
        _canvasBuffer = document.createElement('canvas');
        _canvasBufferContext = _canvasBuffer.getContext('2d');
        updateSizes();
        bindControls();
        return true;
      }
      return false;
    }

    function loadContent(){

    }

    function bindControls () {
      $(document).bind('keyup', function (event) {
          LocalEvent(event);
      });
      $(document).bind('keydown', function (event) {
          LocalEvent(event);
      });
      $(document).bind('click', function (event) {
        event.preventDefault();
          LocalEvent(event);
      });
      $(document).bind('contextmenu', function (event) {
        event.preventDefault();
        LocalEvent(event);
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
      windowSize.x -= 10;
      windowSize.y -= 20;
      $('#canvas').width(windowSize.x).height(windowSize.y);
      $('#canvas').attr('width', windowSize.x).attr('height', windowSize.y);
      config.canvasWidth = windowSize.x;
      config.canvasHeight = windowSize.y;
      config.updateRatios();
      _canvasBuffer.width = config.canvasWidth;
      _canvasBuffer.height = config.canvasHeight;
    };

    getWindowSize = function() {
      return {
        y: window.innerHeight,
        x:  window.innerWidth
      };
    };


    function LocalEvent (event) {
      if (event != null){
        switch(event.type) {
          case 'contextmenu':
          case 'click':
            if (event.target.id == 'canvas'){
              mousePos = getPosition(event);
              var rightMouse = (event.button == 2);
              _scene.click(mousePos, rightMouse);
            }
            break;
          case 'keydown':
            _scene.keyPress(event.keyCode,true);
            break;
          case 'keyup':
            _scene.keyPress(event.keyCode,false);
            break;
        }
      }
    }

    this.tick = function(){
      if (_scene){
        _scene.update(mousePos);
        draw();
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
      switch(type){
        case 'dead':
          _scene = new LoadingScene();
          break;
        case 'start':
          _scene = new LandingScene(_scene.stars,_scene.heroName,_scene.audio);
          break;
        case 'landing':
          _scene = new GameScene(_scene.stars,_scene.terrain,_scene.ship,_scene.heroName,_scene.sceneUtils.bgs);
          break;
      }
    }

    var draw = function(){
      //clear canvas
      _canvasBufferContext.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
      _canvasBufferContext.globalCompositeOperation="source-over";
      _canvasBufferContext.fillStyle = 'rgba(0,0,0,0.7)';
      _canvasBufferContext.fillRect(0,0,config.canvasWidth,config.canvasHeight);

      //draw scene
      _scene.draw(_canvasBufferContext);

      //draw buffer on screen
      _canvasContext.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
      //_canvasBufferContext.globalCompositeOperation="source-atop";
      _canvasContext.drawImage(_canvasBuffer, 0, 0);
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

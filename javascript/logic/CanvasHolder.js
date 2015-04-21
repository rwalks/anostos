function CanvasHolder(){
  this.canvases = [];
  this.contexts = [];
  //alias
  this.gameContext; this.gameCanvas;
  this.lightContext; this.lightCanvas;

  this.load = function(gameCan,num){
    for(var c = 0; c <= num; c++){
      //first canvas is main
      var can = c ? document.createElement('canvas') : gameCan;
      this.canvases.push(can);
      this.contexts.push(can.getContext('2d'));
    }
    //set easy alias
    this.gameCanvas = this.canvases[0];
    this.gameContext = this.contexts[0];
    this.lightCanvas = this.canvases[1];
    this.lightContext = this.contexts[1];
  }

  this.updateSizes = function(){
    var w = config.canvasWidth;
    var h = config.canvasHeight;
    for(var c = 0; c < this.canvases.length; c++){
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

  this.clearAll = function(){
    //clear layers
    for(var c = 0; c < this.contexts.length; c++){
      this.clearContext(c);
    }
  }
}

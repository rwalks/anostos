ArtHolder = function(){
  this.loadCount = 0;

  this.artMap = {};

  for(var i = 0; i < 20; i++){
    this.artMap[i] = new Art();
  }

  this.getArt = function(name){
    return this.artMap[name];
  }

  this.updateArt = function(){
    var artKeys = Object.keys(this.artMap);
    for(var a = 0; a < artKeys.length; a++){
      this.artMap[artKeys[a]].update();
    }
    return true;
  }
}

Art = function() {


  this.update = function(){
  }

}


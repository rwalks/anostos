var AudioLoader = function (){

  var files = {"introMusic": {'src':"sounds/deep_space.ogg",'copies':[],'index':1},
                "spookyPlanet": {'src':"sounds/spooky1.ogg",'copies':[],'index':1},
                "introShip": {'src':"sounds/eng1.ogg",'copies':[],'index':1},
                "eng1": {'src':"sounds/engS.ogg",'copies':[],'index':4},
                "explosion1": {'src':"sounds/explosion1.ogg",'copies':[],'index':4},
                "explosion2": {'src':"sounds/explosion2.ogg",'copies':[],'index':4},
                "message": {'src':"sounds/message.ogg",'copies':[],'index':4},
                "landing1": {'src':"sounds/landingmusic1.ogg",'copies':[],'index':1},
                "landing2": {'src':"sounds/landingmusic2.ogg",'copies':[],'index':1},
                "eng3": {'src':"sounds/eng4.ogg",'copies':[],'index':4}
              }


  this.load = function(){
    for(f in files){
      for(i=0;i<files[f].index;i++){
        var fil = new Audio(files[f].src);
        fil.load();
        files[f].copies.push(fil);
      }
      files[f].index = 0;
    }
  }

  this.play = function(id,reload){
  //  if(reload && window.chrome){ files[id].copies[files[id].index].load(); }
  //  files[id].copies[files[id].index].play();
  //  files[id].index = (files[id].index + 1) % files[id].copies.length;
  }

  this.stop = function(id){
    for(i=0;i<files[id].copies.length;i++){
      files[id].copies[i].pause();
      if(window.chrome){ files[id].copies[files[id].index].load(); }
    }
  }

  this.ready = function(){
    var ret = true;
    for(f in this.files){
      var fil = this.files[f];
      for(c in fil.copies){
        var copy = fil.copies[c];
        if(!copy.readyState != 4){
          ret = false;
        }
      }
    }
    return ret;
  }

}

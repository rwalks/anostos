Resources = function() {
  var maxPower = 100; var currentPower = 0;
  var maxSoil = 100; var currentSoil = 0;
  var maxMetal = 100; var currentMetal = 0;
  var maxWater = 100; var currentWater = 0;
  var maxOx = 100;    var currentOx = 0;

  this.getResources = function(){
    return {
            'power':[currentPower,maxPower],
            'oxygen':[currentOx,maxOx],
            'water':[currentWater,maxWater],
            'soil':[currentSoil,maxSoil],
            'metal':[currentMetal,maxMetal],
           }
  }

  this.update = function(){

  }


}


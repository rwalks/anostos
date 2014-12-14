ResourceNetwork = function(rms,gens,conts,nodes,aff) {

  this.containers = conts ? conts : [];
  this.generators = gens ? gens : [];
  this.rooms = rms ? rms : [];
  this.buildings = nodes ? nodes : {};
  var affinity = aff ? aff[0] : false;

  var oxFlow = 5;


  this.update = function(phaseOne){
    var objs = phaseOne ? this.containers : this.generators;
    for(b in objs){
      var build = objs[b];
      if(phaseOne){
        for(g in this.generators){
          var gen = this.generators[g];
          for(res in gen.genInput){
            var resIn = gen.genInput[res] - gen.inventory.itemCount(res);
            var contIn = build.inventory.itemCount(res);
            if(resIn > 0 && contIn > 0){
              var transferAmount = Math.min(resIn,contIn);
              build.inventory.removeItem(res,transferAmount);
              gen.inventory.addItem(res,transferAmount);
            }
          }
        }
      }else{
        //update generator
        var genCycle = true;
        for(res in build.genInput){
          if(build.inventory.itemCount(res) < build.genInput[res]){
            genCycle = false;
          }
        }
        if(genCycle){
          var genDone = false;
          for(res in build.genOutput){
            var addCount = build.genOutput[res] - build.inventory.itemCount(res);
            if(addCount > 0){
              build.inventory.addItem(res,addCount);
              genDone = true;
            }
          }
          if(genDone){
            //remove input cost
            for(res in build.genInput){
              build.inventory.removeItem(res,build.genInput[res]);
            }
          }
        }
        //push to containers
        for(c in this.containers){
          var cont = this.containers[c];
          for(i in build.inventory.inv){
            var itemCount = Math.min(cont.inventory.spaceRemaining(),build.inventory.inv[i]);
            if(cont.inventory.addItem(i,itemCount)){
              build.inventory.removeItem(i,itemCount);
            }
          }
        }
      }
      if(affinity == 'oxygen'){
        for(r in this.rooms){
          var room = this.rooms[r];
          var oxAmount = Math.min(oxFlow,room.maxOxygen - room.oxygen);
          if(oxAmount > 0){
            var contOx = Math.min(oxAmount,build.inventory.itemCount('oxygen'));
            build.inventory.removeItem('oxygen',contOx);
            room.oxygen += contOx;
          }

        }
      }
    }


  }

}


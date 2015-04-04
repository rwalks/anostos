Color = function(r,g,b,a){
  this.r = Math.floor(r) || 0;
  this.g = Math.floor(g) || 0;
  this.b = Math.floor(b) || 0;
  this.a = a || 0;

  this.colorStr = function(){
    return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
  }

  this.clone = function(){
    return new Color(this.r,this.g,this.b,this.a);
  }

  this.whiten = function(amt){
    var total = this.r + this.g + this.b;
   // this.r = Math.round(200 + (55 * this.r/total));
   // this.g = Math.round(200 + (55 * this.g/total));
   // this.b = Math.round(200 + (55 * this.b/total));
    var w = 255 * amt;
    this.r = Math.floor(Math.min(this.r+w,255));
    this.g = Math.floor(Math.min(this.r+w,255));
    this.b = Math.floor(Math.min(this.r+w,255));
  }

  this.darken = function(amt){
    amt = amt || 0.5;
    this.r = Math.floor(this.r * amt);
    this.g = Math.floor(this.g * amt);
    this.b = Math.floor(this.b * amt);
  }

  this.randomize = function(type){
    var r=0; var g=0; var b=0; var a=this.a;
    switch(type){
      case 'fire':
        var rand = Math.random();
        r = 200 + (55 * rand);
        g = Math.random() > 0.8 ? r : 0;
        a = 0.3 + (Math.random() * 0.5);
        break;
      case 'smoke':
        var rand = Math.random();
        var c = rand * 200;
        r = c;
        g = c;
        b = c;
        a = 0.3 + (Math.random() * 0.6);
        break;
      case 'plasma':
        var rand = Math.random();
        b = 200 + (55 * Math.random());
        r = rand > 0.9 ? 255 : 50;
        g = rand > 0.9 ? 255 : 50;
        a = 0.3 + (Math.random() * 0.5);
        break;
      case 'spark':
        var rand = Math.random();
        if(rand > 0.9){
          r = 255; g = 255; b = 255;
          a = 0.2;
        }else if(rand > 0.8){
          r = 255; g = 255; b = 255;
          a = 0.2;
        }else if(rand > 0.333){
          r = 255; g = 50; b = 0;
          a = 0.6;
        }else{
          r = 255; g = 255; b = 0;
          a = 0.9;
        }
        break;
      default:
        r = Math.random()*255;
        g = Math.random()*255;
        b = Math.random()*255;
        break;
    }
    this.r = Math.floor(r);
    this.g = Math.floor(g);
    this.b = Math.floor(b);
    this.a = a;
  }
}

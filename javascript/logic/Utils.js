var Utils = function (){

  var firstNames = ["Lob","Tex","Snake","Jeb","Moose","Kansas","Rolf","Tane","Benji","Javier","Jane","El",
                    "Ellen","Parthenia","Tiny","Henry","Virgil","Hildred","Fern","Eve","Gibraltar","Ace","Vivian",
                    "Rosemary","Yolanda","Deloris","Adeline","Tig","Satan","Whisk","Lance","Jelly","Boss","Ryan",
                    "Quef","Felix","Honest", "Johnny","Lucy","Mallow","Seldon","Zip","Tupac","Shaq","Sputnik","Splif",
                    "Hex","Job","Ez","Opal","Dusty","Doctor","Rod","Geoff","Nib","Nox","Neeber","Doc","Hugh","Laze",
                    "Zandy","Gio","Joe","MadDog","Elvis","Dot","Bertha","Cilantro","Gilly","Lucy","Gomer","Eunice",
                    "Dorcas","Milcah","Naomi","Tamar","Ariadne","Arachne","Abia","Alope","Dirce","Cleo","Electra",
                    "Euryte","Gorge","Niobe","Pero","Mestra","Memphis","Iphis","Bev","Sheila","Jim"
                    ];
  var lastNamesA = ["Lobster","Moose","Star","Scrub","Goose","Gold","Bling","Barf","Sport","Space","Chill","Dance","Rib",
                    "Gluten","Warp","Jazz","Dunk","Profit","Dock","Jelly","Hog","Speed","Laser","Green","Ghost","Mc","Cod",
                    "Orb","Chuckle","Phase","Zen","Pizza","Shoe","Ice","Fire","Slug","Slack","Zap","Bird","Bike","Spork",
                    "Rock","Big","Ion","Ship","Night","Spring","Daisy","Tyrano","Dust","Grit","Volt","Long"
                   ];
  var lastNamesB = ["dog","lord","hammer","bone","man","jesus","magnet","fist","son","sauce","dust","queen","king",
                    "foe","fan","hound","shank","ster","heart","fast","boss","dad","bean","garden","mix","cave","ski",
                    "thief","slow","bucket","field","meat","well","cove","born","kin","nik","smith","saw","opolis","star",
                    "bandit","left","strong","face"
                   ];

  this.nameGenerator = function(){
    var fN = Math.floor(Math.random()*firstNames.length);
    var lNA = Math.floor(Math.random()*lastNamesA.length);
    var lNB = Math.floor(Math.random()*lastNamesB.length);
    var firstName = firstNames[fN];
    var lastName = lastNamesA[lNA] + "" + lastNamesB[lNB];
    return new Name(firstName,lastName);
  }

  this.distance = function(p1, p2) {
    return Math.sqrt(Math.pow(p2[0] - p1[0],2)+Math.pow(p2[1]-p1[1],2));
  }

  this.objectDistance = function(obj1, obj2) {
    return Math.sqrt(Math.pow((obj2.position.x - obj1.position.x),2)+Math.pow((obj2.position.y-obj1.position.y),2));
  }

  this.roundToGrid = function(x){
    return (x - (x % config.gridInterval));
  }

  this.rotate = function(x,y,theta){
    var rx = (x*Math.cos(theta))-(y*Math.sin(theta));
    var ry = (x*Math.sin(theta))+(y*Math.cos(theta));
    return [rx,ry];
  }

  this.outOfBounds = function(pos){
    return (pos.x < -config.gridInterval || pos.x > config.mapWidth ||
        pos.y < -config.gridInterval || pos.y > config.mapHeight);
  }

  this.intersect = function(p0,p1,p2,p3){
    var s10X = p1[0] - p0[0];
    var s10Y = p1[1] - p0[1];
    var s32X = p3[0] - p2[0];
    var s32Y = p3[1] - p2[1];

    var denom = s10X * s32Y - s32X * s10Y;
    if(denom == 0){
      return false;
    }
    var denomPos = denom > 0;

    var s02X = p0[0] - p2[0];
    var s02Y = p0[1] - p2[1];

    var sNum = s10X * s02Y - s10Y * s02X;
    if((sNum < 0) == denomPos){
      return false;
    }

    var tNum = s32X * s02Y - s32Y * s02X;
    if((tNum < 0) == denomPos){
      return false;
    }

    if((sNum > denom) == denomPos || (tNum > denom) == denomPos){
      return false;
    }

    //collision if this far
    var t = tNum / denom;
    var iX = p0[0] + (t * s10X);
    var iY = p0[1] + (t * s10Y);
    return [iX,iY];
  }
}

Vector = function(x,y){
  this.x = x;
  this.y = y;
}

Directional = function(u,d,l,r){
  this.up = u || false;
  this.down = d || false;
  this.left = l || false;
  this.right = r || false;
}

Name = function(firstName,lastName){
  this.first = firstName || "Unknown";
  this.last = lastName || "Unkown";

  this.set = function(f,l){
    this.first = f;
    this.last = l;
  }
}

Color = function(r,g,b,a){
  this.r = r || Math.floor((Math.random() * 255));
  this.g = g || Math.floor((Math.random() * 255));
  this.b = b || Math.floor((Math.random() * 255));
  this.a = a || 1.0;

  this.colorStr = function(){
    return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
  }
}

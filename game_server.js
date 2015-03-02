var http = require('http');
var fs = require('fs');
var path = require('path');

var app = http.createServer(handler);
app.listen(8080);
console.log('Marqod Lives..');

function handler (req, res) {
    console.log('request starting...');
    var host = req.headers ? req.headers.host : "";
    var filePath = '.' + req.url.split("?")[0];
    if (req.method !== 'GET') {
	    res.writeHead(400);
	    res.end();
	    return;
	  }
    var extName = path.extname(filePath);
    var contentType = 'text/html';
    switch(extName){
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.ogg':
        contentType = 'audio/ogg';
        break;
    }

    var indexPath = "./game.html";

    if (filePath == './'){
        filePath = indexPath;
    }
    res.setHeader("Content-Type",contentType);
    res.setHeader("Cache-Control","public,max-age=66666");
    path.exists(filePath, function(exists){
      if(exists){
        fs.readFile(filePath, function(error,content){
          if(error){
            console.log("ERROR :: " + filePath);
            res.writeHead(404);
            res.end();
          }else{
            console.log("SUCCESS :: " + filePath);
            res.writeHead(200);
            res.end(content);
          }
        });
      }else{
        res.writeHead(400);
        res.end();
      }  
    });
}


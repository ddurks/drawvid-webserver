var socket_io = require('socket.io');
var sizeOf = require('image-size');
var constants = require('../constants');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 512;
const PLAYER_DIMENSION = 32;
const PLAYER_SPEED = 6;
const BULLET_DIMENSION = 16;
const BULLET_SPEED = 250;
const RELOAD_INTERVAL = 60;
const LOUNGE_CAPACITY = 10;
const MESSAGE_DECAY = 20.0;
const Utility = {
  getTimestamp: function() {
    return Date.now() / 1000.0;
  }
}

const Furniture = {
  create: function(image_src, posx, posy, isBlocking) {
    var furniture = Object.create(this);
    furniture.name = image_src;
    furniture.posx = posx;
    furniture.posy = posy;
    furniture.leftx = posx;
    furniture.topy = posy;
    var dimensions = sizeOf(image_src);
    furniture.height = dimensions.height;
    furniture.width = dimensions.width;
    furniture.rightx = furniture.posx+furniture.width;
    furniture.bottomy = furniture.posy+furniture.height;
    furniture.isBlocking = isBlocking;
    return furniture;
  }
}

const Player = {
  height: 0,
  width: 0,
  scale: 1,

  create: function(username, posx, posy, direction) {
    var player = Object.create(this);
    player.posx = posx;
    player.posy = posy;
    player.leftx = posx;
    player.topy = posy;
    player.username = username;
    player.walking_loop = [0,0,1,1,1,1,1,0,0,2,2,2,2,2];
    player.loop = player.walking_loop;
    player.loop_i = 0;
    player.direction = direction;
    player.speed = PLAYER_SPEED;
    player.message_timestamp = 0;
    player.score = 0;
    player.bullets = 1;
    player.reload_timestamp = 0;
    return player;
  },
};

const Bullet = {
  create: function(x, y, direction) {
    var bullet = Object.create(this);
    bullet.x = x;
    bullet.y = y;
    bullet.direction = direction;
    bullet.speed = BULLET_SPEED;
    return bullet;
  }
};

const Bong = {
  create: function(x, y) {
    var bong = Object.create(this);
    bong.x = x;
    bong.y = y;
    return bong;
  }
};

const SmokePuff = {
  create: function(x, y) {
    var smoke = Object.create(this);
    smoke.x = x;
    smoke.y = y;
    smoke.loop = [0,0,0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,1,1, 2,2,2,2,2,2,2,2,2,2, 3,3,3,3,3,3,3,3,3,3, 4,4,4,4,4,4,4,4,4,4, 5,5,5,5,5,5,5,5,5,5];
    smoke.loop_i = 0;
    return smoke;
  }
}

const ScoreBoard = {
  create: function() {
    var scoreboard = Object.create(this);
    scoreboard.scores = new Array();
    scoreboard.scoresMap = new Map();
    scoreboard.updated = false;
    return scoreboard;
  },

  minScore: function() {
    if (this.scores.length >= 5) {
      return this.scores[0].score;
    } else {
      return 0;
    }
  },

  setScoresFromMap: function() {
    var i = 0;
    this.scoresMap.forEach( function(score) {
      this.scores[i] = score;
      i++;
    }.bind(this));
    this.scores.sort( function(a, b) { return a.score-b.score; });
    this.updated = true;
  },

  removeLowestScore: function() {
    var lowestScore = 1000000;
    var lowestUsername;
    this.scoresMap.forEach(function(score) {
      if (score.score < lowestScore) {
        lowestScore = score.score;
        lowestUsername = score.name;
      }
    });
    this.scoresMap.delete(lowestUsername);
  },

  updateScoreboard: function(player) {
    this.updated = false;
    if (player.username != "anonymous" && player.username != null && player.username != "") {
      if (parseInt(player.score, 10) > this.minScore() && !this.scoresMap.has(player.username)) {
        if (this.scores.length >= 5) {
          this.removeLowestScore();
        }
        var newScore = Score.create(player);
        this.scoresMap.set(player.username, newScore);
        this.setScoresFromMap();
      } else if (this.scoresMap.has(player.username)) {
        var scoreboardScore = this.scoresMap.get(player.username);
        if (player.score > scoreboardScore.score) {
          var newScore = Score.create(player);
          this.scoresMap.set(player.username, newScore);
          this.setScoresFromMap();
        }
      }
    }
  }
};

const Score = {
  create: function(player) {
    var score = Object.create(this);
    score.name = player.username;
    score.score = parseInt(player.score, 10);
    return score;
  }
}

const Lounge = {
  players: new Map(),
  furnitureList: new Array(),
  scoreboard: ScoreBoard.create(),

  create: function() {
    var lounge = Object.create(this);
    lounge.addFurniture();
    lounge.bullets = new Array();
    return lounge;
  },

  addFurniture: function() {
    var couch = Furniture.create("onlinelounge/assets/couch.png", 131, 192, true);
    couch.topy = couch.topy + 25;
    this.furnitureList.push(couch);
    var tv = Furniture.create("onlinelounge/assets/tv.png", 160, 0, true);
    this.furnitureList.push(tv);
    var memescreenl = Furniture.create("onlinelounge/assets/meme_screen.png", 32, 0, false);
    this.furnitureList.push(memescreenl);
    var plaquel = Furniture.create("onlinelounge/assets/plaque.png", 62, 95, false);
    this.furnitureList.push(plaquel);
    var memescreenr = Furniture.create("onlinelounge/assets/meme_screen.png", 384, 0, false);
    this.furnitureList.push(memescreenr);
    var plaquer = Furniture.create("onlinelounge/assets/plaque.png", 414, 95, false);
    this.furnitureList.push(plaquer);
    var dinner_table = Furniture.create("onlinelounge/assets/dinner_table.png", 98, 314, true);
    this.furnitureList.push(dinner_table);
    var coffee_table = Furniture.create("onlinelounge/assets/coffee_table.png", 192, 117, true);
    coffee_table.topy = coffee_table.topy + 15;
    this.furnitureList.push(coffee_table);
    var game_table = Furniture.create("onlinelounge/assets/game_table.png", 320, 351, true);
    this.furnitureList.push(game_table);
    var game_chairl = Furniture.create("onlinelounge/assets/game_chair.png", 287, 384, false);
    this.furnitureList.push(game_chairl);
    var game_chairr = Furniture.create("onlinelounge/assets/game_chair.png", 452, 383, false);
    this.furnitureList.push(game_chairr);
    var bean_bag = Furniture.create("onlinelounge/assets/bean_bag.png", 372, 132, false);
    this.furnitureList.push(bean_bag);
    var fridge = Furniture.create("onlinelounge/assets/fridge.png", 460, 213, true);
    this.furnitureList.push(fridge);
    var left_dinner_chairs = Furniture.create("onlinelounge/assets/left_dinner_chairs.png", 63, 306, false);
    this.furnitureList.push(left_dinner_chairs);
    var right_dinner_chairs = Furniture.create("onlinelounge/assets/right_dinner_chairs.png", 191, 306, false);
    this.furnitureList.push(right_dinner_chairs);
    var bottom_dinner_chair = Furniture.create("onlinelounge/assets/bottom_dinner_chair.png", 128, 481, false);
    this.furnitureList.push(bottom_dinner_chair);
    var bong = Bong.create(280, 117);
    this.bong = bong;
  },

  update_all_players: function(deltat) {
    this.players.forEach( function(player) {
      this.update_player(player, deltat);
    }.bind(this));
    if (this.players.size > 0) {
      io.sockets.emit('state', Array.from(this.players.values()));
    }
  },

  update_player: function(player, deltat) {
    player.score += deltat;
    if (Utility.getTimestamp() - player.reload_timestamp > RELOAD_INTERVAL) {
      player.bullets += parseInt(player.score/RELOAD_INTERVAL, 10);
      player.reload_timestamp = Utility.getTimestamp();
    }
    this.scoreboard.updateScoreboard(player);
    //console.log(this.scoreboard.scores);
    if (player.message != null) {
      if (Utility.getTimestamp() - player.message_timestamp > MESSAGE_DECAY) {
        var playerToUpdate = this.players.get(player.id);
        playerToUpdate.message = null;
      }
    }
  },

  update_all_bullets: function(deltat) {
    for(i=this.bullets.length-1; i >= 0; i--) {
      this.update_bullet(this.bullets[i], deltat);
      if (this.bullets[i].x < 0 || this.bullets[i].x > CANVAS_WIDTH || this.bullets[i].y < 0 || this.bullets[i].y > CANVAS_HEIGHT) {
        this.bullets.splice(i, 1);
      }
    }
    if (this.bullets.length > 0) {
      io.sockets.emit('bullets', this.bullets);
    }
  },

  update_bullet: function(bullet, deltat) {
    switch (bullet.direction) {
      case 0: //down
        bullet.y = bullet.y + bullet.speed*deltat;
        break;
      case 1: //right
        bullet.x = bullet.x + bullet.speed*deltat;
        break;
      case 2: //up
        bullet.y = bullet.y - bullet.speed*deltat;
        break;
      case 3: //left
        bullet.x = bullet.x - bullet.speed*deltat;
        break;
    }
  },

  checkBulletCollisions: function() {
    for(i=this.bullets.length-1; i >= 0; i--) {
      this.players.forEach( function(p) {
        var b = this.bullets[i];
        if (b != null) {
          if (p.id != b.shot_by) { 
            if (p.posx < b.x + BULLET_DIMENSION &&
                p.posx + PLAYER_DIMENSION > b.x &&
                p.posy + (2*PLAYER_DIMENSION/3) < b.y + BULLET_DIMENSION &&
                p.posy + PLAYER_DIMENSION > b.y) {
                var killer = this.players.get(b.shot_by);
                if (killer != null) {
                  killer.score+=p.score;
                  this.bullets.splice(i, 1);
                  this.players.delete(p.id);
                  console.log("player " + p.id + " shot by " + killer.id);
                  io.sockets.emit('state', Array.from(this.players.values()));
                  io.sockets.emit('player killed', { killed: p.id, killer: killer.username });
                  io.sockets.emit('bullets', this.bullets);
                  return;
                }
            }
          }
        }
      }.bind(this));
    }
  },
}

var lounge = Lounge.create();
var update_occurred = false;

function checkFurnitureCollisions(p) {
  var result = false;
  lounge.furnitureList.forEach(function(furniture){
    if (furniture.isBlocking) {
      if (p.posx < furniture.rightx &&
          p.posx + PLAYER_DIMENSION > furniture.leftx &&
          p.posy + (2*PLAYER_DIMENSION/3) < furniture.bottomy &&
          p.posy + PLAYER_DIMENSION > furniture.topy) {
          result = true;
      }
    }
  });
  return result;
};

function canMoveHere(posx, posy) {
  if ((posy > 0) && (posx < CANVAS_WIDTH - PLAYER_DIMENSION) && (posy < CANVAS_HEIGHT - PLAYER_DIMENSION) && (posx > 0 )) {
    return true;
  } else {
    return false;
  }
};

function animationFrame(player) {
  if (player.loop_i < player.loop.length - 1) {
    player.loop_i++;
  } else {
    player.loop_i = 0;
  }
};

function update_player(player, posx, posy, direction) {
  if (canMoveHere(posx, posy)) {
    player.posx = posx;
    player.posy = posy;
    player.direction = direction;
  }
}

io.on('connection', function(socket){
  if (lounge.players.size + 1 > LOUNGE_CAPACITY) {
    console.log("lounge full. closing connection");
    socket.emit('lounge full');
    socket.disconnect(true);
  }
  socket.on('new player', function(newPlayer) {
    newPlayer.id = socket.id;
    newPlayer.reload_timestamp = Utility.getTimestamp();
    lounge.players.set(newPlayer.id, newPlayer);
    console.log("new player: " + newPlayer.id);
    console.log("total players: " + lounge.players.size);
    io.sockets.emit('scoreboard update', lounge.scoreboard.scores);
    update_occurred = true;
  });
  socket.on('update player', function(keyArray) {
    var player;
    var newPos = null;
    if(keyArray[2]){ // up
      player = lounge.players.get(socket.id);
      if (player != null) {
        newPos = Player.create(player.username, player.posx, player.posy - player.speed, 2);
        player.direction = 2;
        animationFrame(player);
      }
    }
    if(keyArray[3]){ // down
      player = lounge.players.get(socket.id);
      if (player != null) {
        newPos = Player.create(player.username, player.posx, player.posy + player.speed, 0);
        player.direction = 0;
        animationFrame(player);
      }
    }
    if(keyArray[0]){ // left
      player = lounge.players.get(socket.id);
      if (player != null) {
        newPos = Player.create(player.username, player.posx - player.speed, player.posy, 3);
        player.direction = 3;
        animationFrame(player);
      }
    }
    if(keyArray[1]){ // right
      player = lounge.players.get(socket.id);
      if (player != null) {
        newPos = Player.create(player.username, player.posx + player.speed, player.posy, 1);
        player.direction = 1;
        animationFrame(player);
      }
    }
    if(newPos != null && !checkFurnitureCollisions(newPos)) {
      update_player(player, newPos.posx, newPos.posy, newPos.direction);
      update_occurred = true;
    }
  });
  socket.on('message', function(message) {
    var player = lounge.players.get(socket.id);
    if (player != null) {
      console.log(player.id + ": " + message);
      player.message = message;
      player.message_timestamp = Utility.getTimestamp();
      update_occurred = true;
    }
  });
  socket.on('holding gun', function(holding_gun) {
    var player = lounge.players.get(socket.id);
    if (player != null) {
      console.log(player.id + " gun: " + holding_gun);
      player.holding_gun = holding_gun;
      update_occurred = true;
    }
  });
  socket.on('shot gun', function() {
    var player = lounge.players.get(socket.id);
    if (player != null) {
      if (player.holding_gun && player.bullets > 0 && player.username != "anonymous" && player.username != null && player.username != "") {
        player.last_shot = Utility.getTimestamp();
        player.bullets--;
        player.score-=RELOAD_INTERVAL;
        var newBullet = Bullet.create(player.posx + PLAYER_DIMENSION/2, player.posy + PLAYER_DIMENSION/2, player.direction);
        newBullet.shot_by = player.id;
        lounge.bullets.push(newBullet);
      }
    }
  });
  socket.on('secret reload', function() {
    var player = lounge.players.get(socket.id);
    if (player != null) {
      player.bullets+=5;
    }
  });
  socket.on('holding item', function(holding_item) {
    var player = lounge.players.get(socket.id);
    if (player != null) {
      console.log(player.id + " item: " + holding_item);
      player.holding_item = holding_item;
      update_occurred = true;
    }
  });
  socket.on('bong hit', function(){
    var player = lounge.players.get(socket.id);
    if (player != null) {
      io.sockets.emit('bong hit', SmokePuff.create(player.posx, player.posy - PLAYER_DIMENSION/3));
    }
  });
  socket.on('disconnect', function(newPlayer) {
    lounge.players.delete(socket.id);
    console.log("player left. players: " + lounge.players.size);
    update_occurred = true;
  });
});

var curr_timestamp = Utility.getTimestamp();
var prev_timestamp;
setInterval(function() {
  prev_timestamp = curr_timestamp;
  curr_timestamp = Utility.getTimestamp();

  var deltat = curr_timestamp - prev_timestamp;
  lounge.checkBulletCollisions();
  lounge.update_all_players(deltat);
  lounge.update_all_bullets(deltat);

  if (lounge.scoreboard.updated) {
    io.sockets.emit('scoreboard update', lounge.scoreboard.scores);
  }
}, 1000/60);

module.exports = socketApi;
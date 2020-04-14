var socket_io = require('socket.io');
var sizeOf = require('image-size');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 512;
const PLAYER_DIMENSION = 32;
const PLAYER_SPEED = 6;
const LOUNGE_CAPACITY = 10;
const MESSAGE_DECAY = 30.0;
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
    return player;
  },
};

const Lounge = {
  players: new Map(),
  furnitureList: new Array(),

  create: function() {
    var lounge = Object.create(this);
    lounge.addFurniture();
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
  }
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
    lounge.players.set(newPlayer.id, newPlayer);
    console.log("new player: " + newPlayer.id);
    console.log("total players: " + lounge.players.size);
    update_occurred = true;
  });
  socket.on('update player', function(keyArray) {
    var player;
    var newPos = null;
    if(keyArray[2]){ // up
      player = lounge.players.get(socket.id);
      newPos = Player.create(player.username, player.posx, player.posy - player.speed, 2);
      player.direction = 2;
      animationFrame(player);
    }
    if(keyArray[3]){ // down
      player = lounge.players.get(socket.id);
      newPos = Player.create(player.username, player.posx, player.posy + player.speed, 0);
      player.direction = 0;
      animationFrame(player);
    }
    if(keyArray[0]){ // left
      player = lounge.players.get(socket.id);
      newPos = Player.create(player.username, player.posx - player.speed, player.posy, 3);
      player.direction = 3;
      animationFrame(player);
    }
    if(keyArray[1]){ // right
      player = lounge.players.get(socket.id);
      newPos = Player.create(player.username, player.posx + player.speed, player.posy, 1);
      player.direction = 1;
      animationFrame(player);
    }
    if(newPos != null && !checkFurnitureCollisions(newPos)) {
      update_player(player, newPos.posx, newPos.posy, newPos.direction);
      update_occurred = true;
    }
  });
  socket.on('message', function(message) {
    var player = lounge.players.get(socket.id);
    console.log(player.id + ": " + message);
    player.message = message;
    player.message_timestamp = Utility.getTimestamp();
    update_occurred = true;
  });
  socket.on('holding gun', function(holding_gun) {
    var player = lounge.players.get(socket.id);
    console.log(player.id + " gun: " + holding_gun);
    player.holding_gun = holding_gun;
    update_occurred = true;
  });
  socket.on('holding beer', function(holding_beer) {
    var player = lounge.players.get(socket.id);
    console.log(player.id + " beer: " + holding_beer);
    player.holding_beer = holding_beer;
    update_occurred = true;
  });
  socket.on('disconnect', function(newPlayer) {
    lounge.players.delete(socket.id);
    console.log("player left. players: " + lounge.players.size);
    update_occurred = true;
  });
});

setInterval(function() {
  var players = Array.from(lounge.players.values());
  if (update_occurred) {
    io.sockets.emit('state', players);
    update_occurred = false;
  }
  players.forEach(function(player) {
    if (player.message != null) {
      if (Utility.getTimestamp() - player.message_timestamp > MESSAGE_DECAY) {
        var playerToUpdate = lounge.players.get(player.id);
        playerToUpdate.message = null;
      }
    }
  });
}, 1000/60);

module.exports = socketApi;
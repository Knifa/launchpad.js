window.onload = function () {
  var c = document.getElementById('mainCanvas');
  var ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  var background = new Image();
  var bgGlow = new Image();
  var glowClip;
  var points;
  var w = window.innerWidth;
  var h = window.innerHeight;

  var player = {
    sprite: new Image(),
    locX : 200,
    locY: 197,
    eyes: {
      sprite: new Image(),
      locX: 200,
      locY: 197
    },
    isJumping: false
  }

  var priests = [];

  var priest = function() {
    this.sprite = new Image()
    this.sprite.src = "img/priest_Chanting.png";
    this.locX = Math.floor(Math.random()*180) - 20;
    this.locY = 197;
    this.isJumping = false;
  }

  var dias = {
    sprite: new Image(),
    locX: 208,
    locY: 197
  }

  var symbolGlow = function(img) {
    this.sprite = new Image();
    this.sprite.src = img;
  }

  var symbols = [];

  var symbolImgs = [
    "img/ritualChamber_symbols_1.png",
    "img/ritualChamber_symbols_2.png",
    "img/ritualChamber_symbols_3.png",
    "img/ritualChamber_symbols_4.png"];

  function init() {
    player.sprite.src = "img/player_Chanting.png";
    player.eyes.sprite.src = "img/player_eyes.png";
    dias.sprite.src = "img/dias.png";
    background.src = "img/ritualChamber.png";
    bgGlow.src = "img/ritualChamber_glow.png";
    glowClip = 0;
    points = 0;

    for (i = 0; i < 20; i++) {
      priests[i] = new priest();
    }

    for (i = 0; i < symbolImgs.length; i++) {
      symbols[i] = new symbolGlow(symbolImgs[i]);
    }

    ctx.scale(4,4);
    return setInterval(draw, 60);
    // window.requestAnimationFrame(draw);
  }


  function draw() {
    ctx.save();
    ctx.clearRect(0,0,w,h);

    ctx.drawImage(background, 0, 0);
    ctx.drawImage(player.sprite , player.locX, player.locY);
    ctx.drawImage(player.eyes.sprite, player.eyes.locX, player.eyes.locY);
    ctx.drawImage(dias.sprite, dias.locX, dias.locY);

    for (i = 0; i < priests.length; i++) {
      if (!priests[i].isJumping) {
        priests[i].locY -= 1;
        ctx.drawImage(priests[i].sprite, priests[i].locX, priests[i].locY);
        priests[i].isJumping = true;
      } else {
        priests[i].locY += 1;
        ctx.drawImage(priests[i].sprite, priests[i].locX, priests[i].locY);
        priests[i].isJumping = false;
      }
    }

    srcY = 246 - glowClip;
    srcH = 270 - srcY;
    ctx.drawImage(bgGlow, 0, srcY, 480, srcH, 0, srcY, 480, srcH);

    if (glowClip < 270) {
      glowClip += 4;
    } else if (glowClip >= 270) {
        if (points < 4) {
          glowClip = 0;
          points += 1;
        }
    }

    if (points > 0) {
      for (i = 0; i < points; i++) {
        ctx.drawImage(symbols[i].sprite, 0, 0);
      }
    }

    if (points >= 4) {
      background.src = "img/ritualChamber_gateOpen.png";
      player.sprite.src = "img/player_Staff.png";
    }

    // if (!player.isJumping) {
    //   player.locY -= 1;
    //   player.eyes.locY -= 1;
    //   ctx.drawImage(player.sprite , player.locX, player.locY);
    //   ctx.drawImage(player.eyes.sprite, player.eyes.locX, player.eyes.locY);
    //   player.isJumping = true;
    // } else {
    //   player.locY += 1;
    //   player.eyes.locY += 1;
    //   ctx.drawImage(player.sprite , player.locX, player.locY);
    //   ctx.drawImage(player.eyes.sprite, player.eyes.locX, player.eyes.locY);
    //   player.isJumping = false;
    // }

    // window.requestAnimationFrame(draw);
  }

  init()

}

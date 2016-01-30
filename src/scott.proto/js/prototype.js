window.onload = function () {
  var c = document.getElementById('mainCanvas');
  var ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  var background = new Image();
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
    this.locX = Math.floor(Math.random()*180);
    this.locY = 197;
    this.isJumping = false;
  }

  var dias = {
    sprite: new Image(),
    locX: 208,
    locY: 197
  }

  function init() {
    player.sprite.src = "img/player_Chanting.png";
    player.eyes.sprite.src = "img/player_eyes.png";
    dias.sprite.src = "img/dias.png";
    background.src = "img/ritualChamber.png";

    for (i = 0; i < 20; i++) {
      priests[i] = new priest();
    }

    ctx.scale(3,3);
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

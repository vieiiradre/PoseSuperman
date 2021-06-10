// Variáveis da Pose
let video;
let poseNet;
let pose;

let redePose;
let saidaRede = "";

// Variáveis do jogo
var score = [0, 'SCORE: ', 560, 15];
var explosao;
var meteoros = [];
var superman;
var meteoro;
var titulo = ['SUPERMAN METEORO', 70, 80];
var estado = 1;
var som;
var background;
var logoSuperman;
var ajudatext1 = ['O personagem se move para esquerda e direita', 50, 300];
var ajudatext2 = ['Pressione enter para iniciar o jogo', 50, 360];
var ajudatext3 = ['O movimento para cima destrói o meteoro', 50, 330];

var i = 0;

function preload() {
  background = loadImage("assets/skyline.jpg");
  logoSuperman = loadImage('assets/superman_logo.png');

  //som = loadSound('assets/supermanthemesong.mp3')

}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modeloCarregado);
  poseNet.on('pose', obterPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  redePose = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'modeloteste/model.json',
    metadata: 'modeloteste/model_meta.json',
    weights: 'modeloteste/model.weights.bin',
  };
  redePose.load(modelInfo, redeCarregada);

  background.resize(640, 480);
  image(background);

  logoSuperman.resize(150, 110);

  //som.setVolume(1);
  //som.play();

  superman = createSprite(400, 430);
  var supermanAnimation = superman.addAnimation("floating", "assets/superman1new.png", "assets/superman3new.png");
  superman.addAnimation("punching", "assets/punch1.png", "assets/punch6.png");

}
//______________________________________________//
function redeCarregada() {
  console.log('classificação da pose está pronta!');
  classificarPose();
}

function classificarPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    redePose.classify(inputs, obterResultado);
  } else {
    setTimeout(classificarPose, 100);
  }
}

function obterResultado(error, results) {
  console.log(results);
  console.log(results[0].label);
  
  if (results[0].confidence > 0.75) {
    saidaRede = results[0].label.toUpperCase();
  }
  console.log(results[0].confidence);
  classificarPose();
}


function obterPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}


function modeloCarregado() {
  console.log('poseNet pronto');
}



//______________________________________________//

function draw() {

  if (estado == 1) {
    // Imagens estado 1
    image(background);
    image(logoSuperman, 240, 120); //superman logo

    // Ajuda textual
    fill(255, 255, 255);
    strokeWeight(2);
    textSize(25);
    stroke('#0f1f3d');
    text(ajudatext1[0], ajudatext1[1], ajudatext1[2]);
    text(ajudatext3[0], ajudatext3[1], ajudatext3[2]);
    text(ajudatext2[0], ajudatext2[1], ajudatext2[2]);
    

    drawSprites()

    //Título estado 1
    strokeWeight(3);
    stroke('#ff3300');
    fill(0);
    textSize(45);
    text(titulo[0], titulo[1], titulo[2]);

    borders();
    movement();


  }
  if (estado == 2) {

    //background estado 2
    image(background);
    drawSprites();
    borders();
    movement();

    //criando o meteoro e sua velicidade
    for (; i < 5; i++) {
      meteoro = createSprite(random(0, width), 0);
      var meteoroAnimation = meteoro.addAnimation("falling", "assets/meteor1.png", "assets/meteor8.png");
      meteoro.velocity.y = (random(1, 3))
      meteoros.push(meteoro)

    }
    //Posição do meteoro
    for (let j = 0; j < meteoros.length; j++) {

      if (meteoros[j].position.y > 675) {
        meteoros[j].position.x = random(0, width);
        meteoros[j].position.y = -50;

      }
    //Meteoro-Superman colisão & score
      if (meteoros[j].collide(superman) && keyIsDown(UP_ARROW)) {
      	explosao = createSprite(meteoros[j].position.x, meteoros[j].position.y);
  		var explosaoAnimation = explosao.addAnimation("explode", "assets/exp1.png", "assets/exp5.png");
        meteoros[j].position.x = random(0, width);
        meteoros[j].position.y = -50; 
        explosao.life = 20; 
        if (explosao.life === 20) {
        	score[0] += 1;
        }    
      }
    }
  text(score[1]+ score[0], score[2], score[3]);
 } 	  
}

function keyPressed() {
  if (estado == 1 && keyCode === ENTER) {
    estado = 2;
  }
}
//Funções de movimento
function movement() {
  if (keyIsDown(LEFT_ARROW)) {
    superman.changeAnimation("floating");
    superman.mirrorX(-1);
    superman.position.x -= 10;
  } else if (keyIsDown(RIGHT_ARROW)) {
    superman.changeAnimation("floating");
    superman.mirrorX(1);
    superman.position.x += 10;
  }
  if (keyIsDown(UP_ARROW)) {
    superman.changeAnimation("punching");
  } else {
    superman.changeAnimation("floating");
  }

}
//borders function
function borders() {
  if (superman.position.x < 0) {
    superman.changeAnimation("floating");
    superman.mirrorX(-1);
    superman.position.x = 600;
  }

  if (superman.position.x > width) {
    superman.changeAnimation("floating");
    superman.mirrorX(1);
    superman.position.x = 0;
  }
}

var programCanvas = {
  canvas: document.getElementById("programCanvas"),
  width: 800,
  height: 450,
  frameRate: 120, // Recommends 120, above can cause significant delay
  
  init: function(){
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
}

var programCtx = programCanvas.canvas.getContext("2d");
programCanvas.init();

var objects = []; // Stores all game objects (boxes)
var forces = []; // Stores all game forces

class Box{
  
  constructor(m=1, w=30, h=30, c="black", x=0, y=0, vx=0, vy=0){
    objects.push(this);
    this.mass = 1;
    this.width = w;
    this.height = h;
    this.color = c;
    this.pos = [x, y]; // Unit: px/s
    this.vel = [vx, vy];
    this.accel = [0,0];
    this.force = [0,0]; // This variable is declared so that we can calculate the acceleration of a given object, which is dependent on the sum of forces and not respective forces.
  }

  updateVel(){
    // V=at => \Delta V = a * \Delta t
    this.vel[0] += this.accel[0] / programCanvas.frameRate; // vx
    this.vel[1] += this.accel[1] / programCanvas.frameRate; // vy
  }

  updatePos(){
    // X = Vt => \Delta X = V * \Delta t
    this.pos[0] += this.vel[0] / programCanvas.frameRate // x
    this.pos[1] += this.vel[1] / programCanvas.frameRate // y
  }

  resetForce(){
    // Should be called every frame for recalculation
    this.force = [0,0];
  }

}

class Force{
  
  constructor(exerter=null, receiver, fx, fy){
    forces.push(this);
    this.exerter = exerter;
    this.receiver = receiver;
    this.fx = fx; // Force along the x axis
    this.fy = fy // Force along the y axis
  }

  exert(){
    this.receiver.force[0]+=this.fx;
    this.receiver.force[1]+=this.fy;
  }
}

function updateAllMotion(){
  // SHM.accel[0] = 400-SHM.pos[0];
  for (let object of objects) {
    object.updateVel();
    object.updatePos();
    // object.accel[0] = 400-object.pos[0];
  }
}

function drawAllObjects(){
  for (let object of objects){
    programCtx.fillStyle = object.color;
    programCtx.fillRect(object.pos[0], object.pos[1], object.width, object.height);
  }
}

function exertAllForces(){
  SHMF = new Force(null, box1, 400-box1.pos[0], 0);
  for (let force of forces){
    force.exert();
  }
  removeForce(SHMF);
}

function calcAllAccel() {
  for (let object of objects){
    // F=ma => a = F/m
    object.accel[0] = object.force[0] / object.mass;
    object.accel[1] = object.force[1] / object.mass;
  }
}

function resetAllForces(){
  for (let object of objects){
    object.resetForce();
  }
}

function removeForce(forceObj){
  let index = forces.indexOf(forceObj);
  if (index>-1){
    forces.splice(index,1);
  }
  // This is to prevent indexOf() returning -1, producing unwanted result on splice()
}

function updateFrame(){
  programCtx.clearRect(0,0,programCanvas.width, programCanvas.height); // Clears canvas
  resetAllForces();
  exertAllForces();
  calcAllAccel();
  updateAllMotion();
  drawAllObjects();
}

box1 = new Box(1,30,30,"black",10,10,0,0);

setInterval(updateFrame, 1000/programCanvas.frameRate);

f1 = new Force(null, box1, 10000, 0);
f2 = new Force(null, box1, -10000, 0);
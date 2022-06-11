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
    this.mass = m;
    this.width = w;
    this.height = h;
    this.color = c;
    this.pos = [x, y]; // Unit: px/s
    this.vel = [vx, vy];
    this.accel = [0,0];
    this.force = [0,0]; // This variable is declared so that we can calculate the acceleration of a given object, which is dependent on the sum of forces and not respective forces.
  }

  getVertices(){
    // Returns array of 4 vertex coordinates, in standard quadrant order
    // Lower is larger
    let upperRight = [this.pos[0]+this.width, this.pos[1]];
    let upperLeft = [this.pos[0], this.pos[1]];
    let lowerLeft = [this.pos[0], this.pos[1]+this.height];
    let lowerRight = [this.pos[0]+this.width, this.pos[1]+this.height];
    return [upperRight, upperLeft, lowerLeft, lowerRight];
  }
  updateVel(){
    // V=at => \Delta V = a * \Delta t
    this.vel[0] += this.accel[0] / programCanvas.frameRate; // vx
    this.vel[1] += this.accel[1] / programCanvas.frameRate; // vy
  }

  updatePos(){
    // X = Vt => \Delta X = V * \Delta t
    this.pos[0] += this.vel[0] / programCanvas.frameRate; // x
    this.pos[1] += this.vel[1] / programCanvas.frameRate; // y
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
    this.fy = fy; // Force along the y axis
  }

  exert(){
    this.receiver.force[0]+=this.fx;
    this.receiver.force[1]+=this.fy;
  }
}

function findExtremumXY(object){
  let vertices = object.getVertices();
  let L = vertices.length; // Be general here
  let maxX=vertices[0][0], minX=vertices[0][0], maxY=vertices[0][1], minY=vertices[0][1];
  for (let i=1; i<L; i++){ // Update
    if (vertices[i][0]>maxX){maxX = vertices[i][0];}
    else if (vertices[i][0]<minX){minX = vertices[i][0];}
    if (vertices[i][1]>maxY){maxY = vertices[i][1];}
    else if (vertices[i][1]<minY){minY = vertices[i][1];}
  }
  return [maxX, minX, maxY, minY];
}

function between(a,b,c){
  // Treat the commas as <= or >=
  let x = Math.min(a,c); 
  let y = Math.max(a,c);
  return ((b>=x)&&(b<=y));
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
  // SHMF = new Force(null, box1, 400-box1.pos[0], 0);
  for (let force of forces){
    force.exert();
  }
  // removeForce(SHMF);
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

function applyAllColl(){
  // Calculates and applies all collisions
  // We'll assume that every collision is perfect elastic. The velocity can be given with formulas.
  // We'll also assume that all objects are (maybe not upright) rectangles, so that we can check if a collision occured simply by checking the verticies.

  L = objects.length;
  
    // Object Collision: object-object
  for (let i=0; i<L; i++){
    let obj1 = objects[i];
    let extre1 = findExtremumXY(obj1);
    for (let j=i+1; j<L; j++){
      let obj2 = objects[j];
      let extre2 = findExtremumXY(obj2);

      // If coll(X in AND Y in) => apply formula
      // 1 in 2 or 2 in 1
      // maxX, minX, maxY, minY
      if ( (between(extre1[1], extre2[0], extre1[0])||between(extre1[1], extre2[1], extre1[0])) && (between(extre1[3], extre2[2], extre1[2])||between(extre1[3], extre2[3], extre1[2])) ){
        // Collision Occur
        //console.log("COLL: ", obj1, obj2);

        //Apply formula
        let coefficient = 1/(obj1.mass+obj2.mass);
        let vels = [obj1.vel[0], obj1.vel[1], obj2.vel[0], obj2.vel[1]];
        
        obj1.vel[0] = coefficient*(vels[0]*(obj1.mass-obj2.mass)+vels[2]*(2*obj2.mass));
        obj1.vel[1] = coefficient*(vels[1]*(obj1.mass-obj2.mass)+vels[3]*(2*obj2.mass));
        obj2.vel[0] = coefficient*(vels[2]*(obj2.mass-obj1.mass)+vels[0]*(2*obj1.mass));
        obj2.vel[1] = coefficient*(vels[3]*(obj2.mass-obj1.mass)+vels[1]*(2*obj1.mass));
        
      }

      
        //console.log(extre1, extre2, between(extre1[1], extre2[0], extre1[0]), between(extre1[1], extre2[1], extre1[0]), between(extre1[3], extre2[2], extre1[2]), between(extre1[3], extre2[3], extre1[2]));
    }
  }
  
  // Wall Collision: object-wall
  for (let object of objects){
    // Check collision: right, top, left, bottom
    let extre = findExtremumXY(object); // maxX, minX, maxY, minY
    if (extre[0]>=programCanvas.width || extre[1]<=0){
      object.vel[0] = -object.vel[0];      
      // console.log("WALL COLL"+object);
    }
    if (extre[2]>=programCanvas.height || extre[3]<=0){
      object.vel[1] = -object.vel[1];     
      // console.log("WALL COLL"+object);
    }
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
  applyAllColl();
  exertAllForces();
  calcAllAccel();
  updateAllMotion();
  drawAllObjects();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Testing box
// var b1=new Box(1, 30, 30, "blue", 100, 100, 100, 0);

setInterval(updateFrame, 1000/programCanvas.frameRate);

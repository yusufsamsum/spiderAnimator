
/**
 * A spider animation program developed by 
 *
 * Ahmet Atahan Mutlu 21604085
 * Yusuf Samsum 21501651
 *
 * The user can perform various actions like moving each leg of the spider
 * changing the spider's location. Then by adding each frame with add frame 
 * they can generate a animation by clicking play.
 *
**/ 

var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;
var previous = 0;
var instanceMatrix;

var index = 0;
var cubeIndex = 0;
var vNormal;
var frameList = "";
var frameContent = "";
var block = false;
var callAnim = true;
var smooth = 30;
var selectedFrame = 0;

var keyFrame = 0;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalsArray = [];
var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

//----------Shading Variables-----------------------
// Reference shadedSphere.js provided by http://www.cs.bilkent.edu.tr/~gudukbay/cs465/

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 0.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

//----------------------------------------------------

var turned = false;
var moveX = 0;
var previousY = 0;
var tick = 240;


var near = -1;
var far = 1;
var radius = 1.0;
var thetaP  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;


//----------------Spider Body Part Angles-----------------------
var torsoId 			= 1;
var headId 				= 0;
var leftFrontUpper 		= 2;
var leftFrontMiddle 	= 3;
var leftFrontLower 		= 4;
var leftMiddle1Upper 	= 5;
var leftMiddle1Middle 	= 6;
var leftMiddle1Lower 	= 7;
var leftMiddle2Upper 	= 8;
var leftMiddle2Middle 	= 9;
var leftMiddle2Lower 	= 10;
var leftBehindUpper		= 11;
var leftBehindMiddle	= 12;
var leftBehindLower		= 13;
var rightFrontUpper		= 14;
var rightFrontMiddle	= 15;
var rightFrontLower		= 16;
var rightMiddle1Upper	= 17;
var rightMiddle1Middle	= 18;
var rightMiddle1Lower	= 19;
var rightMiddle2Upper	= 20;
var rightMiddle2Middle	= 21;
var rightMiddle2Lower	= 22;
var rightBehindUpper	= 23;
var rightBehindMiddle	= 24;
var rightBehindLower	= 25;

var headIdX = 26;
var headIdY = 27;
var headIdZ = 28;

var leftFrontX = 29;
var leftMiddle1X = 30;
var leftMiddle2X = 31;
var leftBehindX = 32;

var rightFrontX = 33;
var rightMiddle1X = 34;
var rightMiddle2X = 35;
var rightBehindX = 36;

var translateXId = 37;
var translateYId = 38;
var translateZId = 39;

//----------------Spider Body Part Attributes-----------------------
var TORSO_HEIGHT = 1.5;
var TORSO_WIDTH = 1.2;
var HEAD_HEIGHT = 2.5;
var HEAD_WIDTH = 2.5;
var UPPERARM_LENGTH = 4.0;
var MIDDLEARM_LENGTH = 4.0;
var LOWERARM_LENGTH = 3.0;
var ARM_WIDTH = 0.2;

var numNodes = 40;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 
				56, 105, 18,
				80, 105, 18, 
				110, 105, 18,
				150, 105, 18,
				-56, 105, 18,
				-80, 105, 18, 
				-110, 105, 18, 
				-150, 105, 18,
				150,0,-110,
				-69,-45,-69,-45,
				-45,-69,-45,-69,
				0,0,0
				];


var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];


var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
    

var orthoP = 10;

//-----------------------------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//-----------------------------------------------------------------
// Initialization of the spider using tree traverse method
// Reference figure.js & robotArm.js provided by http://www.cs.bilkent.edu.tr/~gudukbay/cs465/

function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {
   
    switch(Id) {
		case headIdX:
		case headIdY:
		case headIdZ:
		case headId:
		
		m = rotate(theta[headIdX], 1, 0, 0 );
		m = mult(m, rotate(theta[headIdY], 0, 1, 0 ));
		m = mult(m, rotate(theta[headIdZ], 0, 0, 1 ));
		m= mult(m, translate(theta[translateXId],theta[translateYId],theta[translateZId]));
		figure[ headId ] = createNode( m, headFcn, null, torsoId );
		break;
		
		case torsoId:
		
		m = translate(0.0, TORSO_HEIGHT+(1.0*HEAD_HEIGHT), -HEAD_WIDTH*(0.5));
		m = mult(m, rotate(theta[torsoId], 0, 1, 0));
		m = mult(m, translate(0.0, -0.5*HEAD_HEIGHT, 0.0));
		figure[torsoId] = createNode( m, torsoFcn, leftFrontUpper, null );
		break;
		
		case leftFrontX:
		case leftFrontUpper:
		m = translate( -(TORSO_WIDTH*(0.6)), 0.5 * TORSO_HEIGHT, TORSO_WIDTH*(0.6));
		m = mult(m, rotate(theta[leftFrontUpper], 0, 0, 1));
		m = mult(m, rotate(theta[leftFrontX], 1, 0, 0)); 
		figure[ leftFrontUpper ] = createNode( m, leftFrontUpperFcn, leftMiddle1Upper, leftFrontMiddle );
		break;
		
		case leftFrontMiddle:
		m = translate(0.0, UPPERARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[leftFrontMiddle], 1, 0, 0));
		figure[leftFrontMiddle] = createNode( m, leftFrontMiddleFcn, null, leftFrontLower );
		break;
		
		case leftFrontLower:
		m = translate(0.0, MIDDLEARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[leftFrontLower], 1, 0, 0));
		figure[leftFrontLower] = createNode( m, leftFrontLowerFcn, null, null );
		break;
		
		case leftMiddle1X:
		case leftMiddle1Upper:
		m = translate(-(TORSO_WIDTH*(0.7)), 0.3*TORSO_HEIGHT, TORSO_WIDTH*(0.6));
		m = mult(m, rotate(theta[leftMiddle1Upper], 0, 0, 1));
		m = mult(m, rotate(theta[leftMiddle1X], 1, 0, 0));
		figure[leftMiddle1Upper] = createNode( m, leftMiddle1UpperFcn, leftMiddle2Upper, leftMiddle1Middle );
		break;
		
		case leftMiddle1Middle:
		m = translate(0.0, UPPERARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[leftMiddle1Middle], 1, 0, 0));
		figure[leftMiddle1Middle] = createNode( m, leftMiddle1MiddleFcn, null, leftMiddle1Lower );
		break;
		
		case leftMiddle1Lower:
		m = translate(0.0, MIDDLEARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[leftMiddle1Lower], 1, 0, 0));
		figure[leftMiddle1Lower] = createNode( m, leftMiddle1LowerFcn, null, null );
		break;
		
		case leftMiddle2X:
		case leftMiddle2Upper:
		m = translate(-(TORSO_WIDTH*(0.70)), 0.10*TORSO_HEIGHT, TORSO_WIDTH*(0.6));
		m = mult(m, rotate(theta[leftMiddle2Upper], 0, 0, 1));
		m = mult(m, rotate(theta[leftMiddle2X], 1, 0, 0));
		figure[leftMiddle2Upper] = createNode( m, leftMiddle2UpperFcn, leftBehindUpper, leftMiddle2Middle );
		break;
		
		case leftMiddle2Middle:
		m = translate(0.0, UPPERARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[leftMiddle2Middle], 1, 0, 0));
		figure[leftMiddle2Middle] = createNode( m, leftMiddle2MiddleFcn, null, leftMiddle2Lower );
		break;
		
		case leftMiddle2Lower:
		m = translate(0.0, MIDDLEARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[leftMiddle2Lower], 1, 0, 0));
		figure[leftMiddle2Lower] = createNode( m, leftMiddle2LowerFcn, null, null );
		break;
		
		case leftBehindX:
		case leftBehindUpper:
		m = translate(-(TORSO_WIDTH/2), -0.1*TORSO_HEIGHT, TORSO_WIDTH*(0.6));
		m = mult(m, rotate(theta[leftBehindUpper], 0, 0, 1));
		m = mult(m, rotate(theta[leftBehindX], 1, 0, 0));
		figure[leftBehindUpper] = createNode( m, leftBehindUpperFcn, rightFrontUpper, leftBehindMiddle );
		break;
		
		case leftBehindMiddle:
		m = translate(0.0, UPPERARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[leftBehindMiddle], 1, 0, 0));
		figure[leftBehindMiddle] = createNode( m, leftBehindMiddleFcn, null, leftBehindLower );
		break;
		
		case leftBehindLower:
		m = translate(0.0, MIDDLEARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[leftBehindLower], 1, 0, 0));
		figure[leftBehindLower] = createNode( m, leftBehindLowerFcn, null, null );
		break;
		
		case rightFrontX:
		case rightFrontUpper:
		m = translate(TORSO_WIDTH*(0.6), 0.5*TORSO_HEIGHT, TORSO_WIDTH*(0.6));
		m = mult(m, rotate(theta[rightFrontUpper], 0, 0, 1));
		m = mult(m, rotate(theta[rightFrontX], 1, 0, 0));
		figure[rightFrontUpper] = createNode( m, rightFrontUpperFcn, rightMiddle1Upper, rightFrontMiddle );
		break;
		
		case rightFrontMiddle:
		m = translate(0.0, UPPERARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[rightFrontMiddle], 1, 0, 0));
		figure[rightFrontMiddle] = createNode( m, rightFrontMiddleFcn, null, rightFrontLower );
		break;
		
		case rightFrontLower:
		m = translate(0.0, MIDDLEARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[rightFrontLower], 1, 0, 0));
		figure[rightFrontLower] = createNode( m, rightFrontLowerFcn, null, null );
		break;
		
		case rightMiddle1X:
		case rightMiddle1Upper:
		m = translate(TORSO_WIDTH*(0.7), 0.3*TORSO_HEIGHT, TORSO_WIDTH*(0.6));
		m = mult(m, rotate(theta[rightMiddle1Upper], 0, 0, 1));
		m = mult(m, rotate(theta[rightMiddle1X], 1, 0, 0));
		figure[rightMiddle1Upper] = createNode( m, rightMiddle1UpperFcn, rightMiddle2Upper, rightMiddle1Middle );
		break;
		
		case rightMiddle1Middle:
		m = translate(0.0, UPPERARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[rightMiddle1Middle], 1, 0, 0));
		figure[rightMiddle1Middle] = createNode( m, rightMiddle1MiddleFcn, null, rightMiddle1Lower );
		break;
		
		case rightMiddle1Lower:
		m = translate(0.0, MIDDLEARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[rightMiddle1Lower], 1, 0, 0));
		figure[rightMiddle1Lower] = createNode( m, rightMiddle1LowerFcn, null, null );
		break;
		
		case rightMiddle2X:
		case rightMiddle2Upper:
		m = translate(TORSO_WIDTH*(0.7), 0.1*TORSO_HEIGHT, TORSO_WIDTH*(0.6));
		m = mult(m, rotate(theta[rightMiddle2Upper], 0, 0, 1));
		m = mult(m, rotate(theta[rightMiddle2X], 1, 0, 0));
		figure[rightMiddle2Upper] = createNode( m, rightMiddle2UpperFcn, rightBehindUpper, rightMiddle2Middle );
		break;
		
		case rightMiddle2Middle:
		m = translate(0.0, UPPERARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[rightMiddle2Middle], 1, 0, 0));
		figure[rightMiddle2Middle] = createNode( m, rightMiddle2MiddleFcn, null, rightMiddle2Lower );
		break;
		
		case rightMiddle2Lower:
		m = translate(0.0, MIDDLEARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[rightMiddle2Lower], 1, 0, 0));
		figure[rightMiddle2Lower] = createNode( m, rightMiddle2LowerFcn, null, null );
		break;
		
		case rightBehindX:
		case rightBehindUpper:
		m = translate(TORSO_WIDTH/2, -0.1*TORSO_HEIGHT, TORSO_WIDTH*(0.6));
		m = mult(m, rotate(theta[rightBehindUpper], 0, 0, 1));
		m = mult(m, rotate(theta[rightBehindX], 1, 0, 0));
		figure[rightBehindUpper] = createNode( m, rightBehindUpperFcn, null, rightBehindMiddle );
		break;
		
		case rightBehindMiddle:
		m = translate(0.0, UPPERARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[rightBehindMiddle], 1, 0, 0));
		figure[rightBehindMiddle] = createNode( m, rightBehindMiddleFcn, null, rightBehindLower );
		break;
		
		case rightBehindLower:
		m = translate(0.0, MIDDLEARM_LENGTH, 0.0);
		m = mult(m, rotate(theta[rightBehindLower], 1, 0, 0));
		figure[rightBehindLower] = createNode( m, rightBehindLowerFcn, null, null );
		break;
	}
}
//Functions to draw spider's body parts
// Reference figure.js provided by http://www.cs.bilkent.edu.tr/~gudukbay/cs465/
function headFcn() {
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*TORSO_HEIGHT, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( TORSO_WIDTH, TORSO_HEIGHT, TORSO_WIDTH));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	for( var i=cubeIndex; i<cubeIndex+index; i+=3) 
        gl.drawArrays( gl.TRIANGLE_FAN, i, 3 );
}

function torsoFcn() {
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * HEAD_HEIGHT, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4( HEAD_WIDTH, HEAD_HEIGHT, HEAD_WIDTH) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	for( var i=cubeIndex; i< cubeIndex + index; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );
}
function leftFrontUpperFcn(){
	gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	upperFcn();
}

function leftFrontMiddleFcn() {
	middleFcn();
}

function leftFrontLowerFcn() {
	lowerFcn();
}

function leftMiddle1UpperFcn() {
	upperFcn();
}

function leftMiddle1MiddleFcn(){
	middleFcn();
}

function leftMiddle1LowerFcn() {
	lowerFcn();
}

function leftMiddle2UpperFcn() {
	upperFcn();
}

function leftMiddle2MiddleFcn(){
	middleFcn();
}

function leftMiddle2LowerFcn(){
	lowerFcn();
}

function leftBehindUpperFcn(){
	upperFcn();
}

function leftBehindMiddleFcn(){
	middleFcn();
}

function leftBehindLowerFcn(){
	lowerFcn();
}

function rightFrontUpperFcn() {
	upperFcn();
}

function rightFrontMiddleFcn() {
	middleFcn();
}

function rightFrontLowerFcn() {
	lowerFcn();
}

function rightMiddle1UpperFcn() {
	upperFcn();
}

function rightMiddle1MiddleFcn(){
	middleFcn();
}

function rightMiddle1LowerFcn() {
	lowerFcn();
}

function rightMiddle2UpperFcn() {
	upperFcn();
}

function rightMiddle2MiddleFcn() {
	middleFcn();
}

function rightMiddle2LowerFcn() {
	lowerFcn();
}

function rightBehindUpperFcn() {
	upperFcn();
}

function rightBehindMiddleFcn() {
	middleFcn();
}

function rightBehindLowerFcn() {
	lowerFcn();
}

function upperFcn()
{
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * UPPERARM_LENGTH, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(ARM_WIDTH, UPPERARM_LENGTH, ARM_WIDTH) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, 36);
	for(var i = 0 ; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
}

function middleFcn() {
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * MIDDLEARM_LENGTH, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(ARM_WIDTH, MIDDLEARM_LENGTH, ARM_WIDTH) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, 36);
	for(var i = 0 ; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
}

function lowerFcn() {
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * LOWERARM_LENGTH, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(ARM_WIDTH, LOWERARM_LENGTH, ARM_WIDTH) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, 36);
	for(var i = 0 ; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}


function traverse(Id) {
   
   if(Id == null) return; 
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child); 
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}

//-------------------------Functions to generate a cube---------------------------

function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);  
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);      
     pointsArray.push(vertices[d]);
     normalsArray.push(normal); 
		cubeIndex += 4;
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//-------------------------------------------------------------------------------

//----------------------------------Inıt Function--------------------------------
//Reference: figure.js provided by http://www.cs.bilkent.edu.tr/~gudukbay/cs465/
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    
    gl.useProgram( program);

    instanceMatrix = mat4();
	
	gl.enable( gl.DEPTH_TEST );
    
    //projectionMatrix = ortho(-orthoP,orthoP,-orthoP, orthoP,-orthoP,orthoP);
    //modelViewMatrix = mat4();

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    
     gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );  
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);

        
    //gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    //gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );

	cube();
	tetrahedron(va, vb, vc, vd, 5);
    	
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    vNormal = gl.getAttribLocation( program, "vNormal" );
    //gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( vNormal );

        
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc =  gl.getUniformLocation( program, "projectionMatrix");
     var m = mat4();
    for(i=0; i<numNodes; i++) initNodes(i);
    document.onkeydown = keyPressed;

    render();

}

//-------------------------------------------------------------------  
/**
 * Functions used to generate a sphere
 * References:
 *	ShadedSphere1.js provided by http://www.cs.bilkent.edu.tr/~gudukbay/cs465/	
**/
function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal);

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);
     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);
     index += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

//-------------------------------------------------------------------------------

/**
 * A function that simplifies the complex structure of a spiders' movement
 * it increases and decreases different angles at the same time to give a 
 * more realistic movement
 *
**/ 
function move() {
		 initNodes(headId);

        theta[rightFrontUpper] = +event.srcElement.value - 56;
        initNodes(rightFrontUpper);
        theta[rightMiddle2Upper] = +event.srcElement.value -110;
        initNodes(rightMiddle2Upper);
        theta[rightMiddle1Upper] = -event.srcElement.value - 80;
        initNodes(rightMiddle1Upper);
        theta[rightBehindUpper] = -event.srcElement.value - 150;
        initNodes(rightBehindUpper);
        
        if(!turned){
        	if(event.srcElement.value <= 0){
        		theta[rightBehindX] = -event.srcElement.value*2 -69;
        		initNodes(rightBehindX);
        		theta[rightMiddle1X] = -event.srcElement.value*2 -69;
        		initNodes(rightMiddle1X);
        	
        		theta[leftMiddle2X] = -event.srcElement.value*2 -69;
        		initNodes(leftMiddle2X);
        		theta[leftFrontX] = -event.srcElement.value*2 -69;
        		initNodes(leftFrontX);
        	}
        	if(event.srcElement.value > 0){
       		
        		theta[leftMiddle2X] = event.srcElement.value*2 -69;
        		initNodes(leftMiddle2X);
        		theta[leftFrontX] = event.srcElement.value*2 -69;
        		initNodes(leftFrontX);
        	
        		theta[rightBehindX] = event.srcElement.value*2 -69;
        		initNodes(rightBehindX);
        		theta[rightMiddle1X] = event.srcElement.value*2 -69;
        		initNodes(rightMiddle1X);  	
        	}
    	}else{
    		if(event.srcElement.value <= 0 ){
    			theta[rightMiddle2X] = -event.srcElement.value*2 -69;
        		initNodes(rightMiddle2X);
        		theta[rightFrontX] = -event.srcElement.value*2 -69;
        		initNodes(rightFrontX);
        		theta[leftBehindX] = -event.srcElement.value*2 -69;
        		initNodes(leftBehindX);
        		theta[leftMiddle1X] = -event.srcElement.value*2 -69;
        		initNodes(leftMiddle1X);
    		}
    		if(event.srcElement.value > 0 ){
    			theta[rightMiddle2X] = event.srcElement.value*2 -69;
        		initNodes(rightMiddle2X);
        		theta[rightFrontX] = event.srcElement.value*2 -69;
        		initNodes(rightFrontX);
        		theta[leftBehindX] = event.srcElement.value*2 -69;
      		  	initNodes(leftBehindX);
       			theta[leftMiddle1X] = event.srcElement.value*2 -69;
        		initNodes(leftMiddle1X);
        	
    		}

    	}
        theta[rightFrontMiddle] = -event.srcElement.value*3/2 + 105;
        initNodes(rightFrontMiddle);

        theta[rightBehindMiddle] = -event.srcElement.value*2 + 105;
        initNodes(rightBehindMiddle);

        theta[leftFrontUpper] = +event.srcElement.value + 56;
         initNodes(leftFrontUpper);
        theta[leftMiddle2Upper] = +event.srcElement.value + 105;
        initNodes(leftMiddle2Upper);
        theta[leftMiddle1Upper] = -event.srcElement.value-2 + 80;
        initNodes(leftMiddle1Upper);
        theta[leftBehindUpper] = -event.srcElement.value + 150;
        initNodes(leftBehindUpper);

        theta[leftFrontMiddle] = +event.srcElement.value*3/2 + 105;
        initNodes(leftFrontMiddle);

        theta[leftBehindMiddle] = +event.srcElement.value*2 + 105;
        initNodes(leftBehindMiddle);

        theta[headId] = event.srcElement.value/5;
        initNodes(headId);

        if(event.srcElement.value == 12){
         	turned = true;

        }
        if(event.srcElement.value == -12){
         	turned = false;
        }
        if(event.srcElement.value>0){
        	theta[translateYId] -= event.srcElement.value/50;
        	previousY = parseFloat(theta[translateYId]);
	 		initNodes(headId);

	 	}else{
	 		theta[translateYId] += event.srcElement.value/50;
	 		previousY = parseFloat(theta[translateYId]);
	 		initNodes(headId);
	 	}

    }


//------------------Left Front Leg Movements-------------------
function moveLFU_X(){
	theta[leftBehindUpper] = +event.srcElement.value + 150;
    initNodes(leftBehindUpper);
}
function moveLFU_Y(){
	theta[leftBehindX] = +event.srcElement.value - 45;
    initNodes(leftBehindX);
}
function moveLFM(){
	theta[leftBehindMiddle] = +event.srcElement.value + 105;
    initNodes(leftBehindMiddle);
}
function moveLFL(){
	theta[leftBehindLower] = +event.srcElement.value + 18;
    initNodes(leftBehindLower);
}

//------------------Right Front Leg Movements-------------------
function moveRFU_X(){
	theta[rightBehindUpper] = +event.srcElement.value - 150;
    initNodes(rightBehindUpper);
}
function moveRFU_Y(){
	theta[rightBehindX] = +event.srcElement.value - 69;
    initNodes(rightBehindX);
}
function moveRFM(){
	theta[rightBehindMiddle] = +event.srcElement.value + 105;
    initNodes(rightBehindMiddle);
}
function moveRFL(){
	theta[rightBehindLower] = +event.srcElement.value + 18;
    initNodes(rightBehindLower);
}


//------------------Right Middle1 Leg Movements-------------------
function moveRM1U_X(){
	theta[rightMiddle1Upper] = +event.srcElement.value - 80;
    initNodes(rightMiddle1Upper);
}
function moveRM1U_Y(){
	theta[rightMiddle1X] = +event.srcElement.value - 69;
    initNodes(rightMiddle1X);
}
function moveRM1M(){
	theta[rightMiddle1Middle] = +event.srcElement.value + 105;
    initNodes(rightMiddle1Middle);
}
function moveRM1L(){
	theta[rightMiddle1Lower] = +event.srcElement.value + 18;
    initNodes(rightMiddle1Lower);
}

//------------------Left Middle1 Leg Movements-------------------
function moveLM1U_X(){
	theta[leftMiddle1Upper] = +event.srcElement.value + 80;
    initNodes(leftMiddle1Upper);
}
function moveLM1U_Y(){
	theta[leftMiddle1X] = +event.srcElement.value - 45;
    initNodes(leftMiddle1X);
}
function moveLM1M(){
	theta[leftMiddle1Middle] = +event.srcElement.value + 105;
    initNodes(leftMiddle1Middle);
}
function moveLM1L(){
	theta[leftMiddle1Lower] = +event.srcElement.value + 18;
    initNodes(leftMiddle1Lower);
}

//------------------Right Middle2 Leg Movements-------------------
function moveRM2U_X(){
	theta[rightMiddle2Upper] = +event.srcElement.value - 110;
    initNodes(rightMiddle2Upper);
}
function moveRM2U_Y(){
	theta[rightMiddle2X] = +event.srcElement.value - 45;
    initNodes(rightMiddle2X);
}
function moveRM2M(){
	theta[rightMiddle2Middle] = +event.srcElement.value + 105;
    initNodes(rightMiddle2Middle);
}
function moveRM2L(){
	theta[rightMiddle2Lower] = +event.srcElement.value + 18;
    initNodes(rightMiddle2Lower);
}


//------------------Left Middle2 Leg Movements-------------------
function moveLM2U_X(){
	theta[leftMiddle2Upper] = +event.srcElement.value + 110;
    initNodes(leftMiddle2Upper);
}
function moveLM2U_Y(){
	theta[leftMiddle2X] = +event.srcElement.value - 69;
    initNodes(leftMiddle2X);
}
function moveLM2M(){
	theta[leftMiddle2Middle] = +event.srcElement.value + 105;
    initNodes(leftMiddle2Middle);
}
function moveLM2L(){
	theta[leftMiddle2Lower] = +event.srcElement.value + 18;
    initNodes(leftMiddle2Lower);
}


//------------------Left Behind Leg Movements-------------------
function moveLBU_X(){
	theta[leftFrontUpper] = +event.srcElement.value + 56;
    initNodes(leftFrontUpper);
}

function moveLBU_Y(){
	theta[leftFrontX] = +event.srcElement.value/2 -69;
    initNodes(leftFrontX);
}

function moveLBM(){
	theta[leftFrontMiddle] = +event.srcElement.value + 105;
    initNodes(leftFrontMiddle);
}

function moveLBL(){
	theta[leftFrontLower] = +event.srcElement.value + 18;
    initNodes(leftFrontLower);
}

//------------------Right Behind Leg Movements-------------------
function moveRBU_X(){
	theta[rightFrontUpper] = +event.srcElement.value - 56;
    initNodes(rightFrontUpper);
}

function moveRBU_Y(){
	theta[rightFrontX] = +event.srcElement.value/2 -45;
    initNodes(rightFrontX);
}

function moveRBM(){
	theta[rightFrontMiddle] = +event.srcElement.value + 105;
    initNodes(rightFrontMiddle);
}

function moveRBL(){
	theta[rightFrontLower] = +event.srcElement.value + 18;
    initNodes(rightFrontLower);
}

//------------------Translate in X coordinate---------------------
function translateSpiderX(){
	theta[translateXId] = event.srcElement.value;
	 initNodes(headId);
}

//------------------Translate in Y coordinate---------------------
function translateSpiderY(value){
	var sum = 0.0;
	sum = parseFloat(previousY) + parseFloat(value);
	theta[translateYId] = sum;
	 initNodes(headId);
}

//------------------Translate in Z coordinate---------------------
function translateSpiderZ(){
	theta[translateZId] = event.srcElement.value;
	previous = event.srcElement.value;
	initNodes(headId);
}

/**
 * A function to rotate the spider in X,Y,Z axises using keyboard
 * buttons
 *
**/
function keyPressed(){
	console.log(event.keyCode);
	// left
    if (event.keyCode == 100) {
    	theta[headIdY] += 10;
    	initNodes(headIdY);
    // right
    } else if (event.keyCode == 102) {  
    	theta[headIdY] -= 10;
    	initNodes(headIdY);
    // down	
    } else if (event.keyCode == 98) {
        theta[headIdX] += 10;
        initNodes(headIdX);
    // up    
    } else if (event.keyCode == 104) {
        theta[headIdX] -= 10;
        initNodes(headIdX);
    } else if (event.keyCode == 97){
        theta[headIdZ] += 10;
        initNodes(headIdZ);
    } else if (event.keyCode == 99){
        theta[headIdZ] -= 10;
        initNodes(headIdZ);
    }
	else if( event.keyCode == 87 ) // w
	{
		near *= 1.1; far *= 1.1;
	}
	else if( event.keyCode == 65 ) // a
	{
		radius *= 0.5;
	}
	else if( event.keyCode == 83 ) // s
	{
		thetaP += dr;
	}
	else if( event.keyCode == 68 ) // d
	{
		phi += dr;
	}
  }

/**
 * A function that simplifies the complex structure of a spiders' jump movement
 * it increases and decreases angles accordingly to give a clean impresion
 *
**/ 
function moveUp(value){
	theta[leftFrontMiddle] = +event.srcElement.value + 105;
    initNodes(leftFrontMiddle);
	theta[rightFrontMiddle] = +event.srcElement.value + 105;
    initNodes(rightFrontMiddle);
    theta[leftBehindMiddle] = +event.srcElement.value + 105;
    initNodes(leftBehindMiddle);
    theta[rightBehindMiddle] = +event.srcElement.value + 105;
    initNodes(rightBehindMiddle);
    theta[rightMiddle1Middle] = +event.srcElement.value + 105;
    initNodes(rightMiddle1Middle);
    theta[leftMiddle1Middle] = +event.srcElement.value + 105;
    initNodes(leftMiddle1Middle);
    theta[rightMiddle2Middle] = +event.srcElement.value + 105;
    initNodes(rightMiddle2Middle);
    theta[leftMiddle2Middle] = +event.srcElement.value + 105;
    initNodes(leftMiddle2Middle);
	
	theta[leftBehindX] = -event.srcElement.value - 45;
    initNodes(leftBehindX);

    theta[rightBehindX] = -event.srcElement.value - 45;
    initNodes(rightBehindX);

    theta[leftMiddle1X] = -event.srcElement.value - 45;
    initNodes(leftMiddle1X);
    theta[rightMiddle1X] = -event.srcElement.value - 45;
    initNodes(rightMiddle1X);

    theta[rightMiddle2X] = -event.srcElement.value - 45;
    initNodes(rightMiddle2X);
    theta[leftMiddle2X] = -event.srcElement.value - 45;
    initNodes(leftMiddle2X);

    theta[leftFrontX] = -event.srcElement.value/2 -45;
    initNodes(leftFrontX);
    theta[rightFrontX] = -event.srcElement.value/2 -45;
    initNodes(rightFrontX);

	var sum = 0.0;
 	sum = parseFloat(previous) + parseFloat(value/20);
    theta[translateZId] = sum;
	 initNodes(headId);
}
/**
 * A function that stores every angle inside the theta array as a string
 * inside frameContent and adds it to frameList
 *
 * References:
 *		https://github.com/celikkoseoglu/CS465-Bilkent/tree/master/Assignment2
 *
**/
function addFrame(){

var torsoIdAngle 			=  theta[torsoId];
var headIdAngle 			=  theta[headId];
var leftFrontUpperAngle 	=  theta[leftFrontUpper];
var leftFrontMiddleAngle 	=  theta[leftFrontMiddle];
var leftFrontLowerAngle 	=  theta[leftFrontLower];
var leftMiddle1UpperAngle 	=  theta[leftMiddle1Upper];
var leftMiddle1MiddleAngle 	=  theta[leftMiddle1Middle];
var leftMiddle1LowerAngle 	=  theta[leftMiddle1Lower];
var leftMiddle2UpperAngle 	=  theta[leftMiddle2Upper];
var leftMiddle2MiddleAngle 	=  theta[leftMiddle2Middle];
var leftMiddle2LowerAngle 	=  theta[leftMiddle2Lower];
var leftBehindUpperAngle	=  theta[leftBehindUpper]
var leftBehindMiddleAngle	=  theta[leftBehindMiddle];
var leftBehindLowerAngle	=  theta[leftBehindLower];
var rightFrontUpperAngle	=  theta[rightFrontUpper];
var rightFrontMiddleAngle	=  theta[rightFrontMiddle];
var rightFrontLowerAngle	=  theta[rightFrontLower];
var rightMiddle1UpperAngle	=  theta[rightMiddle1Upper];
var rightMiddle1MiddleAngle	=  theta[rightMiddle1Middle];
var rightMiddle1LowerAngle	=  theta[rightMiddle1Lower];
var rightMiddle2UpperAngle	=  theta[rightMiddle2Upper];
var rightMiddle2MiddleAngle	=  theta[rightMiddle2Middle];
var rightMiddle2LowerAngle	=  theta[rightMiddle2Lower];
var rightBehindUpperAngle	=  theta[rightBehindUpper];
var rightBehindMiddleAngle	=  theta[rightBehindMiddle];
var rightBehindLowerAngle	=  theta[rightBehindLower];
var headIdXAngle 			=  theta[headIdX];
var headIdYAngle 			=  theta[headIdY];
var headIdZAngle 			=  theta[headIdZ];
var leftFrontXAngle 		=  theta[leftFrontX];
var leftMiddle1XAngle 		=  theta[leftMiddle1X];
var leftMiddle2XAngle 		=  theta[leftMiddle2X];
var leftBehindXAngle 		=  theta[leftBehindX];
var rightFrontXAngle 		=  theta[rightFrontX];
var rightMiddle1XAngle 		=  theta[rightMiddle1X];
var rightMiddle2XAngle 		=  theta[rightMiddle2X];
var rightBehindXAngle 		=  theta[rightBehindX];
var translateXIdAngle		=  theta[translateXId];
var translateYIdAngle		=  theta[translateYId];
var translateZIdAngle		=  theta[translateZId];	


frameContent =  headIdAngle + ","  + torsoIdAngle + "," + leftFrontUpperAngle + "," + leftFrontMiddleAngle
+ "," + leftFrontLowerAngle + "," + leftMiddle1UpperAngle + "," + leftMiddle1MiddleAngle + ","
+ leftMiddle1LowerAngle + "," + leftMiddle2UpperAngle + "," + leftMiddle2MiddleAngle + "," + leftMiddle2LowerAngle + 
"," + leftBehindUpperAngle + "," + leftBehindMiddleAngle + "," + leftBehindLowerAngle + "," + rightFrontUpperAngle + 
"," + rightFrontMiddleAngle + "," + rightFrontLowerAngle + "," + rightMiddle1UpperAngle + ","
+ rightMiddle1MiddleAngle + "," + rightMiddle1LowerAngle + "," + rightMiddle2UpperAngle + "," + rightMiddle2MiddleAngle +
 "," + rightMiddle2LowerAngle + "," + rightBehindUpperAngle + "," + rightBehindMiddleAngle + "," + rightBehindLowerAngle 
 + "," + headIdXAngle + "," + headIdYAngle + "," + headIdZAngle + "," + leftFrontXAngle + "," + leftMiddle1XAngle + "," + 
 leftMiddle2XAngle + "," + leftBehindXAngle + "," + rightFrontXAngle + "," + rightMiddle1XAngle + "," + rightMiddle2XAngle 
 + "," + rightBehindXAngle + "," + translateXIdAngle + "," + translateYIdAngle + "," + translateZIdAngle;

frameList += frameContent +  "\n";
}


/**
 * A function that saves the content inside frameList as a txt file
 *
**/ 
function saveAnimation(){
	var filename = ( "Animator.txt");

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(frameList));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/*
 * A function that loads the keyFrames inside a txt file by assigning it the frameList 
 *
**/ 
function loadAnimation(){
	var file = event.target.files[0]; 

        var reader = new FileReader();
        reader.onload = function(progressEvent){
        frameList = this.result;

        }
        reader.readAsText(file);
}

/**
 * A function that processes each keyFrame by splitting the content of frameList
 * and send it each keyFrame to processFrameMovement method
 *
 * References:
 *		https://github.com/celikkoseoglu/CS465-Bilkent/tree/master/Assignment2
 *
**/ 
function renderKeyFrame() {
    var frame = frameList.split("\n");

    if (callAnim === true) {
        processFrameMovement(frame[keyFrame]);
        keyFrame++;
        if (keyFrame > frame.length - 1) {

        }
    }
}

/**
 * The function which starts the animation according to the available keyFrames.
 *
**/ 
function playAnimation() {

    keyFrame = 0;
    parseAnimFile();
}

function parseAnimFile() {
        setInterval(renderKeyFrame, 10);
}

/**
 * A function that processes the given Frames movements by smoothing out
 * the display with the help of smooth and calling runAnimation function
 * to print the result
 *
 * References:
 *		https://github.com/celikkoseoglu/CS465-Bilkent/tree/master/Assignment2
**/
function processFrameMovement(text) {

    if (text !== undefined) {
        callAnim = false; 
        var allMoves = ""; 
        var thetaVal = text.split(",");

        for (var j = 0; j < smooth; j++) { 
            for (var i = 0; i < thetaVal.length; i++) {
                var moveDif = parseFloat(thetaVal[i]) - theta[i];
                var movement = (moveDif / smooth);
                thetaVal[0] = parseFloat(theta[i]) + movement;
                allMoves +=  movement + ",";
            }
            allMoves = allMoves.substring(0, allMoves.length - 1); 
            allMoves += "\n";
        }
        runAnimation(allMoves);
    }
}

/**
 * A function that prints each given frame by initializing each vertice 
 * to their (theta + move) value 
 *
 * References:
 *		https://github.com/celikkoseoglu/CS465-Bilkent/tree/master/Assignment2
**/ 
function runAnimation(allMove) {
    var j = 0;
    var keyFrameMoves = allMove.split("\n");
    
    function animate() {
        setTimeout(function () {


            var moves = keyFrameMoves[j].split(',');
            for (var k = 0; k < moves.length; k++) {
                theta[k] = parseFloat(theta[k]) + parseFloat(moves[k]);
            }
            for (i = 0; i < numNodes; i++)
                initNodes(i);
            j++;
            if (j < keyFrameMoves.length)
                animate();
            else
                callAnim = true;
        }, 1000 / tick)
    }
    animate();
}




//----------------Render Function--------------
var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	eye = new vec3();
    modelViewMatrix = lookAt(eye, at , up); 
    projectionMatrix = ortho(-canvas.width/40, canvas.width/40, -canvas.height/40, canvas.height/40,-25.0,25.0);
	
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );


	traverse(headId);
    requestAnimFrame(render);
}

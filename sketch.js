/*
Data and machine learning for artistic practice
Week 7

Style transfer on a static image

Instructions:
- Press 1,2,3,4 to switch between scenes
- Press A or B to apply different styles in screens 2 & 3
- Press I to enable image classifier
- Press Q to enable filters, Press E to disable them 

Description
- Scene One is to provide instuctions the the user
- Scene Two is to apply style transfer to a static image
- Scene Three is to apply Style Transfer to the users webcam
- Scene Four is to apply Style Transfer and Facial Recognition to the webcam
*/


let mgr, //used for the scene manager
    cC, // used to createCanvas
    enableFilters = false; //used to enable filters

let selector = true; //allows me to select between styles on the webcam

//static image variables
let static_style1,
    static_style2,
    static_img,
    originalImg,
    canvas,
    button;

//webcam variables
let web_style1,
    web_style2,
    video,
    web_img,
    graphics;

//facial recognition variables
let faceapi,
    pose_video,
    detections,
    pose_style1,
    pose_img;

//image classifier variables
let classifier,
    result_string = "Predicting...",
    classifier_img,
    scan_num,
    present = false;

function preload() {
    // load our transfer image
    static_img = loadImage("img/test.png");
    originalImg = static_img; // this is used to restore later

    //preloads classifier
    classifier = ml5.imageClassifier("MobileNet");
}

function setup() {

    //this is the scene manager it allows the user to select different scenes (uses scenemanager.js library)
    mgr = new SceneManager();
    mgr.addScene(SceneOne);
    mgr.addScene(SceneTwo);
    mgr.addScene(SceneThree);
    mgr.addScene(SceneFour);
    mgr.showNextScene();

    //allows user to enable image classifier on different scenes
    scan_num = 0;

}


//draws the scenes onto the screen
function draw() {
    mgr.draw();
}

//scene one is used to display onscreen instructions (user can reach here by pressing 1)
function SceneOne() {
    this.setup = function () {
        createCanvas(320, 270);
    }


    this.draw = function () {
        background(0);
        push()
        fill(255)
        text("Press 2 to apply style transfer to a static image", 20, height / 6 + 20)
        text("Press 3 to apply style transfer to your webcam", 20, height / 6 + 50)
        text("Press 4 to apply style transfer to your webcam & facial recognition", 20, height / 6 + 65, 280)
        text("Press i to enable image classification", 20, height / 6 + 115)
        text("Press A or B to apply styles on screen 2 or 3", 20, height / 6 + 145)
        text("Press Q to enable filters, Press E to disable them ", 20, height / 6 + 175)
        pop()
    }
}


//Scene two is used to apply style transfer to a static image
function SceneTwo() {
    this.setup = function () {
        // create canvas, we assign it to the canvas variable so we can access it later
        canvas = createCanvas(320, 270);

        // load two style transfer models from the models folder
        static_style1 = ml5.styleTransfer("models/wave", staticModelLoaded);
        static_style2 = ml5.styleTransfer("models/udnie", staticModelLoaded);

        //select file button
        selectFile = createFileInput(handleFile);
    }

    this.draw = function () {
        background(0);
        
        // draw our image
        image(static_img, 0, 0, width, 240);

        //enables the image classifier when the user presses i 
        if (scan_num == 1 && present) {
            push();
            fill(255);
            text(result_string, 10, 260);
            classifier.classify(static_img, weKnow);
            pop();
        } else {
            fill(255);
            text("Press i to enable image classifier", 10, 260);
            noFill()
        }
        
        if(enableFilters)
            imageFilters();
    }
}

//scene three is used to apply style transfer to the users webcam and they can press a and b to switch its style
function SceneThree() {
    this.setup = function () {
        cC = createCanvas(320, 270);
        webcam();
    }

    this.draw = function () {
        background(0);
        // Switch between showing the raw camera or the style
        if (web_img) {
            image(web_img, 0, 0, 320, 240);
        }
        // this puts the video feed into the invisible graphics canvas
        graphics.image(video, 0, 0, 320, 240);


        //allows users to enable image classifier
        if (scan_num == 2 && present) {
            push()
            fill(255);
            text(result_string, 10, 260);
            classifier.classify(web_img, weKnow);
            pop()
        } else {
            fill(255);
            text("Press i to enable image classifier", 10, 260);
            noFill()
        }
        
        if(enableFilters)
            imageFilters();
    }
}

//scene four is used to apply style transfer and facial detection to the users webcam
function SceneFour() {

    this.setup = function () {
        createCanvas(320, 270);
        pose_webcam();
    }

    this.draw = function () {
        background(0);
        // Switch between showing the raw camera or the style
        if (pose_img) {
            image(pose_img, 0, 0, 320, 240);
        }
        // this puts the video feed into the invisible graphics canvas
        graphics.image(pose_video, 0, 0, 320, 240);

        // if we have detections, draw them on the image
        if (detections) {
            // when we call detect, we are looking for potentially multiple faces, so ml5.js returns an array of objects, therefore here we use a for loop to get each 'person'.
            for (let person of detections) {
                drawBox(person);
                drawLandmarks(person);
            }
        }

        //allows users to enable image classifier
        if (scan_num == 3 && present) {
            push()
            fill(255);
            text(result_string, 10, 260);
            classifier.classify(pose_img, weKnow);
            pop()
        } else {
            fill(255);
            text("Press i to enable image classifier", 10, 260);
            noFill()
        }
        
        if(enableFilters)
            imageFilters();
    }
}



function keyPressed() {
    //used to allow the user to switch scenes
    switch (key) {
        case '1':
            mgr.showScene(SceneOne);
            break;

        case '2':
            mgr.showScene(SceneTwo);
            scan_num = 1;
            break;

        case '3':
            mgr.showScene(SceneThree);
            scan_num = 2;
            break;

        case '4':
            mgr.showScene(SceneFour);
            scan_num = 3;
            break;
    }

    if (key == 'a') {
        // we should transfer into style 1
        static_img = originalImg; // switch back to original so we can prevent recursive application
        static_style1.transfer(canvas, function (err, result) {
            let tempDOMImage = createImg(result.src).hide();
            static_img = tempDOMImage;
        });
        selector = true; //allows user to switch style on scene three
    } else if (key == 'b') {
        // we should transfer into style 2
        static_img = originalImg; // switch back to original so we can prevent recursive application
        static_style2.transfer(canvas, function (err, result) {
            let tempDOMImage = createImg(result.src).hide();
            static_img = tempDOMImage;
        });
        selector = false; //allows user to switch style on scene three
    } else if (key == 'i') {
        present = true;
    } else if (key == 'q'){
        enableFilters = true;
    } else if (key == 'e'){
        enableFilters = false; 
    }
}




/* --------------- Scene Two related functions (Start) --------------- */
function handleFile(file) {
    print(file);
    if (file.type === 'image') {
        static_img = createImg(file.data, '');
        static_img.hide();
    } else {
        static_img = null;
    }
}


function staticModelLoaded() {
    // Check if both models are loaded
    if (static_style1.ready && static_style2.ready) {
        statusMsg.html("Both models are ready!");
    }
}

/* --------------- Scene Two related functions (End) --------------- */





/* --------------- Scene Three related functions (Start) --------------- */
function webcam() {
    video = createCapture(VIDEO, videoLoaded);
    video.size(320, 240);
    video.hide();
    graphics = createGraphics(320, 240);
}

function videoLoaded(stream) {
    // load in the style transfer model
    web_style1 = ml5.styleTransfer("models/udnie", webModelLoaded); // try out mathura too!
    web_style2 = ml5.styleTransfer("models/mathura", webModelLoaded);
}

function webModelLoaded() {
    // model loaded
    console.log("Model loaded");

    // start the transfer of style
    transferStyle();
}

function transferStyle() {
    // we transfer based on graphics, graphics contains a scaled down video feed
    if (selector) {
        web_style1.transfer(graphics, function (err, result) {
            let tempDOMImage = createImg(result.src).hide();
            web_img = tempDOMImage;
            tempDOMImage.remove(); // remove the temporary DOM image

            // recursively call function so we get live updates
            transferStyle();
        });
    }

    if (!selector) {
        web_style2.transfer(graphics, function (err, result) {
            let tempDOMImage = createImg(result.src).hide();
            web_img = tempDOMImage;
            tempDOMImage.remove(); // remove the temporary DOM image

            // recursively call function so we get live updates
            transferStyle();
        });
    }
}

/* --------------- Scene Three related functions (End) --------------- */





/* --------------- Scene Four related functions (Start) --------------- */

// these are our options for detecting faces, provided by ml5.js
const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
}



// ml5.js has determined if there's a face
function gotResults(err, result) {
    // check if ml5.js returned an error - if so print to console and stop
    if (err) {
        console.log(err)
        return
    }

    // if it gets here we are okay, so store results in the detections variable, this is an OBJECT of detections - see the console
    //console.log(result);
    detections = result;

    // we recursively call face detect
    faceapi.detect(gotResults)
}


// *** Draw our elements on the image, a box and face feature locations ***  
function drawBox(detections) {
    const alignedRect = detections.alignedRect;
    const {
        _x,
        _y,
        _width,
        _height
    } = alignedRect._box;
    noFill();
    stroke(161, 95, 251);
    strokeWeight(2)
    rect(_x, _y, _width, _height)
}

function drawLandmarks(detections) {
    noFill();
    stroke(161, 95, 251);
    strokeWeight(2)

    push()
    // mouth
    beginShape();
    detections.parts.mouth.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape(CLOSE);

    // nose
    beginShape();
    detections.parts.nose.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape(CLOSE);

    // left eye
    beginShape();
    detections.parts.leftEye.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape(CLOSE);

    // right eye
    beginShape();
    detections.parts.rightEye.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape(CLOSE);

    // right eyebrow
    beginShape();
    detections.parts.rightEyeBrow.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape();

    // left eye
    beginShape();
    detections.parts.leftEyeBrow.forEach(item => {
        vertex(item._x, item._y)
    })
    endShape();

    pop();

}


function pose_webcam() {
    pose_video = createCapture(VIDEO, pose_webcamReady);
    pose_video.size(320, 240);
    pose_video.hide();
    graphics = createGraphics(320, 240);
}



function pose_webcamReady(stream) {
    // load the faceapi model - with modelReady() callback
    // - NOTE: this time we provide video as the first parameter
    faceapi = ml5.faceApi(pose_video, detection_options, pose_modelReady);
    pose_style1 = ml5.styleTransfer("models/udnie", pose_webModelLoaded);
}


// callback for when ml5.js has loaded the model
function pose_modelReady() {
    console.log("Model is ready...");
    // ask ml5 to detect a faces in the video stream previously provided - gotResults() callback
    faceapi.detect(gotResults);
}


function pose_transferStyle() {
    // we transfer based on graphics, graphics contains a scaled down video feed
    pose_style1.transfer(graphics, function (err, result) {
        let tempDOMImage = createImg(result.src).hide();
        pose_img = tempDOMImage;
        tempDOMImage.remove(); // remove the temporary DOM image

        // recursively call function so we get live updates
        pose_transferStyle();
    });
}


function pose_webModelLoaded() {
    // model loaded
    console.log("Model loaded");

    // start the transfer of style
    pose_transferStyle();
}

/* --------------- Scene Four related functions (End) --------------- */




//used for the image classifier
function weKnow(error, results) {
    if (!error) {
        // form a string to contain the results
        // here we use the backtick method of embedding variables in strings. We use Math.ceil to round up the decimal to the closest whole number
        result_string = `This is a ${results[0].label}, I'm ${(Math.ceil(results[0].confidence * 100))}% confident.`;
    } else {
        // there was an error
        console.log("There was an error determining the object within the image -> " + error);
    }
}



function imageFilters() {
  //used to divide the hight into 8 different sections
  let num = 270/8;

  //mouse position dictates the threshold's valueS
  let threshold;
  threshold = norm(mouseX, width / 6, width);

  //if the mouse is more than half the canvas width and has applied pix2pix
  if (enableFilters) {
    if (mouseY < num) filter(THRESHOLD, threshold);
    else if (mouseY > num && mouseY < num * 2) filter(POSTERIZE, 2);
    else if (mouseY > num * 2 && mouseY < num * 3) filter(BLUR, threshold * 5);
    else if (mouseY > num * 3 && mouseY < num * 4) filter(INVERT, threshold * 5);
    else if (mouseY > num * 4 && mouseY < num * 5) filter(ERODE, threshold * 5);
    else if (mouseY > num * 5 && mouseY < num * 6) filter(DILATE);
    else if (mouseY > num * 6 && mouseY < num * 7) filter(OPAQUE);
    else if (mouseY > num * 7 && mouseY < num * 8) filter(GRAY);
  }
}

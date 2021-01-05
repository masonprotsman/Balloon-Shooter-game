"use strict";

let container;      	        // keeping here for easy access
let scene, camera, renderer;    // Three.js rendering basics.
let gun;                        // The gun, which can be "aimed" by the mouse.
let gunbase;                    // The cylinder at the base of the gun; the gun is a child of this cylinder.
let ray;                        // A yellow "ray" from the barrel of the gun.
let rayVector;                  // The gun and the ray point from (0,0,0) towards this vector
                                //        (in the local coordinate system of the gunbase).
let gunRotateY = 0;             // Amount by which gun is rotated around the y-axis
let cubeTexture;//    (carrying the camera with it).
let raycaster;
let objects = [];
let score = 0;
let objRemaining = 121;
let moveBalls;
let objPos = 30;
let objPosOffest = -1;
let colorCount = 1;
let colorValue = "red";
let shotObjects =[];
let balloonMesh;


/**
 *  Creates the bouncing balls and the translucent cube in which the balls bounce,
 *  and adds them to the scene.  A light that shines from the direction of the
 *  camera's view is also bundled with the camera and added to the scene.
 */
function createWorld() {
    console.log("createWorld function")
    renderer.setClearColor(0);  // black background
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

    /* Add the camera and a light to the scene, linked into one object. */
    let light = new THREE.DirectionalLight();
    light.position.set(0, 0, 1);
    camera.position.set(0, 40, 100);
    camera.rotation.x = -Math.PI / 9; //camera looks down a bit
    camera.add(light);
    scene.add(new THREE.DirectionalLight(0x808080));

    //new light. for some reason it removes texture of ground
    const light2 = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light2);
    //end new light

    let ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshLambertMaterial({
            color: "grey",
            map: makeTexture("resources/wall-grey2.jpg") //add this to resources so it works
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);

    let gunmat = new THREE.MeshLambertMaterial({
        color: 0x091c0e
        //color: 0xaaaaff
    });
    gun = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 8), gunmat);
    let barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 7, 16), gunmat);
    barrel.position.y = 2.5;
    gun.add(barrel);
    gunbase = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 32), gunmat);

    let linegeom = new THREE.Geometry();
    linegeom.vertices.push(new THREE.Vector3(0, 0, 0));
    linegeom.vertices.push(new THREE.Vector3(0, 100, 0));
    ray = new THREE.Line(linegeom, new THREE.LineBasicMaterial({
        color: 0xffaa00,
        linewidth: 3
    }));
    ray.material.visible = false;
    ray.material.needsUpdate = true;

    for (var x = -50; x <= 50; x += 10) {
        for (var z = -50; z <= 50; z += 10) {
            colorValue = "red";
            //console.log("colorCount: " + colorCount)
            if(colorCount == 1){
                colorValue = "red";
                //console.log("IF 1");
                //console.log("colorCount: " + colorCount);
            }
            //console.log("colorCount: " + colorCount);
            if(colorCount == 2){
                //console.log("IF 2");
                colorValue = "orange";
                //console.log("colorCount: " + colorCount);
            }
            if(colorCount == 3){
                //console.log("IF 2");
                colorValue = "yellow";
                //console.log("colorCount: " + colorCount);
            }
            if(colorCount == 4){
                //console.log("IF 2");
                colorValue = "green";
                //console.log("colorCount: " + colorCount);
            }
            if(colorCount == 5){
                //console.log("IF 2");
                colorValue = "blue";
                //console.log("colorCount: " + colorCount);
            }
            if(colorCount == 6){
                //console.log("IF 3");
                colorValue = "purple";
                colorCount = 0;
                //console.log("colorCount is set to 0");
                //console.log("colorCount: " + colorCount);
            }
            colorCount++;
            //change the line below to spheres
            //var m = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 9.5), new THREE.MeshBasicMaterial({
            var m = new THREE.Mesh(new THREE.SphereGeometry(3, 30, 30), new THREE.MeshBasicMaterial({
                color: colorValue,
                side: THREE.DoubleSide
            }));
            console.log("colorCount: " + colorCount)
            console.log("colorValue: " + colorValue)
            m.position.set(x, 30, z);
            m.rotation.x = Math.PI / 2;
            objects.push(m);
            scene.add(m);
        }
    }

    //create a function to move the squares
    //move them up, how a count, once they move 5 spaces, make them move 5 spaces in the opposite direction
    //call the move function by time. or call it each time something is rendered
    //call this in update for frame

    cubeTexture = makeCubeTexture(
        ["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"],
            "resources/skybox/"
    );

    raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
    scene.background = cubeTexture;
    gunbase.add(ray);
    gunbase.add(camera);
    gunbase.add(gun);

    //new
    //gunbase.position.x = -3;
    //gunbase.position.y = 3;
    //gunbase.position.z = 24;
    //end new

    scene.add(gunbase);
    loadGLTF();

} // end createWorld


    function loadGLTF() {
        let balloonLoader = new THREE.GLTFLoader();

        balloonLoader.load('./model/tankBodyV4.gltf', (gltf) => {
            balloonMesh = gltf.scene;
            scene.add(balloonMesh);
            balloonMesh.position.x = -2.25;
            balloonMesh.position.y = 1;
            balloonMesh.position.z = 1.9;
            balloonMesh.rotation.y = 0.60;
        });
    }

    /**
     *  Creates a CubeTexture and starts loading the images.
     *  filenames must be an array containing six strings that
     *  give the names of the files for the positive x, negative x,
     *  positive y, negative y, positive z, and negative z
     *  images in that order.  path, if present, is pre-pended
     *  to each of the filenames to give the full path to the
     *  files.  No error checking is done here, and no callback
     *  function is implemented.  When the images are loaded, the
     *  texture will appear on the objects on which it is used
     *  in the next frame of the animation.
     */
    function makeCubeTexture(filenames, path) {
        console.log("makeCubeTexture Function")
        let URLs;
        if (path) {
            console.log("IF -------------->")
            URLs = [];
            for (var i = 0; i < 6; i++) {
                URLs.push(path + filenames[i]);
                console.log(path + filenames[i]);
            }
        } else {
            URLs = filenames;
            console.log("ELSE -------------->")
            console.log(URLs)
        }
        let loader = new THREE.CubeTextureLoader();
        let texture = loader.load(URLs);
        return texture;
    }


    /**
     *  When an animation is in progress, this function is called just before rendering each
     *  frame of the animation.
     */
    function updateForFrame() {
        let time = clock.getElapsedTime(); // time, in seconds, since clock was created
        var dt = clock.getDelta();  // time since last update
        var hitlist = raycaster.intersectObjects(objects);
//      console.log("hit " + hitlist.length);
        if (hitlist.length != 0) {
            newhit(hitlist[0].object);
        } else {
            newhit(null);
        }

    }

    var hit = null;

function moveBallObjects() {
    //console.log("objects.length: " + objects.length)
    //console.log("moveBalls: " + moveBalls)
    objPos = objPos + objPosOffest;
    for (moveBalls = 0; moveBalls < objects.length; moveBalls++) {
        objects[moveBalls].position.setY(objPos);

        //console.log("objPos: " + objPos);
        //console.log("objPosOffset: " + objPosOffest);
        //console.log("objPos + objPosOffset: " + objPos - objPosOffest);
    }
    if (objPos >= 30) {
        objPosOffest = -1;
    }
    if (objPos <= 25) {
        objPosOffest = 1;
    }
}

function moveShotObjects() {
    for (moveBalls = 0; moveBalls < shotObjects.length; moveBalls++) {
        shotObjects[moveBalls].position.y += 0.1;
        shotObjects[moveBalls].color = "black";

        //console.log("objPos: " + objPos);
        //console.log("objPosOffset: " + objPosOffest);
        //console.log("objPos + objPosOffset: " + objPos - objPosOffest);
    }

}

//checks for new hits
//splices objects into hitobjects array
function newhit(obj) {
        if (obj != hit) {
            if (hit != null) {
//             console.log("restoring material");
                hit.material.color.set(0xffff00);
                hit.material.needsUpdate = true;
            }
            if (obj != null) {
                for (var i = 0; i < objects.length; i++) {
                    if (obj == objects[i]){
                        objects[i].color = "black";
                        shotObjects.push(objects[i]);
                        objects.splice(i, 1);
                    }
                    //console.log("Hit object number " + i);
                }
                //obj.material.visible = false;
                //obj.material.color.set(0xff0000);
                //obj.material.needsUpdate = true;
                score++;
                objRemaining--;

                //new change dec, 08, uncomment below
                //fix below. they are sometimes null and messes everything up

                //console.log("objRemaining " + objRemaining);
                //document.getElementById("remaining").innerHTML = objRemaining;
                //document.getElementById("destroyed").innerHTML = score;
                //end new change

                //document.getElementById("time").innerHTML = clock;
                //add the same thing for time
            }
            hit = obj;
            ray.material.visible = true;
            ray.material.needsUpdate = true;
        }
    }

    /**
     *  Render the scene.  This is called for each frame of the animation, after updating
     *  the position and velocity data of the balls.
     */
    function render() {
        renderer.render(scene, camera);
    }


    /**
     *  Creates and returns a Texture object that will read its image from the
     *  specified URL. If the second parameter is provided, the texture will be
     *  applied to the material when the
     */
    function makeTexture(imageURL, material) {
        function callback() {
            if (material) {
                material.map = texture;
                material.needsUpdate = true;
            }
            // not necessary to call render() since the scene is continually updating.
        }

        let loader = new THREE.TextureLoader();
        let texture = loader.load(imageURL, callback);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat = new THREE.Vector2(10, 10);
        texture.anisotropy = renderer.getMaxAnisotropy();
        return texture;
    }


//----------------------------- mouse and key support -------------------------------
    function doMouseDown(evt) {
        let fn = "[doMouseDown]: ";
        console.log(fn);

        let x = evt.clientX;
        let y = evt.clientY;
        console.log("Clicked mouse at " + x + "," + y);
    }

    function doMouseMove(evt) {
        let fn = "[doMouseMove]: ";
        console.log(fn);

        let x = evt.clientX;
        let y = evt.clientY;
        // mouse was moved to (x,y)
        let rotZ = 5 * Math.PI / 6 * (window.innerWidth / 2 - x) / window.innerWidth;
        let rotX = 5 * Math.PI / 6 * (y - window.innerHeight / 2) / window.innerHeight;
        gun.rotation.set(rotX, 0, rotZ);
        let rcMatrix = new THREE.Matrix4(); // The matrix representing the gun rotation,
                                            //    so we can apply it to the ray direction.
        rcMatrix.makeRotationFromEuler(gun.rotation); // Get the rotation, as a matrix.
        rayVector = new THREE.Vector3(0, 1, 0);  // Untransformed rayVector
        rayVector.applyMatrix4(rcMatrix);  // Apply the rotation matrix
        ray.geometry.vertices[1].set(rayVector.x * 100, rayVector.y * 100, rayVector.z * 100);
        ray.geometry.verticesNeedUpdate = true;

        //new
        var transformedRayVec = rayVector.clone();
        gunbase.localToWorld(transformedRayVec);
        raycaster.set(new THREE.Vector3(0, 0, 0), transformedRayVec);
        //end new
    }

    function doKeyDown(event) {
        let fn = "[doKeyDown]: ";
        console.log(fn + "Key pressed with code " + event.key);
        // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

        const code = event.key;
        // console.log("Key pressed with code " + code);
        let rot = 0;
        if (code === 'a' || code === 'ArrowLeft')           // 'a' and 'left arrow'
        {
            rot = 0.02;
        } else if (code === 'd' || code === 'ArrowRight')     // 'd' and 'right arrow'
        {
            rot = -0.02;
        }
        if (event.shiftKey)                                  // 'shift'
            rot *= 5;
        if (rot !== 0) {
            gunRotateY += rot;
            gunbase.rotation.y = gunRotateY;

            //new
            var transformedRayVec = rayVector.clone();
            gunbase.localToWorld(transformedRayVec);
            raycaster.set(new THREE.Vector3(0, 0, 0), transformedRayVec);
            //end new

            event.stopPropagation();          // *** MH
        }
    }

//--------------------------- animation support -----------------------------------

    let clock;  // Keeps track of elapsed time of animation.

    function doFrame() {
        ray.material.visible = false;
        ray.material.needsUpdate = true;
        updateForFrame();
        render();
        requestAnimationFrame(doFrame);
    }

//----------------------- respond to window resizing -------------------------------

    /* When the window is resized, we need to adjust the aspect ratio of the camera.
     * We also need to reset the size of the canvas that used by the renderer to
     * match the new size of the window.
     */
    function doResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix(); // Need to call this for the change in aspect to take effect.
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function createRenderer() {
        //renderer = new THREE.WebGLRenderer();
        renderer = new THREE.WebGLRenderer({antialias: true});
        // we set this according to the div container.
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 1.0);
        container.appendChild(renderer.domElement);  // adding 'canvas; to container here
        // render, or 'create a still image', of the scene
    }

//----------------------------------------------------------------------------------

    /**
     *  This init() function is called when by the onload event when the document has loaded.
     */
    function init() {
        container = document.querySelector('#scene-container');

        // Create & Install Renderer ---------------------------------------
        createRenderer();

        window.addEventListener('resize', doResize);  // Set up handler for resize event
        document.addEventListener("keydown", doKeyDown);
        window.addEventListener("mousedown", doMouseDown);
        window.addEventListener("mousemove", doMouseMove);

        createWorld();

        clock = new THREE.Clock(); // For keeping time during the animation.

        requestAnimationFrame(doFrame);  // Start the animation.

    }

    init()
    window.setInterval(function(){
        moveBallObjects();
    }, 500);
    window.setInterval(function(){
        moveShotObjects();
    }, 10);



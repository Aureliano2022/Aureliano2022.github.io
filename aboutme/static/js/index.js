var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

console.clear();

// =====================================

var App = function () {
    function App(opts) {
        _classCallCheck(this, App);

        this.opts = Object.assign({}, App.defaultOpts, opts);
        this.world = new World();
        this.init();
    }

    _createClass(App, [{
        key: 'init',
        value: function init() {
            this.threeEnvironment();
            window.requestAnimationFrame(this.animate.bind(this));
        }
    }, {
        key: 'threeEnvironment',
        value: function threeEnvironment() {
            var light = new Light();
            this.world.sceneAdd(light.ambient);
            this.world.sceneAdd(light.sun);
            var lights = lightBalls(this.world, light.lights);

            var composition = new Composition({
                sideLength: 10,
                amount: 15,
                radius: 6,
                thickness: 2,
                offset: 0.3
            });
            this.world.sceneAdd(composition.tubes);
        }
    }, {
        key: 'animate',
        value: function animate() {
            this.world.renderer.render(this.world.scene, this.world.camera);
            window.requestAnimationFrame(this.animate.bind(this));
        }
    }]);

    return App;
}();

App.defaultOpts = {
    debug: false
};

function lightBalls(world, meshes) {
    var radius = 12.4;
    var mainTl = new TimelineMax();

    meshes.forEach(function (group) {
        world.sceneAdd(group);
        createAnimation(group);
    });

    function createAnimation(group) {
        var tl = new TimelineMax({
            yoyo: true
        });

        tl.set(group.position, {
            x: THREE.Math.randInt(-2, 2) * radius + radius * 0.5,
            z: THREE.Math.randInt(-2, 2) * radius + radius * 0.5
        }).to(group.position, 2, {
            y: 18,
            ease: Linear.easeNone
        }).to(group.children[0], 1.2, {
            intensity: 4.0,
            distance: 18,
            ease: Linear.easeNone
        }, '-=1.2');

        tl.paused(true);

        mainTl.to(tl, 1.2, {
            progress: 1,
            ease: SlowMo.ease.config(0.0, 0.1, true),
            onComplete: createAnimation,
            onCompleteParams: [group],
            delay: THREE.Math.randFloat(0, 0.8)
        }, mainTl.time());
    }
}

// =====================================

var Light = function () {
    function Light() {
        _classCallCheck(this, Light);

        this.lights = [];
        this.ambient = null;
        this.sun = null;
        this.createLights();
        this.createAmbient();
        this.createSun();
    }

    _createClass(Light, [{
        key: 'createLights',
        value: function createLights() {
            for (var i = 0; i < 3; i++) {
                var group = new THREE.Group();

                var light = new THREE.PointLight(0xff0000);
                light.intensity = 4.0;
                light.distance = 6;
                light.decay = 1.0;
                group.add(light);

                var geometry = new THREE.SphereBufferGeometry(2, 16, 16);
                var material = new THREE.MeshBasicMaterial({
                    color: 0xff0000
                });
                var mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
                group.position.set(0, -5, 0);

                this.lights.push(group);
            }
        }
    }, {
        key: 'createAmbient',
        value: function createAmbient() {
            this.ambient = new THREE.AmbientLight(0xffffff, 0.03);
        }
    }, {
        key: 'createSun',
        value: function createSun() {
            this.sun = new THREE.SpotLight(0xffffff); // 0.1
            this.sun.intensity = 0.4;
            this.sun.distance = 100;
            this.sun.angle = Math.PI;
            this.sun.penumbra = 2.0;
            this.sun.decay = 1.0;
            this.sun.position.set(0, 50, 0);
        }
    }]);

    return Light;
}();

// =====================================

var World = function () {
    function World(opts) {
        _classCallCheck(this, World);

        this.opts = Object.assign({}, World.defaultOpts, opts);
        this.init();
    }

    _createClass(World, [{
        key: 'init',
        value: function init() {
            this.initScene();
            this.initCamera();
            this.initRenderer();
            this.addRenderer();
            window.addEventListener('resize', this.resizeHandler.bind(this));
        }
    }, {
        key: 'initScene',
        value: function initScene() {
            this.scene = new THREE.Scene();
        }
    }, {
        key: 'initCamera',
        value: function initCamera() {
            this.camera = new THREE.PerspectiveCamera(this.opts.camFov, window.innerWidth / window.innerHeight, this.opts.camNear, this.opts.camFar);
            this.camera.position.set(this.opts.camPosition.x, this.opts.camPosition.y, this.opts.camPosition.z);
            this.camera.lookAt(this.scene.position);
            this.scene.add(this.camera);
        }
    }, {
        key: 'initRenderer',
        value: function initRenderer() {
            this.renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
                logarithmicDepthBuffer: true
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);

            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
    }, {
        key: 'addRenderer',
        value: function addRenderer() {
            this.opts.container.appendChild(this.renderer.domElement);
        }
    }, {
        key: 'resizeHandler',
        value: function resizeHandler() {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }, {
        key: 'sceneAdd',
        value: function sceneAdd(obj) {
            this.scene.add(obj);
        }
    }]);

    return World;
}();

World.defaultOpts = {
    container: document.body,
    camPosition: new THREE.Vector3(150, 200, 400),
    camFov: 6,
    camNear: 0.1,
    camFar: 800
};

var Composition = function () {
    function Composition(opts) {
        _classCallCheck(this, Composition);

        this.opts = Object.assign({}, Composition.defaultOpts, opts);
        this.tube = Tube({
            amount: this.opts.amount,
            radius: this.opts.radius,
            thickness: this.opts.thickness
        });
        this.tubes = this.createTubes();
    }

    _createClass(Composition, [{
        key: 'createRow',
        value: function createRow() {
            var radius = this.opts.radius + this.opts.offset;
            var geometry = new THREE.Geometry();

            for (var i = 0; i < this.opts.sideLength; i++) {
                var t = this.tube.clone();
                t.translate(i * radius * 2, 0, 0);
                geometry.merge(t);
            }

            return geometry;
        }
    }, {
        key: 'createTubes',
        value: function createTubes() {
            var row = this.createRow();
            var radius = this.opts.radius + this.opts.offset;
            var geometry = new THREE.Geometry();

            for (var i = 0; i < this.opts.sideLength; i++) {
                var r = row.clone();
                r.translate(0, 0, i * radius * 2);
                geometry.merge(r);
            }

            geometry.center();

            var bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

            var materials = [
            // front
            new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 1.0,
                metalness: 0.0,
                emissive: 0x000000,
                flatShading: true, // true
                side: THREE.DoubleSide
            }),
            // side
            new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.6,
                metalness: 0.0,
                emissive: 0x000000,
                flatShading: true, // false
                side: THREE.DoubleSide
            })];

            var mesh = new THREE.Mesh(bufferGeometry, materials);
            // mesh.rotation.set(0, -Math.PI*0.15, 0);

            return mesh;
        }
    }]);

    return Composition;
}();

Composition.defaultOpts = {
    sideLength: 10,
    amount: 15,
    radius: 6,
    thickness: 2,
    offset: 0.3
};

// ===========================
function createShape(_ref) {
    var _ref$innerRadius = _ref.innerRadius,
        innerRadius = _ref$innerRadius === undefined ? 4 : _ref$innerRadius,
        _ref$outerRadius = _ref.outerRadius,
        outerRadius = _ref$outerRadius === undefined ? 6 : _ref$outerRadius,
        _ref$fineness = _ref.fineness,
        fineness = _ref$fineness === undefined ? 30 : _ref$fineness;


    var outer = getPath(outerRadius, fineness, false);
    var baseShape = new THREE.Shape(outer);

    var inner = getPath(innerRadius, fineness, true);
    var baseHole = new THREE.Path(inner);

    baseShape.holes.push(baseHole);

    return baseShape;
};

var getPath = function getPath(radius, fineness, reverse) {
    var c = radius * 0.55191502449;
    var path = new THREE.CurvePath();

    path.curves = [new THREE.CubicBezierCurve(new THREE.Vector2(0, radius), new THREE.Vector2(c, radius), new THREE.Vector2(radius, c), new THREE.Vector2(radius, 0)), new THREE.CubicBezierCurve(new THREE.Vector2(radius, 0), new THREE.Vector2(radius, -c), new THREE.Vector2(c, -radius), new THREE.Vector2(0, -radius)), new THREE.CubicBezierCurve(new THREE.Vector2(0, -radius), new THREE.Vector2(-c, -radius), new THREE.Vector2(-radius, -c), new THREE.Vector2(-radius, 0)), new THREE.CubicBezierCurve(new THREE.Vector2(-radius, 0), new THREE.Vector2(-radius, c), new THREE.Vector2(-c, radius), new THREE.Vector2(0, radius))];

    var points = path.getPoints(fineness);
    if (reverse) points.reverse();
    return points;
};

function Tube(_ref2) {
    var _ref2$amount = _ref2.amount,
        amount = _ref2$amount === undefined ? 4 : _ref2$amount,
        _ref2$radius = _ref2.radius,
        radius = _ref2$radius === undefined ? 6 : _ref2$radius,
        _ref2$thickness = _ref2.thickness,
        thickness = _ref2$thickness === undefined ? 2 : _ref2$thickness;


    var shape = createShape({ innerRadius: radius - thickness, outerRadius: radius, fineness: 14 });
    var props = {
        amount: amount,
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.2,
        bevelSegments: 1
    };

    var geometry = new THREE.ExtrudeGeometry(shape, props);

    geometry.center();
    geometry.computeVertexNormals();

    for (var i = 0; i < geometry.faces.length; i++) {
        var face = geometry.faces[i];
        if (face.materialIndex == 1) {
            for (var j = 0; j < face.vertexNormals.length; j++) {
                face.vertexNormals[j].z = 0;
                face.vertexNormals[j].normalize();
            }
        }
    }
    geometry.rotateX(Math.PI * 0.5);
    geometry.rotateZ(Math.PI);

    return geometry;
};

// ===========================
var app = new App();
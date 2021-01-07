

(function () {
    var that = {
        modelChildrenMap:new Map()
    };
    let modelDb = new ModelDbServer();
    modelDb.getModel('3d').then(res => {
        that.parseModel(res['modelData'])
    });
    that.container = document.getElementById("WebGL-output");
    that.parseModel = function (data) {
        let config = {
            x: 11,
            z: 0.5,
            scale: [0.1, 0.1, 0.1]
        };
        new THREE.ObjectLoader().parse(data, function (e) {
            that.initScene()
            console.log(e.children[0], "e.children[0]");
            that.scene.add(e.children[0])
            let obj = that.scene.children[2];
            that.obj = obj;
            if (obj.children && obj.children.length > 0) {
                let model = obj.children;
                model.forEach(e => {
                    that.modelChildrenMap.set(e.name, e)
                });
            }
            obj.rotation.x = config.x;
            obj.rotation.z = config.z;
            obj.scale.set(...config.scale)
        }, '.');
        that.spinModel = false;
        console.log(that.modelChildrenMap, 'obj')
    }
    that.initScene = function () {
        that.scene = new THREE.Scene();
        // that.container.addEventListener('click', (e)=>{that.onDocumentMouseMove(e)}, false);
        that.camera = new THREE.PerspectiveCamera(45, that.container.clientWidth / that.container.clientHeight, 1, 2000);
        that.camera.position.set(0, 0, 13)
        that.orbitControls = new THREE.OrbitControls(that.camera, that.container);
        that.orbitControls.enablePan = false;//防止右键拖动
        that.orbitControls.autoRotate = false;
        // that.orbitControls.autoRotateSpeed = 5;
        that.clock = new THREE.Clock();
        var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
        that.scene.add(ambientLight);
        var pointLight = new THREE.PointLight(0xffffff, 0.8);
        that.scene.add(pointLight);
        that.camera.add(pointLight);
        that.scene.add(that.camera);
        that.renderer = new THREE.WebGLRenderer();
        that.renderer.setClearColor(new THREE.Color("rgb(236, 236, 236)"));
        that.renderer.setSize(that.container.clientWidth, that.container.clientHeight);
        that.container.appendChild(that.renderer.domElement);
        that.animate()
    }
    that.animate = function () {
        that.render();
        that.animateId = requestAnimationFrame(() => { that.animate() });
    }
    that.render = function () {
        that.orbitControls.update(that.clock.getDelta());
        that.renderer.render(that.scene, that.camera);
    }
})()
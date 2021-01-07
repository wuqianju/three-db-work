importScripts('three.min.js', 'GLTFLoader.js', 'DRACOLoader.js');
self.addEventListener('message', function (e) {
    modelName = e.data;
    loadgltf(new THREE.Scene())
}, false);

var modelName;
function loadgltf(scene) {
    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };
    var gltfloader = new THREE.GLTFLoader()
    gltfloader.setDRACOLoader(new THREE.DRACOLoader());
    console.log(`../model/${modelName}.gltf`)
    gltfloader.load(`../model/${modelName}.gltf`, function (gltf) {
        var object = gltf.scene
        var objBbox = new THREE.Box3().setFromObject(gltf.scene);
        var bboxCenter = objBbox.getCenter().clone();
        bboxCenter.multiplyScalar(-1);

        object.traverse(function (child) { //转换成threejs对象
            if (child instanceof THREE.Mesh) {
                child.geometry.translate(bboxCenter.x, bboxCenter.y, bboxCenter.z);
            }
        });
        objBbox.setFromObject(object); // Update the bounding box
        scene.add(object);
        var workeData = {
            name: modelName,
            modelData: scene.toJSON()
        }
        self.postMessage(JSON.stringify(workeData))
        console.log('webwork send scene')
    }, onProgress);
}
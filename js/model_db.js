

var ModelDb = {
}
ModelDb.dbname = "harbor";//数据库名
ModelDb.tabname = 'model';//表明
ModelDb.dbVersion = 3;
ModelDb.db;//数据库
ModelDb.upgradeFlag = false; //数据库升级标识
ModelDb.resolve;
ModelDb.modelData;
ModelDb.modeName;

ModelDb.getModel = function (name) {
    this.modeName = name;
    return new Promise((resolve, reject) => {
        this.resolve = resolve,
            this.createDb();
    })
}
ModelDb.createDb = function () {
    var indexedDB = window.indexedDB || window["webkitIndexedDB"] || window["mozIndexedDB"] || window["msIndexedDB"];
    var request = indexedDB.open(this.dbname, this.dbVersion);
    request.onsuccess = e => {
        if (this.upgradeFlag) {
            this.upgradeFlag = false; //数据库升级标识
            return;
        }
        this.db = e.target.result;
        this.showModel()
    };
    request.onerror = (e) => {
        this.getModelWorker()
    };
    request.onupgradeneeded = e => {
        this.upgradeFlag = true;
        this.db = e.target.result;
        let objectStore;
        if (!this.db.objectStoreNames.contains(this.tabname)) {
            objectStore = this.db.createObjectStore(this.tabname, { keyPath: 'name' });
        }
        this.getModelWorker();
    }
}
ModelDb.tableAdd = function (workData) {
    this.db.transaction([this.tabname], 'readwrite').objectStore(this.tabname).add(workData);
    this.resolve(workData)
}
ModelDb.showModel = function () {
    console.log(new Date().getTime() / 1000)
    var store = this.db.transaction([this.tabname]).objectStore(this.tabname)
    var req = store.get(this.modeName)
    req.onsuccess = (event) => {
        if (req.result == null) {
            this.getModelWorker()
        } else {
            this.modelData = req.result;
            console.log('使用数据库数据');
            this.resolve(this.modelData)
        }
    }
    req.onerror = function (event) {
        this.getModelWorker();
    }
}
ModelDb.getModelWorker = function () {
    var worker = new Worker('./js/export.js');
    worker.postMessage(this.modeName);
    worker.onmessage = (event) => {
        let workData = JSON.parse(event.data);
        worker.terminate();
        if (true) {
            this.tableAdd(workData);
        }
    }
    worker.onerror = function (e) {
        console.log([
            'ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message
        ].join(''));
    };
}
function ModelDbServer() {
    return ModelDb;
}
if (typeof define === 'function' && define.amd) {
    define('modelDbServer', ModelDbServer);
} else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
    module.exports = ModelDbServer;
}
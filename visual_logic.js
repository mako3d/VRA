/* eslint-disable */

/**
 * Generated by Verge3D Puzzles v.4.3.1
 * Fri, 14 Jul 2023 14:38:12 GMT
 * Prefer not editing this file as your changes may get overridden once Puzzles are saved.
 * Check out https://www.soft8soft.com/docs/manual/en/introduction/Using-JavaScript.html
 * for the information on how to add your own JavaScript to Verge3D apps.
 */
function createPL(v3d = window.v3d) {

// global variables/constants used by puzzles' functions

var LIST_NONE = '<none>';

var _pGlob = {};

_pGlob.objCache = {};
_pGlob.fadeAnnotations = true;
_pGlob.pickedObject = '';
_pGlob.hoveredObject = '';
_pGlob.mediaElements = {};
_pGlob.loadedFile = '';
_pGlob.states = [];
_pGlob.percentage = 0;
_pGlob.openedFile = '';
_pGlob.openedFileMeta = {};
_pGlob.xrSessionAcquired = false;
_pGlob.xrSessionCallbacks = [];
_pGlob.screenCoords = new v3d.Vector2();
_pGlob.intervalTimers = {};
_pGlob.customEvents = new v3d.EventDispatcher();
_pGlob.eventListeners = [];

_pGlob.AXIS_X = new v3d.Vector3(1, 0, 0);
_pGlob.AXIS_Y = new v3d.Vector3(0, 1, 0);
_pGlob.AXIS_Z = new v3d.Vector3(0, 0, 1);
_pGlob.MIN_DRAG_SCALE = 10e-4;
_pGlob.SET_OBJ_ROT_EPS = 1e-8;

_pGlob.vec2Tmp = new v3d.Vector2();
_pGlob.vec2Tmp2 = new v3d.Vector2();
_pGlob.vec3Tmp = new v3d.Vector3();
_pGlob.vec3Tmp2 = new v3d.Vector3();
_pGlob.vec3Tmp3 = new v3d.Vector3();
_pGlob.vec3Tmp4 = new v3d.Vector3();
_pGlob.eulerTmp = new v3d.Euler();
_pGlob.eulerTmp2 = new v3d.Euler();
_pGlob.quatTmp = new v3d.Quaternion();
_pGlob.quatTmp2 = new v3d.Quaternion();
_pGlob.colorTmp = new v3d.Color();
_pGlob.mat4Tmp = new v3d.Matrix4();
_pGlob.planeTmp = new v3d.Plane();
_pGlob.raycasterTmp = new v3d.Raycaster(); // always check visibility

var PL = {};
// backward compatibility
if (v3d[Symbol.toStringTag] !== 'Module') {
    v3d.PL = v3d.puzzles = PL;
}

PL.procedures = PL.procedures || {};




PL.execInitPuzzles = function(options) {
    // always null, should not be available in "init" puzzles
    var appInstance = null;
    // app is more conventional than appInstance (used in exec script and app templates)
    var app = null;

    var _initGlob = {};
    _initGlob.percentage = 0;
    _initGlob.output = {
        initOptions: {
            fadeAnnotations: true,
            useBkgTransp: false,
            preserveDrawBuf: false,
            useCompAssets: false,
            useFullscreen: true,
            useCustomPreloader: false,
            preloaderStartCb: function() {},
            preloaderProgressCb: function() {},
            preloaderEndCb: function() {},
        }
    }

    // provide the container's id to puzzles that need access to the container
    _initGlob.container = options !== undefined && 'container' in options
            ? options.container : "";

    

    
    return _initGlob.output;
}

PL.init = function(appInstance, initOptions) {

// app is more conventional than appInstance (used in exec script and app templates)
var app = appInstance;

initOptions = initOptions || {};

if ('fadeAnnotations' in initOptions) {
    _pGlob.fadeAnnotations = initOptions.fadeAnnotations;
}



var vr_available;

// utility function envoked by almost all V3D-specific puzzles
// filter off some non-mesh types
function notIgnoredObj(obj) {
    return obj.type !== 'AmbientLight' &&
           obj.name !== '' &&
           !(obj.isMesh && obj.isMaterialGeneratedMesh) &&
           !obj.isAuxClippingMesh;
}


// utility function envoked by almost all V3D-specific puzzles
// find first occurence of the object by its name
function getObjectByName(objName) {
    var objFound;
    var runTime = _pGlob !== undefined;
    objFound = runTime ? _pGlob.objCache[objName] : null;

    if (objFound && objFound.name === objName)
        return objFound;

    if (appInstance.scene) {
        appInstance.scene.traverse(function(obj) {
            if (!objFound && notIgnoredObj(obj) && (obj.name == objName)) {
                objFound = obj;
                if (runTime) {
                    _pGlob.objCache[objName] = objFound;
                }
            }
        });
    }
    return objFound;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects on the scene
function getAllObjectNames() {
    var objNameList = [];
    appInstance.scene.traverse(function(obj) {
        if (notIgnoredObj(obj))
            objNameList.push(obj.name)
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects which belong to the group
function getObjectNamesByGroupName(targetGroupName) {
    var objNameList = [];
    appInstance.scene.traverse(function(obj){
        if (notIgnoredObj(obj)) {
            var groupNames = obj.groupNames;
            if (!groupNames)
                return;
            for (var i = 0; i < groupNames.length; i++) {
                var groupName = groupNames[i];
                if (groupName == targetGroupName) {
                    objNameList.push(obj.name);
                }
            }
        }
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// process object input, which can be either single obj or array of objects, or a group
function retrieveObjectNames(objNames) {
    var acc = [];
    retrieveObjectNamesAcc(objNames, acc);
    return acc.filter(function(name) {
        return name;
    });
}

function retrieveObjectNamesAcc(currObjNames, acc) {
    if (typeof currObjNames == "string") {
        acc.push(currObjNames);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "GROUP") {
        var newObj = getObjectNamesByGroupName(currObjNames[1]);
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "ALL_OBJECTS") {
        var newObj = getAllObjectNames();
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames)) {
        for (var i = 0; i < currObjNames.length; i++)
            retrieveObjectNamesAcc(currObjNames[i], acc);
    }
}

// outline puzzle
function outline(objSelector, doWhat) {
    var objNames = retrieveObjectNames(objSelector);

    if (!appInstance.postprocessing || !appInstance.postprocessing.outlinePass)
        return;
    var outlineArray = appInstance.postprocessing.outlinePass.selectedObjects;
    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i];
        var obj = getObjectByName(objName);
        if (!obj)
            continue;
        if (doWhat == "ENABLE") {
            if (outlineArray.indexOf(obj) == -1)
                outlineArray.push(obj);
        } else {
            var index = outlineArray.indexOf(obj);
            if (index > -1)
                outlineArray.splice(index, 1);
        }
    }
}

function _checkListenersSame(target0, type0, listener0, optionsOrUseCapture0,
        target1, type1, listener1, optionsOrUseCapture1) {
    const capture0 = Boolean(optionsOrUseCapture0 instanceof Object
            ? optionsOrUseCapture0.capture : optionsOrUseCapture0);
    const capture1 = Boolean(optionsOrUseCapture1 instanceof Object
            ? optionsOrUseCapture1.capture : optionsOrUseCapture1);
    return target0 === target1 && type0 === type1 && listener0 === listener1
            && capture0 === capture1;
}

/**
 * Add the specified event listener to the specified target. This function also
 * stores listener data for easier disposing.
 */
function bindListener(target, type, listener, optionsOrUseCapture) {
    const alreadyExists = _pGlob.eventListeners.some(elem => {
        return _checkListenersSame(elem.target, elem.type, elem.listener,
                elem.optionsOrUseCapture, target, type, listener,
                optionsOrUseCapture);
    });

    if (!alreadyExists) {
        target.addEventListener(type, listener, optionsOrUseCapture);
        _pGlob.eventListeners.push({ target, type, listener, optionsOrUseCapture });
    }
}

// utility function used by the whenClicked, whenHovered and whenDraggedOver puzzles
function initObjectPicking(callback, eventType, mouseDownUseTouchStart, mouseButtons) {

    var elem = appInstance.renderer.domElement;
    bindListener(elem, eventType, pickListener);

    if (eventType == 'mousedown') {

        var touchEventName = mouseDownUseTouchStart ? 'touchstart' : 'touchend';
        bindListener(elem, touchEventName, pickListener);

    } else if (eventType == 'dblclick') {

        var prevTapTime = 0;

        function doubleTapCallback(event) {

            var now = new Date().getTime();
            var timesince = now - prevTapTime;

            if (timesince < 600 && timesince > 0) {

                pickListener(event);
                prevTapTime = 0;
                return;

            }

            prevTapTime = new Date().getTime();
        }

        var touchEventName = mouseDownUseTouchStart ? 'touchstart' : 'touchend';
        bindListener(elem, touchEventName, doubleTapCallback);
    }

    var raycaster = new v3d.Raycaster();

    function pickListener(event) {

        // to handle unload in loadScene puzzle
        if (!appInstance.getCamera())
            return;

        event.preventDefault();

        var xNorm = 0, yNorm = 0;
        if (event instanceof MouseEvent) {
            if (mouseButtons && mouseButtons.indexOf(event.button) == -1)
                return;
            xNorm = event.offsetX / elem.clientWidth;
            yNorm = event.offsetY / elem.clientHeight;
        } else if (event instanceof TouchEvent) {
            var rect = elem.getBoundingClientRect();
            xNorm = (event.changedTouches[0].clientX - rect.left) / rect.width;
            yNorm = (event.changedTouches[0].clientY - rect.top) / rect.height;
        }

        _pGlob.screenCoords.x = xNorm * 2 - 1;
        _pGlob.screenCoords.y = -yNorm * 2 + 1;
        raycaster.setFromCamera(_pGlob.screenCoords, appInstance.getCamera(true));
        var objList = [];
        appInstance.scene.traverse(function(obj){objList.push(obj);});
        var intersects = raycaster.intersectObjects(objList, false);
        callback(intersects, event);
    }
}

function objectsIncludeObj(objNames, testedObjName) {
    if (!testedObjName) return false;

    for (var i = 0; i < objNames.length; i++) {
        if (testedObjName == objNames[i]) {
            return true;
        } else {
            // also check children which are auto-generated for multi-material objects
            var obj = getObjectByName(objNames[i]);
            if (obj && obj.type == "Group") {
                for (var j = 0; j < obj.children.length; j++) {
                    if (testedObjName == obj.children[j].name) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// utility function used by the whenClicked, whenHovered, whenDraggedOver, and raycast puzzles
function getPickedObjectName(obj) {
    // auto-generated from a multi-material object, use parent name instead
    if (obj.isMesh && obj.isMaterialGeneratedMesh && obj.parent) {
        return obj.parent.name;
    } else {
        return obj.name;
    }
}

// whenHovered puzzle
initObjectPicking(function(intersects, event) {

    var prevHovered = _pGlob.hoveredObject;
    var currHovered = '';

    // the event might happen before hover registration
    _pGlob.objHoverInfo = _pGlob.objHoverInfo || [];

    // search for closest hovered object

    var lastIntersectIndex = Infinity;
    _pGlob.objHoverInfo.forEach(function(el) {
        var maxIntersects = el.xRay ? intersects.length : Math.min(1, intersects.length);

        for (var i = 0; i < maxIntersects; i++) {
            var obj = intersects[i].object;
            var objName = getPickedObjectName(obj);

            if (objectsIncludeObj(retrieveObjectNames(el.objSelector), objName) && i <= lastIntersectIndex) {
                currHovered = objName;
                lastIntersectIndex = i;
            }
        }
    });

    if (prevHovered == currHovered) return;

    // first - all "out" callbacks, then - all "over"
    _pGlob.objHoverInfo.forEach(function(el) {
        if (objectsIncludeObj(retrieveObjectNames(el.objSelector), prevHovered)) {
            // ensure the correct value of the hoveredObject block
            _pGlob.hoveredObject = prevHovered;
            el.callbacks[1](event);
        }
    });

    _pGlob.objHoverInfo.forEach(function(el) {
        if (objectsIncludeObj(retrieveObjectNames(el.objSelector), currHovered)) {
            // ensure the correct value of the hoveredObject block
            _pGlob.hoveredObject = currHovered;
            el.callbacks[0](event);
        }
    });

    _pGlob.hoveredObject = currHovered;
}, 'mousemove', false);

// whenHovered puzzle
function registerOnHover(objSelector, xRay, cbOver, cbOut) {

    _pGlob.objHoverInfo = _pGlob.objHoverInfo || [];

    _pGlob.objHoverInfo.push({
        objSelector: objSelector,
        callbacks: [cbOver, cbOut],
        xRay: xRay
    });
}

function findUniqueObjectName(name) {
    function objNameUsed(name) {
        return Boolean(getObjectByName(name));
    }
    while (objNameUsed(name)) {
        var r = name.match(/^(.*?)(\d+)$/);
        if (!r) {
            name += "2";
        } else {
            name = r[1] + (parseInt(r[2], 10) + 1);
        }
    }
    return name;
}

// addAnnotation and removeAnnotation puzzles
function handleAnnot(add, annot, objSelector, contents, id, name) {
    var objNames = retrieveObjectNames(objSelector);

    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i];
        if (!objName)
            continue;
        var obj = getObjectByName(objName);
        if (!obj)
            continue;
        // check if it already has an annotation and remove it
        for (var j = 0; j < obj.children.length; j++) {
            var child = obj.children[j];
            if (child.type == "Annotation") {
                // delete all childs of annotation
                child.traverse(function(child2) {
                    if (child2.isAnnotation)
                        child2.dispose();
                    });
                obj.remove(child);
            }
        }
        if (add) {
            var aObj = new v3d.Annotation(appInstance.container, annot, contents);
            aObj.name = findUniqueObjectName(name ? name : annot);
            aObj.fadeObscured = _pGlob.fadeAnnotations;
            if (id) {
                aObj.annotation.id = id;
                aObj.annotationDialog.id = id+'_dialog';
            }
            obj.add(aObj);
        }
    }
}

// checkVRMode puzzle
function checkVRMode(availableCb, unAvailableCb) {
    v3d.Detector.checkWebXR('immersive-vr', availableCb, unAvailableCb);
}

// snapToObject puzzle
function snapToObject(objName, targetObjName) {
    if (!objName || !targetObjName)
        return;
    var obj = getObjectByName(objName);
    var targetObj = getObjectByName(targetObjName);
    if (!obj || !targetObj)
        return;
    obj.copyTransform(targetObj);
    obj.updateMatrixWorld(true);
}

// makeParent puzzle
function makeParent(objName, targetObjName) {
    if (!objName)
        return;
    var obj = getObjectByName(objName);
    if (!obj)
        return;
    if (targetObjName && targetObjName !== LIST_NONE) {
        var targetObj = getObjectByName(targetObjName);
        if (!targetObj)
            return;
    } else {
        obj.traverseAncestors(function(ancObj) {
            if (ancObj.type == "Scene")
                targetObj = ancObj;
        });
    }
    var matOffset = new v3d.Matrix4();
    matOffset.copy(targetObj.matrixWorld).invert();
    matOffset.multiply(obj.matrixWorld);
    matOffset.decompose(obj.position, obj.quaternion, obj.scale);
    targetObj.add(obj);

    obj.updateMatrixWorld(true);
}

function _pGetInputSource(controller) {
    if (controller && controller.userData.inputSource) {
        return controller.userData.inputSource
    } else {
        return null;
    }
};

function _pTraverseNonControllers(obj, callback) {

    if (obj.name.startsWith('XR_CONTROLLER_'))
        return;

    callback(obj);

    var children = obj.children;

    for (var i = 0, l = children.length; i < l; i++) {

        _pTraverseNonControllers(children[i], callback);

    }

};

function _pXRGetIntersections(controller) {

    controller.updateMatrixWorld(true);

    _pGlob.mat4Tmp.identity().extractRotation(controller.matrixWorld);

    var objList = [];

    _pTraverseNonControllers(appInstance.scene, function(obj) {
        objList.push(obj);
    });

    var raycaster = new v3d.Raycaster();
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(_pGlob.mat4Tmp);

    return raycaster.intersectObjects(objList, false);

}

function _pXROnSelect(event) {

    if (!_pGlob.objClickInfo)
        return;

    var controller = event.target;

    var intersections = _pXRGetIntersections(controller);

    if (intersections.length > 0) {
        var intersection = intersections[0];
        var obj = intersection.object;

        // save the object for the pickedObject block
        _pGlob.pickedObject = getPickedObjectName(obj);

        _pGlob.objClickInfo.forEach(function(el) {
            var isPicked = obj && objectsIncludeObj(retrieveObjectNames(el.objSelector), getPickedObjectName(obj));
            el.callbacks[isPicked ? 0 : 1]();
        });
    } else {
        _pGlob.objClickInfo.forEach(function(el) {
            // missed
            el.callbacks[1]();
        });
    }

}

/**
 * Remove the specified event listener from the specified target.
 */
function unbindListener(target, type, listener, optionsOrUseCapture) {
    const index = _pGlob.eventListeners.findIndex(elem => {
        return _checkListenersSame(elem.target, elem.type, elem.listener,
            elem.optionsOrUseCapture, target, type, listener,
            optionsOrUseCapture);
    });

    if (index !== -1) {
        target.removeEventListener(type, listener, optionsOrUseCapture);
        _pGlob.eventListeners.splice(index, 1);
    }
}

// enterVRMode puzzle
function enterVRMode(refSpace, enterCb, exitCb, unAvailableCb) {

    var DEFAULT_DEPTH = 10;

    var _rayReticleDepth = [];
    var _hoveredObjects = [];

    function onControllerHover() {

        var controllers = appInstance.xrControllers;

        for (var i = 0; i < controllers.length; i++) {
            var controller = controllers[i];

            var intersections = _pXRGetIntersections(controller);

            if (intersections.length > 0) {
                var intersection = intersections[0];
                var obj = intersection.object;
                _rayReticleDepth[i] = intersection.distance;
            } else {
                var obj = null;
                _rayReticleDepth[i] = DEFAULT_DEPTH;
            }

            controller.children.forEach(function(child) {
                if (child.name.indexOf('_RAY') > -1) {
                    child.scale.z = _rayReticleDepth[i];
                } else if (child.name.indexOf('_RETICLE') > -1) {
                    // reduces crossing artefacts
                    child.position.z = -0.95 * _rayReticleDepth[i];
                }
            });

            var prevHovered = _hoveredObjects[i];
            var currHovered = obj ? getPickedObjectName(obj) : '';

            if (prevHovered == currHovered) {
                continue;
            }

            // first - all "out" callbacks, then - all "over"
            _pGlob.objHoverInfo.forEach(function(el) {
                if (objectsIncludeObj(retrieveObjectNames(el.objSelector), prevHovered)) {
                    // ensure the correct value of the hoveredObject block
                    _pGlob.hoveredObject = prevHovered;
                    el.callbacks[1]();
                }
            });

            _pGlob.objHoverInfo.forEach(function(el) {
                if (objectsIncludeObj(retrieveObjectNames(el.objSelector), currHovered)) {
                    // ensure the correct value of the hoveredObject block
                    _pGlob.hoveredObject = currHovered;
                    el.callbacks[0]();
                }
            });

            _hoveredObjects[i] = currHovered;
        }
    }

    switch (refSpace) {
        case 'SITTING':
            var referenceSpace = 'local-floor';
            break;
        case 'WALKING':
            var referenceSpace = 'unbounded';
            break;
        case 'ORIGIN':
            var referenceSpace = 'local';
            break;
        case 'ROOM':
            var referenceSpace = 'bounded-floor';
            break;
        case 'VIEWER':
            var referenceSpace = 'viewer';
            break;
        default:
            console.error('puzzles: Wrong VR reference space');
            return;
    }

    appInstance.initWebXR('immersive-vr', referenceSpace, function() {

        var controllers = appInstance.xrControllers;

        for (var i = 0; i < controllers.length; i++) {
            var controller = controllers[i];

            // clicks
            bindListener(controller, 'select', _pXROnSelect);

            _pGlob.xrSessionCallbacks.forEach(function(pair) {
                bindListener(controller, pair[0], pair[1]);
            });
        }

        // hovers
        if (_pGlob.objHoverInfo && _pGlob.objHoverInfo.length && appInstance.renderCallbacks.indexOf(onControllerHover) == -1)
            appInstance.renderCallbacks.push(onControllerHover);

        _pGlob.xrSessionAcquired = true;

        enterCb();

    }, unAvailableCb, function() {

        var controllers = appInstance.xrControllers;

        for (var i = 0; i < controllers.length; i++) {
            var controller = controllers[i];

            unbindListener(controller, 'select', _pXROnSelect);

            _pGlob.xrSessionCallbacks.forEach(function(pair) {
                unbindListener(controller, pair[0], pair[1]);
            });
        }

        var cbIdx = appInstance.renderCallbacks.indexOf(onControllerHover);
        if (cbIdx != -1)
            appInstance.renderCallbacks.splice(cbIdx, 1);

        _pGlob.xrSessionAcquired = false;

        // to cleanup supplementary XR_CAMERA_CONTROL_OBJECT
        _pGlob.objCache = {};

        exitCb();
    });
}

// whenClicked puzzle
function registerOnClick(objSelector, xRay, doubleClick, mouseButtons, cbDo, cbIfMissedDo) {

    // for AR/VR
    _pGlob.objClickInfo = _pGlob.objClickInfo || [];

    _pGlob.objClickInfo.push({
        objSelector: objSelector,
        callbacks: [cbDo, cbIfMissedDo]
    });

    initObjectPicking(function(intersects, event) {

        var isPicked = false;

        var maxIntersects = xRay ? intersects.length : Math.min(1, intersects.length);

        for (var i = 0; i < maxIntersects; i++) {
            var obj = intersects[i].object;
            var objName = getPickedObjectName(obj);
            var objNames = retrieveObjectNames(objSelector);

            if (objectsIncludeObj(objNames, objName)) {
                // save the object for the pickedObject block
                _pGlob.pickedObject = objName;
                isPicked = true;
                cbDo(event);
            }
        }

        if (!isPicked) {
            _pGlob.pickedObject = '';
            cbIfMissedDo(event);
        }

    }, doubleClick ? 'dblclick' : 'mousedown', false, mouseButtons);
}


registerOnHover('Cube', false, function() {
  outline('Cube', 'ENABLE');
  console.log('VR ON');
}, function() {
  outline('Cube', 'DISABLE');
});

checkVRMode(function() {
  vr_available = true;
  console.log('VR ON');
  handleAnnot(true, '1', 'Cube', 'VR ON', 'poi1', undefined);
}, function() {
  handleAnnot(true, '2', 'Cube', 'VR OFF', 'poi1', undefined);
  console.log('VR OFF');
  vr_available = false;
});

registerOnClick('Cube', false, false, [0,1,2], function() {
  if (vr_available == true) {
    enterVRMode('ORIGIN', function() {
      snapToObject('Camera', 'PLAYER');
      makeParent('Camera', 'PLAYER');
    }, function() {
      makeParent('Camera', '');
    }, function() {
      console.log('Hello, Verge!');
    });
  } else {
  }
}, function() {});



} // end of PL.init function

PL.disposeListeners = function() {
    if (_pGlob) {
        _pGlob.eventListeners.forEach(({ target, type, listener, optionsOrUseCapture }) => {
            target.removeEventListener(type, listener, optionsOrUseCapture);
        });
        _pGlob.eventListeners.length = 0;
    }
}

PL.dispose = function() {
    PL.disposeListeners();
    _pGlob = null;
    // backward compatibility
    if (v3d[Symbol.toStringTag] !== 'Module') {
        delete v3d.PL;
        delete v3d.puzzles;
    }
}



return PL;

}

export { createPL };

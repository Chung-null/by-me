import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';



export async function makeConveyor(): Promise<Mesh> {
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    let loadedGUI = await advancedTexture.parseFromSnippetAsync("L91IFF#82"); //L91IFF#73, L91IFF#76, L91IFF#75
    advancedTexture.idealWidth = 1920;
    advancedTexture.idealHeight = 1080;
    //Close all
    let warehouseInfo = advancedTexture.getControlByName("WarehouseInfo");
    warehouseInfo.isVisible = false;
    let conveyorbeltInfo = advancedTexture.getControlByName("ConveyorbeltInfo");
    conveyorbeltInfo.isVisible = false;
    let boxInfo = advancedTexture.getControlByName("BoxInfo");
    boxInfo.isVisible = false;
    let palletInfo = advancedTexture.getControlByName("PalletInfo");
    palletInfo.isVisible = false;
    let location = advancedTexture.getControlByName("Location");
    location.isVisible = false;
    let listMenuShelf = advancedTexture.getControlByName("ListMenuShelf");
    listMenuShelf.isVisible = false;
    let shelfWareInfo = advancedTexture.getControlByName("ShelfWareInfo");
    shelfWareInfo.isVisible = false;
    let infomationinfobox = advancedTexture.getControlByName("InformationInfoBox");
    infomationinfobox.isVisible = false;
    let infomationinfoshelf = advancedTexture.getControlByName("InformationInfoShelf");
    infomationinfoshelf.isVisible = false;




    //Event click button Shelfinfo
    let buttonConveyor = advancedTexture.getControlByName("ButtonConveyor");
    buttonConveyor.onPointerClickObservable.add(() => {
        conveyorbeltInfo.isVisible = true;
        buttonConveyor.isVisible = true;
    });

    let btnaddconve = advancedTexture.getControlByName("BtnAddConve");
    let btndeleteconve = advancedTexture.getControlByName("BtnDeleteConve");
    let btneditconve = advancedTexture.getControlByName("BtnEditConve");
    let btncloseconve = advancedTexture.getControlByName("BtnCloseConve");

    btncloseconve.onPointerUpObservable.add(() => {
        conveyorbeltInfo.isVisible = false;
        buttonConveyor.isVisible = true;
    });


    var startingConveyor;
    var currentConveyor;
    var outlineconveyor;
    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (conveyor) { return conveyor == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (conveyor) {
        if (currentConveyor) {
            // currentConveyor.material.wireframe = false;
            // outlineconveyor
            outlineconveyor = currentConveyor;
            outlineconveyor.renderOutline = false;
        }

        currentConveyor = conveyor;
        // currentConveyor.material.wireframe = true;
        // outlineconveyor
        outlineconveyor = currentConveyor;
        outlineconveyor.outlineWidth = 0.2;
        outlineconveyor.outlineColor = Color3.Green();
        outlineconveyor.renderOutline = true;

        startingConveyor = getGroundPosition();
        if (startingConveyor) { // we need to disconnect camera from canvas
            setTimeout(function () {
                // camera.detachControl(canvas);
            }, 0);

        }

    }
    var pointerUp = function () {
        if (startingConveyor) {
            // currentConveyor.material.wireframe = false;

            // // outlineconveyor
            // outlineconveyor = currentConveyor;
            // outlineconveyor.renderOutline = false;
            // camera.attachControl(canvas, true);
            startingConveyor = null;
            return;
        }
    }
    var pointerMove = function () {
        if (!startingConveyor) {
            return;
        }
        var current = getGroundPosition();
        if (!current) {
            return;
        }

        var diff = current.subtract(startingConveyor);
        currentConveyor.position.addInPlace(diff);

        startingConveyor = current;

    }
    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:

                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                break;
            case PointerEventTypes.POINTERUP:
                pointerUp();
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
        }
    });

    var position = 1;
    var conveyor;
    var palletes = [];

    // Add an event listener to the button
    btnaddconve.onPointerClickObservable.add(async () => {
        // Import the conveyor
        const result = await SceneLoader.ImportMeshAsync(null, "conveyor/", "conveyor.obj", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });
        conveyor = result.meshes[0];
        if (position != 1) {
            conveyor.position.x += position;
        }
        else {
            conveyor.position.x += 4;
        }

        position = conveyor.position.x + 4;


        palletes.push(conveyor);
        // console.log("conveyor button " + palletes.length);
    });
    btneditconve.onPointerClickObservable.add(() => {
        // Initialize GizmoManager
        var gizmoManager = new GizmoManager(scene)
        gizmoManager.boundingBoxGizmoEnabled = true
        // Restrict gizmos to only spheres
        gizmoManager.attachableMeshes = palletes
        // Toggle gizmos with keyboard buttons
        document.onkeydown = (e) => {
            if (e.key == 'w') {
                gizmoManager.positionGizmoEnabled = !gizmoManager.positionGizmoEnabled
            }
            if (e.key == 'e') {
                gizmoManager.rotationGizmoEnabled = !gizmoManager.rotationGizmoEnabled
            }
            if (e.key == 'r') {
                gizmoManager.scaleGizmoEnabled = !gizmoManager.scaleGizmoEnabled
            }
            if (e.key == 'q') {
                gizmoManager.boundingBoxGizmoEnabled = !gizmoManager.boundingBoxGizmoEnabled
            }
        }
    })
    // delete selected palletes
    btndeleteconve.onPointerClickObservable.add(() => {
        if (currentConveyor != null) {
            currentConveyor.dispose();
            currentConveyor = null;
        }
    });

    return conveyor
}

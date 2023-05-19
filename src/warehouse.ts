import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';



export async function makeWare(): Promise<Mesh> {
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    let loadedGUI = await advancedTexture.parseFromSnippetAsync("L91IFF#54"); //L91IFF#54, L91IFF#53
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


    //Event click button Shelfinfo
    let shelfWareInfo = advancedTexture.getControlByName("ShelfWareInfo");
    shelfWareInfo.isVisible = false;

    let buttonWarehouse = advancedTexture.getControlByName("ButtonWarehouse");
    buttonWarehouse.onPointerClickObservable.add(() => {
        warehouseInfo.isVisible = true;
        buttonWarehouse.isVisible = true;
    });

    let btnaddware = advancedTexture.getControlByName("BtnAddWare");
    let btndeleteware = advancedTexture.getControlByName("BtnDeleteWare");
    let btneditware = advancedTexture.getControlByName("BtnEditWare");
    let btncloseware = advancedTexture.getControlByName("BtnCloseWare");

    btncloseware.onPointerUpObservable.add(() => {
        warehouseInfo.isVisible = false;
        buttonWarehouse.isVisible = true;
    });


    var startingWare;
    var currentWare;
    var outlineware;
    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (house) { return house == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (house) {
        if (currentWare) {
            // currentMesh.material.wireframe = false;
            // outline
            outlineware = currentWare;
            outlineware.renderOutline = false;
        }

        currentWare = house;
        // currentMesh.material.wireframe = true;
        // outline
        outlineware = currentWare;
        outlineware.outlineWidth = 0.2;
        outlineware.outlineColor = Color3.Green();
        outlineware.renderOutline = true;

        startingWare = getGroundPosition();
        if (startingWare) { // we need to disconnect camera from canvas
            setTimeout(function () {
                // camera.detachControl(canvas);
            }, 0);

        }

    }
    var pointerUp = function () {
        if (startingWare) {
            // currentMesh.material.wireframe = false;

            // // outline
            // outline = currentMesh;
            // outline.renderOutline = false;
            // camera.attachControl(canvas, true);
            startingWare = null;
            return;
        }
    }
    var pointerMove = function () {
        if (!startingWare) {
            return;
        }
        var current = getGroundPosition();
        if (!current) {
            return;
        }

        var diff = current.subtract(startingWare);
        currentWare.position.addInPlace(diff);

        startingWare = current;

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
    var ware;
    var wares = [];

    // Add an event listener to the button
    btnaddware.onPointerClickObservable.add(async () => {
        // Import the mesh
        const result = await SceneLoader.ImportMeshAsync(null, "warehouse/", "warehouse.glb", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });
        ware = result.meshes[0];
        if (position != 1) {
            ware.position.x += position;
        }
        else {
            ware.position.x += 4;
        }

        position = ware.position.x + 4;


        wares.push(ware);
        // console.log("mesh button " + meshes.length);
    });
    btneditware.onPointerClickObservable.add(() => {
        // Initialize GizmoManager
        var gizmoManager = new GizmoManager(scene)
        gizmoManager.boundingBoxGizmoEnabled = true
        // Restrict gizmos to only spheres
        gizmoManager.attachableMeshes = wares
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
    // delete selected meshes
    btndeleteware.onPointerClickObservable.add(() => {
        if (currentWare != null) {
            currentWare.dispose();
            currentWare = null;
        }
    });

    return ware
}

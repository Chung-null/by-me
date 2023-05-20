import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';



export async function makePallet(): Promise<Mesh> {
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
    let shelfWareInfo = advancedTexture.getControlByName("ShelfWareInfo");
    shelfWareInfo.isVisible = false;



    //Event click button Shelfinfo
    let buttonPallet = advancedTexture.getControlByName("ButtonPallet");
    buttonPallet.onPointerClickObservable.add(() => {
        palletInfo.isVisible = true;
        buttonPallet.isVisible = true;
    });

    let btnaddpallet = advancedTexture.getControlByName("BtnAddPallet");
    let btndeletepallet = advancedTexture.getControlByName("BtnDeletePallet");
    let btneditpallet = advancedTexture.getControlByName("BtnEditPallet");
    let btnclosepallet = advancedTexture.getControlByName("BtnClosePallet");

    btnclosepallet.onPointerUpObservable.add(() => {
        palletInfo.isVisible = false;
        buttonPallet.isVisible = true;
    });


    var startingPallet;
    var currentPallet;
    var outlinepallet;
    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (pallet) { return pallet == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (pallet) {
        if (currentPallet) {
            // currentPallet.material.wireframe = false;
            // outlinepallet
            outlinepallet = currentPallet;
            outlinepallet.renderOutline = false;
        }

        currentPallet = pallet;
        // currentPallet.material.wireframe = true;
        // outlinepallet
        outlinepallet = currentPallet;
        outlinepallet.outlineWidth = 0.2;
        outlinepallet.outlineColor = Color3.Green();
        outlinepallet.renderOutline = true;

        startingPallet = getGroundPosition();
        if (startingPallet) { // we need to disconnect camera from canvas
            setTimeout(function () {
                // camera.detachControl(canvas);
            }, 0);

        }

    }
    var pointerUp = function () {
        if (startingPallet) {
            // currentPallet.material.wireframe = false;

            // // outlinepallet
            // outlinepallet = currentPallet;
            // outlinepallet.renderOutline = false;
            // camera.attachControl(canvas, true);
            startingPallet = null;
            return;
        }
    }
    var pointerMove = function () {
        if (!startingPallet) {
            return;
        }
        var current = getGroundPosition();
        if (!current) {
            return;
        }

        var diff = current.subtract(startingPallet);
        currentPallet.position.addInPlace(diff);

        startingPallet = current;

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
    var pallet;
    var palletes = [];

    // Add an event listener to the button
    btnaddpallet.onPointerClickObservable.add(async () => {
        // Import the pallet
        const result = await SceneLoader.ImportMeshAsync(null, "pallet/", "pallet.glb", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });
        pallet = result.meshes[0];
        if (position != 1) {
            pallet.position.x += position;
        }
        else {
            pallet.position.x += 4;
        }

        position = pallet.position.x + 4;


        palletes.push(pallet);
        // console.log("pallet button " + palletes.length);
    });
    btneditpallet.onPointerClickObservable.add(() => {
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
    btndeletepallet.onPointerClickObservable.add(() => {
        if (currentPallet != null) {
            currentPallet.dispose();
            currentPallet = null;
        }
    });

    return pallet
}

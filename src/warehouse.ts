import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';

export async function makeWare(): Promise<Mesh> {
    var startingWare;
    var currentWare;
    var outlineware;
    var position = 1;
    var ware;
    var wares = [];
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    let loadedGUI = await advancedTexture.parseFromSnippetAsync("L91IFF#95");
    advancedTexture.idealWidth = 1920;
    advancedTexture.idealHeight = 1080;
    //Close all
    let location = advancedTexture.getControlByName("Location");
    location.isVisible = false;
    let listMenuShelf = advancedTexture.getControlByName("ListMenuShelf");
    listMenuShelf.isVisible = false;
    let listMenuBox = advancedTexture.getControlByName("ListMenuBox")
    listMenuBox.isVisible = false;
    let btndelete = advancedTexture.getControlByName("BtnDelete")
    let listexportbox = advancedTexture.getControlByName("ListExportBox");
    listexportbox.isVisible = false;

    async function createWarehouse() {
        // Import the pallet
        const result = await SceneLoader.ImportMeshAsync(null, "warehouse/", "eton.obj", scene, function (container) {
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
    }

    //Add Warehouse
    let buttonWarehouse = advancedTexture.getControlByName("ButtonWarehouse");
    buttonWarehouse.onPointerClickObservable.add(async() => {
        const ware = await createWarehouse();
    });

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
            // // outline
            camera.attachControl(canvas, true);
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
    // delete selected meshes
    btndelete.onPointerClickObservable.add(() => {
        if (currentWare != null) {
            currentWare.dispose();
            currentWare = null;
        }
    });

    return ware
}

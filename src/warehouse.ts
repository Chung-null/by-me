import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';
import { handlers } from './api/handlers';
import { round2 } from './util';
import { InputText } from '@babylonjs/gui';

export async function makeWare(): Promise<Mesh> {
    var startingWare;
    var currentWare;
    var outlineware;
    var position = 1;
    var ware;
    var wares = [];
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    let loadedGUI = await advancedTexture.parseFromSnippetAsync("D04P4Z#119");
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
    let listeditshelf = advancedTexture.getControlByName("ListEditShelf");
    listeditshelf.isVisible = false;
    //Get Location Object
    let txtXposition = <InputText>advancedTexture.getControlByName("InputTextX");
    let txtYposition = <InputText>advancedTexture.getControlByName("InputTextY");
    let txtZposition = <InputText>advancedTexture.getControlByName("InputTextZ");
    // handle API
    let handler = new handlers()
    async function syncWarehouseFromDB() {
        let allWarehouseOnDB = await handler.get("warehouse")
        if (allWarehouseOnDB.status == 200) {
            allWarehouseOnDB.content.forEach(async function (element) {
                if (wares.filter(ware => ware.id == element.id).length == 0) {// unique on array
                    let wareSync = await createWarehouse(element.id, new Vector3(element.x, element.y, element.z))
                    wares.push(wareSync)
                }
            });
        }
    }
    async function createWarehouse(id, positionWarehouse: Vector3) {
        // Import the pallet
        const result = await SceneLoader.ImportMeshAsync(null, "warehouse/", "warehouseeton.obj", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });
        ware = result.meshes[2];
        ware.position = positionWarehouse
        ware.id = id

        return ware
    }

    //Add Warehouse
    let buttonWarehouse = advancedTexture.getControlByName("ButtonWarehouse");
    buttonWarehouse.onPointerClickObservable.add(async () => {
        let positionWarehouse = new Vector3()
        if (position != 1) {
            positionWarehouse.x += position;
        }
        else {
            positionWarehouse.x += 4;
        }

        position = positionWarehouse.x + 4;
        let resultPost = await handler.postConveyor(positionWarehouse.x, positionWarehouse.y, positionWarehouse.z)
        if (resultPost.status == 201) {
            let ware = await createWarehouse(resultPost.content.nid, positionWarehouse);
            wares.push(ware)
        }
    });

    var getGroundPositionWare = function () {
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
            location.isVisible = false
            txtXposition.text = "";
            txtYposition.text = "";
            txtZposition.text = "";
        }

        currentWare = house;
        // currentMesh.material.wireframe = true;
        // outline
        outlineware = currentWare;
        outlineware.outlineWidth = 0.2;
        outlineware.outlineColor = Color3.Green();
        outlineware.renderOutline = true;

        startingWare = getGroundPositionWare();
        if (startingWare) { // we need to disconnect camera from canvas
            setTimeout(function () {
                // camera.detachControl(canvas);
            }, 0);

        }

    }
    var pointerUp = async function () {
        if (startingWare) {
            // // outline
            outlineware = currentWare;
            outlineware.renderOutline = false;
            camera.attachControl(canvas, true);
            startingWare = null;
            location.isVisible = true;
            txtXposition.text = round2(currentWare.position.x) + ""
            txtYposition.text = round2(currentWare.position.y) + ""
            txtZposition.text = round2(currentWare.position.z) + ""
            if (currentWare.id) {
                await handler.putPositionWarehouse(currentWare.id, currentWare.position.x, currentWare.position.y, currentWare.position.z)
            }
            return;
        }
    }
    var pointerMove = function () {
        if (!startingWare) {
            return;
        }
        var currentware = getGroundPositionWare();
        if (!currentware) {
            return;
        }

        var diff = currentware.subtract(startingWare);
        currentWare.position.addInPlace(diff);

        startingWare = currentware;

    }
    scene.onPointerObservable.add(async (pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:

                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                else if (pointerInfo.pickInfo.pickedMesh == ground) {
                    if (currentWare) {
                        // outline
                        outlineware = currentWare;
                        outlineware.renderOutline = false;
                        location.isVisible = false
                        txtXposition.text = "";
                        txtYposition.text = "";
                        txtZposition.text = "";
                    }
                }
                break;
            case PointerEventTypes.POINTERUP:
                await pointerUp();
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
        }
    });
    // delete selected meshes
    btndelete.onPointerClickObservable.add(async () => {
        if (currentWare != null) {
            await handler.deleteBox(currentWare.id)
            currentWare.dispose();
            currentWare = null;
        }
    });
    // setInterval(syncWarehouseFromDB, 2000)
    await syncWarehouseFromDB()
    return ware
}

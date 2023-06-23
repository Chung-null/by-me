import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';
import { handlers } from './api/handlers';


export async function makeConveyor(): Promise<Mesh> {
    var startingConveyor;
    var currentConveyor;
    var outlineconveyor;
    var position = 1;
    var conveyor;
    var conveyors = [];
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
    // handle API
    let handler = new handlers()
    async function syncConveyorFromDB() {
        let allConveyorOnDB = await handler.get("conveyor")
        if (allConveyorOnDB.status == 200) {
            allConveyorOnDB.content.forEach(async function (element) {
                if (conveyors.filter(conveyor => conveyor.id == element.id).length == 0) {// unique on array
                    let conveyorSync = await createConveyor(new Vector3(element.x, element.y, element.z))
                    conveyorSync.id = element.id
                    conveyors.push(conveyorSync)
                }
            });
        }
    }
    async function createConveyor(position: Vector3) {
        const conveyorhouse = await SceneLoader.ImportMeshAsync(null, "conveyor/", "conveyor.obj", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });
        const conveyor = conveyorhouse.meshes[0];
        conveyor.position = position
        return conveyor
    }
    //Event click button Shelfinfo
    let buttonConveyor = advancedTexture.getControlByName("ButtonConveyor");
    buttonConveyor.onPointerClickObservable.add(async () => {
        let positionConveyor = new Vector3()
        // Adjust the position of the box
        if (position !== 1) {
            positionConveyor.x += position;
        } else {
            positionConveyor.x += 4;
        }

        position = positionConveyor.x + 4;
        let resultPost = await handler.postConveyor(positionConveyor.x, positionConveyor.y, positionConveyor.z)
        if (resultPost.status == 201) {
            let conve = await createConveyor(positionConveyor);
            conve.id = resultPost.content.nid
            conveyors.push(conve)
        }
    });

    var getGroundPositionConvey = function () {
        var pickinfoconveyor = scene.pick(scene.pointerX, scene.pointerY, function (conveyor) { return conveyor == ground; });
        if (pickinfoconveyor.hit) {
            return pickinfoconveyor.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (conveyor) {
        currentConveyor = conveyor;
        if (currentConveyor) {
            // outlineconveyor
            outlineconveyor = currentConveyor;
            outlineconveyor.renderOutline = false;
        }
        // currentConveyor.material.wireframe = true;
        // outlineconveyor
        outlineconveyor = currentConveyor;
        outlineconveyor.outlineWidth = 0.2;
        outlineconveyor.outlineColor = Color3.Green();
        outlineconveyor.renderOutline = true;

        startingConveyor = getGroundPositionConvey();
        if (startingConveyor) { // we need to disconnect camera from canvas
            setTimeout(function () {
                camera.detachControl(canvas);
            }, 0);

        }

    }
    var pointerUp = function () {
        if (startingConveyor) {
            outlineconveyor = currentConveyor;
            outlineconveyor.renderOutline = false;
            camera.attachControl(canvas, true);
            startingConveyor = null;
            handler.putPositionConveyor(currentConveyor.id, currentConveyor.x, currentConveyor.y, currentConveyor.z)
            return;
        }
    }
    var pointerMove = function () {
        if (!startingConveyor) {
            return;
        }
        var current = getGroundPositionConvey();
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
    // delete selected palletes
    btndelete.onPointerClickObservable.add(() => {
        if (currentConveyor != null) {
            handler.deleteConveyor(currentConveyor.id)
            currentConveyor.dispose();
            currentConveyor = null;
        }
    });
    // setInterval(syncConveyorFromDB, 2000)
    await syncConveyorFromDB()
    return conveyor
}

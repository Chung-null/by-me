import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';


export async function makeConveyor(): Promise<Mesh> {
    var startingConveyor;
    var currentConveyor;
    var outlineconveyor;
    var position = 1;
    var conveyor;
    var palletes = [];
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



    async function createConveyor() {
        const conveyorhouse = await SceneLoader.ImportMeshAsync(null, "conveyor/", "conveyor.obj", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });
        const conveyor = conveyorhouse.meshes[0];
        if (position != 1) {
            conveyor.position.x += position;
        } else {
            conveyor.position.x += 4;
        }

        position = conveyor.position.x + 4;

        palletes.push(conveyor);
    }
    //Event click button Shelfinfo
    let buttonConveyor = advancedTexture.getControlByName("ButtonConveyor");
    buttonConveyor.onPointerClickObservable.add(async () => {
        let conve = await createConveyor();
    });

    var getGroundPosition = function () {
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

        startingConveyor = getGroundPosition();
        if (startingConveyor) { // we need to disconnect camera from canvas
            setTimeout(function () {
                // camera.detachControl(canvas);
            }, 0);

        }

    }
    var pointerUp = function () {
        if (startingConveyor) {
            camera.attachControl(canvas, true);
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
    // delete selected palletes
    btndelete.onPointerClickObservable.add(() => {
        if (currentConveyor != null) {
            currentConveyor.dispose();
            currentConveyor = null;
        }
    });

    return conveyor
}

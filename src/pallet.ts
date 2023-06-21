import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';
import { handlers } from './api/handlers';



export async function makePallet(): Promise<Mesh> {
    var startingPallet;
    var currentPallet;
    var outlinepallet;
    var position = 1;
    var pallet;
    var palletes = [];
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    let loadedGUI = await advancedTexture.parseFromSnippetAsync("L91IFF#101");
    advancedTexture.idealWidth = 1920;
    advancedTexture.idealHeight = 1080;
    //Close all
    let location = advancedTexture.getControlByName("Location");
    location.isVisible = false;
    let listMenuShelf = advancedTexture.getControlByName("ListMenuShelf");
    listMenuShelf.isVisible = false;
    let listMenuBox = advancedTexture.getControlByName("ListMenuBox")
    listMenuBox.isVisible = false;
    let btndelete = advancedTexture.getControlByName("BtnDelete");
    let listexportbox = advancedTexture.getControlByName("ListExportBox");
    listexportbox.isVisible = false;
    let listeditshelf = advancedTexture.getControlByName("ListEditShelf");
    listeditshelf.isVisible = false;
    // handle API
    let handler = new handlers()

    async function syncPalletFromDB() {
        let allPalletOnDB = await handler.get("pallet")
        if (allPalletOnDB.status == 200) {
            allPalletOnDB.content.forEach(async function(element){
                if (palletes.filter(pallet => pallet.id == element.nid).length == 0) {// unique on array
                    let palletSync = await createPallet(new Vector3(element.x, element.y, element.z))
                    palletSync.id = element.nid
                    palletes.push(palletSync)
                }
            });
        }
    }
    async function createPallet(position: Vector3) {
        // Import the pallet
        const result = await SceneLoader.ImportMeshAsync(null, "pallet/", "palleteton.obj", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });
        pallet = result.meshes[0]
        pallet.position = position
        return pallet
    }

    //Event click button Shelfinfo
    let buttonPallet = advancedTexture.getControlByName("ButtonPallet");
    buttonPallet.onPointerClickObservable.add(async() => {
        let positionPallet = new Vector3()
        // Adjust the position of the box
        if (position !== 1) {
            positionPallet.x += position;
        } else {
            positionPallet.x += 4;
        }

        position = positionPallet.x + 4;
        let resultPost = await handler.postPallet(positionPallet.x,positionPallet.y, positionPallet.z)
        if (resultPost.status == 201) {
            let pallet = await createPallet(positionPallet);
            pallet.id = resultPost.content[0].nid
            palletes.push(pallet)
        }
    });

    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (pallet) { return pallet == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (pallet) {
        console.log(pallet)
        console.log(palletes)
        console.log(pallet.name, "plalelel")
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
    // delete selected palletes
    btndelete.onPointerClickObservable.add(() => {
        if (currentPallet != null) {
            currentPallet.dispose();
            currentPallet = null;
        }
    });

    // setInterval(syncPalletFromDB, 2000)
    await syncPalletFromDB()

    return pallet
}

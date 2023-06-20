import { AbstractMesh, Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';
import { InputText } from '@babylonjs/gui';
import { generateUniqueRandom } from './util';


export async function makeBox(): Promise<Mesh> {
    var startingBox;
    var currentBox;
    var outlinebox;
    var position = 1;
    var box;
    var boxes = [];
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);

    let loadedGUI = await advancedTexture.parseFromSnippetAsync("L91IFF#97"); //L91IFF#73, L91IFF#76, L91IFF#75

    advancedTexture.idealWidth = 1920;
    advancedTexture.idealHeight = 1080;
    //Close all
    let location = advancedTexture.getControlByName("Location");
    location.isVisible = false;
    let listMenuShelf = advancedTexture.getControlByName("ListMenuShelf");
    listMenuShelf.isVisible = false;
    let listMenuBox = advancedTexture.getControlByName("ListMenuBox");
    listMenuBox.isVisible = false;
    let listexportbox = advancedTexture.getControlByName("ListExportBox");
    listexportbox.isVisible = false;


    let buttonListBox = advancedTexture.getControlByName("ButtonBox");
    //Get Location Object
    let txtXposition = <InputText>advancedTexture.getControlByName("InputTextX");
    let txtYposition = <InputText>advancedTexture.getControlByName("InputTextY");
    let txtZposition = <InputText>advancedTexture.getControlByName("InputTextZ");

    //Event click button Shelfinfo
    buttonListBox.onPointerClickObservable.add(() => {
        listMenuBox.isVisible = true;
    });

    let btndelete = advancedTexture.getControlByName("BtnDelete");
    let btnsaveinfobox = advancedTexture.getControlByName("ButtonSaveInfobox");
    let btnclosebox = advancedTexture.getControlByName("BtnCloseBox");

    //Get Info Box
    let txtBoxNameInfo = <InputText>advancedTexture.getControlByName("InputNameBoxinfo");
    let txtImportInfo = <InputText>advancedTexture.getControlByName("InputImportBoxinfo");
    let txtExportInfo = <InputText>advancedTexture.getControlByName("InputExportBoxinfo");


    // Function to create a box and return it as a Promise
    async function createBox() {
        // Import the box
        const result = await SceneLoader.ImportMeshAsync(null, "box/", "boxeton.obj", scene);
        const box = result.meshes[0];
        const randomNumber = generateUniqueRandom(Number.MAX_SAFE_INTEGER)
        box.name = "box" + randomNumber
        // Adjust the position of the box
        if (position !== 1) {
            box.position.x += position;
        } else {
            box.position.x += 4;
        }

        position = box.position.x + 4;

        boxes.push(box);

    }

    // Event handler for the "Add Box" button
    btnsaveinfobox.onPointerClickObservable.add(async () => {
        const box = await createBox();
        // You can perform additional actions with the created box if needed
    });

    //Close ListMenuBox
    btnclosebox.onPointerUpObservable.add(() => {
        listMenuBox.isVisible = false;
    });

    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (box) { return box == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var pointerDown = function (box: AbstractMesh) {
        try {
            if (box) {
                if (box.name.includes("box")) {
                    if (currentBox) {

                        // currentBox.material.wireframe = false;
                        // outlinebox
                        outlinebox = currentBox;
                        outlinebox.renderOutline = false;
                        location.isVisible = false
                        txtXposition.text = "";
                        txtYposition.text = "";
                        txtZposition.text = "";
                        listexportbox.isVisible = false
                    }

                    currentBox = box;
                    // outlinebox
                    outlinebox = currentBox;
                    outlinebox.outlineWidth = 0.2;
                    outlinebox.outlineColor = Color3.Green();
                    outlinebox.renderOutline = true;

                    startingBox = getGroundPosition();
                    if (startingBox) { // we need to disconnect camera from canvas
                        setTimeout(function () {
                            // camera.detachControl(canvas);
                        }, 0);

                    }
                }
            }
        }
        catch(e) {
            console.log(e)
        }
    }

    var pointerUp = function (box: AbstractMesh) {
        try {
            if (box) {
                if (box.name.includes("box")) {
                    if (startingBox) {
                        camera.attachControl(canvas, true);
                        startingBox = null;

                        location.isVisible = true;
                        txtXposition.text = currentBox.position.x.toFixed(2);
                        txtYposition.text = currentBox.position.y.toFixed(2);
                        txtZposition.text = currentBox.position.z.toFixed(2);

                        listexportbox.isVisible = true
                        return;
                    }
                }
            }
        }
        catch(e) {
            console.log(e)
        }
    }

    var pointerMove = function () {
        if (!startingBox) {
            return;
        }
        var currentbox = getGroundPosition();
        if (!currentbox) {
            return;
        }

        var diff = currentbox.subtract(startingBox);
        currentBox.position.addInPlace(diff);

        startingBox = currentbox;

    }

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:

                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh);

                }
                else if (pointerInfo.pickInfo.pickedMesh == ground) {
                    if (currentBox) {
                        // outline
                        outlinebox = currentBox;
                        outlinebox.renderOutline = false;
                        location.isVisible = false
                        txtXposition.text = "";
                        txtYposition.text = "";
                        txtZposition.text = "";
                        listexportbox.isVisible = false;
                    }
                }
                else if (pointerInfo.pickInfo.pickedMesh == ground && pointerInfo.event.button == 0) {
                    var vector = pointerInfo.pickInfo.pickedPoint;
                    console.log('left mouse click: ' + vector.x + ',' + vector.y + ',' + vector.z);
                }
                else if (pointerInfo.pickInfo.pickedMesh == ground) {
                    var vector = pointerInfo.pickInfo.pickedPoint;

                    console.log('ground click: ' + vector.x + ',' + vector.y + ',' + vector.z);
                    console.log("pointer info: " + pointerInfo.event.button);
                }

                break;
            case PointerEventTypes.POINTERUP:
                pointerUp(pointerInfo.pickInfo.pickedMesh);
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
        }
    });
    // delete selected boxes
    btndelete.onPointerClickObservable.add(() => {
        if (currentBox != null) {
            currentBox.dispose();
            currentBox = null;
        }
    });

    return box
}
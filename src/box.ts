import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';
import { InputText } from '@babylonjs/gui';

export async function makeBox(): Promise<Mesh> {
    var startingBox;
    var currentBox;
    var outlinebox;
    var position = 1;
    var box;
    var boxes = [];
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
    let buttonBox = advancedTexture.getControlByName("ButtonBox");
    buttonBox.onPointerClickObservable.add(() => {
        boxInfo.isVisible = true;
        buttonBox.isVisible = true;
    });

    let btnaddbox = advancedTexture.getControlByName("BtnAddBox");
    let btndeletebox = advancedTexture.getControlByName("BtnDeleteBox");
    let btneditbox = advancedTexture.getControlByName("BtnEditBox");
    let btnclosebox = advancedTexture.getControlByName("BtnCloseBox");
    let btnsaveinfobox = advancedTexture.getControlByName("ButtonSaveInfobox");
    //Get Info Box
    let txtBoxNameInfo = <InputText>advancedTexture.getControlByName("InputNameBoxinfo");
    let txtImportInfo = <InputText>advancedTexture.getControlByName("InputImportBoxinfo");
    let txtExportInfo = <InputText>advancedTexture.getControlByName("InputExportBoxinfo");
    //Khai báo
    let addNameBox;
    let addImportBox;
    let addExportBox;


    btnclosebox.onPointerUpObservable.add(() => {
        boxInfo.isVisible = false;
        buttonBox.isVisible = true;
    });

    var getGroundPosition = function () {
        var pickinfobox = scene.pick(scene.pointerX, scene.pointerY, function (box) { return box == ground; });
        if (pickinfobox.hit) {
            return pickinfobox.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (box) {
        if (currentBox) {
            // currentBox.material.wireframe = false;
            // outlinebox
            outlinebox = currentBox;
            outlinebox.renderOutline = false;
            infomationinfobox.isVisible = false;
            txtBoxNameInfo.text = "";
            txtImportInfo.text = "";
            txtExportInfo.text = "";
        }

        currentBox = box;
        // currentBox.material.wireframe = true;
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
    var pointerUp = function () {
        if (startingBox) {
            // currentBox.material.wireframe = false;

            // // outlinebox
            // outlinebox = currentBox;
            // outlinebox.renderOutline = false;
            camera.attachControl(canvas, true);
            infomationinfobox.isVisible = true;
            // txtBoxNameInfo.text = addNameBox.toString()
            // txtImportInfo.text = addImportBox.toString()
            // txtExportInfo.text = addExportBox.toString()
            startingBox = null;
            return;
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
                        // currentMesh.material.wireframe = false;
                        // outline
                        outlinebox = currentBox;
                        outlinebox.renderOutline = false;
                        infomationinfobox.isVisible = false;
                        txtBoxNameInfo.text = "";
                        txtImportInfo.text = "";
                        txtExportInfo.text = "";

                    }
                    // console.log("down");
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
                pointerUp();
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
        }
    });

    // Function to create box
    async function createBox(position) {
        // Import the box
        const result = await SceneLoader.ImportMeshAsync(null, "box/", "boxeton.obj", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });

        let box = result.meshes[0];
        if (position != 1) {
            box.position.x += position;
        } else {
            box.position.x += 4;
        }

        return box;
    }

    // Add an event listener to the button
    btnaddbox.onPointerClickObservable.add(async () => {
        // Create box
        let box = await createBox(position);

        // Update position for the next box
        position = box.position.x + 4;

        // Add the box to the array
        boxes.push(box);
    });

    btneditbox.onPointerClickObservable.add(() => {
        // Initialize GizmoManager
        var gizmoManager = new GizmoManager(scene)
        gizmoManager.boundingBoxGizmoEnabled = true
        // Restrict gizmos to only spheres
        gizmoManager.attachableMeshes = boxes
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
    // delete selected boxes
    btndeletebox.onPointerClickObservable.add(() => {
        if (currentBox != null) {
            currentBox.dispose();
            currentBox = null;
        }
    });

    return box
}

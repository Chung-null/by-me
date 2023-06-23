import { AbstractMesh, Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';
import { InputText } from '@babylonjs/gui';
import { generateUniqueRandom, getCurrentDate, round2 } from './util';
import { handlers } from './api/handlers';


export async function makeBox(): Promise<Mesh> {
    var startingBox;
    var currentBox;
    var outlinebox;
    var position = 1;
    var box;
    var boxes = [];
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);


    let loadedGUI = await advancedTexture.parseFromSnippetAsync("D04P4Z#119"); //L91IFF#73, L91IFF#76, L91IFF#75



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
    let listeditshelf = advancedTexture.getControlByName("ListEditShelf");
    listeditshelf.isVisible = false;


    let buttonListBox = advancedTexture.getControlByName("ButtonBox");
    //Button Edit Box
    let btneditnamebox = advancedTexture.getControlByName("ButtonEditBox");
    let btnexportbox = advancedTexture.getControlByName("ButtonExportBox");
    //Get Location Object
    let txtXposition = <InputText>advancedTexture.getControlByName("InputTextX");
    let txtYposition = <InputText>advancedTexture.getControlByName("InputTextY");
    let txtZposition = <InputText>advancedTexture.getControlByName("InputTextZ");
    // Edit Box Name
    let txteditnamebox = <InputText>advancedTexture.getControlByName("InputNameExportBox");

    //Event click button Shelfinfo
    buttonListBox.onPointerClickObservable.add(() => {
        listMenuBox.isVisible = true;
    });

    let btndelete = advancedTexture.getControlByName("BtnDelete");
    let btnsaveinfobox = advancedTexture.getControlByName("ButtonSaveInfobox");
    let btnclosebox = advancedTexture.getControlByName("BtnCloseBox");

    //Get Info Box
    let txtBoxNameInfo = <InputText>advancedTexture.getControlByName("InputNameBoxinfo");
    // let txtImportInfo = <InputText>advancedTexture.getControlByName("InputImportBoxinfo");
    // let txtExportInfo = <InputText>advancedTexture.getControlByName("InputExportBoxinfo");

    //  handle API
    let handler = new handlers()
    // Function to create a box and return it as a Promise
    async function createBox(id, name: string, position: Vector3) {
        // Import the box
        const result = await SceneLoader.ImportMeshAsync(null, "box/", "boxeton1.obj", scene);
        // result.meshes[1].name = name
        // result.meshes[1].position = position
        box = result.meshes[1]
        box.name = "box" + name
        box.id = id
        box.position.set(position.x, position.y,position.z)
        console.log(result.meshes.length)
        return result.meshes[0]
    }
    async function syncBoxFromDB() {
        let allBoxOnDB = await handler.getBoxDefault()
        if (allBoxOnDB.status == 200) {
            allBoxOnDB.content.forEach(async function (element) {
                if (boxes.filter(box => box.id == element.id).length == 0) {// unique on array
                    let position = new Vector3(element.x, element.y, element.z)
                    let boxSync = await createBox(element.id, element.name, position)
                    boxSync.id = element.id
                    boxes.push(boxSync)
                }
            });
        }
    }
    // Event handler for the "Add Box" button
    btnsaveinfobox.onPointerClickObservable.add(async () => {
        const nameBox = txtBoxNameInfo.text
        let positionBox = new Vector3()
        // Adjust the position of the box
        if (position !== 1) {
            positionBox.x += position;
        } else {
            positionBox.x += 4;
        }

        position = positionBox.x + 4;
        let resultPost = await handler.postBox(nameBox, positionBox.x, positionBox.y, positionBox.z)
        if (resultPost.status == 201) {
            const box = await createBox(resultPost.content.nid, nameBox, positionBox);
            boxes.push(box)
        }
        else {
            alert(resultPost.message)
        }

        // You can perform additional actions with the created box if needed
    });
    btnexportbox.onPointerClickObservable.add(async () => {
        handler.putExportBox(currentBox.id, getCurrentDate().toString())
    })
    btneditnamebox.onPointerClickObservable.add(async () => {
        currentBox.name = txteditnamebox.text
        handler.putNameBox(currentBox.id, txteditnamebox.text)
    })
    //Close ListMenuBox
    btnclosebox.onPointerUpObservable.add(() => {
        listMenuBox.isVisible = false;
    });

    var getGroundPositionBox = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (box) { return box == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var pointerDown = function (box: AbstractMesh) {
        try {
            if (box) {
                if (box.name.toLowerCase().includes("box")) {
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
                        txteditnamebox.text = "";
                    }

                    currentBox = box;
                    // outlinebox
                    outlinebox = currentBox;
                    outlinebox.outlineWidth = 0.2;
                    outlinebox.outlineColor = Color3.Green();
                    outlinebox.renderOutline = true;

                    startingBox = getGroundPositionBox();
                    if (startingBox) { // we need to disconnect camera from canvas
                        setTimeout(function () {
                            camera.detachControl(canvas);
                        }, 0);

                    }
                }
                else {

                }
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    var pointerUp = async function (box: AbstractMesh) {
        try {
            if (startingBox) {
                outlinebox = currentBox;
                outlinebox.renderOutline = false;
                camera.attachControl(canvas, true)
                startingBox = null;
                if (round2(currentBox.position.x) + "" == "NaN") {
                    console.log(currentBox)
                }
                location.isVisible = true;
                txtXposition.text = round2(currentBox.position.x) + ""
                txtYposition.text = round2(currentBox.position.y) + ""
                txtZposition.text = round2(currentBox.position.z) + ""
                await handler.putPositionBox(currentBox.id, currentBox.x, currentBox.y, currentBox.z)
                listexportbox.isVisible = true;
                txteditnamebox.text = currentBox.name.toString().replace("box","");
                return;
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    var pointerMove = function () {
        if (!startingBox) {
            return;
        }
        var currentbox = getGroundPositionBox();
        if (!currentbox) {
            return;
        }

        var diff = currentbox.subtract(startingBox);
        currentBox.position.addInPlace(diff);

        startingBox = currentbox;

    }

    scene.onPointerObservable.add(async (pointerInfo) => {
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
                        txteditnamebox.text = "";
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
                await pointerUp(pointerInfo.pickInfo.pickedMesh);
                break;
            case PointerEventTypes.POINTERMOVE:
                pointerMove();
                break;
        }
    });
    // setInterval(syncBoxFromDB, 2000)
    await syncBoxFromDB()
    // delete selected boxes
    btndelete.onPointerClickObservable.add(() => {
        if (currentBox != null) {
            handler.deleteBox(currentBox.id)
            currentBox.dispose();
            currentBox = null;
        }
    });

    return box
}
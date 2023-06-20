import { AbstractMesh, Camera, Color3, GizmoManager, HighlightLayer, Matrix, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, StandardMaterial, TransformNode, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { InputText } from '@babylonjs/gui';
import { ground } from './ground';
import { handlers } from './api/handlers';

export async function makeShelf(): Promise<Mesh> {
    var startingPoint;
    var currentMesh;
    var outline;
    var meshs;
    var shelf = [];
    let offsetX = 0;
    let offsetY = 0;
    let offsetZ = 0;
    // check mesh in drag-area or not
    interface Position {
        x: number
        y: number
    }
    // check mesh in drag-area or not
    const isTargetIn = (startPosition, endPosition, target, camera) => {
        // get the screen XY of the target, converted from its world coordinate
        const targetScreenPosition = Vector3.Project(
            target,
            Matrix.IdentityReadOnly,
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(
                scene.getEngine().getRenderWidth(),
                scene.getEngine().getRenderHeight()
            )
        )

        const minX = Math.min(startPosition.x, endPosition.x)
        const minY = Math.min(startPosition.y, endPosition.y)
        const maxX = Math.max(startPosition.x, endPosition.x)
        const maxY = Math.max(startPosition.y, endPosition.y)

        // check if the target's screen XY is inside of the dragBox XY range or not
        if (
            targetScreenPosition.x >= minX &&
            targetScreenPosition.x <= maxX &&
            targetScreenPosition.y >= minY &&
            targetScreenPosition.y <= maxY
        ) {
            return true
        }
        return false
    }
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    let loadedGUI = await advancedTexture.parseFromSnippetAsync("L91IFF#97");
    advancedTexture.idealWidth = 1920;
    advancedTexture.idealHeight = 1080;
    //Close all
    let location = advancedTexture.getControlByName("Location");
    location.isVisible = false;
    let listMenuShelf = advancedTexture.getControlByName("ListMenuShelf");
    listMenuShelf.isVisible = false;
    let listMenuBox = advancedTexture.getControlByName("ListMenuBox")
    listMenuBox.isVisible = false;

    let buttonShelfware = advancedTexture.getControlByName("ButtonShelfware");
    let colorpickershelf = advancedTexture.getControlByName("ColorPicker") as GUI.ColorPicker;
    let listexportbox = advancedTexture.getControlByName("ListExportBox");
    listexportbox.isVisible = false;


    let btnsaveshelf = advancedTexture.getControlByName("BtnSaveShelf");
    let btndelete = advancedTexture.getControlByName("BtnDelete");
    let btncloseshelf = advancedTexture.getControlByName("BtnCloseShelf");

    //Get Location Object
    let txtXposition = <InputText>advancedTexture.getControlByName("InputTextX");
    let txtYposition = <InputText>advancedTexture.getControlByName("InputTextY");
    let txtZposition = <InputText>advancedTexture.getControlByName("InputTextZ");
    //Get Info Shelf
    let txtNameInfo = <InputText>advancedTexture.getControlByName("InputNameShelfinfo");
    let txtWeightInfo = <InputText>advancedTexture.getControlByName("InputShelfinfo");
    let txtaddColumn = <InputText>advancedTexture.getControlByName("InputTextColumn");
    let txtaddRow = <InputText>advancedTexture.getControlByName("InputTextRow");
    let txtaddDepth = <InputText>advancedTexture.getControlByName("InputTextDepth");
    // handle db 
    let handler = new handlers()
    var shelfMaterial = new StandardMaterial("shelfmat", scene);
    // Function to create a single shelf
    async function createShelf(offsetX, offsetY, offsetZ) {
        const result = await SceneLoader.ImportMeshAsync(
            null,
            "shelf/",
            "shelfeton.obj",
            scene,
            function (container) { }
        );

        let mesh = result.meshes[0];
        mesh.position.x = offsetX;
        mesh.position.y = offsetY;
        mesh.position.z = offsetZ;
        mesh.material = shelfMaterial;
        shelf.push(mesh);
        // handler.postShelf(name)
    }
    buttonShelfware.onPointerClickObservable.add(() => {
        listMenuShelf.isVisible = true;
    });

    colorpickershelf.value = shelfMaterial.diffuseColor;
    buttonShelfware.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    colorpickershelf.onValueChangedObservable.add(function (value) {
        shelfMaterial.diffuseColor.copyFrom(value);
    });
    btnsaveshelf.onPointerClickObservable.add(async () => {
        // Retrieve the number of shelves from input text controls
        let addRow = parseInt(txtaddRow.text);
        let addColumn = parseInt(txtaddColumn.text);
        let addDepth = parseInt(txtaddDepth.text);
        // let addWeightShelf = parseInt(txtWeightInfo.text);
        // let addNameShlef = txtNameInfo.text
        // Import the mesh
        for (let i = 0; i < addRow; i++) {
            for (let j = 0; j < addColumn; j++) {
                for (let k = 0; k < addDepth; k++) {
                    await createShelf(offsetX, offsetY, offsetZ);
                    offsetZ += 2;
                }
                offsetZ = 0;
                offsetY += 2;
            }
            offsetZ = 0;
            offsetY = 0;
            offsetX += 1;
        }

        // Reset input text values
        txtaddColumn.text = "";
        txtaddRow.text = "";
        txtaddDepth.text = "";
        if (shelf != null) {

            var groupMesh = Mesh.MergeMeshes(shelf);

            // remove the same element
            shelf = shelf.filter(n => !shelf.includes(n));

            shelf.push(groupMesh);
            console.log("grouping");
        }

    })
    btncloseshelf.onPointerUpObservable.add(() => {
        listMenuShelf.isVisible = false;
    });

    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (mesh) {
        if (currentMesh) {
            // outline
            outline = currentMesh;
            outline.renderOutline = false;
            location.isVisible = false
            txtXposition.text = "";
            txtYposition.text = "";
            txtZposition.text = "";

        }
        // toggledMesh = checkdragboxExits(); // if (toggledMesh == false) do nothing : toggledMesh = true remove
        // if (toggledMesh) {
        //     toggledMesh = toggleDrabbox(true);
        // }

        currentMesh = mesh;
        // outline
        outline = currentMesh;
        outline.outlineWidth = 0.2;
        outline.outlineColor = Color3.Green();
        outline.renderOutline = true;

        startingPoint = getGroundPosition();
        if (startingPoint) { // we need to disconnect camera from canvas
            setTimeout(function () {
                camera.detachControl(canvas);
            }, 0);

        }

    }
    var pointerUp = function () {
        if (startingPoint) {
            // currentMesh.material.wireframe = false;

            // // outline
            outline = currentMesh;
            outline.renderOutline = false;
            camera.attachControl(canvas, true)

            location.isVisible = true;
            txtXposition.text = currentMesh.position.x.toFixed(2);
            txtYposition.text = currentMesh.position.y.toFixed(2);
            txtZposition.text = currentMesh.position.z.toFixed(2);

            var index = shelf.indexOf(currentMesh);
            // console.log("index " + index);
            // console.log("position " + currentMesh.position);

            camera.attachControl(canvas, true);
            startingPoint = null;

            return;
        }
    }
    var pointerMove = function () {
        if (!startingPoint) {
            return;
        }
        var curreenShelf = getGroundPosition();
        if (!curreenShelf) {
            return;
        }

        var diff = curreenShelf.subtract(startingPoint);
        currentMesh.position.addInPlace(diff);

        startingPoint = curreenShelf;

    }
    scene.onPointerObservable.add((pointerInfo, event) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:

                if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh);

                }
                else if (pointerInfo.pickInfo.pickedMesh == ground) {
                    if (currentMesh) {
                        // currentMesh.material.wireframe = false;
                        // outline
                        outline = currentMesh;
                        outline.renderOutline = false;
                        location.isVisible = false
                        txtXposition.text = "";
                        txtYposition.text = "";
                        txtZposition.text = "";

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
    // delete selected meshes
    btndelete.onPointerClickObservable.add(() => {
        if (currentMesh != null) {
            currentMesh.dispose();
            currentMesh = null;
        }
    });

    const checkdragboxExits = function () {
        if (document.querySelector('#canvasZone #_dragBox') !== null) {
            // exist
            return true;
        } else {
            // not exist
            return false;
        }

    }


    return meshs
}
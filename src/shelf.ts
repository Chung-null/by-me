import { AbstractMesh, Camera, Color3, GizmoManager, HighlightLayer, Matrix, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, StandardMaterial, TransformNode, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { InputText } from '@babylonjs/gui';
import { ground } from './ground';

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
    const isTargetin = (
        startPosition: Position,
        endPosition: Position,
        target: Vector3,
        camera: Camera
    ): boolean => {
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

    let buttonShelfware = advancedTexture.getControlByName("ButtonShelfware");
    let colorpickershelf = advancedTexture.getControlByName("ColorPicker") as GUI.ColorPicker;
    let listexportbox = advancedTexture.getControlByName("ListExportBox");
    listexportbox.isVisible = false;


    let btnselect = advancedTexture.getControlByName("BtnSelect");
    let btngroup = advancedTexture.getControlByName("BtnGroup");
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
        toggledMesh = checkdragboxExits(); // if (toggledMesh == false) do nothing : toggledMesh = true remove
        if (toggledMesh) {
            toggledMesh = toggleDrabbox(true);
        }

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
    btnselect.onPointerClickObservable.add(() => {
        toggledMesh = checkdragboxExits();
        toggledMesh = toggleDrabbox(toggledMesh);
    })

    let toggledMesh = false;

    const toggleDrabbox = function (toggle) {

        if (!toggle) {
            setTimeout(function () {
                camera.detachControl(canvas);
            }, 0);
            document.querySelector("#canvasZone").appendChild(dragBox);
            return true;
        }
        else {
            camera.attachControl(canvas, true);
            document.querySelector("#canvasZone").removeChild(dragBox);
            return false;
        }
    }

    const checkdragboxExits = function () {
        if (document.querySelector('#canvasZone #_dragBox') !== null) {
            // exist
            return true;
        } else {
            // not exist
            return false;
        }

    }
    btngroup.onPointerClickObservable.add(() => {

        if (selectedMeshOld != null) {

            var groupMesh = Mesh.MergeMeshes(selectedMeshOld);

            // remove the same element
            shelf = shelf.filter(n => !selectedMeshOld.includes(n));

            shelf.push(groupMesh);
            console.log("grouping");
        }

    })

    // initialize startPointerPosition with null
    let startPointerPosition = null

    // find a div element with id _dragBox, and if you cannot find create it
    const dragBox =
        (document.querySelector('#_dragBox') as HTMLDivElement) ||
        document.createElement('div')
    dragBox.id = '_dragBox'
    // default style of the dragBox
    const defStyle = 'background-color: gray; position: absolute; opacity: 0.3;'
    dragBox.style.cssText = defStyle

        // make the position of div with id canvasZone relative, so that the dragBox can refer to it
        ; (document.querySelector('#canvasZone') as HTMLElement).style.position =
            'relative'
        // set the canvasZone to be the parent of dragBox
        ; (document.querySelector('#canvasZone') as HTMLElement).appendChild(dragBox)
        ; (document.querySelector('#canvasZone') as HTMLElement).removeChild(dragBox)

    let selectedMeshOld = []
    scene.onPointerObservable.add(eventData => {
        if (eventData.type === PointerEventTypes.POINTERDOWN) {
            // set startPointerPosition with pointer down event
            startPointerPosition = { x: scene.pointerX, y: scene.pointerY }
        } else if (eventData.type === PointerEventTypes.POINTERMOVE) {
            if (dragBox && startPointerPosition) {
                // set currentPointerPosition with every pointer move event
                const currentPointerPosition: Position = {
                    x: scene.pointerX,
                    y: scene.pointerY,
                }

                // compute min and max of screen XY with start/currentPointerPosition
                // to set left, top, width and height of the dragBox
                const minX = Math.min(startPointerPosition.x, currentPointerPosition.x)
                const minY = Math.min(startPointerPosition.y, currentPointerPosition.y)
                const maxX = Math.max(startPointerPosition.x, currentPointerPosition.x)
                const maxY = Math.max(startPointerPosition.y, currentPointerPosition.y)

                // update dragBox's style
                dragBox.style.cssText = `${defStyle} left: ${minX}px; top: ${minY}px; width: ${maxX -
                    minX}px; height: ${maxY - minY}px;`
            }
        } else if (eventData.type === PointerEventTypes.POINTERUP) {
            if (startPointerPosition) {
                // set endPointerPosition with pointer up event
                const endPointerPosition: Position = { x: scene.pointerX, y: scene.pointerY }
                // select spheres using array filter method
                const selectedSpheres = shelf.filter(meshe =>
                    isTargetIn(
                        startPointerPosition,
                        endPointerPosition,
                        meshe.getAbsolutePosition(),
                        camera
                    )
                )

                // initialize startPointerPosition with null
                startPointerPosition = null
                // initialize dragBox's style with default one wich doesn't include width and height
                dragBox.style.cssText = defStyle

                // log selected spheres
                console.log('selectedSpheres: ', selectedSpheres)
                // alert with selected spheres counts
                // alert(`${selectedSpheres.length} ${selectedSpheres.length > 1 ? 'spheres are' : 'sphere is'} selected!`)

                selectedMeshOld.forEach(removeHinglightLayer);
                selectedMeshOld = selectedSpheres;

                selectedSpheres.forEach(HinglightLayer);
            }
        }
    })

    var hl = new HighlightLayer("hl1", scene);
    function HinglightLayer(item, index) {
        // namelist += index + ": " + item + "<br>";
        hl.addMesh(item, Color3.Green());

    }
    function removeHinglightLayer(item) {
        hl.removeMesh(item);
    }

    return meshs
}
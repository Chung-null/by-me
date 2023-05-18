import { Color3, GizmoManager, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, PositionGizmo, SceneLoader, UtilityLayerRenderer, Vector3 } from '@babylonjs/core'
import { scene, engine, camera, canvas } from './scene'
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";
import { ground } from './ground';



export async function makeCube(): Promise<Mesh> {
    // Load in a full screen GUI from the snippet server
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    let loadedGUI = await advancedTexture.parseFromSnippetAsync("L91IFF#35"); //L91IFF#35
    advancedTexture.idealWidth = 1920;
    advancedTexture.idealHeight = 1080;

    let btnadd = advancedTexture.getControlByName("BtnAdd");
    let btndelete = advancedTexture.getControlByName("BtnDelete");
    let btnedit = advancedTexture.getControlByName("BtnEdit");

    var startingPoint;
    var currentMesh;
    var outline;
    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }
    var pointerDown = function (mesh) {
        if (currentMesh) {
            // currentMesh.material.wireframe = false;
            // outline
            outline = currentMesh;
            outline.renderOutline = false;
        }

        currentMesh = mesh;
        // currentMesh.material.wireframe = true;
        // outline
        outline = currentMesh;
        outline.outlineWidth = 0.2;
        outline.outlineColor = Color3.Green();
        outline.renderOutline = true;

        startingPoint = getGroundPosition();
        if (startingPoint) { // we need to disconnect camera from canvas
            setTimeout(function () {
                // camera.detachControl(canvas);
            }, 0);

        }

    }
    var pointerUp = function () {
        if (startingPoint) {
            // currentMesh.material.wireframe = false;

            // // outline
            // outline = currentMesh;
            // outline.renderOutline = false;
            // camera.attachControl(canvas, true);
            startingPoint = null;
            return;
        }
    }
    var pointerMove = function () {
        if (!startingPoint) {
            return;
        }
        var current = getGroundPosition();
        if (!current) {
            return;
        }

        var diff = current.subtract(startingPoint);
        currentMesh.position.addInPlace(diff);

        startingPoint = current;

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

    var position = 1;
    var meshs;
    var meshes = [];

    // Add an event listener to the button
    btnadd.onPointerClickObservable.add(async () => {
        // Import the mesh
        const result = await SceneLoader.ImportMeshAsync(null, "shelf/", "shelfware.glb", scene, function (container) {
            // newMeshes[0].getChildMeshes()[0].metadata = "cannon";
        });
        meshs = result.meshes[0];
        if (position != 1) {
            meshs.position.x += position;
        }
        else {
            meshs.position.x += 4;
        }

        position = meshs.position.x + 4;


        meshes.push(meshs);
        // console.log("mesh button " + meshes.length);
    });
    btnedit.onPointerClickObservable.add(() => {
        // Initialize GizmoManager
        var gizmoManager = new GizmoManager(scene)
        gizmoManager.boundingBoxGizmoEnabled = true
        // Restrict gizmos to only spheres
        gizmoManager.attachableMeshes = meshes
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
    // delete selected meshes
    btndelete.onPointerClickObservable.add(() => {
        if (currentMesh != null) {
            currentMesh.dispose();
            currentMesh = null;
        }
    });

    return meshs
}

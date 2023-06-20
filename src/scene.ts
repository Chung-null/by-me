import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Color4,
    Light,
    Camera,
    PerformanceMonitor,
} from '@babylonjs/core'
import { AdvancedDynamicTexture, Control, TextBlock } from '@babylonjs/gui';

function createCamera(scene:Scene): Camera {
    const camera = new ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 2.5, 100, new Vector3(0, 0, 0), scene)
    scene.activeCamera = camera;
    scene.activeCamera.attachControl(canvas, true);
    // camera.upperBetaLimit = Math.PI / 2.3;
    // camera.lowerRadiusLimit = 10;
    // camera.upperRadiusLimit = 150;

    document.documentElement.style["overflow"] = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    return camera
}

function createLight(scene: Scene): void {
    var light1: Light
    var light2: Light
    var light3: Light
    var light4: Light
    light1 = new HemisphericLight("light1", new Vector3(0, 200, -100), scene); // light at bottom
    light2 = new HemisphericLight("light2", new Vector3(0, 200, 100), scene);// light at top
    light3 = new HemisphericLight("light3", new Vector3(-100, 200, 0), scene); // light at left
    light4 = new HemisphericLight("light4", new Vector3(100, 200, 0), scene);  // light at right
}

function setBackground(scene: Scene): void {
    scene.clearColor = new Color4(1,1,1,1)
}

function createCanvas() {
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.id = 'gameCanvas'
    document.body.appendChild(canvas)

    return canvas
}

function makeScene(): Scene {
    const scene = new Scene(engine)
    createCamera(scene)
    createLight(scene)
    setBackground(scene)

    return scene
}
export function makeFPS(): void {
    // Create a full-screen UI
    const ui = AdvancedDynamicTexture.CreateFullscreenUI('UI');

    // Create a text block to display the average FPS
    const textBlock = new TextBlock();
    textBlock.text = 'Average FPS: 0';
    textBlock.color = 'white';
    textBlock.fontSize = 50;
    ui.addControl(textBlock);
    textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

    const perfMonitor = new PerformanceMonitor();
    perfMonitor.enable();

    // Update the text block with the average FPS every frame
    scene.onBeforeRenderObservable.add(() => {
        perfMonitor.sampleFrame();
        textBlock.text = `${perfMonitor.averageFPS.toFixed(0)} Fps`;
    });
}

export const canvas = createCanvas()
export const engine = new Engine(canvas, true);
export const scene = makeScene()
export const camera = createCamera(scene)

import { Color3, CubeTexture, Mesh, MeshBuilder, PhysicsImpostor, StandardMaterial, Texture, Vector3 } from '@babylonjs/core'
import { scene } from './scene'
import { makeCube } from './cube';
import * as GUI from "@babylonjs/gui";
import { AdvancedDynamicTexture, Button, Control, TextBlock, InputText, Rectangle, StackPanel, RadioGroup, SelectionPanel } from "@babylonjs/gui"

export function makeGround(): void {
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    ground.position = new Vector3(0, 0, 0)
    ground.material = groundMaterial;
    const uvScale = 2;
    const textArray: Texture[] = []

    const diffuseText = new Texture("./ground/grass.png", scene);
    groundMaterial.diffuseTexture = diffuseText
    textArray.push(diffuseText)

    const aoText = new Texture("./ground/grass.png", scene); // trang 
    groundMaterial.ambientTexture = aoText
    textArray.push(aoText)

    const pecText = new Texture("./ground/grass.png", scene); //  den 
    groundMaterial.specularTexture = pecText;
    groundMaterial.specularPower = 20;
    textArray.push(pecText)

    textArray.forEach((text) => {
        text.uScale = uvScale;
        text.vScale = uvScale;
    });
    ground.physicsImpostor = new PhysicsImpostor(
        ground,
        PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.9 },
        scene
    )

}
function createGround(): Mesh {
    const ground = MeshBuilder.CreateGroundFromHeightMap("largeGround", "./ground/villageheightmap.png", { width: 300, height: 300, subdivisions: 20, minHeight: 0, maxHeight: 10 });
    return ground
}
export const ground = createGround()
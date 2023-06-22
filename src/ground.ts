import { AxesViewer, Color3, Color4, CubeTexture, Mesh, MeshBuilder, PhysicsImpostor, StandardMaterial, Texture, Vector3, Vector4 } from '@babylonjs/core'
import { scene } from './scene'
import { GridMaterial } from '@babylonjs/materials';

export function makeGround(): void {
    ground.physicsImpostor = new PhysicsImpostor(
        ground,
        PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.9 },
        scene
    )

}
function createGround(): Mesh {
    var ground = Mesh.CreateGround("ground1", 200, 200, 0, scene);
   
    //create grid 
    var grid = new GridMaterial("grid", scene);
    grid.gridRatio = 1;
    grid.mainColor = new Color3 (0.4,0.4,0.4)
    grid.lineColor = new Color3(0.3,0.3,0.1)
    ground.material = grid;
   


    return ground
}
export const ground = createGround()
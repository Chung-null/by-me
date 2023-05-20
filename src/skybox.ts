import { Color3, CubeTexture, Mesh, MeshBuilder, PhysicsImpostor, StandardMaterial, Texture, Vector3 } from '@babylonjs/core'
import { scene } from './scene'

export function makeSky(): Mesh {
    const skybox = MeshBuilder.CreateBox("skyBox", { size: 300 }, scene);
    const skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture("sky/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    skybox.physicsImpostor = new PhysicsImpostor(
        skybox,
        PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.9 },
        scene
    )

    return skybox
}

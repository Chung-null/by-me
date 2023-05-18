import { AmmoJSPlugin, Vector3 } from '@babylonjs/core'
import Ammo from 'ammojs-typed'
import { scene, engine, makeFPS } from './scene'
import { makeGround} from './ground'
import { makeCube } from './cube'
import { makeSky } from './skybox'

async function main(): Promise<void> {
    const ammo = await Ammo()
    const physics: AmmoJSPlugin = new AmmoJSPlugin(true, ammo)
    scene.enablePhysics(new Vector3(0, -9.81, 0), physics)

    makeCube()
    makeGround()
    makeSky()
    makeFPS()
    // run the main render loop
    engine.runRenderLoop(() => scene.render())
}

main()
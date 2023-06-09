import { AmmoJSPlugin, Vector3 } from '@babylonjs/core'
import Ammo from 'ammojs-typed'
import { scene, engine, makeFPS } from './scene'
import { makeGround } from './ground'
import { makeShelf } from './shelf'
import { makeWare } from './warehouse'
import { makeBox } from './box'
import { makePallet } from './pallet'
import { makeConveyor } from './conveyor'


async function main(): Promise<void> {
    // var api = new handlers()
    // console.log("ssaa")
    // console.log(await api.getWithID("Shelf",3))
    // let data = await api.getWithID("Shelf",3)
    // console.log(data.content)
    const ammo = await Ammo()
    const physics: AmmoJSPlugin = new AmmoJSPlugin(true, ammo)
    scene.enablePhysics(new Vector3(0, -9.81, 0), physics)
    makePallet()
    makeWare()
    makeConveyor()
    makeShelf()
    makeGround()
    makeFPS()
    makeBox()
    // run the main render loop
    engine.runRenderLoop(() => scene.render())
    window.addEventListener("resize", ()=>{
        engine.resize()
    })
}


main()
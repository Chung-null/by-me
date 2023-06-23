import { shelf } from "./object/shelf";
import { box } from "./object/box";
import { getCurrentDate, round2 } from "../util";
import { warehouse } from "./object/warehouse";
import { pallet } from "./object/pallet";
import { conveyor } from "./object/conveyor";
enum TABLE {
    SHELF = "Shelf",
    BOX = "Box"
}
export class handlers {
    // Sử dụng middleware cors để cấu hình CORS

    readonly defaultUrl = 'https://dev-web3d-api.eton.vn/node'
    readonly defaultType = '?_format=json'
    constructor() { }
    // sử dụng get / lấy dữ liệu
    async get(table: string) {
        let url = this.defaultUrl + "/" + table + this.defaultType
        return await this.getWithURL(new URL(url))
    }
    async getBoxDefault() {
        let url = this.defaultUrl + "/"  + "box" + this.defaultType
        let data = await this.getWithURL(new URL(url))
        for (let data_content of data.content) {
            // import
            let importParsed = Number(data_content.import_date)
            data_content.import_date = new Date(importParsed * 1000)

            // export
            if (data_content.export_date) {
                let exportParsed = Number(data_content.export_date)
                data_content.export_date = new Date(exportParsed * 1000)
            }
            else {
                data_content.export_date = ""
            }
        }
        return data
    }
    async getBoxWithName(name: string) {
        let url = this.defaultUrl + "/"  + "box" + "/" + name + this.defaultType
        let data = await this.getWithURL(new URL(url))
        for (let data_content of data.content) {
            // import
            let importParsed = Number(data_content.import_date)
            data_content.import_date = new Date(importParsed * 1000)

            // export
            if (data_content.export_date != "false") {
                let exportParsed = Number(data_content.export_date)
                data_content.export_date = new Date(exportParsed * 1000)
            }
            else {
                data_content.export_date = ""
            }
        }
        return data
    }
    async getWithID(id: number) {
        let url = this.defaultUrl + "/"  + id + this.defaultType
        return await this.getWithURL(new URL(url))
    }
    async getWithName(table: string, name: string) {
        let url = this.defaultUrl + "/"  + table + "/" + name + this.defaultType
        return await this.getWithURL(new URL(url))
    }

    // sử dụng post/ tải lên dữ liệu
    // shelf
    async postShelf(name: string, weight: number, columns: number, rows: number, depth: number, x: number, y: number, z: number) {
        if (rows < 1 || columns < 1 || depth < 1 || weight < 1) {
            return { status: 404, message: "Các chỉ số của kệ hàng không được bỏ trống và không thể nhỏ hơn 1!", content: [] } 
        }
        if (name.trim() == "") {
            return { status: 404, message: "Tên không được bỏ trống!", content: [] } 
        }
        let shelfPost = new shelf(name, weight, columns, rows, depth, x, y, z)
        let dataPost = shelfPost.getShelf()
        if (await this.checkConstraintShelf(name)) {
            return await this.post(dataPost)
        }
        else {
            return { status: 404, message: "Tên không được trùng lặp!", content: [] }
        }
    }
    // box
    async postBox(name: string, x: number, y: number, z: number) {
        let boxPost = new box(name, x, y, z)
        let dataPost = boxPost.getBox()
        if (await this.checkConstraintBox(name)) {
            return await this.post(dataPost)
        }
        else {
            return { status: 404, message: "Tên không được trùng lặp!", content: [] }
        }
    }
    // warehouse
    async postWarehouse(x: number, y: number, z: number) {
        let warehousePost = new warehouse(x, y, z)
        let dataPost = warehousePost.getWarehouse()
        return await this.post(dataPost)
    }
    // pallet
    async postPallet(x: number, y: number, z: number) {
        let palletPost = new pallet(x, y, z)
        let dataPost = palletPost.getPallet()
        return await this.post(dataPost)
    }
    // conveyor
    async postConveyor(x: number, y: number, z: number) {
        let conveyorPost = new conveyor(x, y, z)
        let dataPost = conveyorPost.getConveyor()
        return await this.post(dataPost)
    }
    // Sử dụng put/ cập nhật dữ liệu
    //shelf
    async putNameShelf(id: number, newName: string) {
        let putShelf = new shelf(newName)
        let dataPost = putShelf.getPutNameShelf()
        if (this.checkConstraintShelf(newName)) {
            return await this.put(id, dataPost)
        }
        else {
            return { status: 404, message: "Tên không được trùng lặp!", content: [] }
        }
    }
    async putWeightShelf(id: number, weight: number) {
        let putShelf = new shelf()
        putShelf.setWeight = weight
        let dataPost = putShelf.getPutWeightShelf()
        return await this.put(id, dataPost)
    }
    async putPositionShelf(id: number, x: number, y: number, z: number) {
        // if (id && x && y && z){
        let putShelf = new shelf()
        putShelf.setPosition(Number(round2(x)), Number(round2(x)), Number(round2(z)))
        let dataPost = putShelf.getPutPositionShelf()
        return await this.put(id, dataPost)
        // }
    }

    //box
    async putNameBox(id: number, newName: string) {
        let putBox = new box(newName)
        let dataPost = putBox.getPutNameBox()
        if (this.checkConstraintBox(newName)) {
            return await this.put(id, dataPost)
        }
        else {
            return { status: 404, message: "Tên không được trùng lặp!", content: [] }
        }
    }
    async putExportBox(id: number, export_date: string) {
        let putBox = new box()
        putBox.setExportDate = getCurrentDate()
        let dataPost = putBox.getPutExportDateBox()
        return await this.put(id, dataPost)
    }
    async putPositionBox(id: number, x: number, y: number, z: number) {
        let putBox = new box()
        putBox.setPosition(x, y, z)
        let dataPost = putBox.getPutPositionBox()
        return await this.put(id, dataPost)
    }

    //warehouse
    async putPositionWarehouse(id: number, x: number, y: number, z: number) {
        let putWarehouse = new warehouse()
        putWarehouse.setPosition(Number(round2(x)), Number(round2(x)), Number(round2(z)))
        let dataPost = putWarehouse.getPutPositionWarehouse()
        return await this.put(id, dataPost)
    }
    //pallet
    async putPositionPallet(id: number, x: number, y: number, z: number) {
        let putPallet= new pallet()
        putPallet.setPosition(Number(round2(x)), Number(round2(x)), Number(round2(z)))
        let dataPost = putPallet.getPutPositionPallet()
        return await this.put(id, dataPost)
    }
    //warehouse
    async putPositionConveyor(id: number, x: number, y: number, z: number) {
        let putConveyor = new conveyor()
        putConveyor.setPosition(Number(round2(x)), Number(round2(x)), Number(round2(z)))
        let dataPost = putConveyor.getPutPositionConveyor()
        return await this.put(id, dataPost)
    }

    //sử dụng delete/ xóa ứng dụng
    async deleteShelf(id: number) {
        return await this.delete(id)
    }
    async deleteBox(id: number) {
        return await this.delete(id)
    }
    async deleteWarehouse(id: number) {
        return await this.delete(id)
    }
    async deletePallet(id: number) {
        return await this.delete(id)
    }
    async deleteConveyor(id: number) {
        return await this.delete(id)
    }
    //get post nền tảng
    //get
    private async getWithURL(url: URL) {
        let data = await fetch(url, {
            method: 'GET',
            headers: { 
            'content-type': 'application/json',
            },
            credentials: 'include',
        }).then(async function (res) {
            if (res.ok) {
                return { status: res.status, content: await res.json() }
            }
            else {
                return { status: res.status, content: [] }
            }
        }).then(tasks => {
            if (tasks.status != 200) {
                return { status: tasks.status, message: "Lấy dữ liệu thất bại!", content: tasks.content }
            }
            return { status: tasks.status, message: "Lấy dữ liệu thành công!", content: tasks.content }
        }).catch(error => {
            return { status: 404, message: "Lấy dữ liệu thất bại!", content: [] }
        })
        return data
    }
    //post
    private async post(dataPost: {}) {
        return await fetch(this.defaultUrl + this.defaultType, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            // Gửi dữ liệu dạng JSON
            body: JSON.stringify(dataPost)
        }).then(async function (res) {
            if (res.ok) {
                return { status: res.status, content: await res.json() }
            }
            else {
                return { status: res.status, content: [] }
            }
        }).then(tasks => {
            if (tasks.status != 200 && tasks.status != 201) {
                return { status: tasks.status, message: "Tải lên thất bại!", content: tasks.content }
            }
            return { status: tasks.status, message: "Tải lên thành công!", content: tasks.content }
        }).catch(error => {
            return { status: 404, message: "Tải lên không thành công! Đã có lỗi xảy ra", content: [] }
        })
    }
    //put
    private async put(id: number, dataPost: {}) {
        return await fetch(this.defaultUrl + "/"  + id + this.defaultType, {
          method: 'PATCH', 
          headers: {'content-type':'application/json'},
          body: JSON.stringify(dataPost)
        }).then(async function (res) {
            if (res.ok) {
                return { status: res.status, content: await res.json() }
            }
            else {
                return { status: res.status, content: [] }
            }
        }).then(tasks => {
            if (tasks.status != 200) {
                return { status: tasks.status, message: "Cập nhật thất bại!", content: tasks.content }
            }
            return { status: 200, message: "Cập nhật thành công!", content: tasks.content }
        }).catch(error => {
            return { status: 404, message: "Cập nhật không thành công! Đã có lỗi xảy ra.", content: [] }
        })
    }
    // delete
    private async delete(id: number) {
        return await fetch(this.defaultUrl + "/" +id+this.defaultType, {
            method: 'DELETE'
          }).then(async function (res) {
              if (res.ok) {
                  return { status: res.status, content: [] }
              }
              else {
                  return { status: res.status, content: [] }
              }
          }).then(tasks => {
              if (tasks.status != 200) {
                  return { status: tasks.status, message: "Xóa thất bại!", content: tasks.content }
              }
              return { status: 200, message: "Xóa thành công!", content: tasks.content }
          }).catch(error => {
              return { status: 404, message: "Xóa không thành công! Đã có lỗi xảy ra.", content: [] }
          })
    }
    // ràng buộc
    private async checkConstraintBox(name: string) {
        return await this.checkConstraintName(TABLE.BOX, name)
    }
    private async checkConstraintShelf(name: string) {
        return await this.checkConstraintName(TABLE.SHELF, name)
    }
    private async checkConstraintName(table: string, name: string) {
        let dataNameExist = await this.getWithName(table, name)
        if (dataNameExist.content.length > 0) {
            return false
        }
        else {
            return true
        }
    }

}
import { int } from "@babylonjs/core";
enum TABLE {
    SHELF = "Shelf",
    BOX = "Box"
}
export class handlers {
    readonly defaultUrl = 'https://648841780e2469c038fd583d.mockapi.io/'
    constructor() { }
    // sử dụng get / lấy dữ liệu
    async get(table: String) {
        let url = this.defaultUrl + table
        return await this.getWithURL(new URL(url))
    }
    async getWithID(table: String, id: int) {
        let url = this.defaultUrl + table + "/" + id
        return await this.getWithURL(new URL(url))
    }
    async getWithName(table: String, name: String) {
        let url = this.defaultUrl + table + "?name=" + name
        return await this.getWithURL(new URL(url))
    }

    // sử dụng post/ tải lên dữ liệu
    async postShelf(name: String, weight: int) {
        let dataPost = {
            name: name,
            weight: weight
        }
        if (this.checkConstraintShelf(name)) {
            return await this.post(TABLE.BOX, dataPost)
        }
        else {
            return { status: 404, message: "Tên không được trùng lặp!", content: [] }
        }
    }
    async postBox(name: String) {
        let dataPost = {
            name: name
        }
        if (this.checkConstraintBox(name)) {
            return await this.post(TABLE.BOX, dataPost)
        }
        else {
            return { status: 404, message: "Tên không được trùng lặp!", content: [] }
        }
    }

    // Sử dụng put/ cập nhật dữ liệu
    async putNameShelf(oldName: String, newName: String) {
        let dataPost = {
            oldName: oldName,
            newName: newName
        }
        if (this.checkConstraintShelf(newName)) {
            return await this.post(TABLE.SHELF, dataPost)
        }
        else {
            return { status: 404, message: "Tên không được trùng lặp!", content: [] }
        }
    }
    async putNameBox(oldName: String, newName: String) {
        let dataPost = {
            oldName: oldName,
            newName: newName
        }
        if (this.checkConstraintShelf(newName)) {
            return await this.putName(TABLE.BOX, dataPost)
        }
        else {
            return { status: 404, message: "Tên không được trùng lặp!", content: [] }
        }
    }
    async putWeightShelf(name: String, weight: int) {
        let dataPost = {
            name: name,
            weight: weight
        }
        return await this.putWeight(TABLE.SHELF, dataPost)
    }
    async putExportBox(name: String, newExport: Date) {
        let dataPost = {
            name: name,
            export: newExport
        }
        return await this.putExport(TABLE.BOX, dataPost)
    }

    //sử dụng delete/ xóa ứng dụng
    async deleteShelf(name: String) {
        return await this.delete(TABLE.SHELF, name)
    }
    async deleteBox(name: String) {
        return await this.delete(TABLE.BOX, name)
    }
    //get post nền tảng
    //get
    private async getWithURL(url: URL) {
        let data = await fetch(url, {
            method: 'GET',
            headers: { 'content-type': 'application/json' },
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
    private async post(table: String, dataPost: {}) {
        return await fetch(this.defaultUrl + table, {
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
            if (tasks.status != 200) {
                return { status: tasks.status, message: "Tải lên thất bại!", content: tasks.content }
            }
            return { status: 200, message: "Tải lên thành công!", content: tasks.content }
        }).catch(error => {
            return { status: 404, message: "Tải lên không thành công! Đã có lỗi xảy ra", content: [] }
        })
    }
    //put
    private async putName (table: String, dataPost: {oldName: String, newName: String}) {
        return await this.put(table, dataPost.oldName, {weight: dataPost.newName})
    }
    private async putWeight (table: String, dataPost: {name: String, weight: int}) {
        return await this.put(table, dataPost.name, {weight: dataPost.weight})
    }
    private async putExport (table: String, dataPost: {name: String, export: Date}) {
        return await this.put(table, dataPost.name, {export: dataPost.export})
    }
    private async put(table: String, name: String, dataPost: {}) {
        return await fetch(this.defaultUrl+"/"+table+"?name="+name, {
          method: 'PUT', // or PATCH
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
    private async delete(table: String, name: String) {
        return await fetch(this.defaultUrl+"/"+table+"?name="+name, {
            method: 'DELETE'
          }).then(async function (res) {
              if (res.ok) {
                  return { status: res.status, content: await res.json() }
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
    private async checkConstraintBox(name: String) {
        return await this.checkConstraintName(TABLE.BOX, name)
    }
    private async checkConstraintShelf(name: String) {
        return await this.checkConstraintName(TABLE.SHELF, name)
    }
    private async checkConstraintName(table: String, name: String) {
        let dataNameExist = await this.getWithName(table, name)
        if (dataNameExist.content.length > 0) {
            return false
        }
        else {
            return true
        }
    }
}
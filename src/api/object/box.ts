export class box {
    private name: [{ value: String }]
    private export_date: [{ value: String, format:String}]
    private id: Number
    private x: [{ value: Number }]
    private y: [{ value: Number }]
    private z: [{ value: Number }]

    public constructor(name?: String, x?: Number, y?: Number, z?: Number, id?: Number);
    public constructor(name?: String, x?: Number, y?: Number, z?: Number, id?: Number) {
        if (id) {
            this.setId = id
        }
        this.setName = name
        this.setX = x
        this.setY = y
        this.setZ = z
    };

    public set setId(value: Number) {
        this.id = value;
    }
    public set setName(value: String) {
        this.name = [{ value: value }];
    }
    public set setExportDate(value: String) {
        this.export_date = [{ value: value, format: "Y-m-d\\TH:i:sP"}];
    }
    public set setX(value: Number) {
        this.x = [{ value: value }];
    }
    public set setY(value: Number) {
        this.y = [{ value: value }];
    }
    public set setZ(value: Number) {
        this.z = [{ value: value }];
    }
    public setPosition(x: Number, y: Number, z: Number) {
        this.setX = x
        this.setY = y
        this.setZ = z
    }

    public get getId(): Number{
        return this.id;
    }
    public get getName(): String {
        return this.name[0].value
    }
    public get getExportDate(): String {
        return this.export_date[0].value
    }
    public get getX(): Number {
        return this.x[0].value
    }
    public get getY(): Number {
        return this.y[0].value
    }
    public get getZ(): Number {
        return this.z[0].value
    }

    public getBox() : {} {
        return {
            "type": [
                {
                "target_id": "box",
                "target_type": "node_type"
                }
            ],
            "title": [
              {
              "value": "1"
              }
            ],
            "field_name": this.name,
            "field_x": this.x,
            "field_y": this.y,
            "field_z": this.z
        }
    }
    public getPutNameBox() : {} {
        return {
            "type": [
                {
                "target_id": "box",
                "target_type": "node_type"
                }
            ],
            "title": [
              {
              "value": "1"
              }
            ],
            "field_name": this.name
        }
    }
    public getPutPositionBox() : {} {
        return {
            "type": [
                {
                "target_id": "box",
                "target_type": "node_type"
                }
            ],
            "title": [
              {
              "value": "1"
              }
            ],
            "field_x": this.x,
            "field_y": this.y,
            "field_z": this.z
        }
    }
    public getPutExportDateBox() : {} {
        return {
            "type": [
                {
                "target_id": "box",
                "target_type": "node_type"
                }
            ],
            "title": [
              {
              "value": "1"
              }
            ],
            "field_export_date": this.export_date
        }
    }
}
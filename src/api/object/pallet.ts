export class pallet {
    private id: Number
    private x: [{value: Number}]
    private y: [{value: Number}]
    private z: [{value: Number}]
    
    public constructor(x?: Number, y?: Number, z?: Number, id?: Number);
    public constructor(x?: Number, y?: Number, z?: Number, id?: Number) {
        if (id) {
            this.setId = id
        }
        this.setX = x
        this.setY = y
        this.setZ = z
    };

    public set setId(value : Number) {
        this.id = value
    }
    public set setX(value : Number) {
        this.x = [{value: value}];
    }
    public set setY(value : Number) {
        this.y = [{value: value}];
    }
    public set setZ(value : Number) {
        this.z = [{value: value}];
    }
    public setPosition(x: Number, y: Number, z: Number) {
        this.setX = x
        this.setY = y
        this.setZ = z
    }

    public get getId() : Number {
        return this.id
    }
    public get getX() : Number {
        return this.x[0].value
    }
    public get getY() : Number {
        return this.y[0].value
    }
    public get getZ() : Number {
        return this.z[0].value
    }

    public getPallet() : {} {
        return {
            "type": [
                {
                "target_id": "pallet",
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
    public getPutPositionPallet() : {} {
        return this.getPallet()
    }
}
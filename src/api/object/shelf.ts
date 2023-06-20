export class shelf {
    private id: Number
    private name: [{value: String}]
    private weight: [{value: Number}]
    private x: [{value: Number}]
    private y: [{value: Number}]
    private z: [{value: Number}]
    private columns: [{value: Number}]
    private rows: [{value: Number}]
    private depth: [{value: Number}]
    public constructor(name?: String, weight?: Number, columns?: Number, rows?: Number, depth?: Number, x?: Number, y?: Number, z?: Number, id?: Number);
    public constructor(name?: String, weight?: Number, columns?: Number, rows?: Number, depth?: Number, x?: Number, y?: Number, z?: Number, id?: Number) {
        if (id) {
            this.setId = id
        }
        this.setName = name
        this.setWeight = weight
        this.setPosition(x, y, z)
        this.setParameter(columns, rows, depth)
    };
    public set setId(value : Number) {
        this.id = value;
    }
    public set setName(value : String) {
        this.name = [{value: value}];
    }
    public set setWeight(value : Number) {
        this.weight = [{value: value}];
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
    public set setColumns(value : Number) {
        this.columns = [{value: value}];
    }
    public set setRows(value : Number) {
        this.rows = [{value: value}];
    }
    public set setDepth(value : Number) {
        this.depth = [{value: value}];
    }
    public setPosition(x: Number, y: Number, z: Number) {
        this.setX = x
        this.setY = y
        this.setZ = z
    }
    public setParameter(columns: Number, rows: Number, depth: Number) {
        this.setColumns = columns
        this.setRows = rows
        this.setDepth = depth
    }

    public get getId() : Number {
        return this.id
    }
    public get getName() : String {
        return this.name[0].value
    }
    public get getWeight() : Number {
        return this.weight[0].value
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

    
    public getShelf() : {} {
        return {
            "type": [
                {
                "target_id": "shelf",
                "target_type": "node_type"
                }
            ],
            "title": [
              {
              "value": "1"
              }
            ],
            "field_name": this.name,
            "field_weightt": this.weight,
            "field_x": this.x,
            "field_y": this.y,
            "field_z": this.z,
            "field_columns": this.columns,
            "field_rows": this.rows,
            "field_depth": this.depth
        }
    }
    public getPutNameShelf() : {} {
        return {
            "type": [
                {
                "target_id": "shelf",
                "target_type": "node_type"
                }
            ],
            "field_name": this.name
        }
    }
    public getPutPositionShelf() : {} {
        return {
            "type": [
                {
                "target_id": "shelf",
                "target_type": "node_type"
                }
            ],
            "field_x": this.x,
            "field_y": this.y,
            "field_z": this.z
        }
    }
    public getPutWeightShelf() : {} {
        return {
            "type": [
                {
                "target_id": "shelf",
                "target_type": "node_type"
                }
            ],
            "field_weightt": this.weight
        }
    }
    public getPutParameter() : {} {
        return {
            "type": [
                {
                "target_id": "shelf",
                "target_type": "node_type"
                }
            ],
            "field_columns": this.columns,
            "field_rows": this.rows,
            "field_depth": this.depth
        }
    }
}
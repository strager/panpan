define([ ], function () {
    function Array2D() {
        this.data = [ ];
    }

    Array2D.prototype.get = function get(x, y, defaultValue) {
        var data = this.data;
        if (!hasOwn(data, y)) {
            if (arguments.length < 3) {
                die("Tried to access unset array data with no default value");
            }
            return defaultValue;
        }

        var row = data[y];
        if (!hasOwn(row, x)) {
            if (arguments.length < 3) {
                die("Tried to access unset array data with no default value");
            }
            return defaultValue;
        }

        return row[x];
    };

    Array2D.prototype.set = function set(x, y, value) {
        var data = this.data;
        if (!hasOwn(data, y)) {
            data[y] = [ ];
        }

        data[y][x] = value;
    };

    Array2D.prototype.remove = function remove(x, y) {
        var data = this.data;
        if (hasOwn(data, y)) {
            delete data[y][x];
        }
    };

    Array2D.prototype.clear = function clear() {
        this.data.length = 0;
    };

    return Array2D;
});

class Response {
    constructor(_code, _success, _message, _data, _err) {
        this.code = _code;
        this.success = _success;
        this.message = _message;
        this.list_data = _data;
        this.error = _err;
    }
}

module.exports = Response;


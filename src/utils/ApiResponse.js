//Response should be in a stracture formate As it used many times:
//standardized response should be invoked:

class ApiResponse{
    constructor(statusCode, data,message= success){
        this.statusCode=statusCode;
        this.data=data;
        this.message=message;
        this.success=statusCode < 400
    }
}

export {ApiResponse}
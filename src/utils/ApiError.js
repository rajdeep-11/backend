//error should be in a stracture formate As it used many times:

class ApiError extends Error{
    constructor(
        statusCode,
        message ="Something went Wrong",
        errors=[],
        stack="",
    ){
        super(message);//overwrite the message
        this.statusCode= statusCode;
        this.data=null;
        this.message= message;
        this.errors= errors;
        this.success=false;


        //set the stack:
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }

}

export {ApiError}
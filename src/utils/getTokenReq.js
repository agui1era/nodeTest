const getLine = require("./getLine");
module.exports = (req)=>{
    let token = null
    try{
        token = req.headers.authorization.split("Bearer ")[1];
    }catch (e){

        console.log(e);
        console.log(getLine().default());

    }
    return token
}
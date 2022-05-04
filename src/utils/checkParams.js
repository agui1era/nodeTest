module.exports = (data,params)=>{
    let validate = true;
    for(let param of params){
        if(data[param] === undefined){
            validate = false;
        }
    }
    return validate
}
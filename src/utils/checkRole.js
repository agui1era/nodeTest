module.exports = (role) => {
    return role == "administrador" ? true : role == "supervisor" ? true : role == "operador"
}
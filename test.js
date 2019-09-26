const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

function check_user(login, password) {
    return new Promise(((resolve, reject) => {
        MongoClient.connect(url, function(err, client) {
            if (err) reject({error: err, message: 'Что-то пошло не так, обратитесь к разработчику TG - @LovixLzt'});
            console.log("Connected successfully to server");

            const db = client.db('db');
            const collection = db.collection('users');

            function find(login, password){
                collection.findOne({user: login}, (err, db)=>{
                    if(err) reject({error: err, message: 'Что-то пошло не так, обратитесь к разработчику TG - @LovixLzt'});
                    if(db == undefined) reject({message: 'Неврный логин или пароль'});
                    else {
                        if(db['password'] === password.toString()) resolve('Вход осуществлен');
                        else reject({message: 'Неверный логин или пароль'})
                    }
                });

            }
            find(login, password);

            client.close();
        });
    }))
}
async function f1(login, password) {
    try{
        let login1 = login.toString().replace(/[^a-zA-Z0-9]/g, '');
        let password1 = password.toString().replace(/[^a-zA-Z0-9]/g, '');
        return await check_user(login1, password1)
    }
    catch (e) {
        console.log(e);
        return e['message'];
    }
}

module.exports = {
    check: f1
};

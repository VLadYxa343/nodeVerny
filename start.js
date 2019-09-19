const request = require('request');
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('static'));
app.listen(3000);
var amount, status, qr;

function getBalance(token) {
    return new Promise((resolve, reject) => {
        let headers_to_send = {
            Authorization: 'Basic ' + token,
            Company: 'Verny',
        };


        request({
            url: 'https://rsloyalty.verno-info.ru/RS.Loyalty.WebMobileService/api/indicator',
            method: 'GET',
            encoding: 'UTF-8',
            headers: headers_to_send
        }, function (err, res, page) {
            let body = JSON.parse(page)["Amount"];
            resolve(body);
        });
    })
}
function getStatus(token) {
    return new Promise((resolve, reject)=>{
        let headers_to_send = {
            Authorization: 'Basic ' + token,
            Company: 'Verny',
        };
        request({uri: 'https://rsloyalty.verno-info.ru/RS.Loyalty.WebMobileService/api/discountCard/Get', encoding: 'UTF-8', headers: headers_to_send}, (e, r, p) => {
            if(p === 'Ошибка клиентской авторизации.') resolve(null);
            let page = JSON.parse(p);
            resolve(page)
        })
    })
}
function getQR(token, number){
    return new Promise(((resolve, reject) => {
        let headers_to_send = {
            Authorization: 'Basic ' + token,
            Company: 'Verny',
        };
        request({uri: 'https://rsloyalty.verno-info.ru/RS.Loyalty.WebMobileService/api/DiscountCard/OneTimeCode?number=' + number, encoding: 'UTF-8', headers: headers_to_send}, (e, r, p) =>{
            if(p === 'Ошибка клиентской авторизации.') resolve(null);

            let x = JSON.parse(p);
            resolve(x['Code']);
        })
    }))
}
function verify(token){
    return new Promise(((resolve, reject) => {
        let headers_to_send = {
            Authorization: 'Basic ' + token,
            Company: 'Verny',
        };
        request({uri: 'https://rsloyalty.verno-info.ru/RS.Loyalty.WebMobileService/api/discountCard/Get', encoding: 'UTF-8', headers: headers_to_send}, (e, r, p) => {
            if(p === "Ошибка клиентской авторизации.") resolve(r.statusCode);
            else resolve(r.statusCode)
        })
    }))
}

app.get('/', (req, res) => {
    async function f(token) {
        amount = await getBalance(token);

        status = await getStatus(token);

        qr = await getQR(token, status[0]['Number']);
        qr = qr.replace(/\+/g, "%2B");
        res.render('scratch', {amount: amount, number: status[0]['Number'], canpay: status[0]['CanPayBonuses'], qr: qr});
        console.log(qr)
    }
    f('f842f38d-5cb2-4454-9486-71809e143863');
});
app.get('/tokens/:token', (req, res)=>{
    async function f1() {
        let x = await verify(req.params.token);
        if (x !== 200)
            res.send('err');
        else
            res.send('ok')
    }
    f1()
});

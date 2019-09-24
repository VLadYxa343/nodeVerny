const request = require('request');
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
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
    return new Promise((resolve, reject) => {
        let headers_to_send = {
            Authorization: 'Basic ' + token,
            Company: 'Verny',
        };
        request({
            uri: 'https://rsloyalty.verno-info.ru/RS.Loyalty.WebMobileService/api/discountCard/Get',
            encoding: 'UTF-8',
            headers: headers_to_send
        }, (e, r, p) => {
            if (p === 'Ошибка клиентской авторизации.') resolve(null);
            let page = JSON.parse(p);
            resolve(page)
        })
    })
}

function getQR(token, number) {
    return new Promise(((resolve, reject) => {
        let headers_to_send = {
            Authorization: 'Basic ' + token,
            Company: 'Verny',
        };
        request({
            uri: 'https://rsloyalty.verno-info.ru/RS.Loyalty.WebMobileService/api/DiscountCard/OneTimeCode?number=' + number,
            encoding: 'UTF-8',
            headers: headers_to_send
        }, (e, r, p) => {
            if (p === 'Ошибка клиентской авторизации.') resolve(null);

            let x = JSON.parse(p);
            resolve({code: x['Code'], vu: x['ValidUntil']});
        })
    }))
}

function verify(token) {
    return new Promise(((resolve, reject) => {
        let headers_to_send = {
            Authorization: 'Basic ' + token,
            Company: 'Verny',
        };
        request({
            uri: 'https://rsloyalty.verno-info.ru/RS.Loyalty.WebMobileService/api/discountCard/Get',
            encoding: 'UTF-8',
            headers: headers_to_send
        }, (e, r, p) => {
            console.log(p);
            if(e) resolve(e);
            else resolve(r.statusCode);
        })
    }))
}

function registation(token){

}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.post('/getqr', urlencodedParser, (req, res) => {
    if (!req.body || !req.body['token']) {
        res.send('Ошибка')
    } else {
        async function f(token) {
            if (await verify(token) === 200) {
                amount = await getBalance(token);

                status = await getStatus(token);
                if(status[0]) {
                    qr = await getQR(token, status[0]['Number']);
                    let qr1 = qr['code'].replace(/\+/g, "%2B");
                    res.render('scratch', {
                        amount: amount,
                        number: status[0]['Number'],
                        canpay: status[0]['CanPayBonuses'],
                        valid: qr['vu'],
                        qr: qr1
                    });
                    console.log(qr)
                }
                else res.send('Карты не существует')
            } else {
                res.send('Ошибка авторизации')
            }
        }

        f(req.body['token']);

    }

});

let express = require('express');
let app = express();
let path = require('path');
let fs = require('fs')


//Rutas
app.get('/:model/:id', (req, res, next) => {

    let model = req.params.model
    let fileName = req.params.id



    if (!isModelValid(model)) {
        return res.status(400).json({
            ok: false,
            message: 'El modelo ' + model + ' no es valido'
        })
    }


    //let path = `contents/${model}/${fileName}`;

    let url = path.resolve(__dirname, `./../contents/${model}/${fileName}`);
    let urlDefault = path.resolve(__dirname, `./../contents/${model}/default.png`);

    fs.existsSync(url) ? res.sendFile(url) : res.sendFile(urlDefault);


    // res.status(200).json({
    //     ok: true,
    //     result: path
    // })
})

function isModelValid(model) {
    let validModel = ['doctors', 'users', 'hospitals'];
    return validModel.includes(model);
}


export default app
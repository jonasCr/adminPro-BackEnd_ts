import express from 'express';
let app = express();

import Hospital from './../models/hospital';
import Doctor from './../models/doctor';
import User from './../models/user';

//Rutas

/**
 * Realiza una busqueda en todo los campos
 */
app.get('/:query', async(req, res, next) => {

    let query = req.params.query;
    //crear una expresion regular para buscar en la collection
    let regEx = new RegExp(query, 'i')

    let promises:Promise<any>[] = []
    promises.push(searchHospital(query))
    promises.push(searchDoctors(query))
    promises.push(searchUsers(query))


    Promise.all(promises)
        .then(data => {
            res.status(200).json({
                ok: true,
                hospital: data[0],
                doctors: data[1],
                users: data[2]
            })
        })
        .catch(e => {
            return res.status(500).json({
                ok: false,
                result: 'Error en la base de datos',
                errors: e
            })
        })

})

/** */
app.post('/', async(req, res) => {
    let searchBy = req.body.searchBy; //{table: 'aaa', query: ''} 
    let query = req.body.query;

    let result

    try {
        switch (searchBy) {
            case 'user':
                result = await searchUsers(query);
                break;
            case 'doctor':
                result = await searchDoctors(query);
                break;
            case 'hospital':
                result = await searchHospital(query);
                break;
            default:
                return res.status(400).json({
                    ok: false,
                    result: 'Colleccion invalida'
                })

        }
    } catch (e) {
        return res.status(500).json({
            ok: false,
            result: 'Error de base de datos'
        })
    }

    res.status(200).json({
        ok: true,
        result: result
    })



})

function searchHospital(query) {
    let regEx = new RegExp(query, 'i')
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regEx })
            .populate('updatedBy', 'name email')
            .exec(
                (err, results) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results);
                    }
                })
    })
}

function searchDoctors(query) {
    let regEx = new RegExp(query, 'i')
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regEx })
            .populate('user', 'name email role')
            .populate('hospital')
            .exec(
                (err, results) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results);
                    }
                })
    })
}

function searchUsers(query) {
    let regEx = new RegExp(query, 'i')
    return new Promise((resolve, reject) => {
        User.find({}, 'name email role').or([{ 'name': regEx }, { 'email': regEx }])
            .exec(
                (err, results) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results);
                    }
                })
    })
}


export default app
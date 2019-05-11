import express from 'express';
let app = express();

import {Hospital} from '../models/mongoose/hospital';
import {Doctor} from '../models/mongoose/doctor';
import {User} from '../models/mongoose/user';
import { DoctorModel, HospitalModel, UserModel, CustomRequest } from '../models/interfaces';
import { ResponseCustom, Error, ErrorsCustom } from '../models';

//Rutas

/**
 * Realiza una busqueda en todo los campos
 */
app.get('/:query', async(req:CustomRequest, res, next) => {

    let query = req.params.query;
    //crear una expresion regular para buscar en la collection
    //let regEx = new RegExp(query, 'i')

    let promises:Promise<any>[] = []
    let response:ResponseCustom<any>;
    let result, error
    try {
        promises.push(searchHospital(query))
        promises.push(searchDoctors(query))
        promises.push(searchUsers(query))
    
        
    
    
        let data = await Promise.all(promises);
        result = {
            hospital: data[0],
            doctors: data[1],
            users: data[2]
        }
        /*
            .then(data => {
                result = {
                    hospital: data[0],
                    doctors: data[1],
                    users: data[2]
                }
                console.log(result);
            })
            .catch(e => {
                error = e;
            })
*/
        console.log(response);
        
    } catch (e) {
        error = e
    }

    response = new ResponseCustom<any>(error, result);
    

    res.status(response.getStatus()).json(response)

})

/** */
app.post('/', async(req:CustomRequest, res) => {
    let searchBy = req.body.searchBy; //{searchBy: 'aaa', query: ''} 
    let query = req.body.query;

    let result, error;

    try {
        switch (searchBy) {
            case 'users':
                result = await searchUsers(query);
                break;
            case 'doctors':
                result = await searchDoctors(query);
                break;
            case 'hospitals':
                result = await searchHospital(query);
                break;
            default:
                throw new Error(ErrorsCustom.invalidModel)

        }
    } catch (e) {
        error = e;
    }

    let response = new ResponseCustom<any>(error,result);

    res.status(response.getStatus()).json(response);



})

function searchHospital(query):Promise<HospitalModel> {
    let regEx = new RegExp(query, 'i')
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regEx })
            .populate('updatedBy', 'name email')
            .exec(
                (err, results:HospitalModel) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results);
                    }
                })
    })
}

function searchDoctors(query):Promise<DoctorModel> {
    let regEx = new RegExp(query, 'i')
    return new Promise((resolve, reject) => {
        Doctor.find({ name: regEx })
            .populate('user', 'name email role')
            .populate('hospital')
            .exec(
                (err, results:DoctorModel) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results);
                    }
                })
    })
}

function searchUsers(query):Promise<UserModel> {
    let regEx = new RegExp(query, 'i')
    return new Promise((resolve, reject) => {
        User.find({}, 'name email role').or([{ 'name': regEx }, { 'email': regEx }])
            .exec(
                (err, results:UserModel) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results);
                    }
                })
    })
}


export default app
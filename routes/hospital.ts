import express, { Request, response } from 'express';
let app = express();

import * as auth from './../middleware/auth';

import {Hospital} from './../models/mongoose/'
import { HospitalModel, CustomRequest } from '../models/interfaces';
import { ResponseCustom } from '../models';

/**
 * Devuelve la lista de los hospitales
 */
app.get('/', (req:CustomRequest, res) => {
    let startFrom = req.query.startWith || 0
    startFrom = Number(startFrom);
/*
    res.status(200).json({
        ok:true,
        result: 'iii'
    })*/

    Hospital.find({})
        .skip(startFrom)
        .limit(5)
        .populate('updatedBy', 'name email')
        .exec(
            (err, hospitals:HospitalModel[]) => {
                console.log(hospitals);
                let response = new ResponseCustom<HospitalModel[]>(err, hospitals);
                /*
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error en la base de datos',
                        errors: err
                    })
                }*/

                if (!response.error){
                    Hospital.count({}, (err, count) => {
                        response.updateError(err);
                        if (!response.error) {
                            response.count = count;
                        }
                    /*
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error en la base de datos',
                            errors: err
                        })
                    }*/
                       
                    })

                }

                console.log(response);
                res.status(response.getStatus()).json(response);
            })



})

/**
 * Crea un hospital y lo devuelve
 */
app.post('/', auth.checkToken, (req:CustomRequest, res) => {
    let body = req.body;
    let userlogged = req.user

    let hospital = new Hospital({
        name: body.name,
        updatedBy: userlogged._id,
        image: body.image,
    })

    hospital.save((err, newHospital:HospitalModel) => {
        
        let response = new ResponseCustom<HospitalModel>(err,newHospital);

        res.status(response.getStatus()).json(response);

    })

})

/**
 * Actualiza un hospital y lo devuelve
 */
app.put('/:id', auth.checkToken, (req:CustomRequest, res) => {
    let id = req.params.id
    let body:HospitalModel = req.body;
    let userlogged = req.user;

    Hospital.findById(id, (err, hospital:HospitalModel) => {

        let response = new ResponseCustom<HospitalModel>(err,hospital);

        if (response.error) {
            return res.status(response.getStatus()).json({response})
        }

        hospital.name = body.name ? body.name : hospital.name;
        hospital.updatedBy = userlogged._id;


        hospital.save((err:any, updatedHospital:HospitalModel) => {
            response = new ResponseCustom(err, updatedHospital, 'Hospital guardado');

            return res.status(response.getStatus()).json({response})

        })
    })

});

/**
 * Elimina un hospital y devuelve el hospital eliminado
 */
app.delete('/:id', auth.checkToken, (req:CustomRequest, res) => {
    let id = req.params.id
    let userlogged = req.user;

    Hospital.findByIdAndRemove(id, (err, deletedHospital) => {

        let response = new ResponseCustom<HospitalModel>(err, deletedHospital, 'El hospital ha sido borrado');
        
        res.status(response.getStatus()).json(response)
    })

})




export default app
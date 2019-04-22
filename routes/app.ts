import express from 'express';
const app:express.Application = express();


//Rutas
export default app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        result: 'Petición correcta'
    })
})



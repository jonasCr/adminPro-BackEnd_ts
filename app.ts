// Requires
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
//Import rutas
import appRoutes from './routes/app';
import userRoutes from './routes/user'
import loginRoutes from './routes/login'
import hospitalRoutes from './routes/hospital'
import doctorRoutes from './routes/doctor'
import searchRoutes from './routes/search'
import uploadRoutes from './routes/upload'
import imagesRoutes from './routes/images'


//Inicializar variables
const app:express.Application = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Conexion con la base de datos
let db = async() => await mongoose.connect('mongodb://localhost:27017/hospitalDB', {useNewUrlParser: true});


//Routes
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/doctor', doctorRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/images', imagesRoutes);
app.use('/', appRoutes);

app.listen(3000, () => {
    console.log('express server port 3000: \x1b[32m%s\x1b[0m', 'online')
})
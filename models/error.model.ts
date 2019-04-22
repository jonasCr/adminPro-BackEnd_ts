import { ErrorsCustom } from "./response.model";

export class Error{
    /**
     * El message que el front debera enseñar al usuario
     */
    message:string = 'Un error ha occurido';
    /**
     * MAs detalle para el desarollador destinido a estar lanzado en un console.error
     */
    error: any;

    constructor( error:any) {
        this.error = error
        this.message = this.getMessageError(error);
    }

    getMessageError(error:any):string{
        switch (error) {
            case ErrorsCustom.notFound:
                return 'No se ha encontrado nigun registro'
            default:
                console.error(error);
                return 'Ha occurido un error desconocido'
        }
    }

    getStatus():number{
        switch (this.error) {
            default:
                return 500;
        }
    }
}
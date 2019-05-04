/**
 * A completar en funcion de lo que suje
 */
export enum ErrorsCustom {
    notFound = 1,
    wrongPassword,
    userUnauthorize
}

export class Error{
    /**
     * El message que el front debera enseñar al usuario
     */
    message:string = 'Un error ha occurido';
    /**
     * Mas detalle para el desarollador destinido a estar lanzado en un console.error
     */
    error: any;

    constructor( error:any) {
        this.error = error
        this.message = this.getMessageError(error);
    }

    getMessageError(error:any):string{
        if (error.errors) {
            let e = Object.keys(error.errors)[0];
            return error.errors[e].message;
        }
        switch (error) {
            case ErrorsCustom.notFound:
                return 'No se ha encontrado ningún registro';
            case ErrorsCustom.wrongPassword:
                return 'La contraseña no es correcta';
            case error.errors:
                return 'toimemetusai'
            default:
                console.error(error);
                return 'Ha occurido un error desconocido'
        }
    }

    getStatus():number{
        switch (this.error) {
            case ErrorsCustom.notFound:
                return 400;
            case ErrorsCustom.wrongPassword:
                return 401;
            case ErrorsCustom.userUnauthorize:
                return 401;
            default:
                return 500;
        }
    }
}
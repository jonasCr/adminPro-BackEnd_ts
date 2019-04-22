import { Error } from "./error.model";

/**
 * A completar en funcion de lo que suje
 */
export enum ErrorsCustom {
    notFound = 1,
}


/**
 * La clase response permite crear un respuesta rapida a enviar al front-end
 * La idea es pasar tanto el resultado como el error y el constructor se encarga se crear la respuesta adecuada
 */
export class Response<T> {

    status:number
    confirm?:string;
    error:Error | null;
    result:T | null;

    /**
     * 
     * @param error el error a procesar
     * @param result el resultado resperado
     * @param confirm el message de confirmación
     */
    constructor(error?:any, result?:any, confirm?:string ) {
        if (error){
            this.result = null;
            this.error = new Error(error);
            this.status = this.error.getStatus();
            return;
        }

        if (!result){
            this.error = new Error(ErrorsCustom.notFound);
            this.status = this.error.getStatus();
            this.result = null;
            return;
        }

        if (confirm) this.confirm = confirm;

        this.result = result;
        this.error = null;
        this.status = 200;
    }

    /**
     * Como el status no se debe mandar en la respuesta,
     * Se crear esta function para asignarlo en la logica principal y luego se elimina
     * para mandarlo al front-end:
     * @use res.status(response.getStatus).json({
     *     response
     * })
     */
    getStatus():number{
        let response = this.status;
        delete this.status;
        return response;
    }

    
}
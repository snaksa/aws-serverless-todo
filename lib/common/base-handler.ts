import { Logger } from "../helpers/logger-helper";
import { ApiGatewayResponseCodes } from "./api-gateway-response-codes";

export interface Response {
    statusCode: number;
    body: object;
}

export default abstract class BaseHandler {
    protected parseEvent(event: any) {
        throw new Error("Not implemeted");
    }

    protected validate(): boolean {
        return true;
    }

    protected authorize(): boolean {
        return true;
    }

    protected format(data: Response) {
        return {
            statusCode: data.statusCode ?? ApiGatewayResponseCodes.OK,
            body: JSON.stringify(data.body) ?? {},
        };
    }

    protected formatError(message: string, code: number = 400) {
        return {
            statusCode: code,
            body: JSON.stringify({ message }),
        };
    }

    protected async run(): Promise<Response> {
        throw new Error("Not implemented");
    }

    public create() {
        return async (event: any) => {
            Logger.info(event);
            
            this.parseEvent(event);

            if (!this.validate()) {
                Logger.error('Input parameters not valid');
                Logger.error(event);
                return {
                    statusCode: ApiGatewayResponseCodes.BAD_REQUEST,
                    body: JSON.stringify({ message: 'Input parameters not valid' })
                };
            }

            if (!this.authorize()) {
                Logger.error('Unauthorized access');
                return {
                    statusCode: ApiGatewayResponseCodes.UNAUTHORIZED,
                    body: JSON.stringify({ message: 'Unauthorized access' })
                };
            }

            try {
                const result: Response = await this.run();
                Logger.info('Successful execution');
                Logger.info(result);
                return this.format(result);
            }
            catch (err) {
                Logger.error(err.message);
                return this.formatError(err.message);
            }
        };
    }
}
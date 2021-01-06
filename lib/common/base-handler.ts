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
            statusCode: data.statusCode,
            body: JSON.stringify(data.body),
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
            this.parseEvent(event);

            if (!this.validate()) {
                return {
                    statusCode: ApiGatewayResponseCodes.BAD_REQUEST,
                    body: JSON.stringify({ message: 'Body not valid' })
                };
            }

            if(!this.authorize()) {
                return {
                    statusCode: ApiGatewayResponseCodes.UNAUTHORIZED,
                    body: JSON.stringify({ message: 'Unauthorized' })
                };
            }

            try {
                const result: Response = await this.run();
                return this.format(result);
            }
            catch (err) {
                return this.formatError(err.message);
            }
        };
    }
}
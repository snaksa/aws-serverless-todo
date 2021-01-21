export class Logger {
    public static info (message: any) {
            console.log(message);
    }

    public static error (message: any): void {
        console.error(message);
    }

}
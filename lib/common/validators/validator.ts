export class Validator {
    public static notEmpty(input?: string): boolean {
        return Boolean(input && input.length);
    }

    public static notNull(input?: any): boolean {
        return Boolean(input);
    }
}
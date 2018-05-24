export class Sheet {

    public static getInstance(): Sheet {
        if (!this.instance) {
            this.instance = new Sheet();
        }
        return this.instance;
    }

    private static instance: Sheet;

    private constructor() { }
}

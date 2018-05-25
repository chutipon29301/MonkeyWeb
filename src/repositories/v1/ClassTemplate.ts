import * as Sequelize from 'sequelize';
import { Connection } from '../../models/Connection';

export class ClassTemplate {

    public static getInstance(): ClassTemplate {
        if (!this.instance) {
            this.instance = new ClassTemplate();
        }
        return this.instance;
    }

    private static instance: ClassTemplate;

    // private model: Sequelize.Model<QuarterInstance, IQuarterModel>;

    private constructor() {
        // this.model = ;
    }

}

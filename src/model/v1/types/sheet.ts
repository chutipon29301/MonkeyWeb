export interface ITopic {
    ID: number;
    TopicSubject: string;
    Class: string;
    Topic: string;
    TopicName: string;
}

export interface ISheet {
    ID: number;
    TopicID: number;
    SheetLevel: string;
    SheetNumber: string;
    Rev: string;
    SheetPath: string;
}

export interface IHybridSheet extends ITopic, ISheet {}

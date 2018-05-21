export interface ITopicID {
    ID: number;
}

export interface ITopic extends ITopicID {
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

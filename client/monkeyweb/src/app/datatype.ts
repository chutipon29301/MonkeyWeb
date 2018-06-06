export interface Student {
    ID: number;
    Firstname: string;
    Nickname: string;
    Grade: number;
    StudentLevel?: string;
    Remark?: string;
}

export interface Students {
    students: Student[];
}

export interface Token {
    expire: string;
    token: string;
}

export interface Student {
    ID: number;
    Firstname: string;
    Nickname: string;
    Grade: number;
    StudentLevel?: string;
    Remark?: string;
    ChatMessage?: string;
}

export interface Students {
    students: Student[];
}

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

export interface Token {
    ID: number;
    token: string;
    refreshToken: string;
    expire: string;
    Position: string;
    Nickname: string;
    NicknameEn: string;
    Firstname: string;
    FirstnameEn: string;
    Lastname: string;
    LastnameEn: string;
    Phone: string;
    Email: string;
}

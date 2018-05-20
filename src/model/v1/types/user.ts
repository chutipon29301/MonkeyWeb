export interface IUserID {
    ID: number;
}

export interface IUserNicknameEn extends IUserID {
    NicknameEn: string;
}

export interface IUserEnglishName extends IUserNicknameEn {
    FirstnameEn: string;
    LastnameEn: string;
}

export interface IUserThaiName extends IUserID {
    Firstname: string;
    Lastname: string;
    Nickname: string;
}

export interface IUserName extends IUserEnglishName, IUserThaiName { }

export interface IUserInfo extends IUserName {
    Email: string;
    Phone: string;
}

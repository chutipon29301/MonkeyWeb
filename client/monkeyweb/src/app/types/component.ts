export interface DialogAction {
    txt: string;
    close: boolean;
    func: string;
    color: string;
    txtColor: string;
}

export interface Dialog {
    title: string;
    content: string;
    action: [DialogAction];
}

export interface DialogAction {
    txt: string;
    close: boolean;
    func?: (a: string) => void;
    color: string;
    txtColor: string;
}

export interface Dialog {
    title: string;
    content: string;
    action: DialogAction[];
}

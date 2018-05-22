export class Menu {
    children?: Menu[];
    name: string;
    path?: string;
}

export class FlatMenu {
    name: string;
    path: string;
    level: number;
    expandable: boolean;
}

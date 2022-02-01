import ConstTag from '../../../nodes/ConstTag';
export declare function get_const_tags(const_tags: ConstTag[]): {
    type: string;
    kind: string;
    declarations: {
        type: string;
        id: import("estree").Pattern;
        init: import("estree").Expression;
    }[];
};

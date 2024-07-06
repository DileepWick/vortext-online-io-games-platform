import { MarkType } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
declare type ClickHandlerOptions = {
    type: MarkType;
    whenNotEditable: boolean;
};
export declare function clickHandler(options: ClickHandlerOptions): Plugin;
export {};

export declare const dirty_components: any[];
export declare const intros: {
    enabled: boolean;
};
export declare const binding_callbacks: any[];
export declare function schedule_update(): void;
export declare function tick(): Promise<void>;
export declare function add_render_callback(fn: any): void;
export declare function add_flush_callback(fn: any): void;
export declare function flush(): void;

export interface ToolFn<A = any, T = any> {
    (input: { userMessage: string; toolArgs: A }): Promise<T>
}
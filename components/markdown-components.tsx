import { Components } from "react-markdown";

type CodeProps = {
    inline?: boolean;
    className?: string;
} & React.HTMLProps<HTMLElement>;

export const markdownComponents: Components = {
    // Override heading styles
    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold my-3" {...props} />,

    // Override link styles
    a: ({ node, ...props }) => (
        <a
            className="text-primary hover:underline"
            {...props}
            target="_blank"
            rel="noopener noreferrer"
        />
    ),

    // Override code blocks
    code: ({ inline, ...props }: CodeProps) =>
        inline ? (
            <code className="bg-muted px-1 py-0.5 rounded" {...props} />
        ) : (
            <code className="block bg-muted p-4 rounded-lg my-4" {...props} />
        ),

    // Override lists
    ul: ({ node, ...props }) => <ul className="list-disc list-inside my-4" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-4" {...props} />,

    // Override paragraphs
    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
};

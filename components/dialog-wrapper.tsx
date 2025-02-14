import { cn } from "@/lib/utils";
import { DialogTitle } from "@mui/material";
import { DialogContent } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

function DialogWrapper({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <DialogContent
            className={cn(
                "sm:max-w-3xl",
                "max-h-[calc(100vh-10rem)]",
                "bg-neutral-900/70",
                "text-white",
                "overflow-y-auto",
                "!rounded-5xl"
            )}
        >
            <VisuallyHidden>
                <DialogTitle>{title}</DialogTitle>
            </VisuallyHidden>
            {children}
        </DialogContent>
    );
}

export default DialogWrapper;
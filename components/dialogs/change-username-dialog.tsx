"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChangeUsernameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUsername?: string;
    onUpdate: (username: string) => Promise<void>;
}

export function ChangeUsernameDialog({
    open,
    onOpenChange,
    currentUsername,
    onUpdate,
}: ChangeUsernameDialogProps) {
    const [username, setUsername] = useState(currentUsername || "");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await onUpdate(username);
            toast({
                description: "Username updated successfully",
            });
            onOpenChange(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update username",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Username</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter new username"
                            disabled={isLoading}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !username.trim()}>
                            {isLoading ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

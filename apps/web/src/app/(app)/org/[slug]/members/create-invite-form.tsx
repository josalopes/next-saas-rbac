'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormState } from '@/hooks/use-form-state'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
// import { useParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInviteAction } from "./actions";

export function CreateInviteForm() {

    const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
        createInviteAction,
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {success === false && message && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4"/>
                    <AlertTitle>Falha ao criar o convite</AlertTitle>
                    <AlertDescription>
                        <p>{message}</p>
                    </AlertDescription>
                </Alert>
            )}
            
            <div className="flex items-center gap-2">
                <div className="space-y-1 flex-1">
                    <Input 
                        type="email" 
                        name="email"  
                        id="email" 
                        placeholder="joao@exemplo.com"
                    />

                    {errors?.name && (
                        <span className="text-xs font-medium text-red-500">{errors.email[0]}</span>
                    )}
                </div>

                <Select name="role" defaultValue="MEMBER">
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem> 
                        <SelectItem value="MEMBER">Member</SelectItem> 
                        <SelectItem value="BILLING">Billing</SelectItem> 
                    </SelectContent>
                </Select>

                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="size-4 animate-spin"/>
                    )  : (
                        'Convidar usuário'
                    )}
                </Button>
            </div>
        </form>
    )
}
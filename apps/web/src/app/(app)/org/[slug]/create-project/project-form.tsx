'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState } from '@/hooks/use-form-state'

import { createProjectAction } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";
import { queryClient } from "@/lib/react-query";

export function ProjectForm() {
    const { slug: org } = useParams<{ slug: string }>()

    const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
        createProjectAction,
        () => {
            queryClient.invalidateQueries({
                queryKey: [org, 'projects']
            })
        },
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {success === false && message && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4"/>
                    <AlertTitle>Falha ao salvar o projeto</AlertTitle>
                    <AlertDescription>
                        <p>{message}</p>
                    </AlertDescription>
                </Alert>
            )}
            
            {success === true && message && (
                <Alert>
                    <AlertTriangle className="size-4"/>
                    <AlertTitle>Sucesso!</AlertTitle>
                    <AlertDescription>
                        <p>{message}</p>
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-1">
                <Label htmlFor="name">Nome do projeto</Label>
                <Input type="text" name="name"  id="name"/>

                {errors?.name && (
                    <span className="text-xs font-medium text-red-500">{errors.name[0]}</span>
                )}
            </div>
            
            <div className="space-y-1">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                    name="description"  
                    id="description" 
                />

                {errors?.description && (
                    <span className="text-xs font-medium text-red-500">{errors.description[0]}</span>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="size-4 animate-spin"/>
                    )  : (
                        'Salvar Projeto'
                    )}
                </Button>
        </form>
    )
}
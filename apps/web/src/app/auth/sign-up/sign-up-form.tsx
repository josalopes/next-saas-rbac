'use client'

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFormState } from '@/hooks/use-form-state'

import githubIcon from "@/assets/github-icon.svg"
import { signUpAction } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { signInWithGithub } from "../actions";

export function SignUpForm() {
    const router = useRouter()

    const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
        signUpAction,
        () => {
            router.push('/auth/sign-in')
        }
    )

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {success === false && message && (
                    <Alert variant="destructive">
                        <AlertTriangle className="size-4"/>
                        <AlertTitle>Falha ao realizar login!</AlertTitle>
                        <AlertDescription>
                            <p>{message}</p>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-1">
                    <Label htmlFor="name">Nome</Label>
                    <Input type="text" name="name"  id="name"/>

                    {errors?.name && (
                        <span className="text-xs font-medium text-red-500">{errors.name[0]}</span>
                    )}
                </div>
                
                <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" name="email"  id="email"/>

                    {errors?.email && (
                        <span className="text-xs font-medium text-red-500">{errors.email[0]}</span>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password">Senha</Label>
                    <Input type="password" name="password"  id="password"/>

                    {errors?.password && (
                        <span className="text-xs font-medium text-red-500">{errors.password[0]}</span>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password_confirmation">Confirme sua senha</Label>
                    <Input type="password" name="password_confirmation"  id="password_confirmation"/>

                    {errors?.password_confirmation && (
                        <span className="text-xs font-medium text-red-500">{errors.password_confirmation[0]}</span>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="size-4 animate-spin"/>
                    )  : (
                        'Criar conta'
                    )}
                </Button>

                <Button variant="link" className="w-full size=sm" asChild>
                    <Link href="/auth/sign-in">
                    Já tem uma conta? Faça login
                    </Link>
                </Button>
            </form>

            <Separator />

            <form action={signInWithGithub}>
                <Button 
                    type="submit"
                    variant="outline" 
                    className="w-full"
                >
                    <Image src={githubIcon} alt="" className="size-4 mr-2 dark:invert" />
                    Entrar com GitHub
                </Button>
            </form>
        </div>
    )
}


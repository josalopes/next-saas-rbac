'use client'

import Link from "next/link";
import Image from "next/image";
import { useTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { Loader2, AlertTriangle } from "lucide-react";

import githubIcon from "@/assets/github-icon.svg"
import { signInWithEmailAndPassword } from './actions'
import { useFormState } from '@/hooks/use-form-state'
import { useRouter } from "next/navigation";
import { signInWithGithub } from "../actions";

export function SignInForm() {
    const router = useRouter()
    const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
        signInWithEmailAndPassword,
        () => {
            router.push('/')
        }
    )

    return (
        <div>

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

                    <Link href="/auth/forgot-password" className="text-xs text-foreground hover:underline">
                        Esqueceu sua senha?
                    </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <Loader2 className="size-4 animate-spin"/>  : 'Entrar com e-mail' }
                </Button>

                <Button variant="link" className="w-full size=sm" asChild>
                    <Link href="/auth/sign-up">
                        Criar nova conta
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


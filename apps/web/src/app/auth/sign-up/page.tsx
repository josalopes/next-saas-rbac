import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import githubIcon from "@/assets/github-icon.svg"

export default function SignUpPage() {
    return (
        <form action="" className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="name">Nome</Label>
                <Input type="text" name="name"  id="name"/>
            </div>
            
            <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input type="email" name="email"  id="email"/>
            </div>

            <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input type="password" name="password"  id="password"/>
            </div>

            <div className="space-y-1">
                <Label htmlFor="password_confirmation">Confirme sua senha</Label>
                <Input type="password" name="password_confirmation"  id="password_confirmation"/>
            </div>

            <Button type="submit" className="w-full">
                Criar conta
            </Button>
            
            <Button variant="link" className="w-full size=sm" asChild>
                <Link href="/auth/sign-in">
                  Já tem uma conta? Faça login
                </Link>
            </Button>

            <Separator />

            <Button type="submit" variant="outline" className="w-full">
                <Image src={githubIcon} alt="" className="size-4 mr-2 dark:invert" />
                Usar GitHub
            </Button>

        </form>
    )
}
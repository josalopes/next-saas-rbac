import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import githubIcon from "@/assets/github-icon.svg"

export default function ForgotPasswordPage() {
    return (
        <form action="" className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input type="email" name="email"  id="email"/>
            </div>

            <Button type="submit" className="w-full">
                Recuperar senha
            </Button>

            <Button variant="link" className="w-full" size="sm" asChild>
                <Link href="/auth/sign-in">
                  Retornar para login
                </Link>
            </Button>


        </form>
    )
}
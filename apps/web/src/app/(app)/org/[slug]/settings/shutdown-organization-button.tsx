import { getCurrentOrg } from "@/auth/auth";
import { Button } from "@/components/ui/button";
import { shutdownOrganization } from "@/http/shutdown-organization";
import { XCircle } from "lucide-react";
import { redirect } from "next/navigation";

export function ShutdownOrganization() {
    async function shutdownOrganizationAction() {
        'use server'

        const currentOrg = await getCurrentOrg();

        await shutdownOrganization({ org: currentOrg! });

        redirect('/')
    }

    return (
        <form action={shutdownOrganizationAction}>
            <Button type="submit" variant="destructive" className="w-56">
                <XCircle className="size-4 mr-2"/>
                Excluir organização    
            </Button>

        </form>
    )
}
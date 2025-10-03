import { ability } from "@/auth/auth";
import { ProjectForm } from "./project-form";
import { redirect } from "next/navigation";

export default async function CreateProject() {
    const permissions = await ability()

    if (permissions?.cannot('get', 'Project')) {
        redirect('/')
    }
    
    return (
        <div className="space-y-4">
            <main className="mx-auto w-full max-w-[1200px] space-y-4">
                <h1 className="text-2xl font-bold">Criar Projeto</h1>    
            
                <ProjectForm />
            </main>
        </div>
    )
}
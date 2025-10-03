import { OrganizationForm } from "../org/organization-form";

export default function CreateOrganization() {
    return (
        <div className="space-y-4 py-4">
            <main className="mx-auto w-full max-w-[1200px] space-y-4">
                <h1 className="text-2xl font-bold">Criar Organização</h1>    
            
                <OrganizationForm />
            </main>
        </div>
    )
}
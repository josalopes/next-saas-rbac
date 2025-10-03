import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { OrganizationForm } from "../../org/organization-form";
import { InterceptedSheetContent } from "@/components/intercepted-sheet-content";

export default function CreateOrganization() {
    return (
        <Sheet defaultOpen>
            <InterceptedSheetContent>
                <SheetHeader>
                    <SheetTitle>Criar Organização</SheetTitle>
                </SheetHeader>
                <div className="px-4 py-4">
                    <OrganizationForm />
                </div>
            </InterceptedSheetContent>
        </Sheet>
    )
}
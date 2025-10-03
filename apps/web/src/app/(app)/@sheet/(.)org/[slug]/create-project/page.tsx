import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InterceptedSheetContent } from "@/components/intercepted-sheet-content";
import { ProjectForm } from "@/app/(app)/org/[slug]/create-project/project-form";

export default function CreateProject() {
    return (
        <Sheet defaultOpen>
            <InterceptedSheetContent>
                <SheetHeader>
                    <SheetTitle>Criar projeto</SheetTitle>
                </SheetHeader>
                <div className="px-4 py-4">
                    <ProjectForm />
                </div>
            </InterceptedSheetContent>
        </Sheet>
    )
}
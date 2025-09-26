import { type FormEvent, useTransition, useState } from "react";

interface FormState {
    success: boolean,
    message: string | null,
    errors: Record<string, string[]> | null,
}

export function useFormState(
    action: (data: FormData) => Promise<FormState>,
    onSuccess?: () => void | void,
    initialState?: FormState
) {
    const [isPending, startTransition] = useTransition()
    
    const [formState, setFormSate] = useState(
        initialState ?? {
            success: false, 
            message: null, 
            errors: null 
        },
    )
        
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const form = event.currentTarget
        const data = new FormData(form)

        startTransition(async () => {
            const state = await action(data)

            if (state.success && onSuccess) {
                await onSuccess()
            }
            
            setFormSate(state)
        })
    }

    return [formState, handleSubmit, isPending] as const
}
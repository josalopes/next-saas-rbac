'use client'

import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
    const { setTheme} = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Sun className="size-4 dark:invisible dark:size=0"/>
                    <Moon className="size-0 dark:visible dark:size=4 "/>
                    <span className="sr-only">Trocar tema</span>
                </Button>
            </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme('light')}>Claro</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>Escuro</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>Sistema</DropdownMenuItem>
                </DropdownMenuContent>
        </DropdownMenu>
    )
}
import Image from "next/image"
import { Slash } from "lucide-react"

import rocketseatIcon from "@/assets/rocketseat-icon.svg"
import { ProfileButton } from "./profile-button"
import { OrganizationSwitcher } from "./organization-switcher"
import { ability } from "@/auth/auth"
import { Separator } from "./ui/separator"
import { ThemeSwitcher } from "./theme/theme-switcher"
import { ProjectSwitcher } from "./project-switcher"

export default async function Header() {
    const permissions = await ability()

    return (
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
            <div className="flex items-center gap-3">
                <Image 
                    src={rocketseatIcon} 
                    alt="Rocketseat Icon" 
                    className="size-6 dark:invert" 
                />
                <Slash className="size-3 -rotate-[24deg] text-border" />

                <OrganizationSwitcher />

                {permissions?.can('get', 'Project') && (
                    <>
                      <Slash className="size-3 -rotate-[24deg] text-border" />
                      <ProjectSwitcher/>
                    </>
                )}
            </div>


            <div className="flex items-center gap-4">
                <ThemeSwitcher />
                <Separator orientation="vertical" className="h-5"/>
                <ProfileButton />
            </div>
        </div>
    )
}

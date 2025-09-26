import Image from "next/image"
import { Slash } from "lucide-react"

import rocketseatIcon from "@/assets/rocketseat-icon.svg"
import { ProfileButton } from "./profile-button"
import { OrganizationSwitcher } from "./organization-switcher"

export default function Header() {
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
            </div>


            <div className="flex items-center gap-4">
                <ProfileButton />
            </div>
        </div>
    )
}

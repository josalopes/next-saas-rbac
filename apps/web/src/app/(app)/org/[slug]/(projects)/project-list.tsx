import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarFallback } from "@radix-ui/react-avatar";

export function ProjectList() {
    return (
        <div className="grid grid-cols-3 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Projeto 01</CardTitle>
                    <CardDescription className="line-clamp-2 leading-relaxed">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam dolores consectetur officia consequatur eaque earum provident maiores repudiandae. Voluptate cumque quasi commodi adipisci quidem obcaecati aut sequi eos ad magnam!
                    </CardDescription>                    
                </CardHeader>
                <CardFooter className="flex items-center gap-1.5">
                    <Avatar className="size-4">
                        <AvatarImage src="https://github.com/josalopes.png" />
                        <AvatarFallback />
                    </Avatar>

                    <span className="text-xs text-muted-foreground">
                        Criado por <span className="font-medium text-foreground">Francisco Josafá</span> a 1 dia atrás
                        </span>
                </CardFooter>
            </Card>
        </div>
        
    )
}
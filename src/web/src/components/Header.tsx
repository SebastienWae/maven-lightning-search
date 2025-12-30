import { GithubLogoIcon, LightningIcon, XLogoIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Separator orientation="vertical" />
        <LightningIcon weight="fill" className="text-primary" />
        <Separator orientation="vertical" />
        <h1 className="text-base font-medium select-none">Maven Lightning Search</h1>
        <Separator orientation="vertical" />
        <div className="ml-auto flex items-center gap-2">
          <ButtonGroup>
            <ButtonGroupSeparator />
            <Button
              variant="ghost"
              nativeButton={false}
              render={
                <a
                  href="https://github.com/SebastienWae/maven-lightning-search"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="dark:text-foreground"
                />
              }
              size="icon-lg"
              className="hidden sm:flex"
            >
              <GithubLogoIcon />
            </Button>
            <ButtonGroupSeparator />
            <Button
              variant="ghost"
              nativeButton={false}
              render={
                <a
                  href="https://x.com/Seb_Wae"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="dark:text-foreground"
                />
              }
              size="icon-lg"
              className="hidden sm:flex"
            >
              <XLogoIcon />
            </Button>
            <ButtonGroupSeparator />
          </ButtonGroup>
        </div>
      </div>
    </header>
  );
}

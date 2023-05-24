import { PropsWithChildren } from "react"

import { cn } from "@guidepilot/ui/lib/utils"

export const CenterPageWrapper = ({
  children,
  centered = true,
  withBg = true,
}: PropsWithChildren<{ centered?: boolean; withBg?: boolean }>) => {
  return (
    <main
      className={cn(
        "relative flex h-[100vh] w-full flex-col items-center justify-center",
        centered ? "text-center" : ""
      )}
    >
      {children}
      {withBg && (
        <div
          className="absolute inset-0 -z-10 h-full w-full bg-cover bg-top bg-no-repeat opacity-50"
          style={{
            backgroundImage:
              "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAAXNSR0IArs4c6QAAAIpJREFUGFdj3D39Rcvvb/+F/nxlOODhwdD5/BOjwtsvDAcY9zd8Enn/9asjN/e/pw4+f+bdecXCz8PGOJ+RgYGBYVHsCzHfpOdcbAJM8YwMzPz/GRkXgyVA4P///SyfrrHzsTCysX/+zfoJLgGSXOr9UPAb+y9ulXcqL1Ak5gU+cPrHyKj6l+H/aQCpwjOUUBIQugAAAABJRU5ErkJggg==)",
          }}
        />
      )}
    </main>
  )
}

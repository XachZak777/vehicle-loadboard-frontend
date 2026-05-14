"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "font-medium text-sm shadow-lg rounded-lg border",
          title: "font-semibold",
          description: "opacity-90 text-xs",
          success:
            "bg-amber-600 text-white border-amber-700 [&>[data-icon]]:text-white",
          error:
            "bg-red-600 text-white border-red-700 [&>[data-icon]]:text-white",
          warning:
            "bg-amber-500 text-white border-amber-600 [&>[data-icon]]:text-white",
          info:
            "bg-muted text-foreground border-border [&>[data-icon]]:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };


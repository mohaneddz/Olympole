import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transform-gpu transition-[transform,box-shadow,background-color,border-color,color,opacity,filter] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-black hover:bg-primary/90 border border-primary hover:scale-[1.02] hover:brightness-110",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.02]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]",
        secondary: "bg-secondary text-white hover:bg-secondary/80 border border-secondary hover:scale-[1.02] hover:brightness-110",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border border-cyan-400 hover:scale-[1.02] hover:brightness-110",
        neonPill:
          "rounded-full border border-cyan-300/70 bg-cyan-400/10 text-cyan-100 backdrop-blur-md hover:bg-cyan-400 hover:text-black hover:-translate-y-0.5 hover:brightness-110 hover:scale-[1.02]",
        hero:
          "rounded-full border-[2.5px] border-[#81e6ff] bg-[#0b1636]/60 text-white font-bold backdrop-blur-xl hover:scale-[1.02] hover:bg-[#81e6ff] hover:text-[#0b1636] hover:border-[#81e6ff] shadow-[0_0_25px_rgba(129,230,255,0.25)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        pill: "h-12 rounded-full px-9 text-lg tracking-wide",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

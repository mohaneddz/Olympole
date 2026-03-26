import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl glass-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const GlowCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { glowColor?: "cyan" | "purple" }>(
  ({ className, glowColor = "cyan", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl glass-card text-card-foreground transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden",
        glowColor === "cyan" ? "hover:glow-border-cyan" : "hover:glow-border-purple",
        className
      )}
      {...props}
    >
      <div className={cn(
        "absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl",
        glowColor === "cyan" ? "bg-gradient-to-br from-cyan-500/20 to-transparent" : "bg-gradient-to-br from-purple-500/20 to-transparent"
      )} />
      <div className="relative z-10 w-full h-full">
        {props.children}
      </div>
    </div>
  )
)
GlowCard.displayName = "GlowCard"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-foreground/70", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, GlowCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

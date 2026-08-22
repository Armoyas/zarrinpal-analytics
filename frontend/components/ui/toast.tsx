import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
<<<<<<< HEAD
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    variant?: "default" | "destructive"
  }
>(({ className, variant, ...props }, ref) => {
=======
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => {
>>>>>>> b02ecabe7ff1feb08af1199006c2ee9cdf441a41
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full max-w-sm select-none rounded-md border p-3 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitive.Root.displayName

const ToastProvider = ToastPrimitive.Provider
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-medium", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-xs opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

export { Toast, ToastProvider, ToastTitle, ToastDescription }

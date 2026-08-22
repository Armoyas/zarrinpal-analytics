import { useToast } from "@/components/ui/use-toast"
<<<<<<< HEAD
import { Toast, ToastDescription, ToastProvider, ToastTitle } from "@/components/ui/toast"
=======
import { Toast, ToastDescription, ToastTitle, ToastProvider } from "@/components/ui/toast"
>>>>>>> b02ecabe7ff1feb08af1199006c2ee9cdf441a41

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, ...props }) => (
        <Toast key={id} {...props}>
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
        </Toast>
      ))}
    </ToastProvider>
  )
}

import { useState, useEffect } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
}

const TOAST_LIMIT = 1
let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastState: {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  dismiss: (id?: string) => void
} = {
  toasts: [],
  addToast(toast) {
    const id = genId()
    const newToast = { id, ...toast }
    toastState.toasts = [newToast, ...toastState.toasts].slice(0, TOAST_LIMIT)
  },
  dismiss(id) {
    toastState.toasts = toastState.toasts.filter((t) => t.id !== id)
  },
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>(toastState.toasts)

  useEffect(() => {
    const update = () => setToasts([...toastState.toasts])
    update()
    return () => {}
  }, [])

  const toast = (props: Omit<ToastProps, "id">) => toastState.addToast(props)

  return {
    toasts,
    toast,
    dismiss: toastState.dismiss,
  }
}

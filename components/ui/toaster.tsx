// "use client"

// import { useToast } from "@/hooks/use-toast"
// import {
//   Toast,
//   ToastClose,
//   ToastDescription,
//   ToastProvider,
//   ToastTitle,
//   ToastViewport,
// } from "@/components/ui/toast"
// import { X } from "lucide-react"
// export function Toaster() {
//   const { toasts } = useToast()

//   return (
//     <ToastProvider>
//       {toasts.map(function ({ id, title, description, action, ...props }) {
//         return (
//           <Toast key={id} {...props}>
//               <div className="flex justify-between items-start gap-4 w-full">
//               <div className="grid gap-1">
//                 {title && <ToastTitle>{title}</ToastTitle>}
//                 {description && (
//                   <ToastDescription>{description}</ToastDescription>
//                 )}
//               </div>
//             <ToastClose className="text-muted-foreground hover:text-foreground">
//             <X className="h-4 w-4" />
//           </ToastClose>
//             </div>
//             {action}
//             {/* <ToastClose /> */}
//           </Toast>
//         )
//       })}
//       <ToastViewport />
//     </ToastProvider>
//   )
// }
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="relative pr-10">
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>

            {action}

            {/* Make ToastClose absolutely positioned */}
            <ToastClose className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </ToastClose>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

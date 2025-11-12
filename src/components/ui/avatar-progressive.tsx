import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { useProgressiveImage } from "@/hooks/useProgressiveImage"

const AvatarProgressive = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
AvatarProgressive.displayName = AvatarPrimitive.Root.displayName

interface AvatarProgressiveImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  thumbnailSrc?: string;
}

const AvatarProgressiveImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarProgressiveImageProps
>(({ className, src, thumbnailSrc, ...props }, ref) => {
  const { src: currentSrc, isLoading } = useProgressiveImage(src as string, { thumbnailSrc });

  return (
    <AvatarPrimitive.Image
      ref={ref}
      src={currentSrc}
      className={cn(
        "aspect-square h-full w-full object-cover transition-all duration-500",
        isLoading && thumbnailSrc && "blur-sm scale-105",
        className
      )}
      {...props}
    />
  );
})
AvatarProgressiveImage.displayName = AvatarPrimitive.Image.displayName

const AvatarProgressiveFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarProgressiveFallback.displayName = AvatarPrimitive.Fallback.displayName

export { AvatarProgressive, AvatarProgressiveImage, AvatarProgressiveFallback }

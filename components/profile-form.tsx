"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").optional(),
  image: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

interface ProfileFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      image: user.image || "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmitProfile = async (data: ProfileFormValues) => {
    setIsUpdating(true)

    try {
      // For development with mock DB, simulate success
      if (process.env.NODE_ENV === "development" && (process.env.USE_MOCK_DB === "true" || !process.env.MONGODB_URI)) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        })

        // Refresh the page to show updated data
        router.refresh()
        return
      }

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const onSubmitPassword = async (data: PasswordFormValues) => {
    setIsChangingPassword(true)

    try {
      // For development with mock DB, simulate success
      if (process.env.NODE_ENV === "development" && (process.env.USE_MOCK_DB === "true" || !process.env.MONGODB_URI)) {
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully",
        })

        resetPassword()
        return
      }

      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to change password")
      }

      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      })

      resetPassword()
    } catch (error) {
      console.error("Error changing password:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      if (errorMessage.includes("current password")) {
        toast({
          title: "Incorrect password",
          description: "Your current password is incorrect. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Password change failed",
          description: "There was an error changing your password. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="profile">Profile Information</TabsTrigger>
        <TabsTrigger value="password">Change Password</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and profile picture</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="image">Profile Picture URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="image"
                      placeholder="https://example.com/avatar.jpg"
                      {...registerProfile("image")}
                      disabled={isUpdating}
                    />
                    <Button type="button" variant="outline" size="icon" disabled={isUpdating}>
                      <Upload className="h-4 w-4" />
                      <span className="sr-only">Upload</span>
                    </Button>
                  </div>
                  {profileErrors.image && <p className="text-sm text-destructive">{profileErrors.image.message}</p>}
                  <p className="text-xs text-muted-foreground">
                    Enter a URL for your profile picture or use the upload button
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...registerProfile("name")} disabled={isUpdating} />
                {profileErrors.name && <p className="text-sm text-destructive">{profileErrors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...registerProfile("email")} disabled={true} />
                <p className="text-xs text-muted-foreground">
                  Your email address cannot be changed for security reasons
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    {...registerPassword("currentPassword")}
                    disabled={isChangingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    {...registerPassword("newPassword")}
                    disabled={isChangingPassword}
                  />
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    {...registerPassword("confirmPassword")}
                    disabled={isChangingPassword}
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Changing Password..." : "Change Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
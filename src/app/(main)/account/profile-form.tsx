"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  updateAccountDetails,
  sendOtpForChanges,
  verifyOtpAndChangePassword,
} from "./actions";
import type { User } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, AlertCircle } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

function PasswordSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Changing..." : "Change Password"}
    </Button>
  );
}

export function ProfileForm({ user }: { user: User }) {
  const [state, formAction] = useFormState(updateAccountDetails, {
    message: "",
  });
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "1", type: "Card", last4: "4242", expiry: "12/25", isDefault: true },
    { id: "2", type: "UPI", upiId: "user@oksbi", isDefault: false },
  ]);

  // OTP and Password Change State
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordState, setPasswordState] = useFormState(
    verifyOtpAndChangePassword,
    { message: "" },
  );

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Error" : "Success",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
      // Don't call onProfileUpdate to avoid tab change - just show success toast
    }
  }, [state, toast]);

  useEffect(() => {
    if (passwordState.message) {
      toast({
        title: passwordState.errors ? "Error" : "Success",
        description: passwordState.message,
        variant: passwordState.errors ? "destructive" : "default",
      });
      if (!passwordState.errors) {
        setShowOtpInput(false);
        setOtp("");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    }
  }, [passwordState, toast]);

  const handleRemovePayment = (paymentId: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== paymentId));
    toast({
      title: "Payment Method Removed",
      description: "Your payment method has been removed.",
    });
  };

  const handleSetDefaultPayment = (paymentId: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === paymentId,
      })),
    );
    toast({
      title: "Default Payment Method Updated",
      description: "This payment method has been set as your default.",
    });
  };

  const handleSendOtp = async () => {
    // Validate passwords first
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    const result = await sendOtpForChanges();
    if (result.success) {
      setOtpSent(true);
      setShowOtpInput(true);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the OTP.",
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtpAndChange = async () => {
    const formData = new FormData();
    formData.append("otp", otp);
    formData.append("currentPassword", passwordData.currentPassword);
    formData.append("newPassword", passwordData.newPassword);
    await verifyOtpAndChangePassword({}, formData);
  };

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Login & Security</CardTitle>
          <CardDescription>
            Update your personal information and login details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  required
                />
                {state.errors?.name && (
                  <p className="text-sm text-destructive">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={user.phone_number ?? ""}
                  required
                />
                {state.errors?.phone_number && (
                  <p className="text-sm text-destructive">
                    {state.errors.phone_number[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email ?? ""}
                placeholder="your@email.com"
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">
                  {state.errors.email[0]}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Optional - Add your email for order updates and promotions
              </p>
            </div>
          </div>

          <Separator />

          {/* Change Password */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Change Password</h3>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Security Verification Required</AlertTitle>
              <AlertDescription>
                For your security, changing your password requires email OTP
                verification. An OTP will be sent to your registered email.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Min 6 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              {!showOtpInput ? (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full"
                  disabled={
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  Send OTP & Change Password
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      OTP sent to {user.email || "your registered email"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleVerifyOtpAndChange}
                    className="w-full"
                    disabled={!otp}
                  >
                    Verify OTP & Change Password
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Methods */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Payment Methods</h3>
              <p className="text-sm text-muted-foreground">
                Manage your saved payment methods
              </p>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                      {method.type === "Card" ? (
                        <span className="text-lg">💳</span>
                      ) : (
                        <span className="text-lg">📱</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.type === "Card"
                          ? `•••• ${method.last4}`
                          : method.upiId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {method.type === "Card"
                          ? `Expires ${method.expiry}`
                          : "UPI"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault ? (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Default
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultPayment(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemovePayment(method.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No payment methods saved yet.
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}

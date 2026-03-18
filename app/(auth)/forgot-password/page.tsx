import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Password reset is not implemented in this MVP. Contact support or use
          a password you remember.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href="/login">
          <Button variant="outline">Back to login</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

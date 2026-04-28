import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hashInviteToken } from "@/lib/auth/invites";
import { getCurrentDictionary } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import { acceptInviteAction } from "./actions";

type InvitePageProps = {
  params: { token: string };
  searchParams?: { error?: string };
};

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const t = getCurrentDictionary();
  const invite = await prisma.invite.findUnique({
    where: { tokenHash: hashInviteToken(params.token) }
  });
  const now = new Date();
  const invalid = !invite || Boolean(invite.acceptedAt) || invite.expiresAt < now;
  const error = getErrorMessage(searchParams?.error, t);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <BrandLogo markClassName="h-11 w-11" />
          <div>
            <CardTitle className="text-2xl">{invalid ? t.invite.invalidTitle : t.invite.title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {invalid ? t.invite.invalidText : t.invite.subtitle}
            </p>
          </div>
        </CardHeader>
        {!invalid ? (
          <CardContent>
            <form action={acceptInviteAction} className="space-y-4">
              <input type="hidden" name="token" value={params.token} />
              <div className="space-y-2">
                <Label htmlFor="email">{t.invite.email}</Label>
                <Input id="email" value={invite.email} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t.invite.name}</Label>
                <Input id="name" name="name" defaultValue={invite.name ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.invite.password}</Label>
                <Input id="password" name="password" type="password" minLength={8} required />
                <p className="text-xs text-muted-foreground">{t.invite.passwordHelp}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.invite.confirmPassword}</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" type="submit">
                {t.invite.accept}
              </Button>
            </form>
          </CardContent>
        ) : null}
      </Card>
    </main>
  );
}

function getErrorMessage(error: string | undefined, t: ReturnType<typeof getCurrentDictionary>) {
  if (error === "password") return t.invite.errors.password;
  if (error === "expired") return t.invite.errors.expired;
  if (error === "used") return t.invite.errors.used;
  if (error === "invalid") return t.invite.errors.invalid;
  return null;
}

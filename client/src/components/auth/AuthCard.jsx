import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/common/Logo';

export default function AuthCard({ title, description, children, footer }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader className="items-center text-center">
          <Logo variant="large" className="mb-2 h-14" />
          <CardTitle as="h1">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}

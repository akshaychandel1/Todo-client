import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useAuth } from '@/contexts/auth-context';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center px-4 py-10">
    
        <title>Sign In · ToDo App</title>
   

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center p-[5.5px] rounded-[60px] border border-[rgba(255,255,255,0.3)] bg-linear-to-r from-primary to-blue-600 dark:from-blue-950 dark:to-blue-800 shadow-[0_0_0_1px_#000]">
              <img
                src={toAbsoluteUrl('/media/app/logo-35.svg')}
                alt="logo"
                className="size-5"
              />
            </div>
            <span className="text-mono text-xl font-semibold">ToDo App</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-background border border-input rounded-xl shadow-xs p-5 sm:p-8">
          <h1 className="text-xl font-semibold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      navigate('/');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center px-4 py-10">
     
        <title>Sign Up · ToDo App</title>


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
          <h1 className="text-xl font-semibold text-foreground mb-1">Create an account</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Start managing your tasks today
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="name">
                Full name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Doe"
                autoComplete="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

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
                placeholder="Min. 6 characters"
                autoComplete="new-password"
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
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

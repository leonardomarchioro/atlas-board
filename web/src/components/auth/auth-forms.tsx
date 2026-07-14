"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { forwardRef, useState, type ComponentProps } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin, useRegister } from "@/features/auth/hooks/auth-hooks";
import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth/schemas/login.schema";
import {
  registerSchema,
  type RegisterFormData,
} from "@/features/auth/schemas/register.schema";
import { getApiErrorMessage } from "@/features/auth/utils/get-api-error-message";
import { getSafeRedirect } from "@/features/auth/utils/safe-redirect";
import { cn } from "@/lib/utils";

const fieldClass = "h-12 bg-surface-low pl-10";
function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-body-sm text-destructive" role="alert">
      {message}
    </p>
  ) : null;
}

const PasswordInput = forwardRef<
  HTMLInputElement,
  ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <LockKeyhole
        className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(fieldClass, "pr-12", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2"
        aria-label={visible ? "Ocultar senha" : "Exibir senha"}
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

function SocialButtons() {
  return (
    <>
      <div className="flex items-center gap-4 py-2">
        <span className="h-px flex-1 bg-border" />
        <span className="font-label text-label-sm uppercase tracking-widest text-muted-foreground">
          ou
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled
          aria-label="Google indisponível"
        >
          <span className="font-bold">G</span>Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled
          aria-label="GitHub indisponível"
        >
          <span className="font-mono text-xs font-bold" aria-hidden>
            GH
          </span>
          GitHub
        </Button>
      </div>
    </>
  );
}

export function LoginForm() {
  const mutation = useLogin();
  const router = useRouter();
  const search = useSearchParams();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });
  async function submit(data: LoginFormData) {
    try {
      await mutation.mutateAsync({
        email: data.email.toLowerCase(),
        password: data.password,
      });
      toast.success("Login realizado com sucesso.");
      router.replace(getSafeRedirect(search.get("redirect")));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível entrar."));
    }
  }
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-headline-lg">Entrar na sua conta</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Faça login para continuar.
        </p>
      </header>
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nome@exemplo.com"
              className={fieldClass}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
          </div>
          <FieldError id="email-error" message={errors.email?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <FieldError id="password-error" message={errors.password?.message} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Controller
            control={control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="rememberMe" className="text-muted-foreground">
                  Lembrar de mim
                </Label>
              </div>
            )}
          />
          <span
            className="font-label text-label-md text-primary opacity-60"
            aria-disabled
          >
            Esqueci minha senha
          </span>
        </div>
        <Button
          type="submit"
          className="h-12 w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : null}
          {mutation.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <SocialButtons />
      <p className="text-center text-body-sm text-muted-foreground">
        Ainda não possui uma conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm() {
  const mutation = useRegister();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      acceptTerms: false,
    },
  });
  async function submit(data: RegisterFormData) {
    try {
      await mutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      });
      toast.success("Conta criada com sucesso.");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Não foi possível criar sua conta."),
      );
    }
  }
  const textField = (
    name: "name" | "email",
    label: string,
    Icon: typeof UserRound,
    type: string,
    placeholder: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          autoComplete={name}
          className={fieldClass}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          {...register(name)}
        />
      </div>
      <FieldError id={`${name}-error`} message={errors[name]?.message} />
    </div>
  );
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-headline-lg">Criar Conta</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para começar sua jornada.
        </p>
      </header>
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        {textField(
          "name",
          "Nome completo",
          UserRound,
          "text",
          "Seu nome completo",
        )}
        {textField("email", "E-mail", Mail, "email", "nome@exemplo.com")}
        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            {...register("password")}
          />
          <FieldError
            id="register-password-error"
            message={errors.password?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passwordConfirmation">Confirmação de senha</Label>
          <PasswordInput
            id="passwordConfirmation"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.passwordConfirmation)}
            aria-describedby={
              errors.passwordConfirmation ? "confirmation-error" : undefined
            }
            {...register("passwordConfirmation")}
          />
          <FieldError
            id="confirmation-error"
            message={errors.passwordConfirmation?.message}
          />
        </div>
        <Controller
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="acceptTerms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={Boolean(errors.acceptTerms)}
                />
                <Label
                  htmlFor="acceptTerms"
                  className="block text-body-sm leading-5 text-muted-foreground"
                >
                  Eu aceito os{" "}
                  <span className="text-primary">Termos de Serviço</span> e a{" "}
                  <span className="text-primary">Política de Privacidade</span>{" "}
                  da Atlas.
                </Label>
              </div>
              <FieldError
                id="terms-error"
                message={errors.acceptTerms?.message}
              />
            </div>
          )}
        />
        <Button
          type="submit"
          className="h-12 w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : null}
          {mutation.isPending ? "Criando conta..." : "Criar conta"}
          {!mutation.isPending && <ArrowRight aria-hidden />}
        </Button>
      </form>
      <SocialButtons />
      <p className="text-center text-body-sm text-muted-foreground">
        Já possui uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}

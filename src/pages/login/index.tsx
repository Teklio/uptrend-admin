import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginSchemaType } from "../../schemas/adminauth.schema";
import { useLogin } from "../../services/auth.service";
import { Input } from "../../components/shared/Input";
import { toastMessage } from "../../utils/toast.util";

const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = (values: LoginSchemaType) => {
    login(values, {
      onSuccess: () => navigate("/", { replace: true }),
      onError: (err) => toastMessage.apiError(err),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#f4f4f4" }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Uptrend" className="mx-auto h-12 w-auto object-contain" />
          <p className="mt-3 text-[13px]" style={{ color: "rgba(0,0,0,0.45)" }}>
            Sign in to the admin panel
          </p>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input name="email" type="email" label="Email" placeholder="you@uptrend.com" />
            <Input name="password" type="password" label="Password" placeholder="••••••••" />

            <Controller
              name="rememberMe"
              control={form.control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-[13px]" style={{ color: "rgba(0,0,0,0.6)" }}>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#002b7f]"
                  />
                  Remember me
                </label>
              )}
            />

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 rounded-xl py-3 text-[14px] font-semibold text-[#0f172a] transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "#f5a300" }}
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default LoginPage;

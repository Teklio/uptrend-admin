import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changeAdminPasswordSchema,
  updateAdminProfileSchema,
  type ChangeAdminPasswordSchemaType,
  type UpdateAdminProfileSchemaType,
} from "../../schemas/adminauth.schema";
import { useChangeAdminPassword, useMe, useUpdateAdminProfile } from "../../services/auth.service";
import { Input } from "../../components/shared/Input";
import { toastMessage } from "../../utils/toast.util";

const ProfilePage = () => {
  const { data: admin } = useMe();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateAdminProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangeAdminPassword();

  const profileForm = useForm<UpdateAdminProfileSchemaType>({
    resolver: zodResolver(updateAdminProfileSchema),
    defaultValues: { name: "", phone: "" },
  });

  const passwordForm = useForm<ChangeAdminPasswordSchemaType>({
    resolver: zodResolver(changeAdminPasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (admin) {
      profileForm.reset({ name: admin.name ?? "", phone: admin.phone ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const onSubmitProfile = (values: UpdateAdminProfileSchemaType) => {
    updateProfile(values, {
      onSuccess: () => toastMessage.success({ message: "Profile updated successfully" }),
      onError: (err) => toastMessage.apiError(err),
    });
  };

  const onSubmitPassword = (values: ChangeAdminPasswordSchemaType) => {
    changePassword(values, {
      onSuccess: () => {
        toastMessage.success({ message: "Password changed successfully" });
        passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
      },
      onError: (err) => toastMessage.apiError(err),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-semibold" style={{ color: "#191919" }}>
        Profile
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
          <h2 className="mb-4 text-[15px] font-semibold" style={{ color: "#191919" }}>
            Profile details
          </h2>
          <FormProvider {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium" style={{ color: "#191919" }}>
                  Email
                </label>
                <div
                  className="rounded-xl px-3.5 py-2.5 text-[14px]"
                  style={{ backgroundColor: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.5)" }}
                >
                  {admin?.email}
                </div>
              </div>
              <Input name="name" label="Name" placeholder="Your name" />
              <Input name="phone" label="Phone" placeholder="10-digit phone number" />
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="mt-1 self-start rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: "#7e14ff" }}
              >
                {isUpdatingProfile ? "Saving..." : "Save changes"}
              </button>
            </form>
          </FormProvider>
        </div>

        <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
          <h2 className="mb-4 text-[15px] font-semibold" style={{ color: "#191919" }}>
            Change password
          </h2>
          <FormProvider {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="flex flex-col gap-4">
              <Input name="currentPassword" type="password" label="Current password" />
              <Input name="newPassword" type="password" label="New password" />
              <Input name="confirmPassword" type="password" label="Confirm new password" />
              <button
                type="submit"
                disabled={isChangingPassword}
                className="mt-1 self-start rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: "#7e14ff" }}
              >
                {isChangingPassword ? "Saving..." : "Change password"}
              </button>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

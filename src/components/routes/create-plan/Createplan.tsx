import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/atoms/form";
import { Input } from "@/components/ui/atoms/input";
import { Button } from "@/components/ui/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/atoms/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/atoms/textarea";
import { planSchema } from "@/schema/PlanSchema";
import { z } from "zod";
import { useTranslate } from "@tolgee/react";

const Createplan = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslate();
  type PlanFormData = z.infer<typeof planSchema>;

  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      planTitle: "",
      description: "",
      numberOfDays: "",
      difficulty: "",
      coverImage: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      console.log(file);
      form.setValue("coverImage", file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    form.setValue("coverImage", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data: PlanFormData) => {
    console.log("Form submitted with valid data:", data);
  };

  return (
    <div className="w-full h-full font-dynamic flex max-sm:flex-col">
      <div className="flex-1 p-10">
        <h1 className="text-xl font-bold my-4">
          {t("studio.plan.form_field.details")}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="planTitle"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={t("studio.plan.form.placeholder.title")}
                      className="h-12 text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "studio.plan.form.placeholder.description",
                      )}
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base  placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold">
                    {t("studio.plan.form_field.number_of_day")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t(
                        "studio.plan.form.placeholder.number_of_days",
                      )}
                      className="h-12 text-base"
                      min="1"
                      max="365"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="text-sm font-bold">
                {t("studio.dashboard.cover_image")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("studio.plan.cover_image.description")}
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              <div className="flex gap-4 mt-4 items-start">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="border w-48 h-32 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer focus:outline-none"
                >
                  <Plus className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                </button>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-48 h-32 object-cover rounded-lg border"
                    />
                    <div className="flex items-center justify-between absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg p-2">
                      {selectedImage && (
                        <p className="text-xs text-white truncate max-w-32">
                          {selectedImage.name}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className=" text-white cursor-pointer rounded-full p-1 transition-colors ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      <div className="flex-1 p-10 sm:mt-9">
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold">
                    {t("studio.plan.form_field.difficulty")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue
                          placeholder={t(
                            "studio.plan.form.placeholder.select_difficulty",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-8 w-fit">
              <Button
                type="submit"
                variant="default"
                className=" h-12 px-12 font-medium  bg-[#A51C21] hover:bg-[#A51C21]/90"
                onClick={form.handleSubmit(onSubmit)}
              >
                {t("studio.plan.next_button")}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Createplan;

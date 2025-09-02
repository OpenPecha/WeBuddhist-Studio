
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/atoms/form";
import { Input } from "@/components/ui/atoms/input";
import { Button } from "@/components/ui/atoms/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/atoms/select";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

const Createplan = () => {
  const form = useForm({
    defaultValues: {
      planTitle: "",
      description: "",
      numberOfDays: "",
      difficulty: "",
      tags: "",
      coverImage: null,
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div className="w-full h-full font-dynamic flex">
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-8">Detail</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="planTitle"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Plan Title" 
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
                    <textarea
                      placeholder="Description"
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
                  <FormLabel className="text-base font-medium">Number of Day</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="Number of Days..." 
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

            <div className="space-y-2">
              <h3 className="text-base font-medium">Cover Image</h3>
              <p className="text-sm text-muted-foreground">Set a Cover Image that stands out and draws readers attention.</p>
              <div className="border w-1/4 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Plus className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              </div>
            </div>
          </form>
        </Form>
      </div>

      <div className="flex-1 p-10 mt-8">
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Difficulty" />
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
                Next
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Createplan;

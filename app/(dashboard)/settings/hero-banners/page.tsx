"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult, 
  DroppableProvided, 
  DraggableProvided 
} from "@hello-pangea/dnd";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import {
  siteSettingsService,
  UpdateHeroBannersPayload,
} from "@/lib/services/site-settings";
import { useRouter } from "next/navigation";

// Utility to convert file to base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function HeroBannersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { control, register, handleSubmit, reset, watch, setValue } = useForm<UpdateHeroBannersPayload>({
    defaultValues: {
      heroBanners: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "heroBanners",
  });

  // Fetch existing settings on load
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await siteSettingsService.getHeroBanners();
        // Ensure order is correct if backend doesn't sort
        const sortedBanners = (data.heroBanners || []).sort(
          (a, b) => a.order - b.order
        );
        reset({ heroBanners: sortedBanners });
      } catch (error) {
        console.error("Failed to load hero banners", error);
        toast.error("Failed to load hero banners.");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [reset]);

  const onSubmit = async (data: UpdateHeroBannersPayload) => {
    setIsSaving(true);
    try {
      // Re-assign order based on current list position to ensure consistency
      const bannersWithOrder = data.heroBanners.map((banner, index) => ({
        ...banner,
        order: index + 1,
      }));

      await siteSettingsService.updateHeroBanners({
        heroBanners: bannersWithOrder,
      });

      toast.success("Hero banners updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("Failed to save hero banners", error);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setValue(`heroBanners.${index}.imageUrl`, base64);
      } catch (err) {
        console.error("Image upload failed", err);
        toast.error("Failed to process image.");
      }
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    move(result.source.index, result.destination.index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hero Banners</h1>
            <p className="text-gray-500 mt-1">Manage homepage hero slides</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="banners">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {fields.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(provided: DraggableProvided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab hover:text-gray-600"
                              >
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                              <CardTitle className="text-base font-medium">
                                Banner #{index + 1}
                              </CardTitle>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="grid gap-4 md:grid-cols-2">
                            {/* Image Upload Column */}
                            <div className="space-y-4">
                                <Label>Banner Image</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[160px] relative bg-gray-50">
                                    {watch(`heroBanners.${index}.imageUrl`) ? (
                                        <div className="relative w-full h-full min-h-[160px]">
                                            <img 
                                                src={watch(`heroBanners.${index}.imageUrl`)} 
                                                alt="Preview" 
                                                className="absolute inset-0 w-full h-full object-cover rounded-md"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                            <span className="text-sm">No image selected</span>
                                        </div>
                                    )}
                                    <Input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => handleImageUpload(index, e)}
                                    />
                                    <Button type="button" variant="secondary" size="sm" className="absolute bottom-2 right-2 pointer-events-none z-10">
                                        Change Image
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Fields Column */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Title</Label>
                                  <Input
                                    {...register(`heroBanners.${index}.title` as const, { required: true })}
                                    placeholder="Enter banner title"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    {...register(`heroBanners.${index}.description` as const)}
                                    placeholder="Enter description"
                                    rows={2}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>CTA Text</Label>
                                        <Input
                                            {...register(`heroBanners.${index}.ctaText` as const)}
                                            placeholder="Ex: Shop Now"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CTA URL</Label>
                                        <Input
                                            {...register(`heroBanners.${index}.ctaUrl` as const)}
                                            placeholder="/courses"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <Label>Active Status</Label>
                                    <Controller
                                        control={control}
                                        name={`heroBanners.${index}.isActive`}
                                        defaultValue={true}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <Button
            type="button"
            variant="outline"
            className="w-full dashed border-2 h-12"
            onClick={() =>
              append({
                title: "",
                description: "",
                imageUrl: "",
                ctaUrl: "",
                ctaText: "",
                order: fields.length + 1,
                isActive: true,
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hero Banner
          </Button>

          <div className="flex justify-end pt-6 sticky bottom-6">
            <Button size="lg" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

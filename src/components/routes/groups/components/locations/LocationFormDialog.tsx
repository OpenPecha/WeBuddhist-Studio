import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pecha } from "@/components/ui/shadimport";
import {
  locationSchema,
  defaultLocationFormValues,
  coordinateToInput,
  type LocationFormData,
} from "@/schema/LocationSchema";
import type { LocationDetail } from "../../api/locationsApi";
import {
  isPlaceSearchEnabled,
  reverseGeocode,
  type PlaceResult,
} from "../../api/placeSearchApi";
import LocationMap, { type Coordinates } from "./LocationMap";
import PlaceSearch from "./PlaceSearch";

type LocationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: LocationDetail | null;
  isSubmitting: boolean;
  onSubmit: (data: LocationFormData) => void;
  initialName?: string;
};

const SET_VALUE_OPTIONS = { shouldDirty: true, shouldValidate: true } as const;

const LocationFormDialog = ({
  open,
  onOpenChange,
  location,
  isSubmitting,
  onSubmit,
  initialName = "",
}: LocationFormDialogProps) => {
  const isEdit = Boolean(location);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: defaultLocationFormValues(),
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) return;
    if (location) {
      form.reset({
        name: location.name,
        latitude: coordinateToInput(location.latitude),
        longitude: coordinateToInput(location.longitude),
      });
    } else {
      form.reset({ ...defaultLocationFormValues(), name: initialName });
    }
  }, [open, location, initialName, form]);

  const [suggestedName, setSuggestedName] = useState<string | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  const pin: Coordinates | null = useMemo(() => {
    if (latitude === "" || longitude === "") return null;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!open) {
      reverseAbortRef.current?.abort();
      setSuggestedName(null);
    }
  }, [open]);

  useEffect(() => {
    return () => reverseAbortRef.current?.abort();
  }, []);

  const writeCoordinates = useCallback(
    (coords: Coordinates) => {
      form.setValue(
        "latitude",
        String(Number(coords.lat.toFixed(6))),
        SET_VALUE_OPTIONS,
      );
      form.setValue(
        "longitude",
        String(Number(coords.lng.toFixed(6))),
        SET_VALUE_OPTIONS,
      );
    },
    [form],
  );

  const setPin = useCallback(
    (coords: Coordinates) => {
      writeCoordinates(coords);
      setSuggestedName(null);

      if (!isPlaceSearchEnabled()) return;

      reverseAbortRef.current?.abort();
      const controller = new AbortController();
      reverseAbortRef.current = controller;

      reverseGeocode(coords.lat, coords.lng, controller.signal)
        .then((name) => {
          if (controller.signal.aborted || !name) return;
          if (name.trim() === form.getValues("name").trim()) return;
          setSuggestedName(name);
        })
        .catch(() => {
          if (!controller.signal.aborted) setSuggestedName(null);
        });
    },
    [form, writeCoordinates],
  );

  const clearPin = () => {
    reverseAbortRef.current?.abort();
    form.setValue("latitude", "", SET_VALUE_OPTIONS);
    form.setValue("longitude", "", SET_VALUE_OPTIONS);
    setSuggestedName(null);
  };

  const applySuggestedName = () => {
    if (!suggestedName) return;
    form.setValue("name", suggestedName.slice(0, 255), SET_VALUE_OPTIONS);
    setSuggestedName(null);
  };

  const handlePlaceSelected = useCallback(
    (place: PlaceResult) => {
      writeCoordinates({ lat: place.latitude, lng: place.longitude });
      setSuggestedName(null);
      if (!form.getValues("name").trim()) {
        form.setValue("name", place.primary.slice(0, 255), SET_VALUE_OPTIONS);
      }
    },
    [form, writeCoordinates],
  );

  const handleSubmit = form.handleSubmit((data) => onSubmit(data));

  const eventCount = location?.event_count ?? 0;
  const showSharedWarning = isEdit && eventCount > 0;

  const getSubmitLabel = () => {
    if (isSubmitting) return isEdit ? "Saving…" : "Creating…";
    return isEdit ? "Save changes" : "Create location";
  };

  return (
    <Pecha.Dialog open={open} onOpenChange={onOpenChange}>
      <Pecha.DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(() => {
            const input = nameInputRef.current;
            if (!input) return;
            input.focus();
            const end = input.value.length;
            input.setSelectionRange(end, end);
          });
        }}
      >
        <Pecha.DialogHeader>
          <Pecha.DialogTitle>
            {isEdit ? "Edit location" : "New location"}
          </Pecha.DialogTitle>
        </Pecha.DialogHeader>

        {showSharedWarning ? (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            This location is used by {eventCount} event
            {eventCount === 1 ? "" : "s"}. Any changes you make here will apply
            to {eventCount === 1 ? "that event" : "all of them"}.
          </p>
        ) : null}

        <Pecha.Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Pecha.FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormLabel>Name</Pecha.FormLabel>
                  <Pecha.FormControl>
                    <Pecha.Input
                      {...field}
                      ref={(element) => {
                        field.ref(element);
                        nameInputRef.current = element;
                      }}
                      placeholder="Enter a location name"
                      maxLength={255}
                    />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Place</p>
                {pin ? (
                  <button
                    type="button"
                    onClick={clearPin}
                    className="cursor-pointer text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {isPlaceSearchEnabled()
                  ? "Search for a place, or click the map to drop a pin. Drag the pin to adjust. You can skip this for online events."
                  : "Click the map to drop a pin. Drag the pin to adjust. You can skip this for online events."}
              </p>

              <PlaceSearch onSelect={handlePlaceSelected} />

              <LocationMap value={pin} onChange={setPin} />

              {suggestedName ? (
                <p className="text-xs text-muted-foreground">
                  Nearest place: {suggestedName}.{" "}
                  <button
                    type="button"
                    onClick={applySuggestedName}
                    className="cursor-pointer underline hover:text-foreground"
                  >
                    Use as name
                  </button>
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <Pecha.FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <Pecha.FormItem>
                      <Pecha.FormLabel>Latitude</Pecha.FormLabel>
                      <Pecha.FormControl>
                        <Pecha.Input
                          {...field}
                          inputMode="decimal"
                          placeholder="-90 to 90"
                        />
                      </Pecha.FormControl>
                      <Pecha.FormMessage />
                    </Pecha.FormItem>
                  )}
                />
                <Pecha.FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <Pecha.FormItem>
                      <Pecha.FormLabel>Longitude</Pecha.FormLabel>
                      <Pecha.FormControl>
                        <Pecha.Input
                          {...field}
                          inputMode="decimal"
                          placeholder="-180 to 180"
                        />
                      </Pecha.FormControl>
                      <Pecha.FormMessage />
                    </Pecha.FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Pecha.Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Pecha.Button>
              <Pecha.Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#A51C21] font-medium text-white hover:bg-[#A51C21]/90 disabled:opacity-50"
              >
                {getSubmitLabel()}
              </Pecha.Button>
            </div>
          </form>
        </Pecha.Form>
      </Pecha.DialogContent>
    </Pecha.Dialog>
  );
};

export default LocationFormDialog;

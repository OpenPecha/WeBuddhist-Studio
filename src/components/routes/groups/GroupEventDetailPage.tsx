import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { IoCalendarClearOutline } from "react-icons/io5";
import { MdLocationOn } from "react-icons/md";
import {
  LuBookOpen,
  LuCircleDot,
  LuLibrary,
  LuScrollText,
} from "react-icons/lu";
import { Pecha } from "@/components/ui/shadimport";
import { MarkdownPreview } from "@/components/ui/molecules/markdown-editor/MarkdownPreview";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { cn, fromBackendISO } from "@/lib/utils";
import { DEFAULT_TIMEZONE } from "@/schema/EventSchema";
import { getLanguageLabel } from "@/components/api/languagesApi";
import { ROUTES } from "@/routes/paths";
import type { GroupOutletContext } from "./GroupLayout";
import { canWriteEvents } from "./lib/eventPermissions";
import {
  eventLinkIcon,
  eventLinkTypeLabel,
  isSafeLinkUrl,
} from "./lib/eventLinkTypes";
import {
  fetchCmsEvent,
  metadataArray,
  resolveLinkedAccumulator,
  resolveLinkedChantCollection,
  resolveLinkedContent,
  type EventDTO,
  type EventMetadataDTO,
  type ImageUrlModel,
} from "./api/eventsApi";
import { formatCoordinates, hasCoordinates } from "./api/locationsApi";
import LocationMap from "./components/locations/LocationMap";

const languageLabel = (code: string) => getLanguageLabel(code);

const formatDate = (iso: string, timezone: string) => {
  if (!iso) return "—";
  try {
    return format(fromBackendISO(iso, timezone).date, "EEE, MMM d, yyyy");
  } catch {
    return iso.slice(0, 10);
  }
};

const formatDateRange = (event: EventDTO): string => {
  const timezone = event.timezone?.trim() || DEFAULT_TIMEZONE;
  const start = formatDate(event.start_date, timezone);
  if (event.is_one_day || event.start_date === event.end_date) return start;
  return `${start} – ${formatDate(event.end_date, timezone)}`;
};

const resolveHeroImage = (event: EventDTO): string | null => {
  const image = event.image as ImageUrlModel | undefined;
  if (image?.original) return image.original;
  if (image?.medium) return image.medium;
  if (event.image_url && /^https?:\/\//i.test(event.image_url)) {
    return event.image_url;
  }
  return null;
};

const pickDefault = (rows: EventMetadataDTO[]): EventMetadataDTO | undefined =>
  rows.find((r) => r.language.toUpperCase() === "EN") ?? rows[0];

const GroupEventDetailPage = () => {
  const { groupId, eventId } = useParams<{
    groupId: string;
    eventId: string;
  }>();
  const navigate = useNavigate();
  const { myRole, userInfo, readOnlyPlatform } =
    useOutletContext<GroupOutletContext>();

  const canWrite =
    !readOnlyPlatform && canWriteEvents(myRole, userInfo?.platform_role);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cms-event", eventId],
    queryFn: () => fetchCmsEvent(eventId ?? ""),
    enabled: Boolean(eventId),
    refetchOnWindowFocus: false,
  });

  const rows = useMemo(
    () => (data ? metadataArray(data.metadata) : []),
    [data],
  );

  const [activeLang, setActiveLang] = useState<string | null>(null);
  useEffect(() => {
    setActiveLang(pickDefault(rows)?.language ?? null);
  }, [rows]);

  const [linkTitles, setLinkTitles] = useState<Record<string, string>>({});
  const planId = data?.plan_id;
  const seriesId = data?.series_id;
  const accumulatorId = data?.accumulator_id;
  const chantCollectionId = data?.group_recitation_collection_id;

  useEffect(() => {
    let active = true;
    const setTitle = (key: string, title: string) =>
      active && setLinkTitles((prev) => ({ ...prev, [key]: title }));
    if (planId && groupId) {
      resolveLinkedContent(groupId, planId, "plan").then((o) =>
        setTitle("plan", o.title),
      );
    }
    if (seriesId && groupId) {
      resolveLinkedContent(groupId, seriesId, "series").then((o) =>
        setTitle("series", o.title),
      );
    }
    if (accumulatorId) {
      resolveLinkedAccumulator(accumulatorId).then((o) =>
        setTitle("accumulator", o.title),
      );
    }
    if (chantCollectionId && groupId) {
      resolveLinkedChantCollection(groupId, chantCollectionId).then((o) =>
        setTitle("chant", o.title),
      );
    }
    return () => {
      active = false;
    };
  }, [groupId, planId, seriesId, accumulatorId, chantCollectionId]);

  const eventsListPath = groupId ? ROUTES.groupEvents(groupId) : ROUTES.groups;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading event…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-center text-destructive">
          {getApiErrorMessage(error, "Could not load this event.")}
        </p>
        <Pecha.Button
          variant="outline"
          onClick={() => navigate(eventsListPath)}
        >
          Back to events
        </Pecha.Button>
      </div>
    );
  }

  const heroImage = resolveHeroImage(data);
  const active =
    rows.find((r) => r.language === activeLang) ?? pickDefault(rows);
  const title = active?.name?.trim() || "Untitled event";
  const description = active?.description?.trim();

  const eventLocation = data.location ?? null;
  const locationCoords = eventLocation
    ? formatCoordinates(eventLocation)
    : null;

  const links = [
    { id: planId, key: "plan", label: "Plan", Icon: LuBookOpen },
    { id: seriesId, key: "series", label: "Series", Icon: LuLibrary },
    {
      id: accumulatorId,
      key: "accumulator",
      label: "Accumulator",
      Icon: LuCircleDot,
    },
    {
      id: chantCollectionId,
      key: "chant",
      label: "Chant collection",
      Icon: LuScrollText,
    },
  ].filter((link) => Boolean(link.id));

  const urlLinks = [...(data.links ?? [])]
    .filter((link) => isSafeLinkUrl(link.url))
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(eventsListPath)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Events
        </button>
        {canWrite ? (
          <Pecha.Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(ROUTES.groupEventEdit(groupId ?? "", data.id))
            }
          >
            Edit
          </Pecha.Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {heroImage ? (
          <div className="relative aspect-[16/9] w-full">
            <img
              src={heroImage}
              alt={title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h1 className="text-2xl font-bold text-white drop-shadow">
                {title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
        )}

        <div className="space-y-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <IoCalendarClearOutline className="h-4 w-4" />
            <span className="text-foreground">{formatDateRange(data)}</span>
            {data.is_one_day ? (
              <Pecha.Badge variant="secondary" className="ml-1">
                One-day event
              </Pecha.Badge>
            ) : null}
          </div>

          {urlLinks.length > 0 ? (
            <Pecha.TooltipProvider delayDuration={200}>
              <div className="flex flex-wrap gap-2 border-t border-dashed pt-3">
                {urlLinks.map((link) => {
                  const Icon = eventLinkIcon(link.type);
                  const label =
                    link.label?.trim() || eventLinkTypeLabel(link.type);
                  return (
                    <Pecha.Tooltip key={link.id}>
                      <Pecha.TooltipTrigger asChild>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-[#A51C21] hover:text-[#A51C21]"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="max-w-[12rem] truncate">
                            {label}
                          </span>
                        </a>
                      </Pecha.TooltipTrigger>
                      <Pecha.TooltipContent className="max-w-xs break-all">
                        {link.url}
                      </Pecha.TooltipContent>
                    </Pecha.Tooltip>
                  );
                })}
              </div>
            </Pecha.TooltipProvider>
          ) : null}
        </div>
      </div>

      {rows.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setActiveLang(row.language)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                row.language === active?.language
                  ? "border-[#A51C21] bg-[#A51C21]/10 text-foreground"
                  : "border-input text-muted-foreground hover:text-foreground",
              )}
            >
              {languageLabel(row.language)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Description
        </h2>
        {description ? (
          <MarkdownPreview
            value={description}
            className="min-h-0 px-0 py-0 leading-relaxed"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No description for {languageLabel(active?.language ?? "EN")}.
          </p>
        )}
      </div>

      {eventLocation ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Location
          </h2>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <MdLocationOn className="h-4 w-4 text-muted-foreground" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{eventLocation.name}</p>
              {locationCoords ? (
                <p className="text-xs text-muted-foreground">
                  {locationCoords}
                </p>
              ) : null}
            </div>
          </div>
          {hasCoordinates(eventLocation) ? (
            <LocationMap
              value={{
                lat: eventLocation.latitude,
                lng: eventLocation.longitude,
              }}
              readOnly
              className="h-56"
            />
          ) : null}
        </div>
      ) : null}

      {links.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Linked content
          </h2>
          <div className="space-y-2">
            {links.map(({ key, label, Icon }) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="truncate font-medium">
                    {linkTitles[key] ?? `Linked ${label.toLowerCase()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupEventDetailPage;

import { describe, expect, it } from "vitest";
import {
  buildSeriesPartialUpdateBody,
  buildSeriesUpdateBody,
} from "./seriesApi";
import type { SeriesFormData } from "@/schema/SeriesSchema";

const baseForm: SeriesFormData = {
  languages: {
    EN: {
      title: "Series title",
      sub_title: "",
      description: "Original description",
    },
  },
  plans: {
    EN: [
      { id: "plan-a", title: "Plan A" },
      { id: "plan-b", title: "Plan B" },
    ],
  },
  image_url: "series-image-key",
};

describe("buildSeriesPartialUpdateBody", () => {
  it("sends only metadata when description changes", () => {
    const current: SeriesFormData = {
      ...baseForm,
      languages: {
        EN: {
          title: "Series title",
          sub_title: "",
          description: "Updated description",
        },
      },
    };

    const body = buildSeriesPartialUpdateBody(current, baseForm, false, false);

    expect(body).toEqual({
      metadata: [
        {
          language: "EN",
          title: "Series title",
          sub_title: "",
          description: "Updated description",
        },
      ],
    });
    expect(body.plans).toBeUndefined();
    expect(body.image_key).toBeUndefined();
    expect(body.featured).toBeUndefined();
  });

  it("sends only plans when plan order changes", () => {
    const current: SeriesFormData = {
      ...baseForm,
      plans: {
        EN: [
          { id: "plan-b", title: "Plan B" },
          { id: "plan-a", title: "Plan A" },
        ],
      },
    };

    const body = buildSeriesPartialUpdateBody(current, baseForm, false, false);

    expect(body).toEqual({
      plans: { EN: ["plan-b", "plan-a"] },
    });
    expect(body.metadata).toBeUndefined();
  });

  it("sends only image_key when cover changes", () => {
    const current: SeriesFormData = {
      ...baseForm,
      image_url: "new-image-key",
    };

    const body = buildSeriesPartialUpdateBody(current, baseForm, false, false);

    expect(body).toEqual({ image_key: "new-image-key" });
  });

  it("sends only featured when featured flag changes", () => {
    const body = buildSeriesPartialUpdateBody(baseForm, baseForm, true, false);

    expect(body).toEqual({ featured: true });
  });
});

describe("buildSeriesUpdateBody", () => {
  it("returns full payload for create", () => {
    const body = buildSeriesUpdateBody(baseForm, false, { groupId: "group-1" });

    expect(body).toMatchObject({
      metadata: [
        {
          language: "EN",
          title: "Series title",
          sub_title: "",
          description: "Original description",
        },
      ],
      featured: false,
      plans: { EN: ["plan-a", "plan-b"] },
      image_key: "series-image-key",
      group_id: "group-1",
    });
  });

  it("returns partial payload when original form is provided", () => {
    const current: SeriesFormData = {
      ...baseForm,
      languages: {
        EN: {
          title: "Series title",
          sub_title: "",
          description: "Updated description",
        },
      },
    };

    const body = buildSeriesUpdateBody(current, false, { original: baseForm });

    expect(body).toEqual({
      metadata: [
        {
          language: "EN",
          title: "Series title",
          sub_title: "",
          description: "Updated description",
        },
      ],
    });
  });
});
